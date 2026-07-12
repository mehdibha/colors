import { useMemo, useState } from 'react'

import { Demo } from '@/components/demo'
import { Slider, SliderControl } from '@/ui/slider'

import { dEok, LEONARDO_BLUE_KEYS, makeScale, solveWcag } from './leonardo-mini'

const BG = '#f8f8f8'
const N = 512
const SCALE = makeScale(LEONARDO_BLUE_KEYS, N)
const STRIP = SCALE.filter((_, i) => i % 4 === 0)

// Where each key color lands along the sampled path.
const KEY_FRACTIONS = LEONARDO_BLUE_KEYS.map((key) => {
  let best = 0
  let bestD = Infinity
  for (let i = 0; i < SCALE.length; i++) {
    const sample = SCALE[i]
    if (!sample) continue
    const d = dEok(sample.hex, key)
    if (d < bestD) {
      bestD = d
      best = i
    }
  }
  return best / (N - 1)
})

export function KeyColorsAreAnchors() {
  const [target, setTarget] = useState(4.5)

  const solved = useMemo(() => solveWcag(SCALE, BG, target), [target])
  const fraction = solved.index / (N - 1)

  return (
    <Demo
      caption={
        <>
          Leonardo's scale for <code>colorKeys: ['#5CDBFF', '#0000FF']</code> —
          white and black appended, keys sorted by lightness, interpolated in
          sRGB. The key colors (small rings) are anchors on the path; the swatch
          you get (the large ring) is wherever the target ratio lives against
          the background. Drag the target: the output moves, the keys never do.
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <span className="shrink-0 text-xs text-fg-muted">Target ratio</span>
          <Slider
            aria-label="Target contrast ratio against the background"
            value={target}
            onChange={(v) => setTarget(v as number)}
            minValue={1.1}
            maxValue={15}
            step={0.1}
            className="flex-1"
          >
            <SliderControl />
          </Slider>
          <span className="w-14 shrink-0 text-right font-mono text-xs text-fg-muted tabular-nums">
            {target.toFixed(1)}:1
          </span>
        </div>

        <div className="relative pt-3 pb-1">
          <div className="flex h-10 overflow-hidden rounded-md border">
            {STRIP.map((sample, i) => (
              <div
                key={i}
                className="min-w-0 flex-1"
                style={{ backgroundColor: sample.hex }}
              />
            ))}
          </div>
          {KEY_FRACTIONS.map((f, i) => (
            <div
              key={i}
              aria-hidden
              className="absolute top-0 size-2.5 -translate-x-1/2 rounded-full border-2 border-fg-muted bg-transparent"
              style={{ left: `${f * 100}%` }}
            />
          ))}
          <div
            aria-hidden
            className="absolute top-1/2 size-5 -translate-x-1/2 rounded-full border-2 border-white shadow-md ring-1 ring-black/30"
            style={{
              left: `${fraction * 100}%`,
              backgroundColor: solved.hex,
            }}
          />
        </div>

        <div
          aria-live="polite"
          className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs tabular-nums"
        >
          <span>
            solved: <span className="font-mono">{solved.hex}</span>
          </span>
          <span className="text-fg-muted">
            measured against {BG}:{' '}
            <span className="font-mono">{solved.measured.toFixed(2)}:1</span>
          </span>
        </div>
      </div>
    </Demo>
  )
}
