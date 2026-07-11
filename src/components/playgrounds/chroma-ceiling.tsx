import { clampChroma, converter, formatHex } from 'culori'

import { Demo } from '@/components/demo'

const toOklch = converter('oklch')

const L = 0.65
const HUES = [25, 75, 110, 160, 250, 320]

// Max in-gamut chroma at L 0.65 for each hue — the tent's ceiling varies by hue (ch6).
const ceilingC = (h: number): number =>
  clampChroma({ mode: 'oklch', l: L, c: 0.4, h }, 'oklch').c ?? 0

const ceilings = HUES.map(ceilingC)
const shared = Math.min(...ceilings)
const weakestHue = HUES[ceilings.indexOf(shared)] ?? 0

const ownMax = HUES.map((h) =>
  formatHex(clampChroma({ mode: 'oklch', l: L, c: 0.4, h }, 'oklch')),
)
const capped = HUES.map((h) => formatHex({ mode: 'oklch', l: L, c: shared, h }))

function Swatch({ hex, weak }: { hex: string; weak: boolean }) {
  return (
    <div className="flex flex-1 flex-col items-center gap-1">
      <div
        className="h-9 w-full rounded-sm border"
        style={{ backgroundColor: hex }}
      />
      <span
        className={`font-mono text-[0.55rem] tabular-nums ${weak ? 'text-fg-warning' : 'text-fg-muted'}`}
      >
        {(toOklch(hex)?.c ?? 0).toFixed(3)}
      </span>
    </div>
  )
}

export function ChromaCeiling() {
  return (
    <Demo
      caption={
        <>
          Same lightness (L {L}), six hues. Top row: each hue at its own gamut
          ceiling &mdash; the chroma number under each swatch. They are not
          equal: at this lightness a blue reaches far past a yellow. An{' '}
          <em>equal</em>-chroma categorical set can only be as saturated as its
          weakest hue, so the bottom row caps every hue at the minimum ceiling
          (C {shared.toFixed(3)}, set by the ~{weakestHue}&deg; yellow). The
          tent&rsquo;s tightest corner votes for the whole ring &mdash;
          colorful, never neon.
        </>
      }
    >
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <span className="text-[0.7rem] font-medium">
            Each hue at its own ceiling
          </span>
          <div className="flex gap-1.5">
            {ownMax.map((hex, i) => (
              <Swatch key={i} hex={hex} weak={(ceilings[i] ?? 0) === shared} />
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[0.7rem] font-medium">
            Equal-chroma set — capped at the weakest hue
          </span>
          <div className="flex gap-1.5">
            {capped.map((hex, i) => (
              <Swatch key={i} hex={hex} weak={(ceilings[i] ?? 0) === shared} />
            ))}
          </div>
        </div>
        <span
          aria-live="polite"
          className="font-mono text-[0.65rem] text-fg-muted tabular-nums"
        >
          ceiling spread {Math.min(...ceilings).toFixed(3)}–
          {Math.max(...ceilings).toFixed(3)} · the ~{weakestHue}° hue caps the
          equal set at C {shared.toFixed(3)}
        </span>
      </div>
    </Demo>
  )
}
