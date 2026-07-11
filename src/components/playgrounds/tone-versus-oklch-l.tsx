import { converter, formatHex, wcagContrast } from 'culori'

import { Demo } from '@/components/demo'

const toLab = converter('lab')

// Tone is CIE L* (0-100). This chapter's engine substitutes OKLCH L (x100).
// Both are monotonic in luminance, so both rank contrast the same way — but
// they are different rulers, and this table is the size of the gap.
const oklchGray = (t: number) =>
  formatHex({ mode: 'oklch' as const, l: t / 100, c: 0, h: 0 })

const ROWS = [20, 30, 40, 50, 60, 70, 80]

export function ToneVersusOklchL() {
  const rows = ROWS.map((t) => {
    const hex = oklchGray(t)
    const lstar = toLab(hex)?.l ?? 0
    return { t, hex, lstar, over: t - lstar, w: wcagContrast(hex, '#ffffff') }
  })
  const maxOver = Math.max(...rows.map((r) => r.over))
  const l50 = rows.find((r) => r.t === 50)?.lstar ?? 42

  return (
    <Demo
      caption={
        <>
          OKLCH L runs above true Tone (L*) by up to {maxOver.toFixed(0)} points
          through the dark and mid range &mdash; an OKLCH-L 50 gray measures
          Tone {l50.toFixed(0)}, not 50. Both order contrast identically, so
          either works as the lever; they just number the axis differently. That
          is why Material&rsquo;s L*-based tone deltas cannot be pasted into an
          OKLCH-L engine as constants.
        </>
      }
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-sm text-left font-mono text-[0.65rem] tabular-nums">
          <thead>
            <tr className="text-fg-muted">
              <th className="py-1 pr-3 font-normal">swatch</th>
              <th className="py-1 pr-3 font-normal">OKLCH L &times;100</th>
              <th className="py-1 pr-3 font-normal">Tone (L*)</th>
              <th className="py-1 pr-3 font-normal">over L*</th>
              <th className="py-1 font-normal">on white</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.t} className="border-t">
                <td className="py-1.5 pr-3">
                  <span
                    className="inline-block size-4 rounded-sm border align-middle"
                    style={{ backgroundColor: r.hex }}
                  />
                </td>
                <td className="py-1.5 pr-3">{r.t}</td>
                <td className="py-1.5 pr-3">{r.lstar.toFixed(1)}</td>
                <td className="py-1.5 pr-3 text-fg-muted">
                  +{r.over.toFixed(1)}
                </td>
                <td className="py-1.5 text-fg-muted">{r.w.toFixed(2)}:1</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Demo>
  )
}
