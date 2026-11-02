import { useEffect, useRef, useState } from "react"
import { apiGet } from "../../api/client"
import { useI18n } from "../../i18n/I18nContext"

type Company = { id: number; name: string; country: string | null; countryCode: string; city: string | null; active: boolean; sites: number }
type Location = Omit<Company, "sites"> & { companyId: number; companyName: string; primaryLocation: boolean }
type RegistryPage = { items: (Company | Location)[]; total: number; page: number; size: number }

export default function PlatformRegistryDialog({ kind, onClose }: { kind: "companies" | "locations"; onClose: () => void }) {
  const { language } = useI18n()
  const dialogRef = useRef<HTMLDialogElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)
  const [search, setSearch] = useState("")
  const [query, setQuery] = useState({ search: "", page: 0 })
  const [result, setResult] = useState<RegistryPage | null>(null)
  const [loading, setLoading] = useState(true)
  const [failed, setFailed] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const text = language === "fr" ? {
    companies: "Entreprises enregistrées", locations: "Localisations / sites", close: "Fermer",
    search: "Rechercher par nom, pays ou ville", name: "Nom", company: "Entreprise", country: "Pays", city: "Ville",
    status: "Statut", active: "Actif", inactive: "Inactif", sites: "Sites", primary: "Site principal",
    unknown: "Pays non renseigné", loading: "Chargement de la liste…", error: "Impossible de charger la liste.",
    empty: "Aucun résultat.", retry: "Réessayer", previous: "Précédent", next: "Suivant", page: "Page", total: "Total",
  } : language === "es" ? {
    companies: "Empresas registradas", locations: "Ubicaciones / sitios", close: "Cerrar",
    search: "Buscar por nombre, país o ciudad", name: "Nombre", company: "Empresa", country: "País", city: "Ciudad",
    status: "Estado", active: "Activo", inactive: "Inactivo", sites: "Sitios", primary: "Sede principal",
    unknown: "País no indicado", loading: "Cargando la lista…", error: "No se pudo cargar la lista.",
    empty: "Sin resultados.", retry: "Reintentar", previous: "Anterior", next: "Siguiente", page: "Página", total: "Total",
  } : {
    companies: "Registered companies", locations: "Locations / sites", close: "Close",
    search: "Search by name, country or city", name: "Name", company: "Company", country: "Country", city: "City",
    status: "Status", active: "Active", inactive: "Inactive", sites: "Sites", primary: "Primary site",
    unknown: "Country not provided", loading: "Loading list…", error: "Unable to load the list.",
    empty: "No results.", retry: "Retry", previous: "Previous", next: "Next", page: "Page", total: "Total",
  }

  useEffect(() => {
    const dialog = dialogRef.current!
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null
    dialog.showModal()
    searchRef.current?.focus()
    return () => {
      dialog.close()
      opener?.focus({ preventScroll: true })
    }
  }, [])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setQuery(current => current.search === search.trim() ? current : { search: search.trim(), page: 0 })
    }, 300)
    return () => window.clearTimeout(timer)
  }, [search])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setFailed(false)
    const params = new URLSearchParams({ search: query.search, page: String(query.page), size: "25" })
    apiGet<RegistryPage>(`/admin/analytics/${kind}?${params}`).then(data => {
      if (!cancelled) setResult(data)
    }).catch(() => {
      if (!cancelled) { setFailed(true); setResult(null) }
    }).finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [kind, query, refreshKey])

  const number = new Intl.NumberFormat(language)
  const names = new Intl.DisplayNames([language], { type: "region" })
  const pages = result ? Math.max(1, Math.ceil(result.total / result.size)) : 1

  return (
    <dialog ref={dialogRef} className="analytics-registry-dialog" aria-labelledby="registry-title" onCancel={event => { event.preventDefault(); onClose() }}>
      <div className="analytics-registry-heading">
        <h2 id="registry-title">{text[kind]}</h2>
        <button type="button" onClick={onClose}>{text.close}</button>
      </div>
      <label className="analytics-registry-search">{text.search}
        <input ref={searchRef} type="search" value={search} maxLength={200} onChange={event => setSearch(event.target.value)} />
      </label>
      <div className="analytics-registry-body" aria-busy={loading}>
        {loading ? <p role="status">{text.loading}</p> : failed ? <div role="alert">
          <p>{text.error}</p><button type="button" onClick={() => setRefreshKey(key => key + 1)}>{text.retry}</button>
        </div> : result && <>
          <p role="status">{text.total} : {number.format(result.total)}</p>
          <div className="analytics-registry-table">
            <table>
              <thead><tr><th scope="col">{text.name}</th>
                {kind === "locations" && <th scope="col">{text.company}</th>}
                <th scope="col">{text.country}</th><th scope="col">{text.city}</th><th scope="col">{text.status}</th>
                {kind === "companies" && <th scope="col">{text.sites}</th>}
              </tr></thead>
              <tbody>{result.items.length === 0 ? <tr><td colSpan={kind === "locations" ? 6 : 5}>{text.empty}</td></tr> : result.items.map(row => (
                <tr key={row.id}>
                  <th scope="row">{row.name}{"primaryLocation" in row && row.primaryLocation && <small>{text.primary}</small>}</th>
                  {"companyName" in row && <td>{row.companyName}</td>}
                  <td>{row.countryCode === "ZZ" ? row.country || text.unknown : names.of(row.countryCode)}</td>
                  <td>{row.city || "—"}</td><td>{row.active ? text.active : text.inactive}</td>
                  {"sites" in row && <td>{number.format(row.sites)}</td>}
                </tr>
              ))}</tbody>
            </table>
          </div>
        </>}
      </div>
      {result && <nav className="analytics-registry-pagination" aria-label={text.page}>
        <button type="button" disabled={loading || query.page <= 0} onClick={() => setQuery(current => ({ ...current, page: current.page - 1 }))}>{text.previous}</button>
        <span>{text.page} {number.format(query.page + 1)} / {number.format(pages)}</span>
        <button type="button" disabled={loading || query.page + 1 >= pages} onClick={() => setQuery(current => ({ ...current, page: current.page + 1 }))}>{text.next}</button>
      </nav>}
    </dialog>
  )
}
