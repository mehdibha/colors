import { converter, formatHex, parse, wcagContrast } from 'culori'

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

// slate12 at Material's shipped opacities; desat = blue9/red9 lifted to L 0.8, C 0.02.
const ON_SURFACE = '28, 32, 36'
const SURFACES = [
  { name: 'On white', bg: '#ffffff' },
  { name: 'On a warm card (amber 2)', bg: '#fefbe9' },
]

interface Chip {
  label: string
  fill: string
  text: string
}

function recipes(bg: string): { name: string; chips: Chip[] }[] {
  const container = compositeOver(`rgba(${ON_SURFACE}, 0.12)`, bg)
  const label = compositeOver(`rgba(${ON_SURFACE}, 0.38)`, container)
  return [
    {
      name: 'Alpha (Material)',
      chips: [{ label: 'Save changes', fill: container, text: label }],
    },
    {
      name: 'Desaturate + lift',
      chips: [
        { label: 'Save changes', fill: '#b5bfcb', text: '#5d626b' },
        { label: 'Delete', fill: '#cab9b8', text: '#716261' },
      ],
    },
    {
      name: 'Fixed grays (dotUI)',
      chips: [{ label: 'Save changes', fill: '#ededed', text: '#888888' }],
    },
  ]
}

export function DisabledThreeRecipes() {
  return (
    <Demo
      caption={
        <>
          The same disabled buttons, three recipes, two surfaces. The alpha
          recipe re-composites per surface &mdash; on the warm card it comes out
          warm. Desaturate keeps a ghost of the hue: the primary still reads
          faintly blue, the danger faintly red. The fixed grays ship one value
          and sit cold on anything tinted. Every readout is below 4.5:1 on
          purpose; WCAG 1.4.3 exempts inactive components, it doesn&rsquo;t
          reward invisibility.
        </>
      }
    >
      <div className="flex flex-col gap-3">
        {SURFACES.map((s) => (
          <div
            key={s.name}
            className="flex flex-col gap-2 rounded-lg border p-4"
            style={{ backgroundColor: s.bg }}
          >
            <span className="text-[0.65rem] text-fg-muted">{s.name}</span>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {recipes(s.bg).map((r) => (
                <div key={r.name} className="flex flex-col gap-1">
                  <div className="flex flex-col gap-1">
                    {r.chips.map((c) => (
                      <span
                        key={c.label}
                        className="cursor-not-allowed rounded-md px-3 py-2 text-center text-xs font-medium"
                        style={{ backgroundColor: c.fill, color: c.text }}
                      >
                        {c.label}
                      </span>
                    ))}
                  </div>
                  <span className="text-[0.65rem] text-fg-muted">{r.name}</span>
                  <span className="font-mono text-[0.6rem] text-fg-muted tabular-nums">
                    {r.chips
                      .map(
                        (c) => `${wcagContrast(c.text, c.fill).toFixed(2)}:1`,
                      )
                      .join(' · ')}{' '}
                    · exempt (1.4.3)
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Demo>
  )
}
