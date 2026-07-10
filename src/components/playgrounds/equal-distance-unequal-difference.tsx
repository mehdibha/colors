import { differenceCiede2000 } from 'culori'

import { Demo } from '@/components/demo'

const de2000 = differenceCiede2000()

// both pairs are exactly 70 apart in sRGB coordinates — one channel, +70
const PAIRS = [
  { verdict: 'near twins', a: 'rgb(0 200 0)', b: 'rgb(70 200 0)' },
  { verdict: 'different colors', a: 'rgb(255 150 0)', b: 'rgb(255 220 0)' },
].map((pair) => ({
  ...pair,
  colors: [pair.a, pair.b],
  de: de2000(pair.a, pair.b).toFixed(1),
}))

export function EqualDistanceUnequalDifference() {
  return (
    <Demo
      caption={
        <>
          Two pairs, and each pair is exactly the same distance apart in sRGB —
          one channel moved by 70. The green pair reads as one color; the orange
          pair crosses a category boundary. Measured with ΔE2000, the industry's
          perceived-difference formula, the second gap is ten times the first.
          Equal numbers, unequal difference: sRGB distance measures the cube,
          not you.
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        {PAIRS.map((pair) => (
          <div key={pair.verdict} className="flex flex-col gap-2">
            <span className="font-mono text-[0.7rem] tracking-wider text-fg-muted uppercase">
              distance 70 — {pair.verdict}
            </span>
            <div className="flex h-16 overflow-hidden rounded-lg border">
              {pair.colors.map((css) => (
                <div
                  key={css}
                  className="flex-1"
                  style={{ backgroundColor: css }}
                />
              ))}
            </div>
            <div className="flex font-mono text-[0.7rem] text-fg-muted">
              {pair.colors.map((css) => (
                <span key={css} className="flex-1 text-center tabular-nums">
                  {css}
                </span>
              ))}
            </div>
            <span className="text-center font-mono text-[0.7rem] text-fg-muted tabular-nums">
              ΔE2000 = {pair.de}
            </span>
          </div>
        ))}
      </div>
    </Demo>
  )
}
