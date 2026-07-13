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

// Radix blackA3 = rgba(0,0,0,0.15); layers compound as 1−(1−a)^n.
const A = 0.15
const LAYERS = [1, 2, 3].map((n) => {
  let hex = '#ffffff'
  for (let i = 0; i < n; i++) hex = compositeOver('rgba(0,0,0,0.15)', hex)
  return { n, hex, effective: 1 - (1 - A) ** n }
})

const TEXT = '#60646c' // slate11
const OVER_WHITE = compositeOver('#0000330f', '#ffffff')
const OVER_BLUE9 = compositeOver('#0000330f', '#0090ff')

export function AlphaStacks() {
  return (
    <Demo
      caption={
        <>
          Left: blackA3 is 15% black, but a selected row inside a hovered group
          inside a raised card is three layers &mdash; 38.6%, not 45%, because
          each layer filters what the last one let through. Right: the same text
          token over the same alpha surface, on two different undersides &mdash;
          the pairing contract from chapter 17 has nothing fixed to hold on to.
        </>
      }
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <span className="text-xs text-fg-muted">Stacking compounds</span>
          {LAYERS.map((l) => (
            <div key={l.n} className="flex items-center gap-2.5">
              <span
                className="h-8 w-16 shrink-0 rounded-md border"
                style={{ backgroundColor: l.hex }}
              />
              <span className="font-mono text-[0.65rem] text-fg-muted tabular-nums">
                {l.n} layer{l.n > 1 ? 's' : ''} ·{' '}
                {(l.effective * 100).toFixed(1)}% · {l.hex} ·{' '}
                {wcagContrast(l.hex, '#ffffff').toFixed(2)}:1 vs white
              </span>
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-1.5">
          <span className="text-xs text-fg-muted">Text on alpha</span>
          <div className="flex flex-col gap-1.5">
            <div
              className="rounded-md px-3 py-2 text-xs font-medium"
              style={{ backgroundColor: OVER_WHITE, color: TEXT }}
            >
              slate 11 · {wcagContrast(TEXT, OVER_WHITE).toFixed(2)}:1 over
              white
            </div>
            <div
              className="rounded-md px-3 py-2 text-xs font-medium"
              style={{ backgroundColor: OVER_BLUE9, color: TEXT }}
            >
              slate 11 · {wcagContrast(TEXT, OVER_BLUE9).toFixed(2)}:1 over blue
              9
            </div>
          </div>
        </div>
      </div>
    </Demo>
  )
}
