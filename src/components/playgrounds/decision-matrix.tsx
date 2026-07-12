import { useState } from 'react'
import { CheckIcon } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Demo } from '@/components/demo'

interface Row {
  id: string
  decision: string
  chapters: { n: number; slug: string }[]
  leading: string
}

const ROWS: Row[] = [
  {
    id: 'jobs',
    decision: 'Steps & jobs',
    chapters: [
      { n: 10, slug: 'anatomy-of-a-scale' },
      { n: 21, slug: 'radix-colors' },
    ],
    leading:
      'Twelve job slots with written contracts — named backgrounds, both meters, re-checked in CI on every generated scale.',
  },
  {
    id: 'lightness',
    decision: 'Lightness skeleton',
    chapters: [
      { n: 11, slug: 'lightness-curves' },
      { n: 22, slug: 'tailwind' },
      { n: 24, slug: 'spectrum-leonardo' },
    ],
    leading:
      'The ch24 hybrid: anchored skeleton for surface and component steps; text steps and every fg-on-* solved per mode at build time.',
  },
  {
    id: 'chroma',
    decision: 'Chroma curve',
    chapters: [
      { n: 12, slug: 'chroma-curves' },
      { n: 23, slug: 'material-hct' },
    ],
    leading:
      'Per-hue smooth fit under the sRGB tent, peak tracking the cusp; P3 is a second guarded pass, never the working ceiling.',
  },
  {
    id: 'hue',
    decision: 'Hue along the ramp',
    chapters: [{ n: 13, slug: 'hue-along-the-ramp' }],
    leading:
      'Flat by default; per-family bend defaults keyed to L (yellow toward gold), exposed as one scaling axis.',
  },
  {
    id: 'seed',
    decision: 'Seed policy',
    chapters: [{ n: 14, slug: 'seed-to-scale' }],
    leading:
      'Gamut-map at the door, classify accent vs neutral, slot nearest-by-L, snap by default — verbatim is a switch that prints its price.',
  },
  {
    id: 'neutrals',
    decision: 'Neutrals',
    chapters: [{ n: 15, slug: 'neutrals' }],
    leading:
      'Auto-tint from the accent hue at whisper chroma; two user axes (amount, hue); pure gray stays legitimate.',
  },
  {
    id: 'dark',
    decision: 'Dark mode',
    chapters: [
      { n: 16, slug: 'dark-mode' },
      { n: 24, slug: 'spectrum-leonardo' },
    ],
    leading:
      'A second generation pass with its own curve parameters and an elevation policy — never an arithmetic flip of light.',
  },
  {
    id: 'tokens',
    decision: 'Token grammar',
    chapters: [{ n: 17, slug: 'semantic-tokens' }],
    leading:
      'Three tiers; property × role × prominence × state names; every background token owes its foreground a dual-meter partner.',
  },
  {
    id: 'states',
    decision: 'States, alpha, status',
    chapters: [{ n: 18, slug: 'states-alpha-status' }],
    leading:
      'Designed state jobs per mode with a signed computed fallback; alpha twins solved against each mode’s page; status = four seeds through the full pipeline plus a CVD gate.',
  },
  {
    id: 'viz',
    decision: 'Data-viz palettes',
    chapters: [{ n: 19, slug: 'data-viz-palettes' }],
    leading:
      'Categorical, sequential, and diverging generated from the same seeds; separation, monotonicity, and anchor meters run as CI.',
  },
  {
    id: 'css',
    decision: 'The CSS contract',
    chapters: [{ n: 20, slug: 'shipping-color' }],
    leading:
      'Two tiers, two files; only pre-verified values are emitted; P3 behind a gamut guard; runtime color math is distribution, not design.',
  },
]

export function DecisionMatrix() {
  const [done, setDone] = useState<Set<string>>(new Set())

  const toggle = (id: string) => {
    setDone((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <Demo
      caption={
        <>
          Every row is one decision the rewritten engine has to make, the
          chapters that argued it, and the option this course landed on. Check a
          row when you could defend that call to someone who read the same
          chapters and disagrees.{' '}
          <span aria-live="polite" className="font-medium">
            {done.size} of {ROWS.length}
          </span>{' '}
          — at eleven, stop reading and start writing the spec.
        </>
      }
    >
      <div className="flex flex-col divide-y">
        {ROWS.map((row) => {
          const checked = done.has(row.id)
          return (
            <div key={row.id} className="flex items-start gap-3 py-2.5">
              <button
                type="button"
                role="checkbox"
                aria-checked={checked}
                aria-label={`I can defend: ${row.decision}`}
                onClick={() => toggle(row.id)}
                className={cn(
                  'mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-sm border',
                  checked
                    ? 'border-fg bg-fg text-bg'
                    : 'bg-transparent text-transparent',
                )}
              >
                <CheckIcon className="size-3" />
              </button>
              <div className="flex min-w-0 flex-col gap-0.5">
                <span className="flex flex-wrap items-baseline gap-x-2 text-sm">
                  <span
                    className={cn(
                      'font-medium',
                      checked && 'text-fg-muted line-through',
                    )}
                  >
                    {row.decision}
                  </span>
                  <span className="font-mono text-[0.65rem] text-fg-muted">
                    {row.chapters.map((c, i) => (
                      <span key={c.slug + c.n}>
                        {i > 0 && ' · '}
                        <a href={`/${c.slug}`} className="underline">
                          ch{c.n}
                        </a>
                      </span>
                    ))}
                  </span>
                </span>
                <span className="text-xs text-fg-muted">{row.leading}</span>
              </div>
            </div>
          )
        })}
      </div>
    </Demo>
  )
}
