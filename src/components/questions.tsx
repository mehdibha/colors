import type * as React from 'react'
import { Children, cloneElement, isValidElement } from 'react'

import { cn } from '@/lib/utils'
import { Disclosure, DisclosurePanel, DisclosureTrigger } from '@/ui/disclosure'

interface QuestionsProps extends React.ComponentProps<'div'> {}

/** Shared frame for a chapter's revealable self-check questions — one family with Playground and Demo. */
export function Questions({ className, children, ...props }: QuestionsProps) {
  return (
    <div
      className={cn(
        'my-8 overflow-hidden rounded-xl border bg-card',
        className,
      )}
      {...props}
    >
      <ol className="divide-y">
        {Children.toArray(children)
          .filter(isValidElement)
          .map((child, i) => (
            <li key={i} className="px-5">
              {/* numbered here so authors never write digits in the MDX */}
              {cloneElement(child as React.ReactElement<QuestionProps>, {
                n: i + 1,
              })}
            </li>
          ))}
      </ol>
    </div>
  )
}

interface QuestionProps {
  q: string
  n?: number
  children: React.ReactNode
}

/* q is a plain MDX attribute, so `backticks` arrive as text — render them as inline code. */
function renderInlineCode(q: string) {
  return q.split('`').map((part, i) =>
    i % 2 === 1 ? (
      <code
        key={i}
        className="rounded-sm border bg-card px-1.5 py-0.5 font-mono text-[0.8rem]"
      >
        {part}
      </code>
    ) : (
      part
    ),
  )
}

export function Question({ q, n, children }: QuestionProps) {
  return (
    <Disclosure>
      <DisclosureTrigger>
        <span className="flex flex-col gap-1">
          {n != null && (
            <span className="font-mono text-[0.7rem] tracking-wider text-fg-muted uppercase">
              Question {n}
            </span>
          )}
          <span className="text-sm font-medium text-balance">
            {renderInlineCode(q)}
          </span>
        </span>
      </DisclosureTrigger>
      <DisclosurePanel className="text-sm text-fg-muted">
        {children}
      </DisclosurePanel>
    </Disclosure>
  )
}
