import { useState } from 'react'
import { wcagContrast } from 'culori'

import { apcaLc } from '@/lib/apca'
import { Demo } from '@/components/demo'
import { Switch } from '@/ui/switch'

// Radix step-9 colors, light mode.
const NINES = [
  { name: 'Blue', hex: '#0090ff' },
  { name: 'Red', hex: '#e5484d' },
  { name: 'Green', hex: '#30a46c' },
  { name: 'Purple', hex: '#8e4ec6' },
  { name: 'Amber', hex: '#ffc53d' },
  { name: 'Yellow', hex: '#ffe629' },
]

export function SolidStepText() {
  const [dark, setDark] = useState(false)
  const fg = dark ? '#000000' : '#ffffff'

  return (
    <Demo
      caption={
        <>
          Every one of these is a step 9 — same job, same slot, different hue.
          Radix designs most of them for white text, but Sky, Mint, Lime, Yellow
          and Amber for dark text: with white labels, yellow scores 1.26:1 —
          below every bar that exists. Flip the labels and yellow jumps to
          16.6:1, Lc 90.7, while purple drops. The &ldquo;solid&rdquo; job
          doesn&rsquo;t come alone — it ships bundled with a per-hue text-color
          decision.
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {NINES.map((c) => {
            const ratio = wcagContrast(fg, c.hex)
            const lc = apcaLc(fg, c.hex)
            const tone =
              ratio >= 4.5
                ? 'text-success'
                : ratio >= 3
                  ? 'text-warning'
                  : 'text-danger'
            return (
              <div key={c.name} className="flex flex-col gap-1">
                <div
                  className="flex h-10 items-center justify-center rounded-md text-sm font-medium"
                  style={{ backgroundColor: c.hex, color: fg }}
                >
                  {c.name}
                </div>
                <span
                  className="text-center font-mono text-[0.65rem] tabular-nums"
                  aria-live="polite"
                >
                  <span className={tone}>{ratio.toFixed(2)}:1</span>
                  <span className="text-fg-muted"> · Lc {lc.toFixed(1)}</span>
                </span>
              </div>
            )
          })}
        </div>
        <Switch isSelected={dark} onChange={setDark} size="sm">
          Dark labels
        </Switch>
      </div>
    </Demo>
  )
}
