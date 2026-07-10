import { useState } from 'react'
import { clampChroma, formatHex, wcagContrast } from 'culori'

import { Demo } from '@/components/demo'
import { Slider, SliderControl } from '@/ui/slider'

// dotUI's fixed lightness anchors (11 steps), resampled to 12.
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

const LTARGETS = resample(ANCHORS, 12)
const CCURVE = Array.from(
  { length: 12 },
  (_, i) => 0.02 + 0.18 * Math.sin((Math.PI * i) / 11),
)

const makeRamp = (hue: number): string[] =>
  LTARGETS.map((l, i) =>
    formatHex(
      clampChroma({ mode: 'oklch', l, c: CCURVE[i] ?? 0, h: hue }, 'oklch'),
    ),
  )

const REFERENCE = makeRamp(250)

function Ramp({ hexes, label }: { hexes: string[]; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-14 shrink-0 text-right font-mono text-[0.65rem] text-fg-muted tabular-nums">
        {label}
      </span>
      <div className="flex min-w-0 flex-1 gap-1">
        {hexes.map((hex, i) => (
          <div
            key={i}
            className="h-9 min-w-0 flex-1 rounded-md border"
            style={{ backgroundColor: hex }}
          />
        ))}
      </div>
    </div>
  )
}

export function SharedSkeleton() {
  const [hue, setHue] = useState(145)

  const ramp = makeRamp(hue)
  const refStep7 = wcagContrast('#ffffff', REFERENCE[6] ?? '#000')
  const hueStep7 = wcagContrast('#ffffff', ramp[6] ?? '#000')

  return (
    <Demo
      caption={
        <>
          Two hues, one skeleton: every step takes its L from the same fixed
          list, so the geometry — which neighbors whisper, where the cliffs are
          — is identical, and swapping the accent is a repaint. What the shared
          skeleton does <em>not</em> fix is the meter: OKLCH L is not luminance,
          so the same anchored step emits different amounts of light at
          different hues.
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Ramp hexes={REFERENCE} label="250°" />
          <div className="flex items-center gap-2">
            <span className="w-14 shrink-0" />
            <div className="flex min-w-0 flex-1 gap-1">
              {LTARGETS.map((l, i) => (
                <span
                  key={i}
                  className="min-w-0 flex-1 text-center font-mono text-[0.55rem] text-fg-muted tabular-nums"
                >
                  {l.toFixed(2).slice(1)}
                </span>
              ))}
            </div>
          </div>
          <Ramp hexes={ramp} label={`${hue}°`} />
        </div>

        <div className="flex items-center gap-3">
          <span className="shrink-0 text-xs text-fg-muted">Second hue</span>
          <Slider
            aria-label="Second ramp hue"
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

        <p className="text-sm text-fg-muted tabular-nums" aria-live="polite">
          White text on step 7: {refStep7.toFixed(2)}:1 at 250°,{' '}
          {hueStep7.toFixed(2)}:1 at {hue}° — same anchored L, different
          contrast.
        </p>
      </div>
    </Demo>
  )
}
