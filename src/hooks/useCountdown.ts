import { useEffect, useState } from 'react'

export interface CountdownParts {
  days: number
  hours: number
  minutes: number
  seconds: number
  done: boolean
}

export function computeCountdown(target: Date, now: Date = new Date()): CountdownParts {
  const diff = Math.max(0, target.getTime() - now.getTime())
  const s = Math.floor(diff / 1000)
  return {
    days: Math.floor(s / 86400),
    hours: Math.floor((s % 86400) / 3600),
    minutes: Math.floor((s % 3600) / 60),
    seconds: s % 60,
    done: diff === 0,
  }
}

export function useCountdown(targetIso: string): CountdownParts {
  const [parts, setParts] = useState(() => computeCountdown(new Date(targetIso)))
  useEffect(() => {
    const target = new Date(targetIso)
    const tick = () => setParts(computeCountdown(target))
    tick()
    const id = window.setInterval(tick, 1000)
    return () => window.clearInterval(id)
  }, [targetIso])
  return parts
}
