import type * as React from 'react'

import { cn } from '@/lib/utils'

interface DemoProps extends React.ComponentProps<'div'> {
  caption?: React.ReactNode
}

/** Minimal frame for inline demos — no header or reset chrome; just the visual and an optional caption. */
export function Demo({ caption, className, children, ...props }: DemoProps) {
  return (
    <div
      className={cn('my-6 rounded-xl border bg-card p-5', className)}
      {...props}
    >
      {children}
      {caption && <div className="mt-4 text-sm text-fg-muted">{caption}</div>}
    </div>
  )
}
