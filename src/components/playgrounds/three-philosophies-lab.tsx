import { useMemo, useState } from 'react'
import {
  clampChroma,
  converter,
  formatHex,
  wcagContrast,
  wcagLuminance,
} from 'culori'

import { Playground } from '@/components/playground'
import { Slider, SliderControl } from '@/ui/slider'
import { ToggleButton } from '@/ui/toggle-button'
import { ToggleButtonGroup } from '@/ui/toggle-button-group'

type Philosophy = 'anchored' | 'contrast' | 'reference'

const toOklch = converter('oklch')

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

// Philosophy 1 — dotUI's fixed lightness anchors, resampled to 12.
const LTARGETS = resample(
  [
    0.9778, 0.9356, 0.8811, 0.8267, 0.7422, 0.6478, 0.5733, 0.4689, 0.3944,
    0.32, 0.2378,
  ],
  12,
)
// Philosophy 2 — per-step WCAG ratio targets against white (dotUI's contrast producer anchors).
const RATIOS = resample([1.05, 1.15, 1.3, 1.5, 2, 3, 4.5, 6, 8, 12, 15], 12)
const CCURVE = Array.from(
  { length: 12 },
  (_, i) => 0.02 + 0.18 * Math.sin((Math.PI * i) / 11),
)

// Philosophy 3 — hand-tuned masters: eight Radix light scales (radix-ui/colors src/light.ts).
const MASTER_HEXES: string[][] = [
  [
    '#fffcfc',
    '#fff8f7',
    '#feebe7',
    '#ffdcd3',
    '#ffcdc2',
    '#fdbdaf',
    '#f5a898',
    '#ec8e7b',
    '#e54d2e',
    '#dd4425',
    '#d13415',
    '#5c271f',
  ],
  [
    '#fefdfb',
    '#fefbe9',
    '#fff7c2',
    '#ffee9c',
    '#fbe577',
    '#f3d673',
    '#e9c162',
    '#e2a336',
    '#ffc53d',
    '#ffba18',
    '#ab6400',
    '#4f3422',
  ],
  [
    '#fdfdf9',
    '#fefce9',
    '#fffab8',
    '#fff394',
    '#ffe770',
    '#f3d768',
    '#e4c767',
    '#d5ae39',
    '#ffe629',
    '#ffdc00',
    '#9e6c00',
    '#473b1f',
  ],
  [
    '#fbfefb',
    '#f5fbf5',
    '#e9f6e9',
    '#daf1db',
    '#c9e8ca',
    '#b2ddb5',
    '#94ce9a',
    '#65ba74',
    '#46a758',
    '#3e9b4f',
    '#2a7e3b',
    '#203c25',
  ],
  [
    '#fafdfe',
    '#f2fafb',
    '#def7f9',
    '#caf1f6',
    '#b5e9f0',
    '#9ddde7',
    '#7dcedc',
    '#3db9cf',
    '#00a2c7',
    '#0797b9',
    '#107d98',
    '#0d3c48',
  ],
  [
    '#fbfdff',
    '#f4faff',
    '#e6f4fe',
    '#d5efff',
    '#c2e5ff',
    '#acd8fc',
    '#8ec8f6',
    '#5eb1ef',
    '#0090ff',
    '#0588f0',
    '#0d74ce',
    '#113264',
  ],
  [
    '#fdfcfe',
    '#faf8ff',
    '#f4f0fe',
    '#ebe4ff',
    '#e1d9ff',
    '#d4cafe',
    '#c2b5f5',
    '#aa99ec',
    '#6e56cf',
    '#654dc4',
    '#6550b9',
    '#2f265f',
  ],
  [
    '#fffcfe',
    '#fef7fb',
    '#fee9f5',
    '#fbdcef',
    '#f6cee7',
    '#efbfdd',
    '#e7acd0',
    '#dd93c2',
    '#d6409f',
    '#cf3897',
    '#c2298a',
    '#651249',
  ],
]

const MASTERS = MASTER_HEXES.map((hexes) => {
  const steps = hexes.map((hex) => {
    const c = toOklch(hex)
    return { l: c?.l ?? 0, c: c?.c ?? 0 }
  })
  return { steps, h9: toOklch(hexes[8] ?? '#000')?.h ?? 0 }
}).sort((a, b) => a.h9 - b.h9)

interface Step {
  l: number
  hex: string
}

const hexAt = (l: number, c: number, h: number) =>
  formatHex(clampChroma({ mode: 'oklch', l, c, h }, 'oklch'))

function anchoredRamp(hue: number): Step[] {
  return LTARGETS.map((l, i) => ({ l, hex: hexAt(l, CCURVE[i] ?? 0, hue) }))
}

// Bisect L so the step hits its WCAG target against white (darker side).
function contrastRamp(hue: number): Step[] {
  return RATIOS.map((target, i) => {
    const yTarget = 1.05 / target - 0.05
    let lo = 0
    let hi = 1
    for (let k = 0; k < 22; k++) {
      const mid = (lo + hi) / 2
      if (wcagLuminance(hexAt(mid, CCURVE[i] ?? 0, hue)) > yTarget) hi = mid
      else lo = mid
    }
    const l = (lo + hi) / 2
    return { l, hex: hexAt(l, CCURVE[i] ?? 0, hue) }
  })
}

// Simplified Radix-style generation: per-step lerp of the two nearest masters, re-aimed at the seed hue.
function referenceRamp(hue: number): Step[] {
  const h = ((hue % 360) + 360) % 360
  let a = MASTERS[MASTERS.length - 1]
  let b = MASTERS[0]
  for (let i = 0; i < MASTERS.length; i++) {
    const cur = MASTERS[i]
    const nxt = MASTERS[(i + 1) % MASTERS.length]
    if (!cur || !nxt) continue
    const lo = cur.h9
    const hi = nxt.h9 <= lo ? nxt.h9 + 360 : nxt.h9
    const hh = h < lo ? h + 360 : h
    if (hh >= lo && hh < hi) {
      a = cur
      b = nxt
      break
    }
  }
  if (!a || !b) return anchoredRamp(hue)
  const lo = a.h9
  const hi = b.h9 <= lo ? b.h9 + 360 : b.h9
  const hh = h < lo ? h + 360 : h
  const w = hi === lo ? 0 : (hh - lo) / (hi - lo)
  return Array.from({ length: 12 }, (_, i) => {
    const sa = a.steps[i]
    const sb = b.steps[i]
    const l = (sa?.l ?? 0) * (1 - w) + (sb?.l ?? 0) * w
    const c = (sa?.c ?? 0) * (1 - w) + (sb?.c ?? 0) * w
    return { l, hex: hexAt(l, c, h) }
  })
}

const PHILOSOPHIES: { id: Philosophy; label: string }[] = [
  { id: 'anchored', label: 'Lightness-anchored' },
  { id: 'contrast', label: 'Contrast-anchored' },
  { id: 'reference', label: 'Hand-tuned reference' },
]

const W = 520
const H = 200
const PAD = { left: 40, right: 12, top: 10, bottom: 26 }
const px = (i: number) => PAD.left + (i / 11) * (W - PAD.left - PAD.right)
const py = (l: number) => PAD.top + (1 - l) * (H - PAD.top - PAD.bottom)
const path = (steps: Step[]) =>
  steps
    .map(
      (s, i) =>
        `${i === 0 ? 'M' : 'L'}${px(i).toFixed(1)},${py(s.l).toFixed(1)}`,
    )
    .join(' ')

export function ThreePhilosophiesLab() {
  const [philosophy, setPhilosophy] = useState<Philosophy>('anchored')
  const [hue, setHue] = useState(250)

  const ramps = useMemo(
    () => ({
      anchored: anchoredRamp(hue),
      contrast: contrastRamp(hue),
      reference: referenceRamp(hue),
    }),
    [hue],
  )
  const active = ramps[philosophy]
  const ghosts = PHILOSOPHIES.filter((p) => p.id !== philosophy)

  const step7 = active[6]
  const step9 = active[8]
  const step7Ratio = wcagContrast('#ffffff', step7?.hex ?? '#000')
  const step9White = wcagContrast('#ffffff', step9?.hex ?? '#000')
  const step9Black = wcagContrast('#000000', step9?.hex ?? '#000')

  const summary =
    philosophy === 'anchored'
      ? `The L row never moves — the same skeleton at every hue. The contrast row does: step 7 reads ${step7Ratio.toFixed(2)}:1 against white at this hue. Consistency is designed; contrast is an outcome.`
      : philosophy === 'contrast'
        ? `Every step sits on its ratio target against white — the contrast row is the design and barely acknowledges the hue. The L row is solver output; repaint the background and all twelve values re-solve.`
        : `The masters reshape the whole scale per hue: step 9 sits at L ${(step9?.l ?? 0).toFixed(2)} here and prefers ${step9White >= step9Black ? 'white' : 'black'} text (${Math.max(step9White, step9Black).toFixed(2)}:1). Fidelity is inherited; so is everything else.`

  return (
    <Playground
      question="What does each philosophy keep fixed as the hue turns — and what does it let drift?"
      onReset={() => {
        setPhilosophy('anchored')
        setHue(250)
      }}
    >
      <div className="flex flex-col gap-5">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <ToggleButtonGroup
            selectionMode="single"
            disallowEmptySelection
            selectedKeys={[philosophy]}
            onSelectionChange={(keys) => {
              const id = [...keys][0]
              if (typeof id === 'string') setPhilosophy(id as Philosophy)
            }}
            size="sm"
            aria-label="Generation philosophy"
            className="max-w-full overflow-x-auto"
          >
            {PHILOSOPHIES.map((p) => (
              <ToggleButton key={p.id} id={p.id}>
                {p.label}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
          <div className="flex min-w-48 flex-1 items-center gap-3">
            <span className="shrink-0 text-xs text-fg-muted">Seed hue</span>
            <Slider
              aria-label="Seed hue"
              value={hue}
              onChange={(v) => setHue(v as number)}
              minValue={0}
              maxValue={360}
              step={1}
              className="flex-1"
            >
              <SliderControl />
            </Slider>
            <span className="w-8 shrink-0 text-right font-mono text-xs text-fg-muted tabular-nums">
              {hue}°
            </span>
          </div>
        </div>

        <div className="flex gap-1">
          {active.map((s, i) => (
            <div
              key={i}
              className="flex min-w-0 flex-1 flex-col items-center gap-1"
            >
              <div
                className="h-11 w-full rounded-md border"
                style={{ backgroundColor: s.hex }}
              />
              <span className="font-mono text-[0.6rem] text-fg">{i + 1}</span>
              <span className="font-mono text-[0.55rem] text-fg-muted tabular-nums">
                {s.l.toFixed(2)}
              </span>
              <span className="font-mono text-[0.55rem] text-fg-muted tabular-nums">
                {wcagContrast('#ffffff', s.hex).toFixed(1)}
              </span>
            </div>
          ))}
        </div>
        <p className="-mt-3 text-xs text-fg-muted">
          Under each step: its OKLCH L, then white text&rsquo;s WCAG ratio on
          it.
        </p>

        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="h-auto w-full text-fg"
          role="img"
          aria-label="Lightness curve per step for the three philosophies"
        >
          <line
            x1={PAD.left}
            y1={py(0)}
            x2={px(11)}
            y2={py(0)}
            stroke="currentColor"
            strokeOpacity={0.25}
          />
          <line
            x1={PAD.left}
            y1={py(0)}
            x2={PAD.left}
            y2={py(1)}
            stroke="currentColor"
            strokeOpacity={0.25}
          />
          {ghosts.map((p) => (
            <path
              key={p.id}
              d={path(ramps[p.id])}
              fill="none"
              stroke="currentColor"
              strokeOpacity={0.18}
              strokeDasharray="4 4"
            />
          ))}
          <path
            d={path(active)}
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          />
          {active.map((s, i) => (
            <circle
              key={i}
              cx={px(i)}
              cy={py(s.l)}
              r={4}
              fill={s.hex}
              stroke="currentColor"
              strokeOpacity={0.5}
            />
          ))}
          <g
            className="font-mono text-[0.6rem]"
            fill="currentColor"
            fillOpacity={0.55}
          >
            <text x={px(0)} y={H - 8} textAnchor="middle">
              1
            </text>
            <text x={px(11)} y={H - 8} textAnchor="middle">
              12
            </text>
            <text x={PAD.left - 6} y={py(1) + 4} textAnchor="end">
              1
            </text>
            <text x={PAD.left - 6} y={py(0) + 4} textAnchor="end">
              0
            </text>
            <text
              x={12}
              y={(py(0) + py(1)) / 2}
              textAnchor="middle"
              transform={`rotate(-90 12 ${(py(0) + py(1)) / 2})`}
            >
              L
            </text>
          </g>
        </svg>

        <p className="text-sm text-fg-muted" aria-live="polite">
          {summary}
        </p>
      </div>
    </Playground>
  )
}
