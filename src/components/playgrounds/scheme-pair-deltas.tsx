import { useState } from 'react'
import { clampChroma, converter, formatHex, wcagContrast } from 'culori'

import { apcaLc } from '@/lib/apca'
import { cn } from '@/lib/utils'
import { Demo } from '@/components/demo'
import { ToggleButton } from '@/ui/toggle-button'
import { ToggleButtonGroup } from '@/ui/toggle-button-group'

const toLab = converter('lab')
const toOklch = converter('oklch')

// Tone kept exact (CIE L* == tone); hue/chroma are OKLCH stand-ins for CAM16.
function toneHex(hue: number, chroma: number, tone: number): string {
  let lo = 0
  let hi = 1
  for (let i = 0; i < 22; i++) {
    const mid = (lo + hi) / 2
    const c = clampChroma(
      { mode: 'oklch' as const, l: mid, c: chroma, h: hue },
      'oklch',
    )
    if ((toLab(c)?.l ?? 0) < tone) lo = mid
    else hi = mid
  }
  return formatHex(
    clampChroma(
      { mode: 'oklch' as const, l: (lo + hi) / 2, c: chroma, h: hue },
      'oklch',
    ),
  )
}

type Mode = 'light' | 'dark'

// Baseline scheme Tone assignments, verbatim from material-color-utilities
// scheme.ts. The TONE numbers and deltas are the point, and those are exact;
// the swatches are OKLCH approximations of the tonal palette.
const SEED = '#6750A4'
const NEUTRAL_C = 0.008

const PAIRS: {
  label: string
  pal: 'accent' | 'neutral'
  base: Record<Mode, number>
  on: Record<Mode, number>
}[] = [
  {
    label: 'primary → on-primary',
    pal: 'accent',
    base: { light: 40, dark: 80 },
    on: { light: 100, dark: 20 },
  },
  {
    label: 'container → on-container',
    pal: 'accent',
    base: { light: 90, dark: 30 },
    on: { light: 10, dark: 90 },
  },
  {
    label: 'surface → on-surface',
    pal: 'neutral',
    base: { light: 99, dark: 10 },
    on: { light: 10, dark: 90 },
  },
  {
    label: 'surface-var → on-surface-var',
    pal: 'neutral',
    base: { light: 90, dark: 30 },
    on: { light: 30, dark: 80 },
  },
]

export function SchemePairDeltas() {
  const [mode, setMode] = useState<Mode>('light')

  const seed = toOklch(SEED)
  const aH = seed?.h ?? 300
  const aC = seed?.c ?? 0.13

  const rows = PAIRS.map((p) => {
    const chroma = p.pal === 'accent' ? aC : NEUTRAL_C
    const baseTone = p.base[mode]
    const onTone = p.on[mode]
    const baseHex = toneHex(aH, chroma, baseTone)
    const onHex = toneHex(aH, chroma, onTone)
    const delta = Math.abs(baseTone - onTone)
    const w = wcagContrast(onHex, baseHex)
    const lc = apcaLc(onHex, baseHex)
    return { ...p, baseTone, onTone, baseHex, onHex, delta, w, lc }
  })

  return (
    <Demo
      caption={
        <>
          The Tone assignments are read straight from Material&rsquo;s{' '}
          <span className="font-mono">scheme.ts</span>. Every{' '}
          <span className="font-mono">on-</span> pair sits a Tone gap of 50 or
          more from its surface, so every pair clears its meter before a hex is
          computed. Flip the mode: the palette is invariant, only the Tone the
          role reads changes &mdash; chapter 17&rsquo;s re-pick.
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <ToggleButtonGroup
          selectionMode="single"
          disallowEmptySelection
          selectedKeys={[mode]}
          onSelectionChange={(keys) => {
            const next = [...keys][0]
            if (next === 'light' || next === 'dark') setMode(next)
          }}
          size="sm"
          aria-label="Scheme"
          className="max-w-full overflow-x-auto"
        >
          <ToggleButton id="light">Light</ToggleButton>
          <ToggleButton id="dark">Dark</ToggleButton>
        </ToggleButtonGroup>

        <div className="overflow-x-auto">
          <table className="w-full min-w-lg text-left font-mono text-[0.65rem] tabular-nums">
            <thead>
              <tr className="text-fg-muted">
                <th className="py-1 pr-3 font-normal">pair</th>
                <th className="py-1 pr-3 font-normal">tones</th>
                <th className="py-1 pr-3 font-normal">Δ</th>
                <th className="py-1 pr-3 font-normal">swatch</th>
                <th className="py-1 pr-3 font-normal">WCAG</th>
                <th className="py-1 font-normal">APCA</th>
              </tr>
            </thead>
            <tbody aria-live="polite">
              {rows.map((r) => (
                <tr key={r.label} className="border-t">
                  <td className="py-1.5 pr-3">{r.label}</td>
                  <td className="py-1.5 pr-3 text-fg-muted">
                    {r.baseTone} / {r.onTone}
                  </td>
                  <td className="py-1.5 pr-3">{r.delta}</td>
                  <td className="py-1.5 pr-3">
                    <span className="inline-flex overflow-hidden rounded-sm border align-middle">
                      <span
                        className="size-4"
                        style={{ backgroundColor: r.baseHex }}
                      />
                      <span
                        className="size-4"
                        style={{ backgroundColor: r.onHex }}
                      />
                    </span>
                  </td>
                  <td
                    className={cn(
                      'py-1.5 pr-3',
                      r.w >= 4.5 ? 'text-fg-success' : 'text-fg-warning',
                    )}
                  >
                    {r.w.toFixed(2)}:1
                  </td>
                  <td
                    className={cn(
                      'py-1.5',
                      Math.abs(r.lc) >= 60
                        ? 'text-fg-success'
                        : 'text-fg-warning',
                    )}
                  >
                    Lc {r.lc.toFixed(1)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Demo>
  )
}
