import { useState } from 'react'
import {
  converter,
  differenceEuclidean,
  filterDeficiencyDeuter,
  filterDeficiencyProt,
  filterDeficiencyTrit,
  formatHex,
} from 'culori'
import type { Rgb } from 'culori'

import { Demo } from '@/components/demo'
import { ToggleButton } from '@/ui/toggle-button'
import { ToggleButtonGroup } from '@/ui/toggle-button-group'

const toRgb = converter('rgb')
const dEok = differenceEuclidean('oklab')

// The five shipped tokens, verbatim from styles.css.
const TOKENS = [
  { name: '--chart-1', alias: 'accent', css: 'oklch(0.6478 0.1337 251.06)' },
  { name: '--chart-2', alias: 'success', css: 'oklch(0.6512 0.1869 148.33)' },
  { name: '--chart-3', alias: 'warning', css: 'oklch(0.6497 0.1338 82.26)' },
  { name: '--chart-4', alias: 'danger', css: 'oklch(0.6478 0.2078 25.33)' },
  { name: '--chart-5', alias: 'info', css: 'oklch(0.6478 0.188 259.81)' },
].map((t) => {
  const rgb = toRgb(t.css)
  if (!rgb) throw new Error('bad chart token')
  return { ...t, rgb }
})

type Sim = 'none' | 'deutan' | 'protan' | 'tritan'

const FILTERS: Record<Sim, (c: Rgb) => Rgb> = {
  none: (c) => c,
  deutan: filterDeficiencyDeuter(1),
  protan: filterDeficiencyProt(1),
  tritan: filterDeficiencyTrit(1),
}

export function ChartTokensToday() {
  const [sim, setSim] = useState<Sim>('none')
  const filter = FILTERS[sim]

  let worst = { de: Infinity, a: 0, b: 0 }
  for (let i = 0; i < TOKENS.length; i++)
    for (let j = i + 1; j < TOKENS.length; j++) {
      const a = TOKENS[i]
      const b = TOKENS[j]
      if (!a || !b) continue
      const de = dEok(filter(a.rgb), filter(b.rgb))
      if (de < worst.de) worst = { de, a: i, b: j }
    }
  const wa = TOKENS[worst.a]
  const wb = TOKENS[worst.b]

  return (
    <Demo
      caption={
        <>
          dotUI&rsquo;s five chart tokens, verbatim from the shipped theme. No
          filter needed: the worst pair under normal vision is already
          <code> --chart-1</code> versus <code>--chart-5</code> &mdash; two
          blues 8.75&deg; apart, &Delta;Eok 0.059, under chapter 9&rsquo;s
          merged bar. Switch to deutan and the failure moves: success versus
          danger at 0.009 &mdash; the two series that mean opposite things.
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-fg-muted">Simulate</span>
          <ToggleButtonGroup
            selectionMode="single"
            disallowEmptySelection
            selectedKeys={[sim]}
            onSelectionChange={(keys) => {
              const next = [...keys][0]
              if (
                next === 'none' ||
                next === 'deutan' ||
                next === 'protan' ||
                next === 'tritan'
              )
                setSim(next)
            }}
            size="sm"
            aria-label="Color vision deficiency"
            className="max-w-full overflow-x-auto"
          >
            <ToggleButton id="none">Normal</ToggleButton>
            <ToggleButton id="deutan">Deutan</ToggleButton>
            <ToggleButton id="protan">Protan</ToggleButton>
            <ToggleButton id="tritan">Tritan</ToggleButton>
          </ToggleButtonGroup>
        </div>

        <div className="flex gap-2">
          {TOKENS.map((t, i) => {
            const flagged = i === worst.a || i === worst.b
            return (
              <div
                key={t.name}
                className="flex min-w-0 flex-1 flex-col items-center gap-1.5"
              >
                <div
                  className={`h-14 w-full rounded-md ${
                    flagged
                      ? 'ring-2 ring-danger ring-offset-2 ring-offset-card'
                      : ''
                  }`}
                  style={{
                    backgroundColor: formatHex(filter(t.rgb)) ?? '#000000',
                  }}
                />
                <span className="truncate font-mono text-[0.6rem] text-fg-muted">
                  {t.name}
                </span>
                <span className="truncate text-[0.6rem] text-fg-muted">
                  {t.alias}-500
                </span>
              </div>
            )
          })}
        </div>

        <p
          aria-live="polite"
          className="font-mono text-[0.65rem] text-fg-muted tabular-nums"
        >
          worst pair {wa?.alias} vs {wb?.alias}: ΔEok {worst.de.toFixed(3)}{' '}
          under {sim === 'none' ? 'normal vision' : sim} —{' '}
          {worst.de < 0.06 ? 'merged' : worst.de < 0.12 ? 'risky' : 'distinct'}
        </p>
      </div>
    </Demo>
  )
}
