import { useState } from 'react'
import { wcagContrast } from 'culori'

import { apcaLc } from '@/lib/apca'
import { Demo } from '@/components/demo'
import { ToggleButton } from '@/ui/toggle-button'
import { ToggleButtonGroup } from '@/ui/toggle-button-group'

const PAIRS = [
  { label: 'Black on yellow', fg: '#000000', bg: '#facc15' },
  { label: 'Slate on off-white', fg: '#475569', bg: '#f8fafc' },
  { label: 'Black on orange', fg: '#000000', bg: '#ff6600' },
  { label: 'Gray on black', fg: '#888888', bg: '#000000' },
  { label: 'White on indigo', fg: '#ffffff', bg: '#6366f1' },
  { label: 'White on orange', fg: '#ffffff', bg: '#ff6600' },
].map((p) => ({
  ...p,
  ratio: wcagContrast(p.fg, p.bg),
  lc: apcaLc(p.fg, p.bg),
}))

const byWcag = [...PAIRS].sort((a, b) => b.ratio - a.ratio)
const byApca = [...PAIRS].sort((a, b) => Math.abs(b.lc) - Math.abs(a.lc))

const MAX_RATIO = Math.max(...PAIRS.map((p) => p.ratio))
const MAX_LC = Math.max(...PAIRS.map((p) => Math.abs(p.lc)))

type Judge = 'wcag' | 'apca'

export function LineThemUp() {
  const [judge, setJudge] = useState<Judge>('wcag')

  const order = judge === 'wcag' ? byWcag : byApca
  const other = judge === 'wcag' ? byApca : byWcag

  return (
    <Demo
      caption={
        <>
          Six pairs, two referees. Flip the judge and watch the field reshuffle
          — white-on-orange climbs from dead last to fourth, black-on-orange
          drops from third to fifth, and gray-on-black falls to the floor. These
          aren't cherry-picked knife-edge cases: the two models disagree about{' '}
          <em>order</em>, not just where to draw the passing line.
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs text-fg-muted">Rank by</span>
          <ToggleButtonGroup
            selectionMode="single"
            disallowEmptySelection
            selectedKeys={[judge]}
            onSelectionChange={(keys) => setJudge([...keys][0] as Judge)}
            size="sm"
            aria-label="Ranking metric"
          >
            <ToggleButton id="wcag">WCAG 2</ToggleButton>
            <ToggleButton id="apca">APCA</ToggleButton>
          </ToggleButtonGroup>
        </div>

        <div className="flex flex-col gap-2">
          {order.map((pair, i) => {
            const otherRank = other.indexOf(pair)
            const delta = otherRank - i
            const width =
              judge === 'wcag'
                ? (pair.ratio / MAX_RATIO) * 100
                : (Math.abs(pair.lc) / MAX_LC) * 100
            return (
              <div key={pair.label} className="flex items-center gap-3">
                <span className="w-4 shrink-0 text-right font-mono text-xs text-fg-muted tabular-nums">
                  {i + 1}
                </span>
                <span
                  className="w-10 shrink-0 rounded-md border py-1 text-center text-sm font-medium"
                  style={{ backgroundColor: pair.bg, color: pair.fg }}
                >
                  Aa
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="truncate text-xs">{pair.label}</span>
                    <span className="shrink-0 font-mono text-[0.7rem] text-fg-muted tabular-nums">
                      <span className={judge === 'wcag' ? 'text-fg' : ''}>
                        {pair.ratio.toFixed(2)}:1
                      </span>
                      {' · '}
                      <span className={judge === 'apca' ? 'text-fg' : ''}>
                        Lc {pair.lc.toFixed(1)}
                      </span>
                    </span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full border">
                    <div
                      className="h-full bg-fg/70"
                      style={{ width: `${width}%` }}
                    />
                  </div>
                </div>
                <span className="w-12 shrink-0 text-right font-mono text-[0.65rem] text-fg-muted tabular-nums">
                  {delta === 0 ? '=' : delta > 0 ? `↓${delta}` : `↑${-delta}`}{' '}
                  other
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </Demo>
  )
}
