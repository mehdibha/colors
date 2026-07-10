import { useState } from 'react'
import { displayable, formatHex } from 'culori'

import { Demo } from '@/components/demo'
import { Slider, SliderControl } from '@/ui/slider'

const HUE = 250

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

const maxChroma = (l: number, h: number) => {
  let lo = 0
  let hi = 0.45
  for (let k = 0; k < 22; k++) {
    const mid = (lo + hi) / 2
    if (displayable({ mode: 'oklch', l, c: mid, h })) lo = mid
    else hi = mid
  }
  return lo
}

const CEILS = L12.map((l) => maxChroma(l, HUE))
const NEVER_CLAMPS = Math.min(...CEILS)

const W = 520
const H = 160
const PAD = { left: 40, right: 12, top: 10, bottom: 22 }
const C_TOP = 0.26
const px = (i: number) => PAD.left + (i / 11) * (W - PAD.left - PAD.right)
const py = (c: number) => PAD.top + (1 - c / C_TOP) * (H - PAD.top - PAD.bottom)

// continuous ceiling across step space (L lerped between steps)
const CEIL_PATH = Array.from({ length: 56 }, (_, k) => {
  const t = (k / 55) * 11
  const lo = Math.floor(t)
  const hi = Math.min(lo + 1, 11)
  const f = t - lo
  const l = (L12[lo] ?? 0) * (1 - f) + (L12[hi] ?? 0) * f
  const c = maxChroma(l, HUE)
  return `${k === 0 ? 'M' : 'L'}${px(t).toFixed(1)},${py(c).toFixed(1)}`
}).join(' ')

export function ConstantChromaStrip() {
  const [asked, setAsked] = useState(0.15)

  const steps = L12.map((l, i) => {
    const ceil = CEILS[i] ?? 0
    const delivered = Math.min(asked, ceil)
    return {
      l,
      ceil,
      delivered,
      clamped: asked > ceil + 1e-4,
      hex: formatHex({ mode: 'oklch', l, c: delivered, h: HUE }),
    }
  })
  const clampedCount = steps.filter((s) => s.clamped).length

  return (
    <Demo
      caption={
        <>
          One hue (250°), chapter 11&rsquo;s skeleton, one demand: the same
          chroma at every step. The dashed line is your spec; the dots are what
          the screen delivers. The largest constant that never clamps here is C{' '}
          {NEVER_CLAMPS.toFixed(3)} &mdash; a ramp indistinguishable from the
          gray scale.
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <span className="shrink-0 text-xs text-fg-muted">
            Requested chroma
          </span>
          <Slider
            aria-label="Requested chroma"
            value={asked}
            onChange={(v) => setAsked(v as number)}
            minValue={0.005}
            maxValue={0.24}
            step={0.005}
            className="flex-1"
          >
            <SliderControl />
          </Slider>
          <span className="w-12 shrink-0 text-right font-mono text-xs text-fg-muted tabular-nums">
            {asked.toFixed(3)}
          </span>
        </div>

        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="h-auto w-full text-fg"
          role="img"
          aria-label="Requested constant chroma versus the gamut ceiling across the twelve steps"
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
            y2={py(C_TOP)}
            stroke="currentColor"
            strokeOpacity={0.25}
          />
          <path
            d={CEIL_PATH}
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            strokeOpacity={0.6}
          />
          <line
            x1={PAD.left}
            y1={py(asked)}
            x2={px(11)}
            y2={py(asked)}
            stroke="currentColor"
            strokeOpacity={0.5}
            strokeDasharray="4 3"
          />
          {steps.map((s, i) => (
            <circle
              key={i}
              cx={px(i)}
              cy={py(s.delivered)}
              r={4}
              fill={s.hex}
              stroke="currentColor"
              strokeOpacity={s.clamped ? 0.9 : 0.35}
            />
          ))}
          <g
            className="font-mono text-[0.6rem]"
            fill="currentColor"
            fillOpacity={0.55}
          >
            <text x={px(0)} y={H - 6} textAnchor="middle">
              1
            </text>
            <text x={px(11)} y={H - 6} textAnchor="middle">
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
            <text x={px(11)} y={py(CEILS[11] ?? 0) - 8} textAnchor="end">
              ceiling
            </text>
          </g>
        </svg>

        <div className="flex gap-1">
          {steps.map((s, i) => (
            <div
              key={i}
              className="flex min-w-0 flex-1 flex-col items-center gap-1"
            >
              <div
                className="h-10 w-full rounded-md border"
                style={{ backgroundColor: s.hex }}
              />
              <span className="font-mono text-[0.6rem] text-fg-muted">
                {s.clamped ? '✕' : ' '}
              </span>
            </div>
          ))}
        </div>

        <p className="-mt-2 text-sm text-fg-muted" aria-live="polite">
          {clampedCount === 0
            ? `No step clamps at C ${asked.toFixed(3)} — because the demand is under the ceiling everywhere, and the whole ramp is nearly gray.`
            : `${clampedCount} of 12 steps (marked ✕) sit above this hue's ceiling. Their chroma is the tent's shape, not your spec — the "constant" ramp isn't.`}
        </p>
      </div>
    </Demo>
  )
}
