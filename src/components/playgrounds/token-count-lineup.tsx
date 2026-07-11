import { Demo } from '@/components/demo'

// Counts verified against each system's source (July 2026): shadcn theming docs
// :root block; MaterialDynamicColors in material-color-utilities; dotUI theme.css.
const SYSTEMS = [
  {
    name: 'Radix Colors',
    count: 12,
    unit: 'primitives per scale',
    note: 'no shipped semantic tier — aliasing is documented homework',
  },
  {
    name: 'shadcn/ui',
    count: 18,
    unit: 'core tokens',
    note: '31 with chart and sidebar tokens',
  },
  {
    name: 'Material 3',
    count: 53,
    unit: 'color roles',
    note: 'plus 6 palette key colors, in the reference implementation',
  },
  {
    name: 'dotUI',
    count: 83,
    unit: 'semantic tokens',
    note: '77 semantic + 6 component-tier',
  },
]

const MAX = 83

export function TokenCountLineup() {
  return (
    <Demo
      caption={
        <>
          Four shipped answers to &ldquo;how many names.&rdquo; The numbers
          aren&rsquo;t comparable one-to-one &mdash; Radix counts primitives and
          leaves the semantic tier to you; the other three count the public API.
          The pattern that is comparable: every system&rsquo;s core &mdash; the
          tokens a component author reaches for daily &mdash; converges near
          twenty.
        </>
      }
    >
      <div className="flex flex-col gap-3">
        {SYSTEMS.map((s) => (
          <div key={s.name} className="flex flex-col gap-1">
            <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
              <span className="text-xs font-medium">{s.name}</span>
              <span className="font-mono text-[0.65rem] text-fg-muted tabular-nums">
                {s.count} {s.unit}
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${(s.count / MAX) * 100}%` }}
              />
            </div>
            <span className="text-[0.7rem] text-fg-muted">{s.note}</span>
          </div>
        ))}
      </div>
    </Demo>
  )
}
