import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { LocalBackend } from './localBackend'
import { SupabaseBackend } from './supabaseBackend'
import type { Backend, Session } from './types'

export function createBackend(): Backend {
  const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined
  return url && key ? new SupabaseBackend(url, key) : new LocalBackend()
}

const BackendContext = createContext<Backend | null>(null)

export function BackendProvider({ backend, children }: { backend: Backend; children: ReactNode }) {
  return <BackendContext.Provider value={backend}>{children}</BackendContext.Provider>
}

export function useBackend(): Backend {
  const b = useContext(BackendContext)
  if (!b) throw new Error('useBackend must be used inside <BackendProvider>')
  return b
}

/** undefined while loading, null when signed out. */
export function useSession(): Session | null | undefined {
  const backend = useBackend()
  const [session, setSession] = useState<Session | null | undefined>(undefined)
  useEffect(() => {
    let alive = true
    backend.getSession().then((s) => alive && setSession(s))
    const off = backend.onAuthChange((s) => setSession(s))
    return () => {
      alive = false
      off()
    }
  }, [backend])
  return session
}
