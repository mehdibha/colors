import { converter, formatHex } from 'culori'

import { Demo } from '@/components/demo'

const toOklch = converter('oklch')

// Tailwind v4 default theme, step 500 across five families (theme.css, verbatim oklch).
const FIVES = [
  { name: 'blue-500', str: 'oklch(62.3% 0.214 259.815)' },
  { name: 'red-500', str: 'oklch(63.7% 0.237 25.331)' },
  { name: 'sky-500', str: 'oklch(68.5% 0.169 237.323)' },
  { name: 'green-500', str: 'oklch(72.3% 0.219 149.579)' },
  { name: 'amber-500', str: 'oklch(76.9% 0.188 70.08)' },
]

const LO = 0.6
const HI = 0.8
const pct = (l: number) => Math.max(0, Math.min(1, (l - LO) / (HI - LO))) * 100

export function TailwindCrossHueLightness() {
  const rows = FIVES.map((f) => {
    const c = toOklch(f.str)
    return { ...f, l: c?.l ?? 0, hex: formatHex(f.str) ?? '#000000' }
  })
  const ls = rows.map((r) => r.l)
  const spread = Math.max(...ls) - Math.min(...ls)
  const blueL = rows[0]?.l ?? 0.623

  return (
    <Demo
      caption={
        <>
          Every swatch is someone&rsquo;s step{' '}
          <span className="font-mono">500</span>, yet the lightnesses fan out
          across ΔL {spread.toFixed(3)}. The dashed line marks{' '}
          <span className="font-mono">blue-500</span>;{' '}
          <span className="font-mono">amber-500</span> rides 0.15 above it
          because the gamut tent (chapter 6) forbids a dark vivid amber, so it
          stays light to stay saturated &mdash; chapter 13&rsquo;s &ldquo;no
          dark vivid yellow,&rdquo; one hue over. v4 kept v3&rsquo;s per-hue
          balance (chapter 11), so the 500 row is a <em>same-as-v3</em> row, not
          an iso-lightness row: the number never promised one lightness per
          step, and it doesn&rsquo;t deliver one.
        </>
      }
    >
      <div className="flex flex-col gap-2.5">
        {rows.map((r) => (
          <div key={r.name} className="flex items-center gap-3">
            <span
              className="size-6 shrink-0 rounded-md border"
              style={{ backgroundColor: r.hex }}
            />
            <span className="w-20 shrink-0 font-mono text-[0.7rem] text-fg-muted tabular-nums">
              {r.name}
            </span>
            <div className="relative h-6 min-w-0 flex-1 rounded-md bg-muted/50">
              <span
                className="absolute top-0 bottom-0 w-px bg-fg/30"
                style={{ left: `${pct(blueL)}%` }}
              />
              <span
                className="absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border border-fg/40"
                style={{ left: `${pct(r.l)}%`, backgroundColor: r.hex }}
              />
            </div>
            <span className="w-14 shrink-0 text-right font-mono text-[0.7rem] text-fg-muted tabular-nums">
              L {r.l.toFixed(3)}
            </span>
          </div>
        ))}
      </div>
    </Demo>
  )
}
