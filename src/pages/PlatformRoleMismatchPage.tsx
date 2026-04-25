import { useAuth } from "../auth/AuthContext"
import LanguageSwitcher from "../components/common/LanguageSwitcher"
import { useI18n } from "../i18n/I18nContext"

type Props = {
  companyAppUrl: string
}

export default function PlatformRoleMismatchPage({ companyAppUrl }: Props) {
  const { logoutUser, user } = useAuth()
  const { language } = useI18n()

  const text =
    language === "fr"
      ? {
          title: "Ce compte utilise le portail entreprise",
          message: "Votre role n'est pas gere dans l'espace plateforme. Utilisez plutot le portail entreprise pour continuer.",
          goToCompanyApp: "Ouvrir le portail entreprise",
          logout: "Deconnexion",
          connectedAs: "Connecte en tant que",
        }
      : language === "es"
        ? {
            title: "Esta cuenta usa el portal de empresa",
            message: "Su rol no se gestiona en el espacio de plataforma. Use el portal de empresa para continuar.",
            goToCompanyApp: "Abrir portal de empresa",
            logout: "Cerrar sesion",
            connectedAs: "Conectado como",
          }
        : {
            title: "This account uses the company portal",
            message: "Your role is not managed in the platform workspace. Please use the company portal instead.",
            goToCompanyApp: "Open company portal",
            logout: "Logout",
            connectedAs: "Signed in as",
          }

  return (
    <div className="platform-role-page">
      <div className="platform-role-card card">
        <div className="platform-login-topbar">
          <LanguageSwitcher />
          <button type="button" className="secondary-button" onClick={logoutUser}>
            {text.logout}
          </button>
        </div>
        <h1>{text.title}</h1>
        <p>{text.message}</p>
        <p className="platform-role-meta">
          {text.connectedAs}: <strong>{user?.email}</strong>
        </p>
        <a className="platform-role-link" href={companyAppUrl}>
          {text.goToCompanyApp}
        </a>
      </div>
    </div>
  )
}
