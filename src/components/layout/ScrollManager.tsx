import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/** Scroll to top on route change, or to the hash target (e.g. /#offres). */
export function ScrollManager() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (hash) {
      const id = decodeURIComponent(hash.slice(1))
      // Wait for lazy route content to mount.
      let tries = 0
      const seek = () => {
        const el = document.getElementById(id)
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' })
          return
        }
        if (tries++ < 20) window.setTimeout(seek, 50)
      }
      seek()
      return
    }
    window.scrollTo(0, 0)
  }, [pathname, hash])
  return null
}
