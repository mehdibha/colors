import { useState } from 'react'
import { wcagContrast } from 'culori'

import { apcaLc } from '@/lib/apca'
import { cn } from '@/lib/utils'
import { Playground } from '@/components/playground'
import { ToggleButton } from '@/ui/toggle-button'
import { ToggleButtonGroup } from '@/ui/toggle-button-group'

type Lens = 'all' | 'steal' | 'fix'
type Status = 'steal' | 'core' | 'fix'

interface Row {
  ch: string
  decision: string
  geist: string
  dotui: string
  status: Status
  swatches?: string[]
}

// Verdicts across the course, read through Geist (designed) vs the dotUI engine
// (generated). Swatch hexes are verified Geist light-theme values.
const ROWS: Row[] = [
  {
    ch: '5',
    decision: 'Working space',
    geist: 'Authors in OKLCH; ships an oklch() twin for P3.',
    dotui: 'Computes every ramp in OKLCH — same space.',
    status: 'steal',
  },
  {
    ch: '6',
    decision: 'Gamut & P3',
    geist: 'sRGB hex baseline, Display-P3 via oklch(), gated by capability.',
    dotui: 'Gamut-maps with clampChroma. No P3 variant shipped — a gap.',
    status: 'fix',
    swatches: ['#006bff'],
  },
  {
    ch: '8 · 17',
    decision: 'Contrast & pairing',
    geist: 'High-contrast by hand; blue-700 wins on both meters.',
    dotui: 'Pairing scored max-WCAG only; APCA ignored. Name both meters.',
    status: 'fix',
    swatches: ['#006bff', '#ffffff'],
  },
  {
    ch: '10',
    decision: 'Steps are jobs',
    geist: '10 steps, 100–1000, each a job.',
    dotui: '11-step job scale (50–950) — same contract, more rungs.',
    status: 'steal',
  },
  {
    ch: '11',
    decision: 'Lightness curve',
    geist: 'Hand-tuned per scale; non-monotone by design.',
    dotui: 'Fixed lightness anchors.',
    status: 'steal',
  },
  {
    ch: '12',
    decision: 'Chroma curve',
    geist: 'Hand-drawn under the tent; restrained, never neon.',
    dotui: 'Chroma envelope, clamped to gamut.',
    status: 'steal',
  },
  {
    ch: '13',
    decision: 'Hue along the ramp',
    geist: 'Hue drifts by hand — blue 251° → 258° → 254°, dips to 245°.',
    dotui: 'Per-family bend term; otherwise constant hue.',
    status: 'steal',
  },
  {
    ch: '14',
    decision: 'Seed policy',
    geist: 'No seed. One brand, hand-authored, frozen.',
    dotui: 'Any seed in, full system out. The whole product.',
    status: 'core',
  },
  {
    ch: '15',
    decision: 'Neutrals',
    geist: 'Near-pure neutral grays; #171717 ink; restraint by default.',
    dotui: 'Tint budget below C 0.02.',
    status: 'steal',
    swatches: ['#f2f2f2', '#171717'],
  },
  {
    ch: '16',
    decision: 'Dark mode',
    geist: 'Separate hand-designed dark (design.dark.md), same names.',
    dotui:
      'Reverses the light list — an un-designed flip. Owe a second design.',
    status: 'fix',
  },
  {
    ch: '17',
    decision: 'Token tiers',
    geist: 'Job scale consumed by semantic usage.',
    dotui: 'Three tiers, 83 tokens, property × role × state.',
    status: 'steal',
  },
  {
    ch: '18',
    decision: 'States & alpha',
    geist: 'States step up the scale; gray-alpha companion for overlays.',
    dotui: 'States as -hover suffixes; alpha companion still owed.',
    status: 'fix',
  },
  {
    ch: '20',
    decision: 'Shipping',
    geist: 'sRGB hex + P3 oklch, light + dark, machine-readable.',
    dotui: 'CSS custom-property tiers.',
    status: 'steal',
  },
]

const DOT: Record<Status, string> = {
  steal: 'bg-fg-success',
  core: 'bg-fg',
  fix: 'bg-fg-warning',
}
const LABEL: Record<Status, string> = {
  steal: 'steal',
  core: 'core',
  fix: 'fix',
}

function visible(rows: Row[], lens: Lens): Row[] {
  if (lens === 'all') return rows
  if (lens === 'fix') return rows.filter((r) => r.status === 'fix')
  return rows.filter((r) => r.status === 'steal' || r.status === 'core')
}

const SOLID = '#006bff' // Geist blue-700

export function EngineScorecard() {
  const [lens, setLens] = useState<Lens>('all')

  const rows = visible(ROWS, lens)
  const stealCount = ROWS.filter((r) => r.status === 'steal').length
  const fixCount = ROWS.filter((r) => r.status === 'fix').length

  const wW = wcagContrast('#ffffff', SOLID)
  const wB = wcagContrast('#000000', SOLID)
  const aW = apcaLc('#ffffff', SOLID)
  const aB = apcaLc('#000000', SOLID)

  return (
    <Playground
      question="Geist is one brand's hand-tuned destination — what does a seed-driven engine steal from it, and what can it never copy?"
      onReset={() => setLens('all')}
    >
      <div className="flex flex-col gap-5">
        <div className="flex flex-wrap items-center gap-3 rounded-lg border bg-muted/40 p-3">
          <span
            className="rounded-md px-3 py-1.5 text-xs font-medium"
            style={{ backgroundColor: SOLID, color: '#ffffff' }}
          >
            Deploy
          </span>
          <span
            aria-live="polite"
            className="font-mono text-[0.65rem] text-fg-muted tabular-nums"
          >
            blue-700 {SOLID} + white — WCAG white {wW.toFixed(2)}:1 / black{' '}
            {wB.toFixed(2)}:1 · APCA white Lc {aW.toFixed(0)} / black{' '}
            {aB.toFixed(0)} → both pick white
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <ToggleButtonGroup
            selectionMode="single"
            disallowEmptySelection
            selectedKeys={[lens]}
            onSelectionChange={(keys) => {
              const next = [...keys][0]
              if (next === 'all' || next === 'steal' || next === 'fix')
                setLens(next)
            }}
            size="sm"
            aria-label="Scorecard lens"
            className="max-w-full overflow-x-auto"
          >
            <ToggleButton id="all">Everything</ToggleButton>
            <ToggleButton id="steal">Steal</ToggleButton>
            <ToggleButton id="fix">Fix</ToggleButton>
          </ToggleButtonGroup>
          <span
            aria-live="polite"
            className="font-mono text-[0.65rem] text-fg-muted tabular-nums"
          >
            {stealCount} to steal · {fixCount} to fix · 1 irreducible
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-2xl text-left text-xs">
            <thead>
              <tr className="font-mono text-[0.6rem] text-fg-muted uppercase">
                <th className="py-1.5 pr-3 font-normal">decision</th>
                <th className="py-1.5 pr-3 font-normal">Geist — designed</th>
                <th className="py-1.5 font-normal">dotUI — generated</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr
                  key={`${r.ch}-${r.decision}`}
                  className="border-t align-top"
                >
                  <td className="py-2 pr-3">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={cn(
                          'inline-block size-2 rounded-full',
                          DOT[r.status],
                        )}
                        aria-hidden
                      />
                      <span className="font-medium text-fg">{r.decision}</span>
                    </div>
                    <span className="font-mono text-[0.6rem] text-fg-muted tabular-nums">
                      ch{r.ch} · {LABEL[r.status]}
                    </span>
                  </td>
                  <td className="py-2 pr-3 text-fg-muted">
                    <span>{r.geist}</span>
                    {r.swatches && (
                      <span className="mt-1 flex gap-1">
                        {r.swatches.map((s) => (
                          <span
                            key={s}
                            className="inline-block size-3 rounded-xs border"
                            style={{ backgroundColor: s }}
                          />
                        ))}
                      </span>
                    )}
                  </td>
                  <td
                    className={cn(
                      'py-2',
                      r.status === 'fix' ? 'text-fg-warning' : 'text-fg-muted',
                    )}
                  >
                    {r.dotui}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p aria-live="polite" className="text-sm text-fg-muted">
          {lens === 'fix' ? (
            <>
              The punch list. Every row here is dotUI diverging from the
              destination it&rsquo;s aiming at — clear them and the
              engine&rsquo;s output holds Geist&rsquo;s bar.
            </>
          ) : lens === 'steal' ? (
            <>
              What Geist proves works as a shipped artifact — the engine&rsquo;s
              job is to embody these as a function, not to reinvent them. The
              one <span className="font-mono">core</span> row is the difference
              in kind: Geist has no seed, dotUI is nothing but one.
            </>
          ) : (
            <>
              Read top to bottom, this is the rewrite spec in miniature — steal
              the green rows as invariants, clear the amber rows as tasks, hold
              the one neutral row as the reason dotUI is a road and Geist a
              destination.
            </>
          )}
        </p>
      </div>
    </Playground>
  )
}
