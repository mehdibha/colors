import { converter, formatHex, wcagContrast } from 'culori'

import { Demo } from '@/components/demo'
const toRgb = converter('rgb')
// Source-over compositing: what the eye actually sees for a translucent step.
function over(fg: string, bg: string): string {
  const f = toRgb(fg)
  const b = toRgb(bg)
  if (!f || !b) return bg
  const a = f.alpha ?? 1
  return formatHex({
    mode: 'rgb',
    r: f.r * a + b.r * (1 - a),
    g: f.g * a + b.g * (1 - a),
    b: f.b * a + b.b * (1 - a),
  })
}
const labelText = (hex: string) =>
  wcagContrast('#000000', hex) >= wcagContrast('#ffffff', hex)
    ? '#000000'
    : '#ffffff'
// radix-ui/colors src/light.ts — blue8 (solid) and blueA8 (alpha, α 0.63).
const SOLID = '#5eb1ef'
const ALPHA = '#0084e6a1'
const SURFACES = [
  { name: 'white', bg: '#ffffff' },
  { name: 'gray', bg: '#e0e1e6' },
  { name: 'near-black', bg: '#111113' },
]
export function RadixAlphaSurfaces() {
  return (
    <Demo
      caption={
        <>
          blue8 as a solid vs blueA8 (&alpha; 0.63) over three surfaces. The
          solid is tuned for white &mdash; 2.33:1 there &mdash; and blows to
          8.09:1 on near-black: a harsh line, not a subtle edge. The alpha tints
          whatever it&rsquo;s over and holds 2.0&ndash;2.6:1 everywhere; over
          white it composites to the solid step exactly. Chapter 18&rsquo;s
          compositing primitive, generated for every step.
        </>
      }
    >
      <div className="grid gap-3 sm:grid-cols-3">
        {SURFACES.map((s) => {
          const comp = over(ALPHA, s.bg)
          const solidC = wcagContrast(SOLID, s.bg)
          const alphaC = wcagContrast(comp, s.bg)
          const fg = labelText(s.bg)
          return (
            <div
              key={s.name}
              className="flex flex-col gap-2 rounded-lg border p-3"
              style={{ backgroundColor: s.bg }}
            >
              <span
                className="font-mono text-[0.6rem] tabular-nums"
                style={{ color: fg }}
              >
                {s.name} {s.bg}
              </span>
              <div className="flex gap-2">
                <div className="flex flex-1 flex-col items-center gap-1">
                  <div
                    className="h-10 w-full rounded-sm"
                    style={{ backgroundColor: SOLID }}
                  />
                  <span
                    className="font-mono text-[0.6rem] tabular-nums"
                    style={{ color: fg }}
                  >
                    solid {solidC.toFixed(2)}:1
                  </span>
                </div>
                <div className="flex flex-1 flex-col items-center gap-1">
                  <div
                    className="h-10 w-full rounded-sm"
                    style={{ backgroundColor: ALPHA }}
                  />
                  <span
                    className="font-mono text-[0.6rem] tabular-nums"
                    style={{ color: fg }}
                  >
                    alpha {alphaC.toFixed(2)}:1
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </Demo>
  )
}
