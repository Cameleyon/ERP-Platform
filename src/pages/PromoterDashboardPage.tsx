import { useEffect, useMemo, useState } from "react"
import {
  acknowledgePromoterPayoutReport,
  getPromoterDashboard,
  type PromoterDashboardResponse,
} from "../api/promoterApi"
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
  const [acknowledgingPayoutId, setAcknowledgingPayoutId] = useState<number | null>(null)
  const [error, setError] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  const text =
    language === "fr"
      ? {
          title: "Portail promoteur",
          subtitle:
            "Suivez les entreprises rattachees a votre code, vos commissions, votre solde et vos versements.",
          refresh: "Actualiser",
          logout: "Deconnexion",
          filter: "Filtrer",
          startDate: "Date debut",
          endDate: "Date fin",
          code: "Code promoteur",
          balance: "Solde",
          totalClients: "Clients rattaches",
          totalClientPayments: "Montant client cumule",
          totalCommission: "Commission totale",
          totalPayouts: "Versements cumules",
          clientsTitle: "Clients",
          payoutsTitle: "Historique des versements",
          loading: "Chargement du portail promoteur...",
          empty: "Aucun client n'est encore rattache a votre code.",
          noPayouts: "Aucun versement sur cette periode.",
          company: "Entreprise",
          plan: "Plan",
          nextPaymentDate: "Prochaine date de paiement",
          status: "Statut",
          clientPayments: "Montant cumule client",
          commission: "Commission cumulee (15%)",
          payoutDate: "Date versement",
          payoutAmount: "Montant paye",
          reportStatus: "Statut rapport",
          reportSentAt: "Rapport envoye le",
          acknowledgedAt: "Accuse recu le",
          acknowledge: "Confirmer reception",
          acknowledging: "Confirmation...",
          reportFailure: "Erreur rapport",
          action: "Action",
          unavailable: "Non definie",
          loadError: "Impossible de charger les informations du promoteur",
          reportPending: "En preparation",
          reportSent: "Envoye",
          reportFailed: "Echec",
        }
      : language === "es"
        ? {
            title: "Portal del promotor",
            subtitle:
              "Siga las empresas vinculadas a su codigo, sus comisiones, su saldo y sus pagos recibidos.",
            refresh: "Actualizar",
            logout: "Cerrar sesion",
            filter: "Filtrar",
            startDate: "Fecha inicial",
            endDate: "Fecha final",
            code: "Codigo del promotor",
            balance: "Saldo",
            totalClients: "Clientes vinculados",
            totalClientPayments: "Monto acumulado del cliente",
            totalCommission: "Comision total",
            totalPayouts: "Pagos acumulados",
            clientsTitle: "Clientes",
            payoutsTitle: "Historial de pagos",
            loading: "Cargando el portal del promotor...",
            empty: "Todavia no hay clientes vinculados a su codigo.",
            noPayouts: "No hay pagos en este periodo.",
            company: "Empresa",
            plan: "Plan",
            nextPaymentDate: "Proxima fecha de pago",
            status: "Estado",
            clientPayments: "Monto acumulado del cliente",
            commission: "Comision acumulada (15%)",
            payoutDate: "Fecha del pago",
            payoutAmount: "Monto pagado",
            reportStatus: "Estado del reporte",
            reportSentAt: "Reporte enviado el",
            acknowledgedAt: "Acuse recibido el",
            acknowledge: "Confirmar recepcion",
            acknowledging: "Confirmando...",
            reportFailure: "Error del reporte",
            action: "Accion",
            unavailable: "No definido",
            loadError: "No se pudo cargar la informacion del promotor",
            reportPending: "Preparando",
            reportSent: "Enviado",
            reportFailed: "Fallido",
          }
        : {
            title: "Promoter portal",
            subtitle:
              "Track the companies attached to your code, your commissions, your outstanding balance, and your payouts.",
            refresh: "Refresh",
            logout: "Logout",
            filter: "Filter",
            startDate: "Start date",
            endDate: "End date",
            code: "Promoter code",
            balance: "Balance",
            totalClients: "Attached clients",
            totalClientPayments: "Cumulative client amount",
            totalCommission: "Total commission",
            totalPayouts: "Total payouts",
            clientsTitle: "Clients",
            payoutsTitle: "Payout history",
            loading: "Loading promoter portal...",
            empty: "No clients are attached to your code yet.",
            noPayouts: "No payouts found in this period.",
            company: "Company",
            plan: "Plan",
            nextPaymentDate: "Next payment date",
            status: "Status",
            clientPayments: "Client cumulative amount",
            commission: "Cumulative commission (15%)",
            payoutDate: "Payout date",
            payoutAmount: "Amount paid",
            reportStatus: "Report status",
            reportSentAt: "Report sent at",
            acknowledgedAt: "Acknowledged at",
            acknowledge: "Confirm receipt",
            acknowledging: "Confirming...",
            reportFailure: "Report error",
            action: "Action",
            unavailable: "Not set",
            loadError: "Unable to load promoter information",
            reportPending: "Preparing",
            reportSent: "Sent",
            reportFailed: "Failed",
          }

  async function loadDashboard(isRefresh = false) {
    try {
      if (isRefresh) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }
      setError("")
      const response = await getPromoterDashboard(startDate, endDate)
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
    void loadDashboard()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const locale = getLocale(language)
  const amountFormatter = useMemo(
    () =>
      new Intl.NumberFormat(locale, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
    [locale]
  )
  const dateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
    [locale]
  )

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

  function formatReportStatus(value: string | null | undefined) {
    if (value === "SENT") {
      return text.reportSent
    }
    if (value === "FAILED") {
      return text.reportFailed
    }
    return text.reportPending
  }

  async function handleAcknowledgePayout(payoutId: number) {
    try {
      setAcknowledgingPayoutId(payoutId)
      setError("")
      await acknowledgePromoterPayoutReport(payoutId)
      await loadDashboard(true)
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : text.loadError)
    } finally {
      setAcknowledgingPayoutId(null)
    }
  }

  if (loading) {
    return <div className="promoter-loading">{text.loading}</div>
  }

  return (
    <div className="promoter-page">
      <section className="promoter-hero card">
        <div className="promoter-hero-top">
          <div className="promoter-hero-copy">
            <h1>{text.title}</h1>
            <p>{text.subtitle}</p>
          </div>
          <div className="promoter-hero-actions">
            <LanguageSwitcher />
            <button type="button" className="secondary-button" onClick={logoutUser}>
              {text.logout}
            </button>
          </div>
        </div>

        <div className="promoter-filter-bar">
          <label className="promoter-filter-field">
            <span>{text.startDate}</span>
            <input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} />
          </label>
          <label className="promoter-filter-field">
            <span>{text.endDate}</span>
            <input type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} />
          </label>
          <button
            type="button"
            className="secondary-button"
            onClick={() => void loadDashboard(true)}
            disabled={refreshing}
          >
            {refreshing ? `${text.filter}...` : text.filter}
          </button>
          <button
            type="button"
            className="secondary-button"
            onClick={() => void loadDashboard(true)}
            disabled={refreshing}
          >
            {refreshing ? `${text.refresh}...` : text.refresh}
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
              <span>{text.balance}</span>
              <strong>{formatAmount(dashboard.balanceAmount)}</strong>
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

            <article className="card promoter-summary-card">
              <span>{text.totalPayouts}</span>
              <strong>{formatAmount(dashboard.totalPayoutAmount)}</strong>
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

          <section className="card promoter-clients-card">
            <div className="promoter-clients-head">
              <h2>{text.payoutsTitle}</h2>
            </div>

            {dashboard.payouts.length === 0 ? (
              <div className="promoter-empty-state">{text.noPayouts}</div>
            ) : (
              <div className="promoter-table-wrap">
                <table className="promoter-table">
                  <thead>
                    <tr>
                      <th>{text.payoutDate}</th>
                      <th>{text.payoutAmount}</th>
                      <th>{text.balance}</th>
                      <th>{text.reportStatus}</th>
                      <th>{text.reportSentAt}</th>
                      <th>{text.acknowledgedAt}</th>
                      <th>{text.reportFailure}</th>
                      <th>{text.action}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboard.payouts.map((payout) => (
                      <tr key={payout.id}>
                        <td>{formatDate(payout.paidAt)}</td>
                        <td>{formatAmount(payout.amount)}</td>
                        <td>{formatAmount(payout.newBalance)}</td>
                        <td>{formatReportStatus(payout.reportStatus)}</td>
                        <td>{formatDate(payout.reportSentAt)}</td>
                        <td>{formatDate(payout.reportAcknowledgedAt)}</td>
                        <td>{payout.reportFailureReason || text.unavailable}</td>
                        <td>
                          {payout.reportStatus === "SENT" && !payout.reportAcknowledgedAt ? (
                            <button
                              type="button"
                              className="secondary-button"
                              onClick={() => void handleAcknowledgePayout(payout.id)}
                              disabled={acknowledgingPayoutId === payout.id}
                            >
                              {acknowledgingPayoutId === payout.id ? text.acknowledging : text.acknowledge}
                            </button>
                          ) : (
                            "-"
                          )}
                        </td>
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
