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

// Radix slate3 and its alpha twin slateA3 (light.ts).
const SOLID = '#f0f0f3'
const ALPHA = '#0000330f'

const SURFACES = [
  { name: 'white', bg: '#ffffff' },
  { name: 'amber 2', bg: '#fefbe9' },
  { name: 'blue 3', bg: '#e6f4fe' },
]

export function AlphaVsSolidChip() {
  return (
    <Demo
      caption={
        <>
          One &ldquo;hover wash&rdquo; chip, two spellings, three surfaces. On
          white they are pixel-identical &mdash; slateA3 is constructed so that
          composited over white it <em>is</em> slate 3. Everywhere else the
          solid ships its blue-gray verbatim while the alpha darkens whatever it
          lands on: warm on the warm card, blue on the blue one.
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
            <span className="text-[0.65rem] text-fg-muted">{s.name}</span>
            <div className="flex flex-col gap-1.5">
              <div
                className="rounded-md px-3 py-2 text-[0.7rem] font-medium text-[#1c2024]"
                style={{ backgroundColor: SOLID }}
              >
                solid slate 3
              </div>
              <div
                className="rounded-md px-3 py-2 text-[0.7rem] font-medium text-[#1c2024]"
                style={{ backgroundColor: ALPHA }}
              >
                alpha slateA3
              </div>
            </div>
            <span className="font-mono text-[0.6rem] text-fg-muted tabular-nums">
              {SOLID} · {compositeOver(ALPHA, s.bg)}
            </span>
          </div>
        ))}
      </div>
    </Demo>
  )
}
