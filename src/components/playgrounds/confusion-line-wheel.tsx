import { useState } from 'react'
import {
  clampChroma,
  differenceEuclidean,
  filterDeficiencyDeuter,
  formatHex,
} from 'culori'

import { Demo } from '@/components/demo'
import { Switch } from '@/ui/switch'

const deutan = filterDeficiencyDeuter(1)
const dEok = differenceEuclidean('oklab')

// Twelve hues at one lightness, chroma clamped where sRGB runs out of room.
function swatch(h: number) {
  const color = clampChroma({ mode: 'oklch', l: 0.62, c: 0.15, h }, 'oklch')
  return { h, hex: formatHex(color), sim: formatHex(deutan(color)) }
}
const WHEEL = Array.from({ length: 12 }, (_, i) => swatch(i * 30))

// Tightest stretch of the collapse: orange through green.
const DE_60_90 = dEok(swatch(60).sim, swatch(90).sim)
const DE_90_120 = dEok(swatch(90).sim, swatch(120).sim)

export function ConfusionLineWheel() {
  const [sim, setSim] = useState(true)
  const swatches = WHEEL.map((w) => ({ ...w, color: sim ? w.sim : w.hex }))

  return (
    <Demo
      caption={
        <>
          Twelve hues at one lightness, evenly spaced around the wheel (chroma
          clamped where sRGB runs out of room). Under deuteranopia the warm run
          — red, orange, yellow, green &mdash; slumps into one muddy band,
          tightest from orange through green where adjacent ΔEok falls to{' '}
          {DE_60_90.toFixed(3)} and {DE_90_120.toFixed(3)}, under chapter
          6&rsquo;s just-noticeable difference of 0.02 — while the blues and
          purples stay apart. That collapsed band is a <em>confusion line</em>:
          colors a dichromat cannot tell from one another. Red&ndash;green
          vision runs on one axis; lose it and every hue on that axis becomes a
          synonym. Blue&ndash;yellow, a separate channel, is the one that
          survives.
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
