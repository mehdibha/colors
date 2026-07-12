import { clampChroma, converter } from 'culori'

import { Demo } from '@/components/demo'

import { makeScale, solveWcag } from './leonardo-mini'

const toOklch = converter('oklch')

const KEY = '#ffe100'
const BG = '#f8f8f8'
const SOLVED = solveWcag(makeScale([KEY]), BG, 4.5)

function okLabel(hex: string): { l: number; c: number; h: number } {
  const ok = toOklch(hex)
  return { l: ok?.l ?? 0, c: ok?.c ?? 0, h: ok?.h ?? 0 }
}

const keyOk = okLabel(KEY)
const solvedOk = okLabel(SOLVED.hex)
const ceiling = clampChroma(
  { mode: 'oklch', l: solvedOk.l, c: 0.5, h: solvedOk.h },
  'oklch',
).c

export function DeadSpotReceipt() {
  const swatches = [
    { title: 'key color, the art', hex: KEY, ok: keyOk },
    {
      title: `solved at 4.5:1 (${SOLVED.measured.toFixed(2)} measured)`,
      hex: SOLVED.hex,
      ok: solvedOk,
    },
  ]
  return (
    <Demo
      caption={
        <>
          A vivid yellow key color, and what the solver returns when asked for
          4.5:1 against near-white. The solved swatch sits at{' '}
          {((solvedOk.c / ceiling) * 100).toFixed(0)}% of the sRGB chroma
          ceiling at its own lightness and hue — the solver spent everything the
          gamut had. The dead spot isn't a bug in the search; it's chapter 6's
          tent: at the lightness the ratio demands, this hue has no chroma left
          to give.
        </>
      }
    >
      <div className="grid gap-3 sm:grid-cols-2">
        {swatches.map(({ title, hex, ok }) => (
          <div key={hex} className="flex flex-col gap-2">
            <span className="font-mono text-[0.65rem] text-fg-muted">
              {title}
            </span>
            <div
              className="h-16 rounded-lg border"
              style={{ backgroundColor: hex }}
            />
            <span className="font-mono text-xs text-fg-muted tabular-nums">
              {hex} · oklch({ok.l.toFixed(3)} {ok.c.toFixed(3)}{' '}
              {ok.h.toFixed(1)})
            </span>
          </div>
        ))}
      </div>
    </Demo>
  )
}
