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
          email: "Email",
          password: "Mot de passe",
          emailPlaceholder: "your@email.com",
          passwordPlaceholder: "Entrez votre mot de passe",
          submit: "Se connecter",
          submitting: "Connexion...",
          fallbackError: "La connexion a echoue",
        }
      : language === "es"
        ? {
            eyebrow: "Portal de plataforma",
            title: "CAMELEYON Platform",
            email: "Correo",
            password: "Contrasena",
            emailPlaceholder: "your@email.com",
            passwordPlaceholder: "Ingrese su contrasena",
            submit: "Iniciar sesion",
            submitting: "Conectando...",
            fallbackError: "Error de inicio de sesion",
          }
        : {
            eyebrow: "Platform portal",
            title: "CAMELEYON Platform",
            email: "Email",
            password: "Password",
            emailPlaceholder: "your@email.com",
            passwordPlaceholder: "Enter your password",
            submit: "Login",
            submitting: "Logging in...",
            fallbackError: "Login failed",
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
          </div>

          <div className="platform-login-copy">
            <p className="platform-login-eyebrow">{text.eyebrow}</p>
            <h1>{text.title}</h1>
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
      </section>
    </div>
  )
}
