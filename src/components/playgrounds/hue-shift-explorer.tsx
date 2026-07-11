import { useMemo, useState } from 'react'
import { displayable } from 'culori'

import { Playground } from '@/components/playground'
import { Button } from '@/ui/button'
import { Slider, SliderControl } from '@/ui/slider'

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

// ch11's skeleton: dotUI's fixed lightness anchors, resampled to 12 steps.
const ANCHORS = [
  0.9778, 0.9356, 0.8811, 0.8267, 0.7422, 0.6478, 0.5733, 0.4689, 0.3944, 0.32,
  0.2378,
]
const L12 = Array.from({ length: 12 }, (_, i) => {
  const t = (i / 11) * (ANCHORS.length - 1)
  const lo = Math.floor(t)
  const hi = Math.min(lo + 1, ANCHORS.length - 1)
  const f = t - lo
  return (ANCHORS[lo] ?? 0) * (1 - f) + (ANCHORS[hi] ?? 0) * f
})
const L1 = L12[0] ?? 1
const LN = L12[11] ?? 0

const norm = (h: number) => ((h % 360) + 360) % 360

// Bend keyed to L: 0 at the lightest step, 1 at the darkest.
const buildRamp = (seedHue: number, bend: number) =>
  L12.map((l) => {
    const w = (L1 - l) / (L1 - LN)
    const h = norm(seedHue + bend * w)
    const c = Math.min(0.15, maxChroma(l, h))
    return {
      l,
      c,
      h,
      css: `oklch(${l.toFixed(3)} ${c.toFixed(3)} ${h.toFixed(1)})`,
    }
  })

const START_HUE = 110
const START_BEND = -30

const PRESETS = [
  { label: 'Yellow', hue: 110, bend: -30 },
  { label: 'Orange', hue: 55, bend: -22 },
  { label: 'Red', hue: 30, bend: 0 },
  { label: 'Green', hue: 145, bend: 0 },
  { label: 'Blue', hue: 250, bend: 13 },
]

const W = 560
const H = 200
const PAD = { left: 44, right: 12, top: 12, bottom: 24 }
const px = (i: number) => PAD.left + (i / 11) * (W - PAD.left - PAD.right)

export function HueShiftExplorer() {
  const [hue, setHue] = useState(START_HUE)
  const [bend, setBend] = useState(START_BEND)

  const hq = Math.round(hue)
  const flat = useMemo(() => buildRamp(hq, 0), [hq])
  const bent = useMemo(() => buildRamp(hq, bend), [hq, bend])

  const yMin = hq - 65
  const yMax = hq + 65
  const py = (h: number) => {
    // plot against the un-normalized bent hue so the curve never wraps visually
    return PAD.top + ((yMax - h) / (yMax - yMin)) * (H - PAD.top - PAD.bottom)
  }
  const rawHues = L12.map((l) => hq + bend * ((L1 - l) / (L1 - LN)))
  const bentLine = rawHues
    .map(
      (h, i) => `${i === 0 ? 'M' : 'L'}${px(i).toFixed(1)},${py(h).toFixed(1)}`,
    )
    .join(' ')

  const chromaGain = bent
    .slice(6)
    .reduce((sum, s, i) => sum + s.c - (flat[i + 6]?.c ?? 0), 0)
  const last = bent[11]
  const summary =
    Math.abs(bend) < 3
      ? 'No bend: both rows are the constant-hue ramp. Move the bend slider and watch only the dark half change.'
      : `The dark steps leave ${hq}° gradually and step 12 lands at ${(last?.h ?? 0).toFixed(0)}°.` +
        (chromaGain > 0.02
          ? ' The bent dark half also carries more chroma — the tent is taller where the bend points.'
          : chromaGain < -0.02
            ? ' The bend is costing chroma: it points toward a shorter part of the tent.'
            : '')

  return (
    <Playground
      question="Your dark yellow reads olive — how many degrees toward orange buy the yellow back?"
      onReset={() => {
        setHue(START_HUE)
        setBend(START_BEND)
      }}
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-fg-muted">Families:</span>
          {PRESETS.map((p) => (
            <Button
              key={p.label}
              variant={hq === p.hue && bend === p.bend ? 'primary' : 'default'}
              size="sm"
              onPress={() => {
                setHue(p.hue)
                setBend(p.bend)
              }}
            >
              {p.label} {p.bend > 0 ? '+' : ''}
              {p.bend}&deg;
            </Button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <span className="w-16 shrink-0 text-xs text-fg-muted">Seed hue</span>
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
          <span className="w-12 shrink-0 text-right font-mono text-xs text-fg-muted tabular-nums">
            {hq}&deg;
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="w-16 shrink-0 text-xs text-fg-muted">Bend</span>
          <Slider
            aria-label="Hue bend toward the dark end, in degrees"
            value={bend}
            onChange={(v) => setBend(v as number)}
            minValue={-60}
            maxValue={60}
            step={1}
            className="flex-1"
          >
            <SliderControl />
          </Slider>
          <span className="w-12 shrink-0 text-right font-mono text-xs text-fg-muted tabular-nums">
            {bend > 0 ? '+' : ''}
            {bend}&deg;
          </span>
        </div>

        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="h-auto w-full text-fg"
          role="img"
          aria-label="Hue at each step: a dashed line at the constant seed hue, and the bent curve leaving it toward the dark end"
        >
          <line
            x1={px(0)}
            y1={py(hq)}
            x2={px(11)}
            y2={py(hq)}
            stroke="currentColor"
            strokeOpacity={0.35}
            strokeDasharray="4 4"
          />
          <path
            d={bentLine}
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            strokeOpacity={0.6}
          />
          {rawHues.map((h, i) => (
            <circle
              key={i}
              cx={px(i)}
              cy={py(h)}
              r={5}
              fill={bent[i]?.css}
              stroke="currentColor"
              strokeOpacity={0.5}
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
            <text x={PAD.left - 6} y={py(hq) + 3} textAnchor="end">
              {hq}&deg;
            </text>
            <text x={PAD.left - 6} y={py(yMax) + 4} textAnchor="end">
              +65&deg;
            </text>
            <text x={PAD.left - 6} y={py(yMin) + 4} textAnchor="end">
              &minus;65&deg;
            </text>
          </g>
        </svg>

        <div className="flex flex-col gap-3">
          <div>
            <p className="mb-1 text-xs text-fg-muted">Constant hue</p>
            <div className="flex gap-1">
              {flat.map((s, i) => (
                <div
                  key={i}
                  className="h-11 min-w-0 flex-1 rounded-md border"
                  style={{ backgroundColor: s.css }}
                />
              ))}
            </div>
          </div>
          <div>
            <p className="mb-1 text-xs text-fg-muted">With the bend</p>
            <div className="flex gap-1">
              {bent.map((s, i) => (
                <div
                  key={i}
                  className="flex min-w-0 flex-1 flex-col items-center gap-1"
                >
                  <div
                    className="h-11 w-full rounded-md border"
                    style={{ backgroundColor: s.css }}
                  />
                  <span className="font-mono text-[0.55rem] text-fg-muted tabular-nums">
                    {s.h.toFixed(0)}&deg;
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <p className="text-sm text-fg-muted" aria-live="polite">
          {summary}
        </p>
      </div>
    </Playground>
  )
}
