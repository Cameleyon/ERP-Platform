import { useEffect, useState } from "react"
import { useAuth } from "../auth/AuthContext"
import {
  confirmPasswordReset,
  requestPasswordReset,
  type PasswordResetStartResponse,
} from "../auth/authApi"
import LanguageSwitcher from "../components/common/LanguageSwitcher"
import { useI18n } from "../i18n/I18nContext"

export default function PlatformLoginPage() {
  const { loginUser } = useAuth()
  const { language } = useI18n()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [requestingReset, setRequestingReset] = useState(false)
  const [confirmingReset, setConfirmingReset] = useState(false)
  const [resetCode, setResetCode] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmNewPassword, setConfirmNewPassword] = useState("")
  const [resetError, setResetError] = useState("")
  const [secondsLeft, setSecondsLeft] = useState(0)
  const [pendingReset, setPendingReset] = useState<PasswordResetStartResponse | null>(null)

  const text =
    language === "fr"
      ? {
          eyebrow: "Portail plateforme",
          title: "CAMELEYON Platform",
          email: "Email",
          password: "Mot de passe",
          emailPlaceholder: "votre@email.com",
          passwordPlaceholder: "Entrez votre mot de passe",
          submit: "Se connecter",
          submitting: "Connexion...",
          fallbackError: "La connexion a echoue",
          resetFallbackError: "La reinitialisation du mot de passe a echoue",
          forgotPassword: "Mot de passe oublie ?",
          requestReset: "Envoyer un code",
          requestingReset: "Envoi du code...",
          resetTitle: "Reinitialiser le mot de passe",
          resetSubtitle: (email: string) => `Saisissez le code envoye a ${email}.`,
          resetHint: "Vous avez 3 essais et 10 minutes.",
          resetCode: "Code de verification",
          resetCodePlaceholder: "Entrez le code",
          newPassword: "Nouveau mot de passe",
          newPasswordPlaceholder: "Entrez votre nouveau mot de passe",
          confirmNewPassword: "Confirmer le nouveau mot de passe",
          confirmNewPasswordPlaceholder: "Confirmez votre nouveau mot de passe",
          confirmReset: "Mettre a jour le mot de passe",
          confirmingReset: "Mise a jour...",
          resetSuccess: "Mot de passe mis a jour. Vous pouvez maintenant vous connecter.",
          emailRequiredForReset: "Renseignez d'abord votre email.",
          passwordMismatch: "La confirmation du mot de passe ne correspond pas.",
          verificationCodeRequired: "Le code de verification est requis.",
          newPasswordRequired: "Le nouveau mot de passe est requis.",
          attemptsRemaining: (count: number) => `Essais restants : ${count}`,
          timeRemaining: (count: number) => `Temps restant : ${count}s`,
        }
      : language === "es"
        ? {
            eyebrow: "Portal de plataforma",
            title: "CAMELEYON Platform",
            email: "Correo",
            password: "Contrasena",
            emailPlaceholder: "tu@email.com",
            passwordPlaceholder: "Ingrese su contrasena",
            submit: "Iniciar sesion",
            submitting: "Conectando...",
            fallbackError: "Error de inicio de sesion",
            resetFallbackError: "La restauracion de contrasena fallo",
            forgotPassword: "Olvido su contrasena?",
            requestReset: "Enviar codigo",
            requestingReset: "Enviando codigo...",
            resetTitle: "Restablecer contrasena",
            resetSubtitle: (email: string) => `Ingrese el codigo enviado a ${email}.`,
            resetHint: "Tiene 3 intentos y 10 minutos.",
            resetCode: "Codigo de verificacion",
            resetCodePlaceholder: "Ingrese el codigo",
            newPassword: "Nueva contrasena",
            newPasswordPlaceholder: "Ingrese su nueva contrasena",
            confirmNewPassword: "Confirmar nueva contrasena",
            confirmNewPasswordPlaceholder: "Confirme su nueva contrasena",
            confirmReset: "Actualizar contrasena",
            confirmingReset: "Actualizando...",
            resetSuccess: "Contrasena actualizada. Ahora puede iniciar sesion.",
            emailRequiredForReset: "Primero ingrese su correo.",
            passwordMismatch: "La confirmacion de la contrasena no coincide.",
            verificationCodeRequired: "El codigo de verificacion es obligatorio.",
            newPasswordRequired: "La nueva contrasena es obligatoria.",
            attemptsRemaining: (count: number) => `Intentos restantes: ${count}`,
            timeRemaining: (count: number) => `Tiempo restante: ${count}s`,
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
            resetFallbackError: "Password reset failed",
            forgotPassword: "Forgot password?",
            requestReset: "Send code",
            requestingReset: "Sending code...",
            resetTitle: "Reset password",
            resetSubtitle: (email: string) => `Enter the code sent to ${email}.`,
            resetHint: "You have 3 attempts and 10 minutes.",
            resetCode: "Verification code",
            resetCodePlaceholder: "Enter the code",
            newPassword: "New password",
            newPasswordPlaceholder: "Enter your new password",
            confirmNewPassword: "Confirm new password",
            confirmNewPasswordPlaceholder: "Confirm your new password",
            confirmReset: "Update password",
            confirmingReset: "Updating...",
            resetSuccess: "Password updated. You can now log in.",
            emailRequiredForReset: "Enter your email first.",
            passwordMismatch: "Password confirmation does not match.",
            verificationCodeRequired: "Verification code is required.",
            newPasswordRequired: "New password is required.",
            attemptsRemaining: (count: number) => `Attempts remaining: ${count}`,
            timeRemaining: (count: number) => `Time remaining: ${count}s`,
          }

  useEffect(() => {
    if (!pendingReset) {
      setSecondsLeft(0)
      return
    }

    const expiresAt = pendingReset.expiresAt

    function updateCountdown() {
      const remaining = Math.max(
        0,
        Math.ceil((new Date(expiresAt).getTime() - Date.now()) / 1000),
      )
      setSecondsLeft(remaining)

      if (remaining <= 0) {
        setPendingReset(null)
        setResetCode("")
        setNewPassword("")
        setConfirmNewPassword("")
        setResetError(text.resetFallbackError)
      }
    }

    updateCountdown()
    const timer = window.setInterval(updateCountdown, 1000)
    return () => {
      window.clearInterval(timer)
    }
  }, [pendingReset, text.resetFallbackError])

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()

    try {
      setLoading(true)
      setError("")
      setSuccess("")
      await loginUser({ email, password })
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : text.fallbackError)
    } finally {
      setLoading(false)
    }
  }

  async function handleRequestReset() {
    if (!email.trim()) {
      setError(text.emailRequiredForReset)
      return
    }

    try {
      setRequestingReset(true)
      setError("")
      setSuccess("")
      setResetError("")
      const response = await requestPasswordReset({ email: email.trim() })
      setPendingReset(response)
      setResetCode("")
      setNewPassword("")
      setConfirmNewPassword("")
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : text.resetFallbackError)
    } finally {
      setRequestingReset(false)
    }
  }

  async function handleConfirmReset(event: React.FormEvent) {
    event.preventDefault()

    if (!pendingReset) {
      return
    }
    if (!resetCode.trim()) {
      setResetError(text.verificationCodeRequired)
      return
    }
    if (!newPassword.trim()) {
      setResetError(text.newPasswordRequired)
      return
    }
    if (newPassword !== confirmNewPassword) {
      setResetError(text.passwordMismatch)
      return
    }

    try {
      setConfirmingReset(true)
      setResetError("")
      const response = await confirmPasswordReset({
        pendingResetId: pendingReset.pendingResetId,
        verificationCode: resetCode.trim(),
        newPassword: newPassword.trim(),
      })

      if (!response.reset) {
        if (response.requiresRestart || response.expired) {
          setPendingReset(null)
          setResetCode("")
          setNewPassword("")
          setConfirmNewPassword("")
        } else {
          setPendingReset((current) => current
            ? { ...current, attemptsRemaining: response.attemptsRemaining }
            : current)
        }
        setResetError(response.message)
        return
      }

      setPendingReset(null)
      setResetCode("")
      setNewPassword("")
      setConfirmNewPassword("")
      setSuccess(text.resetSuccess)
      setPassword("")
    } catch (err) {
      console.error(err)
      setResetError(err instanceof Error ? err.message : text.resetFallbackError)
    } finally {
      setConfirmingReset(false)
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
          {success && <div className="card success">{success}</div>}

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

          <button
            type="button"
            className="inline-text-button"
            onClick={handleRequestReset}
            disabled={requestingReset}
          >
            {requestingReset ? text.requestingReset : text.forgotPassword}
          </button>
        </article>
      </section>

      {pendingReset && (
        <div className="auth-overlay">
          <div className="auth-overlay-card">
            <h2>{text.resetTitle}</h2>
            <p>{text.resetSubtitle(pendingReset.email)}</p>
            <p>{text.resetHint}</p>
            <p><strong>{text.attemptsRemaining(pendingReset.attemptsRemaining)}</strong></p>
            <p><strong>{text.timeRemaining(secondsLeft)}</strong></p>

            {resetError && <div className="card error">{resetError}</div>}

            <form onSubmit={handleConfirmReset} className="platform-login-form">
              <label>
                {text.resetCode}
                <input
                  type="text"
                  value={resetCode}
                  onChange={(event) => setResetCode(event.target.value)}
                  placeholder={text.resetCodePlaceholder}
                  autoFocus
                />
              </label>
              <label>
                {text.newPassword}
                <input
                  type="password"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  placeholder={text.newPasswordPlaceholder}
                />
              </label>
              <label>
                {text.confirmNewPassword}
                <input
                  type="password"
                  value={confirmNewPassword}
                  onChange={(event) => setConfirmNewPassword(event.target.value)}
                  placeholder={text.confirmNewPasswordPlaceholder}
                />
              </label>
              <button type="submit" disabled={confirmingReset || secondsLeft <= 0}>
                {confirmingReset ? text.confirmingReset : text.confirmReset}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
