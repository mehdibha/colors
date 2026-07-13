import { converter, formatHex, parse } from 'culori'

import { Demo } from '@/components/demo'

const toRgb = converter('rgb')

function compositeOver(fg: string, bg: string): string {
  const f = toRgb(parse(fg))
  const b = toRgb(parse(bg))
  if (!f || !b) return bg
  const a = f.alpha ?? 1
  return formatHex({
    mode: 'rgb' as const,
    r: a * f.r + (1 - a) * b.r,
    g: a * f.g + (1 - a) * b.g,
    b: a * f.b + (1 - a) * b.b,
  })
}

// Radix light.ts: blue5 and blueA5 — the selected-row job, two spellings.
const SOLID = '#c2e5ff'
const ALPHA = '#0093ff3d'
const TEXT = '#113264'

const SURFACES = [
  { name: 'white (the page it was built for)', bg: '#ffffff' },
  { name: 'amber 2', bg: '#fefbe9' },
  { name: 'jade 3', bg: '#e6f7ed' },
]

export function SolidVsAlphaTwin() {
  return (
    <Demo
      caption={
        <>
          Blue&rsquo;s selected-row step, both spellings, three surfaces. On
          white the twin composites to blue&nbsp;5 to the exact hex &mdash;
          that&rsquo;s the construction. Off the page it was built for, the
          solid pastes its verbatim sky-blue while the alpha tints whatever it
          lands on. One token doing three surfaces is what the twin buys.
        </>
      }
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {SURFACES.map((s) => (
          <div
            key={s.name}
            className="flex flex-col gap-2 rounded-lg border p-4"
            style={{ backgroundColor: s.bg }}
          >
            <span className="text-[0.65rem]" style={{ color: TEXT }}>
              {s.name}
            </span>
            <div
              className="rounded-md px-3 py-2 text-[0.7rem] font-medium"
              style={{ backgroundColor: SOLID, color: TEXT }}
            >
              solid blue 5
            </div>
            <div
              className="rounded-md px-3 py-2 text-[0.7rem] font-medium"
              style={{ backgroundColor: ALPHA, color: TEXT }}
            >
              alpha blueA5
            </div>
            <span
              className="font-mono text-[0.6rem] tabular-nums"
              style={{ color: TEXT }}
            >
              {SOLID} · {compositeOver(ALPHA, s.bg)}
            </span>
          </div>
        ))}
      </div>
    </Demo>
  )
}
