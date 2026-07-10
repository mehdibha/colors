import type * as React from 'react'
import { useMemo, useRef, useState } from 'react'
import { displayable, inGamut } from 'culori'

import { Playground } from '@/components/playground'
import { Button } from '@/ui/button'
import { Slider, SliderControl } from '@/ui/slider'
import { ToggleButton } from '@/ui/toggle-button'
import { ToggleButtonGroup } from '@/ui/toggle-button-group'

type GamutId = 'srgb' | 'p3'
type Mode = 'absolute' | 'relative'

const inP3 = inGamut('p3')
const tests: Record<
  GamutId,
  (color: { mode: 'oklch'; l: number; c: number; h: number }) => boolean
> = { srgb: displayable, p3: inP3 }

// dotUI's fixed lightness anchors (ch11), resampled to 12 steps.
const ANCHORS = [
  0.9778, 0.9356, 0.8811, 0.8267, 0.7422, 0.6478, 0.5733, 0.4689, 0.3944, 0.32,
  0.2378,
]

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

const L12 = resample(ANCHORS, 12)

const maxChroma = (
  l: number,
  h: number,
  test: (color: { mode: 'oklch'; l: number; c: number; h: number }) => boolean,
) => {
  let lo = 0
  let hi = 0.45
  for (let k = 0; k < 20; k++) {
    const mid = (lo + hi) / 2
    if (test({ mode: 'oklch', l, c: mid, h })) lo = mid
    else hi = mid
  }
  return lo
}

const stepCeilings = (h: number, gamut: GamutId) =>
  L12.map((l) => maxChroma(l, h, tests[gamut]))

// continuous ceiling across step space, for the drawn tent
const ceilingSamples = (h: number, gamut: GamutId) =>
  Array.from({ length: 45 }, (_, k) => {
    const t = (k / 44) * 11
    const lo = Math.floor(t)
    const hi = Math.min(lo + 1, 11)
    const f = t - lo
    const l = (L12[lo] ?? 0) * (1 - f) + (L12[hi] ?? 0) * f
    return { t, c: maxChroma(l, h, tests[gamut]) }
  })

const START_HUE = 250
// a smooth arc drawn to fit under hue 250's sRGB ceiling with a whisker of clearance
const DEFAULT_ABS = [
  0.01, 0.028, 0.05, 0.078, 0.11, 0.14, 0.155, 0.145, 0.12, 0.1, 0.08, 0.06,
]
const START_CEILS = stepCeilings(START_HUE, 'srgb')
const DEFAULT_FRACS = DEFAULT_ABS.map((c, i) =>
  Math.min(c / (START_CEILS[i] ?? 1), 1),
)

const W = 560
const H = 240
const PAD = { left: 40, right: 12, top: 12, bottom: 26 }
const PLOT_W = W - PAD.left - PAD.right
const PLOT_H = H - PAD.top - PAD.bottom
const C_TOP = 0.34
const px = (i: number) => PAD.left + (i / 11) * PLOT_W
const py = (c: number) => PAD.top + (1 - c / C_TOP) * PLOT_H

export function ChromaCurveEditor() {
  const [hue, setHue] = useState(START_HUE)
  const [gamut, setGamut] = useState<GamutId>('srgb')
  const [mode, setMode] = useState<Mode>('absolute')
  const [abs, setAbs] = useState<number[]>(DEFAULT_ABS)
  const [fracs, setFracs] = useState<number[]>(DEFAULT_FRACS)
  const dragging = useRef(false)

  const hq = Math.round(hue)
  const ceils = useMemo(() => stepCeilings(hq, gamut), [hq, gamut])
  const srgbCeils = useMemo(() => stepCeilings(hq, 'srgb'), [hq])
  const tent = useMemo(() => ceilingSamples(hq, gamut), [hq, gamut])

  const steps = L12.map((l, i) => {
    const ceil = ceils[i] ?? 0
    const asked = mode === 'absolute' ? (abs[i] ?? 0) : (fracs[i] ?? 0) * ceil
    const delivered = Math.min(asked, ceil)
    return {
      l,
      asked,
      delivered,
      clamped: asked > ceil + 1e-4,
      p3Only: delivered > (srgbCeils[i] ?? 0) + 1e-4,
      css: `oklch(${l.toFixed(3)} ${delivered.toFixed(3)} ${hq})`,
    }
  })
  const clampedCount = steps.filter((s) => s.clamped).length
  const p3Count = steps.filter((s) => s.p3Only).length

  const paint = (event: React.PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const sx = ((event.clientX - rect.left) / rect.width) * W
    const sy = ((event.clientY - rect.top) / rect.height) * H
    const i = Math.min(
      Math.max(Math.round(((sx - PAD.left) / PLOT_W) * 11), 0),
      11,
    )
    const c = Math.min(
      Math.max((1 - (sy - PAD.top) / PLOT_H) * C_TOP, 0),
      C_TOP,
    )
    const ceil = ceils[i] ?? 0
    setAbs((prev) => prev.map((v, k) => (k === i ? c : v)))
    setFracs((prev) =>
      prev.map((v, k) =>
        k === i ? (ceil > 1e-4 ? Math.min(c / ceil, 1) : 0) : v,
      ),
    )
  }

  const applyPreset = (nextAbs: number[]) => {
    setAbs(nextAbs)
    setFracs(
      nextAbs.map((c, i) => {
        const ceil = ceils[i] ?? 0
        return ceil > 1e-4 ? Math.min(c / ceil, 1) : 0
      }),
    )
  }

  const tentLine = tent
    .map(
      (p, k) =>
        `${k === 0 ? 'M' : 'L'}${px(p.t).toFixed(1)},${py(p.c).toFixed(1)}`,
    )
    .join(' ')
  const tentArea = `${tentLine} L${px(11).toFixed(1)},${py(0).toFixed(1)} L${px(0).toFixed(1)},${py(0).toFixed(1)} Z`
  const curveLine = steps
    .map(
      (s, i) =>
        `${i === 0 ? 'M' : 'L'}${px(i).toFixed(1)},${py(s.delivered).toFixed(1)}`,
    )
    .join(' ')

  const summary =
    (mode === 'absolute'
      ? clampedCount > 0
        ? `${clampedCount} of 12 steps ask more than this ceiling affords — their delivered chroma traces the tent, not your curve.`
        : 'Every step fits under this ceiling — this curve was drawn for it. Now turn the hue.'
      : 'The curve is stored as fractions of the ceiling — it re-scales as the hue turns and never clamps. Equal fractions are not equal vividness: compare the mid steps at hue 250 and 145.') +
    (gamut === 'p3' && p3Count > 0
      ? ` ${p3Count} steps now exceed the sRGB ceiling (marked P3) — on an sRGB screen your browser clips them back.`
      : '')

  return (
    <Playground
      question="Your chroma curve fits blue perfectly — what survives when the hue turns to yellow?"
      onReset={() => {
        setHue(START_HUE)
        setGamut('srgb')
        setMode('absolute')
        setAbs(DEFAULT_ABS)
        setFracs(DEFAULT_FRACS)
      }}
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <ToggleButtonGroup
            selectionMode="single"
            disallowEmptySelection
            selectedKeys={[mode]}
            onSelectionChange={(keys) => {
              const next = [...keys][0]
              if (typeof next === 'string') setMode(next as Mode)
            }}
            size="sm"
            aria-label="Curve interpretation"
            className="max-w-full overflow-x-auto"
          >
            <ToggleButton id="absolute">Absolute C</ToggleButton>
            <ToggleButton id="relative">% of ceiling</ToggleButton>
          </ToggleButtonGroup>
          <ToggleButtonGroup
            selectionMode="single"
            disallowEmptySelection
            selectedKeys={[gamut]}
            onSelectionChange={(keys) => {
              const next = [...keys][0]
              if (typeof next === 'string') setGamut(next as GamutId)
            }}
            size="sm"
            aria-label="Ceiling gamut"
            className="max-w-full overflow-x-auto"
          >
            <ToggleButton id="srgb">sRGB ceiling</ToggleButton>
            <ToggleButton id="p3">P3 ceiling</ToggleButton>
          </ToggleButtonGroup>
        </div>

        <div className="flex items-center gap-3">
          <span className="shrink-0 text-xs text-fg-muted">Hue</span>
          <Slider
            aria-label="Hue"
            value={hue}
            onChange={(v) => setHue(v as number)}
            minValue={0}
            maxValue={360}
            step={1}
            className="flex-1"
          >
            <SliderControl />
          </Slider>
          <span className="w-9 shrink-0 text-right font-mono text-xs text-fg-muted tabular-nums">
            {hq}°
          </span>
        </div>

        <div
          className="relative cursor-crosshair touch-none select-none"
          onPointerDown={(event) => {
            dragging.current = true
            event.currentTarget.setPointerCapture(event.pointerId)
            paint(event)
          }}
          onPointerMove={(event) => {
            if (dragging.current) paint(event)
          }}
          onPointerUp={() => {
            dragging.current = false
          }}
          onPointerCancel={() => {
            dragging.current = false
          }}
        >
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="h-auto w-full text-fg"
            role="img"
            aria-label="Chroma curve editor: per-step chroma under the gamut ceiling. Drag to reshape the curve; use the presets for keyboard access."
          >
            <path d={tentArea} fill="currentColor" fillOpacity={0.05} />
            <path
              d={tentLine}
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              strokeOpacity={0.6}
            />
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
              y2={py(C_TOP)}
              stroke="currentColor"
              strokeOpacity={0.25}
            />
            {steps.map(
              (s, i) =>
                s.clamped && (
                  <g key={`ask-${i}`}>
                    <line
                      x1={px(i)}
                      y1={py(s.asked)}
                      x2={px(i)}
                      y2={py(s.delivered)}
                      stroke="currentColor"
                      strokeOpacity={0.35}
                      strokeDasharray="3 3"
                    />
                    <circle
                      cx={px(i)}
                      cy={py(s.asked)}
                      r={3.5}
                      fill="none"
                      stroke="currentColor"
                      strokeOpacity={0.5}
                    />
                  </g>
                ),
            )}
            <path
              d={curveLine}
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            />
            {steps.map((s, i) => (
              <circle
                key={i}
                cx={px(i)}
                cy={py(s.delivered)}
                r={4.5}
                fill={s.css}
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
              <text x={PAD.left - 6} y={py(C_TOP) + 4} textAnchor="end">
                {C_TOP}
              </text>
              <text x={PAD.left - 6} y={py(0) + 4} textAnchor="end">
                0
              </text>
              <text
                x={12}
                y={(py(0) + py(C_TOP)) / 2}
                textAnchor="middle"
                transform={`rotate(-90 12 ${(py(0) + py(C_TOP)) / 2})`}
              >
                C
              </text>
              <text x={px(5)} y={py(tent[20]?.c ?? 0) - 8} textAnchor="middle">
                ceiling
              </text>
            </g>
          </svg>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-fg-muted">Presets:</span>
          <Button
            variant="default"
            size="sm"
            onPress={() => applyPreset(DEFAULT_ABS)}
          >
            Smooth fit
          </Button>
          <Button
            variant="default"
            size="sm"
            onPress={() => applyPreset(Array.from({ length: 12 }, () => 0.15))}
          >
            Constant 0.15
          </Button>
          <Button
            variant="default"
            size="sm"
            onPress={() => applyPreset(ceils.map((c) => c * 0.95))}
          >
            Hug the ceiling
          </Button>
        </div>

        <div className="flex gap-1">
          {steps.map((s, i) => (
            <div
              key={i}
              className="flex min-w-0 flex-1 flex-col items-center gap-1"
            >
              <div
                className="h-11 w-full rounded-md border"
                style={{ backgroundColor: s.css }}
              />
              <span className="font-mono text-[0.55rem] text-fg-muted tabular-nums">
                {s.delivered.toFixed(3)}
              </span>
              <span className="font-mono text-[0.55rem] text-fg-muted">
                {s.clamped ? '✕' : s.p3Only ? 'P3' : ' '}
              </span>
            </div>
          ))}
        </div>
        <p className="-mt-2 text-xs text-fg-muted">
          Under each step: delivered chroma; ✕ marks a clamped step, P3 a step
          only wide-gamut screens show at full strength.
        </p>

        <p className="text-sm text-fg-muted" aria-live="polite">
          {summary}
        </p>
      </div>
    </Playground>
  )
}
