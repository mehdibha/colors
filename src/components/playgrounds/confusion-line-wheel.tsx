import { useState } from 'react'
import { clampChroma, filterDeficiencyDeuter, formatHex } from 'culori'

import { Demo } from '@/components/demo'
import { Switch } from '@/ui/switch'

const deutan = filterDeficiencyDeuter(1)

// Twelve hues at one lightness and chroma — the only thing separating them is angle.
const WHEEL = Array.from({ length: 12 }, (_, i) => {
  const h = i * 30
  const color = clampChroma({ mode: 'oklch', l: 0.62, c: 0.15, h }, 'oklch')
  return { h, hex: formatHex(color), sim: formatHex(deutan(color)) }
})

export function ConfusionLineWheel() {
  const [sim, setSim] = useState(true)
  const swatches = WHEEL.map((w) => ({ ...w, color: sim ? w.sim : w.hex }))

  return (
    <Demo
      caption={
        <>
          Twelve hues, equal lightness and chroma, evenly spaced around the
          wheel. Under deuteranopia the warm run — red, orange, yellow, green
          &mdash; folds into one narrow band of near-identical colors (adjacent
          ΔEok drops below 0.02, well under chapter 6&rsquo;s just-noticeable
          difference), while the blues and purples stay apart. That collapsed
          band is a <em>confusion line</em>: colors a dichromat cannot tell from
          one another. Red&ndash;green vision runs on one axis; lose it and
          every hue on that axis becomes a synonym. Blue&ndash;yellow, a
          separate channel, is the one that survives.
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="flex gap-1.5">
          {swatches.map((s) => (
            <div key={s.h} className="flex flex-1 flex-col items-center gap-1">
              <div
                className="h-14 w-full rounded-md border"
                style={{ backgroundColor: s.color }}
              />
              <span className="font-mono text-[0.6rem] text-fg-muted tabular-nums">
                {s.h}°
              </span>
            </div>
          ))}
        </div>
        <Switch isSelected={sim} onChange={setSim} size="sm">
          Simulate deuteranopia
        </Switch>
      </div>
    </Demo>
  )
}
