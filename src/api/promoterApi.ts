import { apiGet } from "./client"
import { apiPost } from "./client"

export type PromoterClientSummaryResponse = {
  companyId: number
  companyName: string
  planCode: string
  planName: string
  subscriptionStatus: string
  nextPaymentDate: string | null
  totalClientPayments: number
  totalCommissionAmount: number
}

export type PromoterDashboardResponse = {
  partnerCodeId: number
  partnerCode: string
  promoterName: string
  email: string | null
  phone: string | null
  totalClients: number
  totalClientPayments: number
  totalCommissionAmount: number
  totalPayoutAmount: number
  balanceAmount: number
  clients: PromoterClientSummaryResponse[]
  payouts: {
    id: number
    amount: number
    currency: string
    previousBalance: number
    newBalance: number
    notes: string | null
    paidAt: string
    createdAt: string | null
    reportStatus: string | null
    reportRecipientEmail: string | null
    reportGeneratedAt: string | null
    reportSentAt: string | null
    reportAcknowledgedAt: string | null
    reportFailureReason: string | null
  }[]
}

export type PromoterReportAcknowledgementResponse = {
  payoutId: number
  reportLogId: number
  reportStatus: string
  reportSentAt: string | null
  acknowledgedAt: string | null
}

export function getPromoterDashboard(startDate?: string, endDate?: string) {
  const params = new URLSearchParams()

  if (startDate?.trim()) {
    params.set("startDate", startDate.trim())
  }

  if (endDate?.trim()) {
    params.set("endDate", endDate.trim())
  }

  const query = params.toString()
  return apiGet<PromoterDashboardResponse>(`/promoter/dashboard${query ? `?${query}` : ""}`)
}

export function acknowledgePromoterPayoutReport(payoutId: number) {
  return apiPost<PromoterReportAcknowledgementResponse, undefined>(
    `/promoter/payouts/${payoutId}/acknowledge`
  )
}
