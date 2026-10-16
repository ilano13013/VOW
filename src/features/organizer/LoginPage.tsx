import { useRef, useState, type FormEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Field } from '@/components/form/Field'
import { Button } from '@/components/ui/Button'
import { Logo } from '@/components/ui/Logo'
import { useBackend, useSession } from '@/services/backend'
import { LocalModeNotice } from './OrganizerLayout'

export default function LoginPage() {
  const backend = useBackend()
  const session = useSession()
  const navigate = useNavigate()
  const location = useLocation()
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const errorRef = useRef<HTMLParagraphElement>(null)
  const from = (location.state as { from?: string } | null)?.from ?? '/organizer'

  if (session) return <Navigate to={from} replace />

  async function submit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setInfo(null)
    if (!email.trim() || !password) {
      setError('Indiquez votre e-mail et votre mot de passe.')
      return
    }
    setBusy(true)
    const res = mode === 'signin' ? await backend.signIn(email.trim(), password) : await backend.signUp(email.trim(), password)
    setBusy(false)
    if (!res.ok) {
      setError(res.error)
      requestAnimationFrame(() => errorRef.current?.focus())
      return
    }
    if (res.needsConfirmation) {
      setInfo('Compte créé. Ouvrez le lien de confirmation reçu par e-mail, puis connectez-vous.')
      setMode('signin')
      return
    }
    navigate(from, { replace: true })
  }

  return (
    <div className="min-h-[100svh]">
      {backend.mode === 'local' && <LocalModeNotice />}
      <main id="main" className="mx-auto grid min-h-[80svh] max-w-[1280px] items-center gap-16 px-5 py-16 md:grid-cols-12 md:px-10">
        <div className="md:col-span-6">
          <Link to="/" aria-label="VOW. — accueil">
            <Logo className="text-[2rem]" />
          </Link>
          <h1 className="display mt-10 text-[clamp(3rem,7vw,5.5rem)]">
            {mode === 'signin' ? 'Votre espace organisateur' : 'Créer votre espace'}
          </h1>
          <p className="mt-6 max-w-[42ch] text-pearl-dim">
            Composez votre invitation, gérez vos invités et suivez leurs réponses.
          </p>
        </div>
        <form noValidate onSubmit={submit} className="flex flex-col gap-8 md:col-span-5 md:col-start-8">
          {error && (
            <p ref={errorRef} tabIndex={-1} role="alert" className="rounded-[1rem] border border-danger/50 p-4 text-danger outline-none">
              {error}
            </p>
          )}
          {info && (
            <p role="status" className="rounded-[1rem] border border-success/40 p-4 text-success">
              {info}
            </p>
          )}
          <Field label="E-mail" id="login-email">
            <input className="field" type="email" autoComplete="email" inputMode="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </Field>
          <Field label="Mot de passe" id="login-password" hint={mode === 'signup' ? '8 caractères au moins.' : undefined}>
            <input className="field" type="password" autoComplete={mode === 'signin' ? 'current-password' : 'new-password'} value={password} onChange={(e) => setPassword(e.target.value)} />
          </Field>
          <Button type="submit" arrow disabled={busy} aria-busy={busy}>
            {busy ? 'Un instant…' : mode === 'signin' ? 'Se connecter' : 'Créer mon compte'}
          </Button>
          <button
            type="button"
            className="min-h-11 self-start text-[0.9375rem] text-pearl-dim underline decoration-line-strong hover:text-pearl"
            onClick={() => {
              setMode((m) => (m === 'signin' ? 'signup' : 'signin'))
              setError(null)
            }}
          >
            {mode === 'signin' ? 'Pas encore de compte ? Créer un compte' : 'Déjà un compte ? Se connecter'}
          </button>
        </form>
      </main>
    </div>
  )
}
