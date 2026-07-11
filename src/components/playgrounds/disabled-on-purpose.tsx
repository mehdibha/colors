import { converter, formatHex, wcagContrast } from 'culori'

import { apcaLc } from '@/lib/apca'
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

const CARD = '#f6f5f1' // neutral-100
const FG = '#090807' // neutral-950 — enabled label
const FG_DISABLED = '#8a8883' // neutral-500 — dotUI's fg-disabled (stepped)
const OPACITY = 0.38 // Material 3 disabled content opacity

// dotUI ships a stepped neutral; M3 ships a raw-opacity content layer.
const OPACITY_DISABLED = over(FG, CARD, OPACITY)

const rows = [
  {
    state: 'enabled',
    fg: FG,
    verdict: 'must pass 4.5:1',
    tone: 'text-fg-muted',
  },
  {
    state: 'disabled · stepped (dotUI)',
    fg: FG_DISABLED,
    verdict: 'exempt · keep legible',
    tone: 'text-fg-warning',
  },
  {
    state: 'disabled · 0.38 opacity (M3)',
    fg: OPACITY_DISABLED,
    verdict: 'exempt · dimmer still',
    tone: 'text-fg-warning',
  },
]

export function DisabledOnPurpose() {
  return (
    <Demo
      caption={
        <>
          Disabled is the one state that <em>reduces</em> contrast on purpose.
          The enabled label clears {wcagContrast(FG, CARD).toFixed(2)}:1;
          dotUI&rsquo;s stepped disabled (neutral-500) drops to{' '}
          {wcagContrast(FG_DISABLED, CARD).toFixed(2)}:1, and Material&rsquo;s
          0.38-opacity recipe lands lower still at{' '}
          {wcagContrast(OPACITY_DISABLED, CARD).toFixed(2)}:1 — both under the
          4.5:1 floor, both correct. WCAG 2.2 says the same thing in SC 1.4.3
          and 1.4.11: &ldquo;User Interface Components that are not available
          for user interaction (e.g., a disabled control in HTML) are not
          required to meet contrast requirements.&rdquo; Exempt is not
          invisible: the control must still read as a control and never be
          mistaken for enabled. The stepped neutral is the more legible default;
          raw opacity can dim past reading on a busy surface.
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div
          className="flex flex-wrap items-center gap-3 rounded-md border p-4"
          style={{ backgroundColor: CARD }}
        >
          {rows.map((r) => (
            <span
              key={r.state}
              className="rounded-md border px-3 py-1.5 text-xs font-medium"
              style={{ color: r.fg, borderColor: '#dddbd7' }}
            >
              Save changes
            </span>
          ))}
        </div>
        <div
          aria-live="polite"
          className="overflow-x-auto rounded-md bg-muted/50 p-2.5"
        >
          <table className="w-full min-w-sm text-left font-mono text-[0.65rem] tabular-nums">
            <thead>
              <tr className="text-fg-muted">
                <th className="py-1 pr-3 font-normal">state</th>
                <th className="py-1 pr-3 font-normal">WCAG</th>
                <th className="py-1 pr-3 font-normal">APCA</th>
                <th className="py-1 font-normal">verdict</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.state} className="border-t">
                  <td className="py-1.5 pr-3">{r.state}</td>
                  <td className="py-1.5 pr-3">
                    {wcagContrast(r.fg, CARD).toFixed(2)}:1
                  </td>
                  <td className="py-1.5 pr-3">
                    Lc {apcaLc(r.fg, CARD).toFixed(1)}
                  </td>
                  <td className={`py-1.5 ${r.tone}`}>{r.verdict}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Demo>
  )
}
