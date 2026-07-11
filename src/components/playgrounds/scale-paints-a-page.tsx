import type * as React from 'react'
import { useState } from 'react'

import { Demo } from '@/components/demo'
import { Switch } from '@/ui/switch'

// Radix slate + blue, light mode.
const S = [
  '#fcfcfd',
  '#f9f9fb',
  '#f0f0f3',
  '#e8e8ec',
  '#e0e1e6',
  '#d9d9e0',
  '#cdced6',
  '#b9bbc6',
  '#8b8d98',
  '#80838d',
  '#60646c',
  '#1c2024',
]
const BLUE3 = '#e6f4fe'
const BLUE9 = '#0090ff'
const BLUE11 = '#0d74ce'

function step(n: number): string {
  return S[n - 1] ?? '#000000'
}

function Tag({ show, children }: { show: boolean; children: React.ReactNode }) {
  if (!show) return null
  return (
    <span
      className="pointer-events-none ml-1 shrink-0 rounded-sm border px-1 font-mono text-[0.55rem] whitespace-nowrap"
      style={{
        backgroundColor: '#ffffff',
        borderColor: step(7),
        color: step(12),
      }}
    >
      {children}
    </span>
  )
}

export function ScalePaintsAPage() {
  const [labels, setLabels] = useState(false)

  return (
    <Demo
      caption={
        <>
          One neutral scale and one accent scale paint the whole screen — flip
          the labels on and count: nine of the twenty-four slots are doing a job
          here, and not one color was invented on the spot. Every &ldquo;what
          color should this be?&rdquo; became &ldquo;which job is this?&rdquo; —
          which is the entire point of having slots.
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div
          className="overflow-hidden rounded-lg border text-left"
          style={{ backgroundColor: step(1), borderColor: step(6) }}
        >
          <div className="flex">
            <aside
              className="hidden w-36 shrink-0 flex-col gap-1 border-r p-2 sm:flex"
              style={{ backgroundColor: step(2), borderColor: step(6) }}
            >
              <span
                className="px-2 py-1 text-[0.65rem] font-semibold tracking-wide uppercase"
                style={{ color: step(11) }}
              >
                Mail <Tag show={labels}>slate2</Tag>
              </span>
              <span
                className="flex items-center rounded-md px-2 py-1 text-xs font-medium"
                style={{ backgroundColor: step(5), color: step(12) }}
              >
                Inbox <Tag show={labels}>slate5 · 12</Tag>
              </span>
              {['Drafts', 'Sent', 'Archive'].map((item) => (
                <span
                  key={item}
                  className="px-2 py-1 text-xs"
                  style={{ color: step(11) }}
                >
                  {item}
                </span>
              ))}
            </aside>
            <main className="flex flex-1 flex-col gap-3 p-4">
              <div className="flex items-center justify-between gap-2">
                <span
                  className="text-sm font-semibold"
                  style={{ color: step(12) }}
                >
                  Quarterly review <Tag show={labels}>slate12 on slate1</Tag>
                </span>
                <span
                  className="rounded-full px-2 py-0.5 text-[0.65rem] font-medium"
                  style={{ backgroundColor: BLUE3, color: BLUE11 }}
                >
                  3 new <Tag show={labels}>blue3 · blue11</Tag>
                </span>
              </div>
              <div
                className="flex flex-col gap-2 rounded-lg border p-3"
                style={{ backgroundColor: step(1), borderColor: step(6) }}
              >
                <span
                  className="text-xs font-medium"
                  style={{ color: step(12) }}
                >
                  Numbers are in — draft attached{' '}
                  <Tag show={labels}>card: slate1, border slate6</Tag>
                </span>
                <span className="text-xs" style={{ color: step(11) }}>
                  Sarah · 2h ago · finance <Tag show={labels}>slate11</Tag>
                </span>
                <div
                  className="border-t"
                  style={{ borderColor: step(6) }}
                  aria-hidden
                />
                <div className="flex items-center gap-3">
                  <span
                    className="rounded-md px-3 py-1 text-xs font-medium"
                    style={{ backgroundColor: BLUE9, color: '#ffffff' }}
                  >
                    Reply <Tag show={labels}>blue9 · white</Tag>
                  </span>
                  <span
                    className="text-xs font-medium"
                    style={{ color: BLUE11 }}
                  >
                    Open thread <Tag show={labels}>blue11</Tag>
                  </span>
                </div>
              </div>
            </main>
          </div>
        </div>
        <Switch isSelected={labels} onChange={setLabels} size="sm">
          Label the steps
        </Switch>
      </div>
    </Demo>
  )
}
