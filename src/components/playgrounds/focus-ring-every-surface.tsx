import { converter, formatHex, wcagContrast } from 'culori'

import { Demo } from '@/components/demo'

const toRgb = converter('rgb')

function over(fg: string, bg: string, a: number): string {
  const f = toRgb(fg)
  const b = toRgb(bg)
  if (!f || !b) return bg
  return (
    formatHex({
      mode: 'rgb',
      r: f.r * a + b.r * (1 - a),
      g: f.g * a + b.g * (1 - a),
      b: f.b * a + b.b * (1 - a),
    }) ?? bg
  )
}

// dotUI: --color-border-focus = accent-500 (#4992dd); the focus-ring utility is
// ring-2 + ring-offset-2. WCAG 1.4.11 asks a focus indicator for 3:1 vs adjacent.
const RING = '#4992dd'

const SURFACES = [
  { name: 'card', value: '#f6f5f1' }, // neutral-100
  { name: 'accent panel', value: '#b0dcff' }, // accent-200
  { name: 'danger soft', value: '#ffdcd7' }, // danger-100
  { name: 'inverse', value: '#090807' }, // neutral-950
]

export function FocusRingEverySurface() {
  const rows = SURFACES.map((s) => ({
    ...s,
    ratio: wcagContrast(RING, s.value),
  }))
  const misses = rows.filter((r) => r.ratio < 3).length

  return (
    <Demo
      caption={
        <>
          One focus token, four surfaces. The ring is{' '}
          <span className="font-mono">border-focus</span> — accent-500 ({RING})
          at 2px with a 2px offset — a dedicated token, not a step borrowed from
          the component&rsquo;s own ramp, because it has to stay visible on{' '}
          <em>every</em> surface at once. WCAG 1.4.11 wants a focus indicator at
          3:1 against the adjacent color. Measured, the shipped accent-500 ring{' '}
          <strong className="text-fg">misses on {misses} of 4 surfaces</strong>{' '}
          — it grazes 2.99:1 on the card and dips to 2.26:1 on the blue panel.
          The offset gap is a real shape cue (chapter 9), but it does not raise
          the ratio against the adjacent color. The honest engine fix: pick the
          focus token to clear 3:1 on the surfaces it lands on, or ship a
          two-tone ring so one edge always passes.
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {rows.map((s) => {
            const offset = over('#ffffff', s.value, 0.9)
            return (
              <div
                key={s.name}
                className="flex flex-col items-center gap-2 rounded-md border p-3"
                style={{ backgroundColor: s.value }}
              >
                <span
                  className="rounded-md px-3 py-1.5 text-xs font-medium"
                  style={{
                    backgroundColor: RING,
                    color: '#ffffff',
                    boxShadow: `0 0 0 2px ${offset}, 0 0 0 4px ${RING}`,
                  }}
                >
                  Focused
                </span>
                <span
                  className={`font-mono text-[0.6rem] tabular-nums ${
                    s.ratio >= 3 ? 'text-fg-success' : 'text-fg-danger'
                  }`}
                >
                  {s.ratio.toFixed(2)}:1 {s.ratio >= 3 ? '✓' : '✕'}
                </span>
              </div>
            )
          })}
        </div>
        <span
          aria-live="polite"
          className="font-mono text-[0.65rem] text-fg-muted tabular-nums"
        >
          ring vs adjacent surface — WCAG 1.4.11 floor is 3:1
        </span>
      </div>
    </Demo>
  )
}
