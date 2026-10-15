import { useEffect, useState, type RefObject } from 'react'

/** True while the element intersects the viewport (with margin). Used to pause offscreen WebGL. */
export function useInView<T extends Element>(ref: RefObject<T | null>, rootMargin = '120px'): boolean {
  const [inView, setInView] = useState(true)
  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { rootMargin })
    io.observe(el)
    return () => io.disconnect()
  }, [ref, rootMargin])
  return inView
}
