import { Link } from 'react-router-dom'
import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { ArrowIcon } from './Icon'

type Variant = 'primary' | 'ghost' | 'quiet'

const base =
  'group relative inline-flex min-h-12 items-center justify-center gap-3 overflow-hidden rounded-full px-7 text-[0.8125rem] font-medium tracking-[0.08em] uppercase transition-[color,background-color,border-color,transform] duration-500 ease-[var(--ease-couture)] active:scale-[0.98] disabled:opacity-50'

const variants: Record<Variant, string> = {
  primary: 'bg-pearl text-obsidian hover:bg-iris',
  ghost: 'border border-line-strong text-pearl hover:border-iris hover:text-iris',
  quiet: 'px-0 min-h-10 text-pearl-dim hover:text-pearl underline-offset-8 hover:underline',
}

function Arrow() {
  return <ArrowIcon className="transition-transform duration-500 ease-[var(--ease-couture)] group-hover:translate-x-1" />
}

interface CommonProps {
  variant?: Variant
  arrow?: boolean
  className?: string
  children: ReactNode
}

export function ButtonLink({ to, variant = 'primary', arrow, className, children, ...rest }: CommonProps & { to: string } & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'>) {
  const external = /^https?:/.test(to)
  const cls = cn(base, variants[variant], className)
  const inner = (
    <>
      <span>{children}</span>
      {arrow && <Arrow />}
    </>
  )
  if (external) {
    return (
      <a href={to} className={cls} target="_blank" rel="noopener noreferrer" {...rest}>
        {inner}
      </a>
    )
  }
  return (
    <Link to={to} className={cls} {...rest}>
      {inner}
    </Link>
  )
}

export function Button({ variant = 'primary', arrow, className, children, type = 'button', ...rest }: CommonProps & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type={type} className={cn(base, variants[variant], className)} {...rest}>
      <span>{children}</span>
      {arrow && <Arrow />}
    </button>
  )
}
