import { clampChroma, converter, formatHex } from 'culori'

import { Demo } from '@/components/demo'

const toLab = converter('lab')
const toOklch = converter('oklch')

// Tone kept EXACT: solve OKLCH L so the sRGB result's CIE L* equals the tone.
// Hue/chroma are OKLCH stand-ins for CAM16 — the point is that dropping chroma
// on the same hue turns the accent palette into a warm-gray ramp.
function hexOf(hue: number, chroma: number, tone: number): string {
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

const SEED = '#6750A4' // M3 baseline violet
const TONES = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 95, 99, 100]
const NEUTRAL_C = 0.01

export function TonalPaletteStrip() {
  const seed = toOklch(SEED)
  const h = seed?.h ?? 300
  const accentC = seed?.c ?? 0.13

  const rows = [
    { label: 'accent', chroma: accentC },
    { label: 'neutral', chroma: NEUTRAL_C },
  ]

  return (
    <Demo
      caption={
        <>
          One tonal palette is one hue and one chroma with Tone swept
          0&rarr;100. The top row holds the seed&rsquo;s chroma; the bottom row
          drops chroma to {NEUTRAL_C} at the same hue &mdash; a low-chroma tonal
          palette <em>is</em> a warm-gray ramp (chapter 15), the same object
          with chroma turned down. Tone is exact: each swatch is solved so its
          CIE L* equals its label.
        </>
      }
    >
      <div className="flex flex-col gap-1.5">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center gap-2">
            <span className="w-14 shrink-0 text-right text-[0.65rem] text-fg-muted">
              {row.label}
            </span>
            <div className="flex flex-1 gap-1">
              {TONES.map((t) => (
                <div
                  key={t}
                  className="h-8 min-w-0 flex-1 rounded-sm border"
                  style={{ backgroundColor: hexOf(h, row.chroma, t) }}
                />
              ))}
            </div>
          </div>
        ))}
        <div className="flex items-center gap-2">
          <span className="w-14 shrink-0" />
          <div className="flex flex-1 gap-1">
            {TONES.map((t) => (
              <span
                key={t}
                className="min-w-0 flex-1 text-center font-mono text-[0.55rem] text-fg-muted tabular-nums"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Demo>
  )
}
