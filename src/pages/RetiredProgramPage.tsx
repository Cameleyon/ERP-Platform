import { useAuth } from "../auth/AuthContext"
import { useI18n } from "../i18n/I18nContext"
import LanguageSwitcher from "../components/common/LanguageSwitcher"

export default function RetiredProgramPage() {
  const { logoutUser } = useAuth()
  const { language, copy } = useI18n()
  const text = language === "fr"
    ? { title: "Programme fermé", message: "Ce programme a pris fin. Cet espace n’est plus disponible." }
    : language === "es"
      ? { title: "Programa cerrado", message: "Este programa ha finalizado. Este espacio ya no está disponible." }
      : { title: "Program closed", message: "This program has ended. This workspace is no longer available." }

  return (
    <div className="platform-role-page">
      <main className="platform-role-card card">
        <div className="platform-login-topbar"><LanguageSwitcher /></div>
        <h1>{text.title}</h1>
        <p>{text.message}</p>
        <button type="button" onClick={logoutUser}>{copy.common.logout}</button>
      </main>
    </div>
  )
}
