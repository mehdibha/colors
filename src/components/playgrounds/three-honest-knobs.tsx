import { useState } from 'react'
import { converter, displayable, formatHex, wcagLuminance } from 'culori'

import { Demo } from '@/components/demo'
import { Slider, SliderControl } from '@/ui/slider'

const toRgb = converter('rgb')

// max chroma every hue can display at a given L, with a small safety margin
const CAP_MIN_L = 0.35
const CAP_STEP = 0.025
const CAPS = Array.from({ length: 23 }, (_, i) => {
  const l = CAP_MIN_L + i * CAP_STEP
  let min = 0.4
  for (let h = 0; h < 360; h += 10) {
    let lo = 0
    let hi = 0.4
    for (let k = 0; k < 20; k++) {
      const mid = (lo + hi) / 2
      if (displayable({ mode: 'oklch', l, c: mid, h })) lo = mid
      else hi = mid
    }
    min = Math.min(min, lo)
  }
  return min * 0.98
})

const capFor = (l: number) => {
  const x = (l - CAP_MIN_L) / CAP_STEP
  const i = Math.min(Math.max(Math.floor(x), 0), CAPS.length - 2)
  const lower = CAPS[i] ?? 0
  const upper = CAPS[i + 1] ?? lower
  const cap = lower + (upper - lower) * (x - i)
  return Math.floor(cap * 1000) / 1000
}

const START = { l: 0.65, c: 0.1, h: 250 }

export function ThreeHonestKnobs() {
  const [l, setL] = useState(START.l)
  const [c, setC] = useState(START.c)
  const [h, setH] = useState(START.h)

  const cap = capFor(l)
  const chroma = Math.min(c, cap)

  const rgb = toRgb({ mode: 'oklch', l, c: chroma, h })
  const hex = formatHex(rgb)
  const y = wcagLuminance(rgb)
  const grayHex = formatHex(toRgb({ mode: 'lrgb', r: y, g: y, b: y }))

  return (
    <Demo
      caption={
        <>
          Spin H through a full turn: the color changes completely, its gray
          twin barely moves. Drain C to zero: it fades to gray without getting
          lighter or darker. Only L moves the twin. The light meter does wiggle
          a few points as H turns — perceived lightness is not a light meter
          (chapter 3) — and C's ceiling shifts as you move: that's your screen
          running out of colors, which is chapter 6's problem, not OKLCH's.
        </>
      }
    >
      <div className="flex h-24 overflow-hidden rounded-lg border">
        <div className="flex-1" style={{ backgroundColor: hex }} />
        <div className="flex-1" style={{ backgroundColor: grayHex }} />
      </div>
      <div className="mt-2 flex font-mono text-[0.7rem] text-fg-muted">
        <span className="flex-1 text-center tabular-nums">
          oklch({l.toFixed(2)} {chroma.toFixed(3)} {Math.round(h)}) — {hex}
        </span>
        <span className="flex-1 text-center">its light, as gray</span>
      </div>

      <div className="mt-4 flex flex-col gap-3">
        <Knob
          label="L — lightness"
          display={l.toFixed(2)}
          value={l}
          onChange={setL}
          min={0.35}
          max={0.9}
          step={0.01}
        />
        <Knob
          label="C — chroma"
          display={chroma.toFixed(3)}
          value={chroma}
          onChange={setC}
          min={0}
          max={cap}
          step={0.001}
        />
        <Knob
          label="H — hue"
          display={`${Math.round(h)}°`}
          value={h}
          onChange={setH}
          min={0}
          max={360}
          step={1}
        />
        <div className="flex items-center gap-2">
          <span className="w-26 shrink-0 text-xs text-fg-muted">
            light emitted
          </span>
          <div className="h-2 flex-1 overflow-hidden rounded-full border">
            <div
              className="h-full"
              style={{ width: `${y * 100}%`, backgroundColor: hex }}
            />
          </div>
          <span className="w-12 shrink-0 text-right font-mono text-xs text-fg-muted tabular-nums">
            {(y * 100).toFixed(1)}%
          </span>
        </div>
      </div>
    </Demo>
  )
}

function Knob({
  label,
  display,
  value,
  onChange,
  min,
  max,
  step,
}: {
  label: string
  display: string
  value: number
  onChange: (value: number) => void
  min: number
  max: number
  step: number
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-baseline justify-between">
        <span className="text-xs text-fg-muted">{label}</span>
        <span className="font-mono text-xs text-fg-muted tabular-nums">
          {display}
        </span>
      </div>
      <Slider
        aria-label={label}
        value={value}
        onChange={(v) => onChange(v as number)}
        minValue={min}
        maxValue={max}
        step={step}
      >
        <SliderControl />
      </Slider>
    </div>
  )
}
