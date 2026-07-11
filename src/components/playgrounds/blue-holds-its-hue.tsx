import { displayable, formatHex } from 'culori'

import { Demo } from '@/components/demo'

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

const HUE = 252
const STEPS = L12.map((l) => {
  const c = Math.min(0.15, maxChroma(l, HUE))
  return {
    css: `oklch(${l.toFixed(3)} ${c.toFixed(3)} ${HUE})`,
    hex: formatHex({ mode: 'oklch', l, c, h: HUE }),
  }
})

export function BlueHoldsItsHue() {
  return (
    <Demo
      caption={
        <>
          Twelve steps on chapter 11&rsquo;s skeleton, chroma capped by chapter
          12&rsquo;s ceiling, and one hue number the whole way: 252&deg;, the
          hue of Radix blue&rsquo;s solid step. Every step reads as the same
          blue &mdash; pale blue, blue, dark blue, navy. The flattest possible
          third curve, and nothing to fix.
        </>
      }
    >
      <div className="flex gap-1">
        {STEPS.map((s, i) => (
          <div
            key={i}
            className="flex min-w-0 flex-1 flex-col items-center gap-1"
          >
            <div
              className="h-12 w-full rounded-md border"
              style={{ backgroundColor: s.css }}
            />
            <span className="font-mono text-[0.55rem] text-fg-muted tabular-nums">
              {i + 1}
            </span>
          </div>
        ))}
      </div>
      <p className="mt-2 font-mono text-xs text-fg-muted">
        h = 252&deg; at every step
      </p>
    </Demo>
  )
}
