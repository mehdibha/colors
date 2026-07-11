import { clampChroma, formatHex } from 'culori'

import { cn } from '@/lib/utils'
import { Demo } from '@/components/demo'

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

// ch12's envelope shape, normalized so the landing slot gets exactly the seed's chroma.
const shape = (i: number) => 0.45 + 0.55 * Math.sin((Math.PI * i) / 11)

const SEED_L = 0.578
const HUE = 278.3
const SLOT = L12.reduce(
  (bestIdx, l, i) =>
    Math.abs(l - SEED_L) < Math.abs((L12[bestIdx] ?? 0) - SEED_L) ? i : bestIdx,
  0,
)

const SEED_CS = [0.06, 0.15, 0.235]

const ROWS = SEED_CS.map((seedC) => {
  const seedHex = formatHex(
    clampChroma({ mode: 'oklch', l: SEED_L, c: seedC, h: HUE }, 'oklch'),
  )
  const ambition = seedC / shape(SLOT)
  const ramp = L12.map((l, i) =>
    formatHex(
      clampChroma(
        { mode: 'oklch', l, c: ambition * shape(i), h: HUE },
        'oklch',
      ),
    ),
  )
  return { seedC, seedHex, ramp }
})

export function ChromaAmbition() {
  return (
    <Demo
      caption={
        <>
          One skeleton, one hue, three seeds that differ only in chroma &mdash;
          all landing at step {SLOT + 1}. The seed&rsquo;s C scales the entire
          arc: a muted seed asks for a muted family, a vivid seed for a vivid
          one. Lightness never moved.
        </>
      }
    >
      <div className="flex flex-col gap-4">
        {ROWS.map((row) => (
          <div key={row.seedC} className="flex items-center gap-3">
            <div className="flex w-9 shrink-0 flex-col items-center gap-1">
              <div
                className="h-9 w-9 rounded-md border"
                style={{ backgroundColor: row.seedHex }}
              />
              <span className="font-mono text-[0.6rem] text-fg-muted tabular-nums">
                C {row.seedC.toFixed(2)}
              </span>
            </div>
            <div className="flex min-w-0 flex-1 gap-1">
              {row.ramp.map((hex, i) => (
                <div
                  key={i}
                  className={cn(
                    'h-9 min-w-0 flex-1 rounded-md border',
                    i === SLOT && 'outline-2 outline-offset-2 outline-fg/70',
                  )}
                  style={{ backgroundColor: hex }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </Demo>
  )
}
