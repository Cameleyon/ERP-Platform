import { useEffect, useMemo, useState } from "react"
import {
  createPromoterPayout,
  getPartnerCodes,
  getPromoterPayouts,
  type CreatePromoterPayoutRequest,
  type PartnerCodeResponse,
  type PromoterPayoutResponse,
} from "../../api/platformAdminApi"
import { useI18n } from "../../i18n/I18nContext"

function getLocale(language: "fr" | "en" | "es") {
  return language === "fr" ? "fr-FR" : language === "es" ? "es-ES" : "en-US"
}

function toDefaultDateTimeLocal() {
  const now = new Date()
  const offset = now.getTimezoneOffset()
  const adjusted = new Date(now.getTime() - offset * 60000)
  return adjusted.toISOString().slice(0, 16)
}

export default function PromoterFinanceSection() {
  const { language } = useI18n()
  const [partnerCodes, setPartnerCodes] = useState<PartnerCodeResponse[]>([])
  const [selectedPartner, setSelectedPartner] = useState<PartnerCodeResponse | null>(null)
  const [payouts, setPayouts] = useState<PromoterPayoutResponse[]>([])
  const [loadingPartners, setLoadingPartners] = useState(true)
  const [loadingPayouts, setLoadingPayouts] = useState(false)
  const [submittingPayout, setSubmittingPayout] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [filterStartDate, setFilterStartDate] = useState("")
  const [filterEndDate, setFilterEndDate] = useState("")
  const [payoutAmount, setPayoutAmount] = useState("")
  const [payoutNotes, setPayoutNotes] = useState("")
  const [paidAt, setPaidAt] = useState(toDefaultDateTimeLocal)

  const text =
    language === "fr"
      ? {
          eyebrow: "Promoteurs",
          title: "Versements promoteur",
          subtitle:
            "Suivez les commissions, le solde a verser et l'historique des rapports envoyes apres paiement.",
          startDate: "Date debut",
          endDate: "Date fin",
          applyFilter: "Filtrer",
          refresh: "Actualiser",
          loading: "Chargement des promoteurs...",
          loadingPayouts: "Chargement des versements...",
          noPromoters: "Aucun promoteur trouve pour le moment.",
          promoterCode: "Code",
          promoterName: "Promoteur",
          profileType: "Profil",
          totalPayments: "Paiements client",
          totalCommission: "Commission",
          totalPayouts: "Versements",
          balance: "Solde",
          action: "Action",
          manage: "Gerer",
          payoutFormTitle: "Enregistrer un versement",
          payoutAmount: "Montant paye",
          payoutDate: "Date du versement",
          payoutNotes: "Notes",
          payoutNotesPlaceholder: "Note optionnelle pour le paiement",
          submitPayout: "Enregistrer le versement",
          submitting: "Enregistrement...",
          payoutHistory: "Historique des versements",
          amount: "Montant",
          previousBalance: "Solde avant",
          newBalance: "Nouveau solde",
          reportStatus: "Rapport email",
          reportSentAt: "Envoye le",
          reportFailure: "Erreur rapport",
          noPayouts: "Aucun versement sur cette periode.",
          payoutCreated: "Versement enregistre avec succes.",
          loadError: "Impossible de charger les donnees promoteur",
          payoutError: "Impossible d'enregistrer le versement",
          selectPromoter: "Selectionnez un promoteur pour voir les details.",
          reportPending: "En preparation",
          reportSent: "Envoye",
          reportFailed: "Echec",
          profilePromoter: "Promoteur",
          profilePartner: "Apporteur",
        }
      : language === "es"
        ? {
            eyebrow: "Promotores",
            title: "Pagos del promotor",
            subtitle:
              "Siga las comisiones, el saldo pendiente y el historial de reportes enviados despues de cada pago.",
            startDate: "Fecha inicial",
            endDate: "Fecha final",
            applyFilter: "Filtrar",
            refresh: "Actualizar",
            loading: "Cargando promotores...",
            loadingPayouts: "Cargando pagos...",
            noPromoters: "Todavia no se encontraron promotores.",
            promoterCode: "Codigo",
            promoterName: "Promotor",
            profileType: "Perfil",
            totalPayments: "Pagos de clientes",
            totalCommission: "Comision",
            totalPayouts: "Pagos",
            balance: "Saldo",
            action: "Accion",
            manage: "Gestionar",
            payoutFormTitle: "Registrar un pago",
            payoutAmount: "Monto pagado",
            payoutDate: "Fecha del pago",
            payoutNotes: "Notas",
            payoutNotesPlaceholder: "Nota opcional para este pago",
            submitPayout: "Guardar pago",
            submitting: "Guardando...",
            payoutHistory: "Historial de pagos",
            amount: "Monto",
            previousBalance: "Saldo anterior",
            newBalance: "Nuevo saldo",
            reportStatus: "Reporte por correo",
            reportSentAt: "Enviado el",
            reportFailure: "Error del reporte",
            noPayouts: "No hay pagos en este periodo.",
            payoutCreated: "Pago registrado correctamente.",
            loadError: "No se pudieron cargar los datos del promotor",
            payoutError: "No se pudo registrar el pago",
            selectPromoter: "Seleccione un promotor para ver los detalles.",
            reportPending: "Preparando",
            reportSent: "Enviado",
            reportFailed: "Fallido",
            profilePromoter: "Promotor",
            profilePartner: "Referidor",
          }
        : {
            eyebrow: "Promoters",
            title: "Promoter payouts",
            subtitle:
              "Track earned commissions, the balance still due, and the history of payment reports sent by email.",
            startDate: "Start date",
            endDate: "End date",
            applyFilter: "Filter",
            refresh: "Refresh",
            loading: "Loading promoters...",
            loadingPayouts: "Loading payouts...",
            noPromoters: "No promoters found yet.",
            promoterCode: "Code",
            promoterName: "Promoter",
            profileType: "Profile",
            totalPayments: "Client payments",
            totalCommission: "Commission",
            totalPayouts: "Payouts",
            balance: "Balance",
            action: "Action",
            manage: "Manage",
            payoutFormTitle: "Record a payout",
            payoutAmount: "Amount paid",
            payoutDate: "Payout date",
            payoutNotes: "Notes",
            payoutNotesPlaceholder: "Optional note for this payment",
            submitPayout: "Save payout",
            submitting: "Saving...",
            payoutHistory: "Payout history",
            amount: "Amount",
            previousBalance: "Previous balance",
            newBalance: "New balance",
            reportStatus: "Email report",
            reportSentAt: "Sent at",
            reportFailure: "Report error",
            noPayouts: "No payouts found in this period.",
            payoutCreated: "Payout saved successfully.",
            loadError: "Unable to load promoter data",
            payoutError: "Unable to save the payout",
            selectPromoter: "Select a promoter to view details.",
            reportPending: "Preparing",
            reportSent: "Sent",
            reportFailed: "Failed",
            profilePromoter: "Promoter",
            profilePartner: "Referral partner",
          }

  const locale = getLocale(language)

  const moneyFormatter = useMemo(
    () =>
      new Intl.NumberFormat(locale, {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
    [locale]
  )

  const dateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        dateStyle: "medium",
        timeStyle: "short",
      }),
    [locale]
  )

  useEffect(() => {
    void loadPartnerCodes()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function loadPartnerCodes(partnerToKeepId?: number) {
    try {
      setLoadingPartners(true)
      setError("")
      const response = await getPartnerCodes(filterStartDate, filterEndDate)
      const promoters = response.filter((partner) => partner.profileType === "PROMOTER")
      setPartnerCodes(promoters)

      const nextSelected =
        promoters.find((partner) => partner.id === (partnerToKeepId ?? selectedPartner?.id)) ??
        promoters[0] ??
        null

      setSelectedPartner(nextSelected)

      if (nextSelected) {
        await loadPayouts(nextSelected.id)
      } else {
        setPayouts([])
      }
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : text.loadError)
    } finally {
      setLoadingPartners(false)
    }
  }

  async function loadPayouts(partnerCodeId: number) {
    try {
      setLoadingPayouts(true)
      const response = await getPromoterPayouts(partnerCodeId, filterStartDate, filterEndDate)
      setPayouts(response)
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : text.loadError)
    } finally {
      setLoadingPayouts(false)
    }
  }

  async function handleApplyFilters(event?: React.FormEvent) {
    event?.preventDefault()
    await loadPartnerCodes(selectedPartner?.id)
  }

  async function handleSelectPartner(partner: PartnerCodeResponse) {
    setSelectedPartner(partner)
    setSuccess("")
    await loadPayouts(partner.id)
  }

  async function handleCreatePayout(event: React.FormEvent) {
    event.preventDefault()

    if (!selectedPartner) {
      return
    }

    try {
      setSubmittingPayout(true)
      setError("")
      setSuccess("")

      const payload: CreatePromoterPayoutRequest = {
        amount: Number(payoutAmount),
        currency: "USD",
        notes: payoutNotes.trim() || undefined,
        paidAt: paidAt || undefined,
      }

      await createPromoterPayout(selectedPartner.id, payload)
      setPayoutAmount("")
      setPayoutNotes("")
      setPaidAt(toDefaultDateTimeLocal())
      setSuccess(text.payoutCreated)
      await loadPartnerCodes(selectedPartner.id)
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : text.payoutError)
    } finally {
      setSubmittingPayout(false)
    }
  }

  function formatMoney(value: number | null | undefined) {
    return moneyFormatter.format(value ?? 0)
  }

  function formatDateTime(value: string | null | undefined) {
    if (!value) {
      return "-"
    }

    const date = new Date(value)
    if (Number.isNaN(date.getTime())) {
      return value
    }

    return dateFormatter.format(date)
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

  function profileLabel(profileType: string) {
    return profileType === "PROMOTER" ? text.profilePromoter : text.profilePartner
  }

  return (
    <section className="platform-section-grid">
      <article className="card">
        <div className="section-heading">
          <div>
            <p className="eyebrow">{text.eyebrow}</p>
            <h2>{text.title}</h2>
            <p className="platform-section-copy">{text.subtitle}</p>
          </div>
        </div>

        <form className="platform-inline-actions promoter-filter-bar" onSubmit={handleApplyFilters}>
          <label className="platform-inline-field">
            {text.startDate}
            <input
              type="date"
              value={filterStartDate}
              onChange={(event) => setFilterStartDate(event.target.value)}
            />
          </label>
          <label className="platform-inline-field">
            {text.endDate}
            <input type="date" value={filterEndDate} onChange={(event) => setFilterEndDate(event.target.value)} />
          </label>
          <button type="submit" disabled={loadingPartners}>
            {text.applyFilter}
          </button>
          <button
            type="button"
            className="secondary-button"
            onClick={() => void loadPartnerCodes(selectedPartner?.id)}
            disabled={loadingPartners}
          >
            {text.refresh}
          </button>
        </form>

        {error && <div className="card error">{error}</div>}
        {success && <div className="card success">{success}</div>}

        {loadingPartners ? (
          <div className="platform-empty-state">{text.loading}</div>
        ) : partnerCodes.length === 0 ? (
          <div className="platform-empty-state">{text.noPromoters}</div>
        ) : (
          <div className="platform-partner-table">
            <table>
              <thead>
                <tr>
                  <th>{text.promoterCode}</th>
                  <th>{text.promoterName}</th>
                  <th>{text.profileType}</th>
                  <th>{text.totalPayments}</th>
                  <th>{text.totalCommission}</th>
                  <th>{text.totalPayouts}</th>
                  <th>{text.balance}</th>
                  <th>{text.action}</th>
                </tr>
              </thead>
              <tbody>
                {partnerCodes.map((partner) => (
                  <tr key={partner.id}>
                    <td>{partner.code}</td>
                    <td>{partner.ownerName || "-"}</td>
                    <td>{profileLabel(partner.profileType)}</td>
                    <td>{formatMoney(partner.totalClientPayments)}</td>
                    <td>{formatMoney(partner.totalCommissionAmount)}</td>
                    <td>{formatMoney(partner.totalPayoutAmount)}</td>
                    <td>{formatMoney(partner.balanceAmount)}</td>
                    <td>
                      <button
                        type="button"
                        className="secondary-button"
                        onClick={() => void handleSelectPartner(partner)}
                      >
                        {text.manage}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </article>

      <article className="card">
        {!selectedPartner ? (
          <div className="platform-empty-state">{text.selectPromoter}</div>
        ) : (
          <>
            <div className="section-heading">
              <div>
                <p className="eyebrow">{selectedPartner.code}</p>
                <h2>{selectedPartner.ownerName || selectedPartner.code}</h2>
                <p className="platform-section-copy">
                  {text.balance}: {formatMoney(selectedPartner.balanceAmount)}
                </p>
              </div>
            </div>

            <form className="platform-form-grid" onSubmit={handleCreatePayout}>
              <label>
                {text.payoutAmount}
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={payoutAmount}
                  onChange={(event) => setPayoutAmount(event.target.value)}
                  required
                />
              </label>
              <label>
                {text.payoutDate}
                <input type="datetime-local" value={paidAt} onChange={(event) => setPaidAt(event.target.value)} />
              </label>
              <label className="full-width">
                {text.payoutNotes}
                <textarea
                  value={payoutNotes}
                  onChange={(event) => setPayoutNotes(event.target.value)}
                  placeholder={text.payoutNotesPlaceholder}
                />
              </label>
              <div className="form-actions full-width">
                <button type="submit" disabled={submittingPayout}>
                  {submittingPayout ? text.submitting : text.submitPayout}
                </button>
              </div>
            </form>

            <div className="section-heading promoter-history-heading">
              <div>
                <p className="eyebrow">{text.eyebrow}</p>
                <h2>{text.payoutHistory}</h2>
              </div>
            </div>

            {loadingPayouts ? (
              <div className="platform-empty-state">{text.loadingPayouts}</div>
            ) : payouts.length === 0 ? (
              <div className="platform-empty-state">{text.noPayouts}</div>
            ) : (
              <div className="platform-partner-table">
                <table>
                  <thead>
                    <tr>
                      <th>{text.payoutDate}</th>
                      <th>{text.amount}</th>
                      <th>{text.previousBalance}</th>
                      <th>{text.newBalance}</th>
                      <th>{text.reportStatus}</th>
                      <th>{text.reportSentAt}</th>
                      <th>{text.reportFailure}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payouts.map((payout) => (
                      <tr key={payout.id}>
                        <td>{formatDateTime(payout.paidAt)}</td>
                        <td>{formatMoney(payout.amount)}</td>
                        <td>{formatMoney(payout.previousBalance)}</td>
                        <td>{formatMoney(payout.newBalance)}</td>
                        <td>{formatReportStatus(payout.reportStatus)}</td>
                        <td>{formatDateTime(payout.reportSentAt)}</td>
                        <td>{payout.reportFailureReason || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </article>
    </section>
  )
}
