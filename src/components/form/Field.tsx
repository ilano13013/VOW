import { cloneElement, isValidElement, useId, type ReactElement, type ReactNode } from 'react'
import { cn } from '@/lib/cn'

interface FieldProps {
  label: string
  /** Stable id for the control (also preserves form state across republishes). */
  id?: string
  hint?: ReactNode
  error?: string | null
  optional?: boolean
  className?: string
  children: ReactElement<Record<string, unknown>>
}

/** Visible label + hint + inline error, wired to the control with aria attributes. */
export function Field({ label, id, hint, error, optional, className, children }: FieldProps) {
  const auto = useId()
  const controlId = id ?? `f-${auto}`
  const hintId = hint ? `${controlId}-hint` : undefined
  const errorId = error ? `${controlId}-error` : undefined
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined
  return (
    <div className={cn('flex flex-col', className)}>
      <label htmlFor={controlId} className="meta !text-pearl-dim">
        {label}
        {optional && <span className="ml-2 normal-case tracking-normal text-pearl-mute">(facultatif)</span>}
      </label>
      {isValidElement(children) &&
        cloneElement(children, {
          id: controlId,
          'aria-invalid': error ? true : undefined,
          'aria-describedby': describedBy,
        })}
      {hint && (
        <p id={hintId} className="mt-2 text-[0.875rem] text-pearl-mute">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="mt-2 text-[0.9375rem] text-danger" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

export interface SummaryItem {
  fieldId: string
  message: string
}

/** Error summary shown after a failed submit; receives focus and links to each field. */
export function ErrorSummary({ items, title = 'Quelques précisions sont nécessaires', summaryRef }: { items: SummaryItem[]; title?: string; summaryRef?: React.Ref<HTMLDivElement> }) {
  if (!items.length) return null
  return (
    <div ref={summaryRef} tabIndex={-1} role="alert" aria-labelledby="error-summary-title" className="rounded-[1rem] border border-danger/50 p-5 outline-none focus-visible:ring-1 focus-visible:ring-danger">
      <p id="error-summary-title" className="text-pearl">{title}</p>
      <ul className="mt-3 space-y-1.5">
        {items.map((i) => (
          <li key={i.fieldId}>
            <a href={`#${i.fieldId}`} className="text-[0.9375rem] text-danger underline decoration-danger/40 hover:decoration-danger" onClick={(e) => {
              e.preventDefault()
              document.getElementById(i.fieldId)?.focus()
            }}>
              {i.message}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}
