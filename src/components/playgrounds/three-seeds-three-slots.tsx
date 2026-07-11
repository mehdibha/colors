import { converter } from 'culori'

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

const SEEDS = [
  { hex: '#635bff', name: 'a violet-blue solid' },
  { hex: '#1e2a5a', name: 'a dark navy' },
  { hex: '#ffd6e7', name: 'a pastel pink' },
]

const ROWS = SEEDS.map(({ hex, name }) => {
  const l = toOklch(hex)?.l ?? 0
  let slot = 0
  let best = Infinity
  L12.forEach((sl, i) => {
    const d = Math.abs(sl - l)
    if (d < best) {
      best = d
      slot = i
    }
  })
  return { hex, name, l, slot, slotL: L12[slot] ?? 0 }
})

export function ThreeSeedsThreeSlots() {
  return (
    <Demo
      caption={
        <>
          Three seeds dropped onto one gray skeleton, each at the step whose
          lightness is nearest. Nobody asked what job the brand meant the color
          for &mdash; the ladder only read its L.
        </>
      }
    >
      <div className="flex flex-col gap-5">
        {ROWS.map((row) => (
          <div key={row.hex} className="flex flex-col gap-1.5">
            <div className="flex items-center gap-3">
              <div
                className="h-9 w-9 shrink-0 rounded-md border"
                style={{ backgroundColor: row.hex }}
              />
              <div className="flex min-w-0 flex-1 gap-1">
                {L12.map((l, i) => (
                  <div
                    key={i}
                    className={cn(
                      'h-9 min-w-0 flex-1 rounded-md border',
                      i === row.slot &&
                        'outline-2 outline-offset-2 outline-fg/70',
                    )}
                    style={{
                      backgroundColor:
                        i === row.slot ? row.hex : `oklch(${l.toFixed(3)} 0 0)`,
                    }}
                  />
                ))}
              </div>
            </div>
            <p className="pl-12 font-mono text-[0.65rem] text-fg-muted tabular-nums">
              {row.hex} ({row.name}) &middot; L {row.l.toFixed(3)} &rarr; step{' '}
              {row.slot + 1} (slot L {row.slotL.toFixed(3)})
            </p>
          </div>
        ))}
        <div className="flex gap-1 pl-12">
          {L12.map((_, i) => (
            <span
              key={i}
              className="min-w-0 flex-1 text-center font-mono text-[0.6rem] text-fg-muted"
            >
              {i + 1}
            </span>
          ))}
        </div>
      </div>
    </Demo>
  )
}
