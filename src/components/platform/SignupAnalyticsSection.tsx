import { useEffect, useState } from "react"
import { apiGet } from "../../api/client"
import { useI18n } from "../../i18n/I18nContext"

type Counts = { submitted: number; formVisitors: number; codesSent: number; completed: number; completedVisitors: number;
  formErrors: number; verificationErrors: number; expired: number; cancelled: number; pending: number; incomplete: number }
type Overview = { pageViews: number; uniqueVisitors: number; funnel: Counts; trackingConfigured: boolean;
  countries: { countryCode: string; pageViews: number; uniqueVisitors: number; funnel: Counts }[];
  errors: { reasonCode: string; attempts: number; visitors: number }[] }
type Props = { startDate: string; endDate: string; refreshToken: string }

export default function SignupAnalyticsSection({ startDate, endDate, refreshToken }: Props) {
  const { language } = useI18n()
  const requestKey = `${startDate}:${endDate}:${refreshToken}`
  const [result, setResult] = useState<{ key: string; data: Overview | null; failed: boolean } | null>(null)
  const loading = result?.key !== requestKey
  const data = loading ? null : result?.data
  const failed = !loading && result?.failed
  const text = language === "fr" ? {
    title: "Parcours d'inscription", arrivals: "Arrivées sur l'inscription", forms: "Formulaires envoyés", codes: "Codes envoyés", completed: "Inscriptions confirmées",
    unique: "navigateurs uniques", formErrors: "Erreurs de formulaire", verificationErrors: "Erreurs de vérification", expired: "Codes expirés", cancelled: "Vérifications annulées",
    pending: "Tentatives récentes non confirmées", incomplete: "Tentatives non terminées", country: "Pays", unknown: "Pays non renseigné",
    visitors: "Uniques", errors: "Erreurs signalées", reason: "Motif", attempts: "Tentatives", errorEmpty: "Aucune erreur signalée pour cette période.",
    empty: "Aucune donnée d'inscription pour cette période.", loading: "Chargement du parcours d'inscription...", failed: "Impossible de charger le parcours d'inscription.",
    disabled: "Le suivi n'est pas encore configuré.",
    note: "Les formulaires et leurs résultats sont regroupés par début de tentative (UTC). Une tentative non terminée n'est pas nécessairement abandonnée. Les étapes et erreurs peuvent se recouper.",
    privacy: "Suivi non rétroactif, agrégé par navigateur et pays. Aucun nom, e-mail, mot de passe ou code n'est enregistré dans ces statistiques. Le blocage du suivi par le navigateur peut réduire les chiffres.",
    errorNote: "Erreurs observées pendant la période : une même tentative ne compte qu'une fois par motif.",
    reasons: { VALIDATION: "Champs ou conditions à vérifier", ACTIVE_OWNER_EXISTS: "Entreprise active déjà associée à l'e-mail", NETWORK: "Problème réseau", REQUEST_FAILED: "Échec de la requête", INVALID_CODE: "Code incorrect", CODE_EXPIRED: "Code expiré", ATTEMPTS_EXHAUSTED: "Essais épuisés", INVALID_RESPONSE: "Réponse du serveur inattendue" },
  } : language === "es" ? {
    title: "Proceso de registro", arrivals: "Visitas al registro", forms: "Formularios enviados", codes: "Códigos enviados", completed: "Registros confirmados",
    unique: "navegadores únicos", formErrors: "Errores del formulario", verificationErrors: "Errores de verificación", expired: "Códigos vencidos", cancelled: "Verificaciones canceladas",
    pending: "Intentos recientes sin confirmar", incomplete: "Intentos sin completar", country: "País", unknown: "País no indicado",
    visitors: "Únicos", errors: "Errores notificados", reason: "Motivo", attempts: "Intentos", errorEmpty: "No se notificaron errores en este período.",
    empty: "No hay datos de registro en este período.", loading: "Cargando el proceso de registro...", failed: "No se pudo cargar el proceso de registro.",
    disabled: "El seguimiento aún no está configurado.",
    note: "Los formularios y resultados se agrupan por inicio del intento (UTC). Un intento sin completar no está necesariamente abandonado. Las etapas y errores pueden coincidir.",
    privacy: "Seguimiento no retroactivo, agrupado por navegador y país. Estas estadísticas no guardan nombres, correos, contraseñas ni códigos. El bloqueo del seguimiento puede reducir las cifras.",
    errorNote: "Errores observados en el período: cada intento cuenta una sola vez por motivo.",
    reasons: { VALIDATION: "Revisar campos o condiciones", ACTIVE_OWNER_EXISTS: "El correo ya tiene una empresa activa", NETWORK: "Problema de red", REQUEST_FAILED: "Solicitud fallida", INVALID_CODE: "Código incorrecto", CODE_EXPIRED: "Código vencido", ATTEMPTS_EXHAUSTED: "Intentos agotados", INVALID_RESPONSE: "Respuesta inesperada del servidor" },
  } : {
    title: "Signup journey", arrivals: "Signup page views", forms: "Forms submitted", codes: "Codes sent", completed: "Confirmed signups",
    unique: "unique browsers", formErrors: "Form errors", verificationErrors: "Verification errors", expired: "Expired codes", cancelled: "Cancelled verifications",
    pending: "Recent unconfirmed attempts", incomplete: "Incomplete attempts", country: "Country", unknown: "Country not provided",
    visitors: "Unique", errors: "Reported errors", reason: "Reason", attempts: "Attempts", errorEmpty: "No errors reported in this period.",
    empty: "No signup data for this period.", loading: "Loading signup journey...", failed: "Unable to load signup journey.",
    disabled: "Tracking is not configured yet.",
    note: "Forms and outcomes are grouped by attempt start (UTC). Incomplete attempts are not necessarily abandoned. Stages and errors may overlap.",
    privacy: "Tracking is not retroactive and is aggregated by browser and country. These statistics do not store names, emails, passwords or codes. Browser tracking protection may reduce counts.",
    errorNote: "Errors observed during the period: each attempt counts once per reason.",
    reasons: { VALIDATION: "Fields or terms need attention", ACTIVE_OWNER_EXISTS: "Email already owns an active business", NETWORK: "Network issue", REQUEST_FAILED: "Request failed", INVALID_CODE: "Incorrect code", CODE_EXPIRED: "Expired code", ATTEMPTS_EXHAUSTED: "Attempts exhausted", INVALID_RESPONSE: "Unexpected server response" },
  }

  useEffect(() => {
    let cancelled = false
    apiGet<Overview>(`/admin/analytics/signup?${new URLSearchParams({ startDate, endDate })}`).then(value => {
      if (!cancelled) setResult({ key: requestKey, data: value, failed: false })
    }).catch(() => { if (!cancelled) setResult({ key: requestKey, data: null, failed: true }) })
    return () => { cancelled = true }
  }, [startDate, endDate, requestKey])

  const number = new Intl.NumberFormat(language)
  const names = new Intl.DisplayNames([language], { type: "region" })
  return (
    <section className="signup-analytics" aria-labelledby="signup-analytics-title">
      <h3 id="signup-analytics-title">{text.title}</h3>
      {loading ? <p role="status">{text.loading}</p> : failed ? <p className="error" role="alert">{text.failed}</p> : data && <>
        {!data.trackingConfigured && <p role="status">{text.disabled}</p>}
        <dl className="platform-analytics-metrics">
          {[{ label: text.arrivals, value: data.pageViews, unique: data.uniqueVisitors },
            { label: text.forms, value: data.funnel.submitted, unique: data.funnel.formVisitors },
            { label: text.codes, value: data.funnel.codesSent },
            { label: text.completed, value: data.funnel.completed, unique: data.funnel.completedVisitors }].map(metric =>
              <div key={metric.label}><dt>{metric.label}</dt><dd>{number.format(metric.value)}</dd>
                {metric.unique !== undefined && <small>{number.format(metric.unique)} {text.unique}</small>}</div>)}
        </dl>
        <dl className="signup-outcomes">
          {[[text.formErrors, data.funnel.formErrors], [text.verificationErrors, data.funnel.verificationErrors],
            [text.expired, data.funnel.expired], [text.cancelled, data.funnel.cancelled], [text.pending, data.funnel.pending],
            [text.incomplete, data.funnel.incomplete]].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{number.format(Number(value))}</dd></div>)}
        </dl>
        <p className="platform-analytics-note">{text.note}</p>
        <div className="platform-analytics-table"><table>
          <thead><tr><th scope="col">{text.country}</th><th scope="col">{text.arrivals}</th><th scope="col">{text.visitors}</th><th scope="col">{text.forms}</th><th scope="col">{text.completed}</th><th scope="col">{text.incomplete}</th></tr></thead>
          <tbody>{data.countries.length ? data.countries.map(country => <tr key={country.countryCode}>
            <th scope="row">{country.countryCode === "ZZ" ? text.unknown : names.of(country.countryCode)}</th>
            <td>{number.format(country.pageViews)}</td><td>{number.format(country.uniqueVisitors)}</td><td>{number.format(country.funnel.submitted)}</td>
            <td>{number.format(country.funnel.completed)}</td><td>{number.format(country.funnel.incomplete)}</td>
          </tr>) : <tr><td colSpan={6}>{text.empty}</td></tr>}</tbody>
        </table></div>
        <h4>{text.errors}</h4>
        <p className="platform-analytics-note">{text.errorNote}</p>
        {data.errors.length ? <div className="platform-analytics-table"><table>
          <thead><tr><th scope="col">{text.reason}</th><th scope="col">{text.attempts}</th><th scope="col">{text.unique}</th></tr></thead>
          <tbody>{data.errors.map(error => <tr key={error.reasonCode}><th scope="row">{text.reasons[error.reasonCode as keyof typeof text.reasons] || text.failed}</th><td>{number.format(error.attempts)}</td><td>{number.format(error.visitors)}</td></tr>)}</tbody>
        </table></div> : <p>{text.errorEmpty}</p>}
        <p className="platform-analytics-note">{text.privacy}</p>
      </>}
    </section>
  )
}
