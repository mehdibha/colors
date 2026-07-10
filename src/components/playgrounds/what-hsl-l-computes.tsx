import { wcagLuminance } from 'culori'

import { Demo } from '@/components/demo'

const ROWS = [
  { name: 'yellow', css: '#ffff00', r: 255, g: 255, b: 0 },
  { name: 'cyan', css: '#00ffff', r: 0, g: 255, b: 255 },
  { name: 'blue', css: '#0000ff', r: 0, g: 0, b: 255 },
]

export function WhatHslLComputes() {
  return (
    <Demo
      caption={
        <>
          Identical arithmetic, three verdicts of "50% lightness." L averages
          the largest and smallest raw channel values and never asks{' '}
          <em>which</em> channels are lit — but in the light your screen emits,
          the green channel carries roughly ten times the blue channel's weight.
        </>
      }
    >
      <div className="flex flex-col gap-2">
        {ROWS.map((row) => {
          const y = wcagLuminance(row.css)
          const max = Math.max(row.r, row.g, row.b)
          const min = Math.min(row.r, row.g, row.b)
          return (
            <div
              key={row.name}
              className="flex items-center gap-3 rounded-lg border p-3"
            >
              <div
                className="size-12 shrink-0 rounded-md border"
                style={{ backgroundColor: row.css }}
              />
              <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                <div className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-1">
                  <code className="font-mono text-xs text-fg-muted">
                    rgb({row.r} {row.g} {row.b})
                  </code>
                  <code className="font-mono text-xs">
                    L = ({max} + {min}) / 2 → 50%
                  </code>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-26 shrink-0 text-xs text-fg-muted">
                    light emitted
                  </span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full border">
                    <div
                      className="h-full"
                      style={{
                        width: `${y * 100}%`,
                        backgroundColor: row.css,
                      }}
                    />
                  </div>
                  <span className="w-9 shrink-0 text-right font-mono text-xs text-fg-muted tabular-nums">
                    {Math.round(y * 100)}%
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </Demo>
  )
}
