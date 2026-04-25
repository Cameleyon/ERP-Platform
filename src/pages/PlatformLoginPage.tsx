import { useState } from "react"
import { useAuth } from "../auth/AuthContext"
import LanguageSwitcher from "../components/common/LanguageSwitcher"
import { useI18n } from "../i18n/I18nContext"

export default function PlatformLoginPage() {
  const { loginUser } = useAuth()
  const { language } = useI18n()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const text =
    language === "fr"
      ? {
          eyebrow: "Portail plateforme",
          title: "CAMELEYON Platform",
          subtitle: "Connectez-vous pour gerer la plateforme ou suivre vos commissions promoteur.",
          supportedRoles: "Acces dedie aux super admins et promoteurs",
          email: "Email",
          password: "Mot de passe",
          emailPlaceholder: "vous@cameleyondynamics.com",
          passwordPlaceholder: "Entrez votre mot de passe",
          submit: "Se connecter",
          submitting: "Connexion...",
          fallbackError: "La connexion a echoue",
          supportTitle: "Ce portail couvre",
          supportOne: "Gestion des plans, abonnements et entreprises",
          supportTwo: "Vue promoteur avec clients, renouvellements et commissions",
        }
      : language === "es"
        ? {
            eyebrow: "Portal de plataforma",
            title: "CAMELEYON Platform",
            subtitle: "Inicie sesion para administrar la plataforma o seguir sus comisiones de promotor.",
            supportedRoles: "Acceso dedicado a superadministradores y promotores",
            email: "Correo",
            password: "Contrasena",
            emailPlaceholder: "usted@cameleyondynamics.com",
            passwordPlaceholder: "Ingrese su contrasena",
            submit: "Iniciar sesion",
            submitting: "Conectando...",
            fallbackError: "Error de inicio de sesion",
            supportTitle: "Este portal cubre",
            supportOne: "Gestion de planes, suscripciones y empresas",
            supportTwo: "Vista del promotor con clientes, renovaciones y comisiones",
          }
        : {
            eyebrow: "Platform portal",
            title: "CAMELEYON Platform",
            subtitle: "Sign in to manage the platform or track your promoter commissions.",
            supportedRoles: "Dedicated access for super admins and promoters",
            email: "Email",
            password: "Password",
            emailPlaceholder: "you@cameleyondynamics.com",
            passwordPlaceholder: "Enter your password",
            submit: "Login",
            submitting: "Logging in...",
            fallbackError: "Login failed",
            supportTitle: "This portal covers",
            supportOne: "Plans, subscriptions, and managed companies",
            supportTwo: "Promoter view with clients, renewals, and commissions",
          }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()

    try {
      setLoading(true)
      setError("")
      await loginUser({ email, password })
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : text.fallbackError)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="platform-login-page">
      <section className="platform-login-shell">
        <article className="platform-login-panel">
          <div className="platform-login-topbar">
            <LanguageSwitcher />
            <span className="platform-login-role-chip">{text.supportedRoles}</span>
          </div>

          <div className="platform-login-copy">
            <p className="platform-login-eyebrow">{text.eyebrow}</p>
            <h1>{text.title}</h1>
            <p>{text.subtitle}</p>
          </div>

          {error && <div className="card error">{error}</div>}

          <form className="platform-login-form" onSubmit={handleSubmit}>
            <label>
              {text.email}
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder={text.emailPlaceholder}
              />
            </label>
            <label>
              {text.password}
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder={text.passwordPlaceholder}
              />
            </label>
            <button type="submit" disabled={loading}>
              {loading ? text.submitting : text.submit}
            </button>
          </form>
        </article>

        <aside className="platform-login-aside card">
          <h2>{text.supportTitle}</h2>
          <ul>
            <li>{text.supportOne}</li>
            <li>{text.supportTwo}</li>
          </ul>
        </aside>
      </section>
    </div>
  )
}
