import { wcagContrast } from 'culori'

import { apcaLc } from '@/lib/apca'
import { Demo } from '@/components/demo'

const FG = '#767676'
const BG = '#ffffff'

const RATIO = wcagContrast(FG, BG)
const LC = apcaLc(FG, BG)

const ROWS = [
  { size: 12, weight: 400 },
  { size: 15, weight: 400 },
  { size: 18, weight: 400 },
  { size: 24, weight: 700 },
  { size: 32, weight: 800 },
]

export function SamePairFiveFonts() {
  return (
    <Demo
      caption={
        <>
          One pair, one WCAG score, one APCA score — five different reading
          experiences. WCAG's model of typography is a single cliff: below 18pt
          (14pt bold), 4.5:1; above it, 3:1. APCA prices every row separately
          through a size-and-weight lookup table: Lc 71.6 comfortably buys the
          bottom rows and doesn't quite cover 18px body text, which asks for Lc
          75.
        </>
      }
    >
      <div className="flex items-baseline justify-between gap-3">
        <span className="font-mono text-[0.7rem] tracking-wider text-fg-muted uppercase">
          {FG} on {BG}
        </span>
        <span className="font-mono text-[0.7rem] text-fg-muted tabular-nums">
          WCAG {RATIO.toFixed(2)}:1 · APCA Lc {LC.toFixed(1)}
        </span>
      </div>
      <div
        className="mt-1.5 flex flex-col gap-2.5 rounded-lg border p-5"
        style={{ backgroundColor: BG }}
      >
        {ROWS.map((row) => (
          <div key={row.size} className="flex items-baseline gap-4">
            <span
              className="min-w-0 flex-1 truncate"
              style={{
                color: FG,
                fontSize: row.size,
                fontWeight: row.weight,
                lineHeight: 1.3,
              }}
            >
              The five boxing wizards jump quickly
            </span>
            <span
              className="shrink-0 font-mono text-[0.65rem] tabular-nums"
              style={{ color: '#a3a3a3' }}
            >
              {row.size}px / {row.weight}
            </span>
          </div>
        ))}
      </div>
    </Demo>
  )
}
