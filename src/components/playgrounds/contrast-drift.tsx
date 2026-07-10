import { useState } from 'react'
import { clampChroma, formatHex, wcagLuminance } from 'culori'

import { Demo } from '@/components/demo'
import { ToggleButton } from '@/ui/toggle-button'
import { ToggleButtonGroup } from '@/ui/toggle-button-group'

const HUE = 250

// Per-step WCAG ratio targets (dotUI's contrast producer anchors, resampled to 12).
const RATIO_ANCHORS = [1.05, 1.15, 1.3, 1.5, 2, 3, 4.5, 6, 8, 12, 15]

function resample(anchors: number[], n: number): number[] {
  const last = anchors.length - 1
  return Array.from({ length: n }, (_, i) => {
    const t = (i / (n - 1)) * last
    const lo = Math.floor(t)
    const hi = Math.min(lo + 1, last)
    const f = t - lo
    return (anchors[lo] ?? 0) * (1 - f) + (anchors[hi] ?? 0) * f
  })
}

const RATIOS = resample(RATIO_ANCHORS, 12)
const CCURVE = Array.from(
  { length: 12 },
  (_, i) => 0.02 + 0.18 * Math.sin((Math.PI * i) / 11),
)

const hexAt = (l: number, i: number) =>
  formatHex(
    clampChroma({ mode: 'oklch', l, c: CCURVE[i] ?? 0, h: HUE }, 'oklch'),
  )

// Bisect L so the step (darker side) hits the target ratio against the background.
function solveL(target: number, bgY: number, i: number): number {
  const yTarget = (bgY + 0.05) / target - 0.05
  let lo = 0
  let hi = 1
  for (let k = 0; k < 22; k++) {
    const mid = (lo + hi) / 2
    if (wcagLuminance(hexAt(mid, i)) > yTarget) hi = mid
    else lo = mid
  }
  return (lo + hi) / 2
}

const BACKGROUNDS = [
  { id: 'white', label: 'White', hex: '#ffffff' },
  { id: 'offwhite', label: 'Off-white', hex: '#f4f2ef' },
  { id: 'gray', label: 'Light gray', hex: '#e6e4e0' },
]

const solveRamp = (bgHex: string) => {
  const bgY = wcagLuminance(bgHex)
  return RATIOS.map((r, i) => {
    const l = solveL(r, bgY, i)
    return { l, hex: hexAt(l, i) }
  })
}

const SOLVED = BACKGROUNDS.map((bg) => ({ ...bg, steps: solveRamp(bg.hex) }))
const WHITE_STEPS = SOLVED[0]?.steps ?? []

export function ContrastDrift() {
  const [bgId, setBgId] = useState('offwhite')

  const bg = SOLVED.find((b) => b.id === bgId) ?? SOLVED[0]
  if (!bg) return null

  return (
    <Demo
      caption={
        <>
          Twelve contrast targets, three backgrounds. The targets never change —
          every step still hits its ratio exactly — but the lightness that
          achieves them is re-solved per background: the off-white pulls every
          step down by ~0.03 L, the light gray by 0.06–0.10. Under this
          philosophy a palette isn&rsquo;t a set of constants; it&rsquo;s a
          function of the background.
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="shrink-0 text-xs text-fg-muted">Background</span>
          <ToggleButtonGroup
            selectionMode="single"
            disallowEmptySelection
            selectedKeys={[bgId]}
            onSelectionChange={(keys) => {
              const id = [...keys][0]
              if (typeof id === 'string') setBgId(id)
            }}
            size="sm"
            aria-label="Background"
            className="max-w-full overflow-x-auto"
          >
            {BACKGROUNDS.map((b) => (
              <ToggleButton key={b.id} id={b.id}>
                <span
                  className="size-3.5 rounded-sm border"
                  style={{ backgroundColor: b.hex }}
                />
                {b.label}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </div>

        <div
          className="rounded-lg border p-4"
          style={{ backgroundColor: bg.hex }}
        >
          <div className="flex gap-1">
            {bg.steps.map((s, i) => (
              <div
                key={i}
                className="flex min-w-0 flex-1 flex-col items-center gap-1"
              >
                <div
                  className="h-10 w-full rounded-md"
                  style={{ backgroundColor: s.hex }}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-1" aria-live="polite">
          {bg.steps.map((s, i) => {
            const drift = s.l - (WHITE_STEPS[i]?.l ?? s.l)
            return (
              <div
                key={i}
                className="flex min-w-0 flex-1 flex-col items-center font-mono text-[0.55rem] tabular-nums"
              >
                <span className="text-fg">{s.l.toFixed(2)}</span>
                <span className="text-fg-muted">
                  {drift === 0 ? '·' : drift.toFixed(2)}
                </span>
              </div>
            )
          })}
        </div>

        <p className="text-sm text-fg-muted">
          Top row: the solved L per step. Bottom row: how far it moved from the
          white-background solution.
        </p>
      </div>
    </Demo>
  )
}
