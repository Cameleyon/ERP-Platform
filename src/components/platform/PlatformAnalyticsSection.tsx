import { useEffect, useState } from "react"
import { apiGet } from "../../api/client"
import { useI18n } from "../../i18n/I18nContext"
import "./PlatformAnalyticsSection.css"
import PlatformRegistryDialog from "./PlatformRegistryDialog"

type CountryCount = { countryCode: string; visits: number; uniqueVisitors: number; locations: number }
type Overview = {
  visits: number; uniqueVisitors: number; companies: number; locations: number
  trackingConfigured: boolean; trackingSince: string | null; countries: CountryCount[]
}

function range(days: number) {
  const end = new Date()
  const start = new Date(end)
  start.setUTCDate(start.getUTCDate() - days + 1)
  return { startDate: start.toISOString().slice(0, 10), endDate: end.toISOString().slice(0, 10) }
}

export default function PlatformAnalyticsSection() {
  const { language } = useI18n()
  const [preset, setPreset] = useState("30")
  const [dates, setDates] = useState(() => range(30))
  const [applied, setApplied] = useState(() => range(30))
  const [overview, setOverview] = useState<Overview | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [refreshKey, setRefreshKey] = useState(0)
  const [rangeError, setRangeError] = useState(false)
  const [details, setDetails] = useState<"companies" | "locations" | null>(null)

  const text = language === "fr" ? {
    title: "Activité de la plateforme", visits: "Visites", visitors: "Visiteurs uniques", uniqueColumn: "Uniques",
    companies: "Entreprises enregistrées", locations: "Localisations / sites", sites: "Sites", today: "Aujourd’hui",
    week: "7 jours", month: "30 jours", custom: "Personnalisé", start: "Du", end: "Au",
    apply: "Appliquer", refresh: "Actualiser", country: "Pays", unknown: "Pays non renseigné",
    empty: "Aucune donnée pour cette période.", loading: "Chargement des statistiques…",
    invalid: "Choisissez une période valide de 366 jours maximum.",
    error: "Impossible de charger les statistiques.",
    note: "Visites et visiteurs uniques sur la période (UTC). Entreprises et sites : totaux actuels, y compris inactifs. Un visiteur unique correspond à un navigateur.",
    disabled: "Le suivi des visites n’est pas encore configuré.",
    noVisits: "Aucune visite enregistrée. Le suivi n’est pas rétroactif.", since: "Première visite enregistrée le",
  } : language === "es" ? {
    title: "Actividad de la plataforma", visits: "Visitas", visitors: "Visitantes únicos", uniqueColumn: "Únicos",
    companies: "Empresas registradas", locations: "Ubicaciones / sitios", sites: "Sitios", today: "Hoy",
    week: "7 días", month: "30 días", custom: "Personalizado", start: "Desde", end: "Hasta",
    apply: "Aplicar", refresh: "Actualizar", country: "País", unknown: "País no indicado",
    empty: "No hay datos para este período.", loading: "Cargando estadísticas…",
    invalid: "Seleccione un período válido de hasta 366 días.", error: "No se pudieron cargar las estadísticas.",
    note: "Visitas y visitantes únicos del período (UTC). Empresas y sitios: totales actuales, incluidos los inactivos. Un visitante único corresponde a un navegador.",
    disabled: "El seguimiento de visitas aún no está configurado.",
    noVisits: "No se registraron visitas. El seguimiento no es retroactivo.", since: "Primera visita registrada el",
  } : {
    title: "Platform activity", visits: "Visits", visitors: "Unique visitors", uniqueColumn: "Unique", companies: "Registered companies",
    locations: "Locations / sites", sites: "Sites", today: "Today", week: "7 days", month: "30 days", custom: "Custom",
    start: "From", end: "To", apply: "Apply", refresh: "Refresh", country: "Country", unknown: "Country not provided",
    empty: "No data for this period.", loading: "Loading statistics…",
    invalid: "Choose a valid range of at most 366 days.", error: "Unable to load statistics.",
    note: "Visits and unique visitors within the period (UTC). Companies and sites: current totals, including inactive records. A unique visitor represents a browser.",
    disabled: "Visit tracking is not configured yet.", noVisits: "No visits recorded. Tracking is not retroactive.",
    since: "First visit recorded on",
  }

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError("")
    const query = new URLSearchParams(applied)
    apiGet<Overview>(`/admin/analytics?${query}`).then(value => {
      if (!cancelled) setOverview(value)
    }).catch(() => {
      if (!cancelled) { setError("load"); setOverview(null) }
    }).finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [applied, refreshKey])

  const number = new Intl.NumberFormat(language)
  const names = new Intl.DisplayNames([language], { type: "region" })
  function countryName(code: string) {
    return code === "ZZ" ? text.unknown : names.of(code) || code
  }

  function applyRange() {
    const days = (Date.parse(dates.endDate) - Date.parse(dates.startDate)) / 86_400_000
    const invalid = !Number.isFinite(days) || days < 0 || days > 365
    setRangeError(invalid)
    if (!invalid) { setApplied({ ...dates }); setRefreshKey(key => key + 1) }
  }

  return (
    <section className="platform-analytics" aria-labelledby="platform-analytics-title">
      <div className="platform-analytics-heading">
        <h2 id="platform-analytics-title">{text.title}</h2>
        <button type="button" onClick={() => setRefreshKey(key => key + 1)} disabled={loading}>{text.refresh}</button>
      </div>
      <form className="platform-analytics-filters" onSubmit={event => { event.preventDefault(); applyRange() }}>
        <select aria-label={text.custom} value={preset} onChange={event => {
          setPreset(event.target.value)
          setRangeError(false)
          if (event.target.value !== "custom") {
            const next = range(Number(event.target.value)); setDates(next); setApplied(next)
          }
        }}>
          <option value="1">{text.today}</option><option value="7">{text.week}</option>
          <option value="30">{text.month}</option><option value="custom">{text.custom}</option>
        </select>
        {preset === "custom" && <>
          <label>{text.start}<input type="date" required value={dates.startDate} onChange={event => setDates({ ...dates, startDate: event.target.value })} /></label>
          <label>{text.end}<input type="date" required value={dates.endDate} onChange={event => setDates({ ...dates, endDate: event.target.value })} /></label>
          <button type="submit" disabled={loading}>{text.apply}</button>
        </>}
      </form>
      {rangeError && <p role="alert" className="error">{text.invalid}</p>}
      {error && <p role="alert" className="error">{text.error}</p>}
      {loading ? <p role="status">{text.loading}</p> : overview && <>
        <dl className="platform-analytics-metrics">
          {[{ label: text.visits, value: overview.visits }, { label: text.visitors, value: overview.uniqueVisitors },
            { label: text.companies, value: overview.companies, kind: "companies" as const },
            { label: text.locations, value: overview.locations, kind: "locations" as const }].map(metric => (
            <div key={metric.label}><dt>{metric.label}</dt><dd>{metric.kind
              ? <button type="button" className="analytics-metric-link" aria-haspopup="dialog" aria-label={`${metric.label} : ${number.format(metric.value)}`} onClick={() => metric.kind && setDetails(metric.kind)}>{number.format(metric.value)}</button>
              : number.format(metric.value)}</dd></div>
          ))}
        </dl>
        <p className="platform-analytics-note">{text.note}</p>
        {!overview.trackingConfigured && <p role="status">{text.disabled}</p>}
        <p className="platform-analytics-note">{overview.trackingSince
          ? `${text.since} ${new Intl.DateTimeFormat(language, { dateStyle: "medium", timeZone: "UTC" }).format(new Date(overview.trackingSince))}.`
          : text.noVisits}</p>
        <div className="platform-analytics-table">
          <table>
            <thead><tr><th scope="col">{text.country}</th><th scope="col">{text.visits}</th><th scope="col" title={text.visitors} aria-label={text.visitors}>{text.uniqueColumn}</th><th scope="col">{text.sites}</th></tr></thead>
            <tbody>{overview.countries.length === 0 ? <tr><td colSpan={4}>{text.empty}</td></tr> :
              [...overview.countries].sort((a, b) => b.visits - a.visits || countryName(a.countryCode).localeCompare(countryName(b.countryCode), language)).map(row => (
                <tr key={row.countryCode}><th scope="row">{countryName(row.countryCode)}</th><td>{number.format(row.visits)}</td><td>{number.format(row.uniqueVisitors)}</td><td>{number.format(row.locations)}</td></tr>
              ))}</tbody>
          </table>
        </div>
      </>}
      {details && <PlatformRegistryDialog kind={details} onClose={() => setDetails(null)} />}
    </section>
  )
}
