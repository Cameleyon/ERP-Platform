import { useEffect } from "react"
import { AuthProvider, useAuth } from "./auth/AuthContext"
import { LanguageProvider, useI18n } from "./i18n/I18nContext"
import PlatformConsolePage from "./pages/PlatformConsolePage"
import PlatformLoginPage from "./pages/PlatformLoginPage"
import PlatformRoleMismatchPage from "./pages/PlatformRoleMismatchPage"
import PromoterDashboardPage from "./pages/PromoterDashboardPage"

const COMPANY_APP_URL =
  (import.meta.env.VITE_COMPANY_APP_URL as string | undefined)?.trim() ||
  "https://erp.cameleyondynamics.com"

function AppContent() {
  const { isAuthenticated, isLoading, user } = useAuth()
  const { copy } = useI18n()

  useEffect(() => {
    const primaryColor = user?.role === "PROMOTER" ? "#1d7c74" : "#0f6b9b"
    const sidebarColor = "#044975"

    document.documentElement.style.setProperty("--primary-color", primaryColor)
    document.documentElement.style.setProperty("--sidebar-color", sidebarColor)
  }, [user])

  if (isLoading) {
    return <div style={{ padding: 24 }}>{copy.app.sessionLoading}</div>
  }

  if (!isAuthenticated) {
    return <PlatformLoginPage />
  }

  if (user?.role === "SUPER_ADMIN") {
    return <PlatformConsolePage />
  }

  if (user?.role === "PROMOTER") {
    return <PromoterDashboardPage />
  }

  return <PlatformRoleMismatchPage companyAppUrl={COMPANY_APP_URL} />
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </LanguageProvider>
  )
}
