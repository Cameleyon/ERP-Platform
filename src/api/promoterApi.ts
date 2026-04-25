import { apiGet } from "./client"

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
  clients: PromoterClientSummaryResponse[]
}

export function getPromoterDashboard() {
  return apiGet<PromoterDashboardResponse>("/promoter/dashboard")
}
