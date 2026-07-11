import { clampChroma, converter, formatHex } from 'culori'

import { cn } from '@/lib/utils'
import { Demo } from '@/components/demo'

const toOklch = converter('oklch')

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

const shape = (i: number) => 0.45 + 0.55 * Math.sin((Math.PI * i) / 11)

const SEED = '#6f7278'
const seed = toOklch(SEED)
const SEED_L = seed?.l ?? 0
const SEED_C = seed?.c ?? 0
const SEED_H = seed?.h ?? 0

const SLOT = L12.reduce(
  (bestIdx, l, i) =>
    Math.abs(l - SEED_L) < Math.abs((L12[bestIdx] ?? 0) - SEED_L) ? i : bestIdx,
  0,
)

const ramp = (peakC: number) =>
  L12.map((l, i) =>
    formatHex(
      clampChroma(
        { mode: 'oklch', l, c: peakC * shape(i), h: SEED_H },
        'oklch',
      ),
    ),
  )

// Carry: ambition read straight off the seed. Floor: dotUI's minChroma 0.11 at the peak.
const CARRY = ramp(SEED_C / shape(SLOT))
const FLOOR = ramp(0.11)

const ROWS = [
  { label: 'Carry the seed’s chroma', ramp: CARRY },
  { label: 'Floor it at 0.11 (dotUI today)', ramp: FLOOR },
]

export function GraySeedTwoReadings() {
  return (
    <Demo
      caption={
        <>
          The seed is {SEED} &mdash; oklch({SEED_L.toFixed(3)}{' '}
          {SEED_C.toFixed(3)} {SEED_H.toFixed(0)}), one whisker from gray. Carry
          its chroma and you get a tinted neutral; floor it and the engine has
          decided, on its own, that the brand meant a blue accent. Neither
          reading is wrong &mdash; but only one was asked for.
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div
            className="h-9 w-9 shrink-0 rounded-md border"
            style={{ backgroundColor: SEED }}
          />
          <span className="font-mono text-xs text-fg-muted">
            seed {SEED} &middot; C {SEED_C.toFixed(3)}
          </span>
        </div>
        {ROWS.map((row) => (
          <div key={row.label} className="flex flex-col gap-1">
            <p className="text-xs text-fg-muted">{row.label}</p>
            <div className="flex gap-1">
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
