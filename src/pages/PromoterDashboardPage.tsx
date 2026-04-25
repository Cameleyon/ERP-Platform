import { useEffect, useState } from "react"
import { getPromoterDashboard, type PromoterDashboardResponse } from "../api/promoterApi"
import { useAuth } from "../auth/AuthContext"
import LanguageSwitcher from "../components/common/LanguageSwitcher"
import { useI18n } from "../i18n/I18nContext"

function getLocale(language: "fr" | "en" | "es") {
  return language === "fr" ? "fr-FR" : language === "es" ? "es-ES" : "en-US"
}

export default function PromoterDashboardPage() {
  const { logoutUser } = useAuth()
  const { language } = useI18n()
  const [dashboard, setDashboard] = useState<PromoterDashboardResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState("")

  const text =
    language === "fr"
      ? {
          badge: "PROMOTEUR",
          title: "Portail promoteur",
          subtitle: "Suivez les entreprises rattachees a votre code et les commissions cumulees.",
          refresh: "Actualiser",
          logout: "Deconnexion",
          code: "Code promoteur",
          email: "Email",
          phone: "Telephone",
          totalClients: "Clients rattaches",
          totalClientPayments: "Montant client cumule",
          totalCommission: "Commission totale",
          clientsTitle: "Clients",
          loading: "Chargement du portail promoteur...",
          empty: "Aucun client n'est encore rattache a votre code.",
          company: "Entreprise",
          plan: "Plan",
          nextPaymentDate: "Prochaine date de paiement",
          status: "Statut",
          clientPayments: "Montant cumule client",
          commission: "Commission cumulee (15%)",
          unavailable: "Non definie",
          loadError: "Impossible de charger les informations du promoteur",
        }
      : language === "es"
        ? {
            badge: "PROMOTOR",
            title: "Portal del promotor",
            subtitle: "Siga las empresas vinculadas a su codigo y las comisiones acumuladas.",
            refresh: "Actualizar",
            logout: "Cerrar sesion",
            code: "Codigo del promotor",
            email: "Correo",
            phone: "Telefono",
            totalClients: "Clientes vinculados",
            totalClientPayments: "Monto acumulado del cliente",
            totalCommission: "Comision total",
            clientsTitle: "Clientes",
            loading: "Cargando el portal del promotor...",
            empty: "Todavia no hay clientes vinculados a su codigo.",
            company: "Empresa",
            plan: "Plan",
            nextPaymentDate: "Proxima fecha de pago",
            status: "Estado",
            clientPayments: "Monto acumulado del cliente",
            commission: "Comision acumulada (15%)",
            unavailable: "No definido",
            loadError: "No se pudo cargar la informacion del promotor",
          }
        : {
            badge: "PROMOTER",
            title: "Promoter portal",
            subtitle: "Track the companies attached to your code and the commissions you have accumulated.",
            refresh: "Refresh",
            logout: "Logout",
            code: "Promoter code",
            email: "Email",
            phone: "Phone",
            totalClients: "Attached clients",
            totalClientPayments: "Cumulative client amount",
            totalCommission: "Total commission",
            clientsTitle: "Clients",
            loading: "Loading promoter portal...",
            empty: "No clients are attached to your code yet.",
            company: "Company",
            plan: "Plan",
            nextPaymentDate: "Next payment date",
            status: "Status",
            clientPayments: "Client cumulative amount",
            commission: "Cumulative commission (15%)",
            unavailable: "Not set",
            loadError: "Unable to load promoter information",
          }

  async function loadDashboard(isRefresh = false) {
    try {
      if (isRefresh) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }
      setError("")
      const response = await getPromoterDashboard()
      setDashboard(response)
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : text.loadError)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadDashboard()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const locale = getLocale(language)
  const amountFormatter = new Intl.NumberFormat(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  const dateFormatter = new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  })

  function formatAmount(value: number | null | undefined) {
    if (value == null) {
      return text.unavailable
    }
    return amountFormatter.format(value)
  }

  function formatDate(value: string | null | undefined) {
    if (!value) {
      return text.unavailable
    }
    return dateFormatter.format(new Date(value))
  }

  if (loading) {
    return <div className="promoter-loading">{text.loading}</div>
  }

  return (
    <div className="promoter-page">
      <section className="promoter-hero card">
        <div>
          <div className="promoter-badge">{text.badge}</div>
          <h1>{text.title}</h1>
          <p>{text.subtitle}</p>
        </div>

        <div className="promoter-hero-actions">
          <LanguageSwitcher />
          <button
            type="button"
            className="secondary-button"
            onClick={() => loadDashboard(true)}
            disabled={refreshing}
          >
            {refreshing ? `${text.refresh}...` : text.refresh}
          </button>
          <button type="button" className="secondary-button" onClick={logoutUser}>
            {text.logout}
          </button>
        </div>
      </section>

      {error && <div className="card error">{error}</div>}

      {dashboard && (
        <>
          <section className="promoter-summary-grid">
            <article className="card promoter-summary-card">
              <span>{text.code}</span>
              <strong>{dashboard.partnerCode}</strong>
              <small>{dashboard.promoterName}</small>
            </article>

            <article className="card promoter-summary-card">
              <span>{text.email}</span>
              <strong>{dashboard.email || text.unavailable}</strong>
              <small>
                {text.phone}: {dashboard.phone || text.unavailable}
              </small>
            </article>

            <article className="card promoter-summary-card">
              <span>{text.totalClients}</span>
              <strong>{dashboard.totalClients}</strong>
            </article>

            <article className="card promoter-summary-card">
              <span>{text.totalClientPayments}</span>
              <strong>{formatAmount(dashboard.totalClientPayments)}</strong>
            </article>

            <article className="card promoter-summary-card promoter-summary-highlight">
              <span>{text.totalCommission}</span>
              <strong>{formatAmount(dashboard.totalCommissionAmount)}</strong>
            </article>
          </section>

          <section className="card promoter-clients-card">
            <div className="promoter-clients-head">
              <h2>{text.clientsTitle}</h2>
            </div>

            {dashboard.clients.length === 0 ? (
              <div className="promoter-empty-state">{text.empty}</div>
            ) : (
              <div className="promoter-table-wrap">
                <table className="promoter-table">
                  <thead>
                    <tr>
                      <th>{text.company}</th>
                      <th>{text.plan}</th>
                      <th>{text.nextPaymentDate}</th>
                      <th>{text.status}</th>
                      <th>{text.clientPayments}</th>
                      <th>{text.commission}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboard.clients.map((client) => (
                      <tr key={client.companyId}>
                        <td>{client.companyName}</td>
                        <td>{client.planName}</td>
                        <td>{formatDate(client.nextPaymentDate)}</td>
                        <td>{client.subscriptionStatus}</td>
                        <td>{formatAmount(client.totalClientPayments)}</td>
                        <td>{formatAmount(client.totalCommissionAmount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  )
}
