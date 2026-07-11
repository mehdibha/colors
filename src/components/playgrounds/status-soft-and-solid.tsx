import { wcagContrast } from 'culori'

import { apcaLc } from '@/lib/apca'
import { Demo } from '@/components/demo'

// dotUI status kit (styles.css): solid = family-500, soft surface = family-100
// (info: family-50), soft text = fg-family = family-800.
const FAMILIES = [
  {
    name: 'success',
    solid: '#00ad47',
    soft: '#b0ffbf',
    text: '#005912',
    fg: 'text-fg-success',
  },
  {
    name: 'warning',
    solid: '#b78600',
    soft: '#ffe69b',
    text: '#5e4100',
    fg: 'text-fg-warning',
  },
  {
    name: 'danger',
    solid: '#f34847',
    soft: '#ffdcd7',
    text: '#880010',
    fg: 'text-fg-danger',
  },
  {
    name: 'info',
    solid: '#438aff',
    soft: '#ecf9ff',
    text: '#0b4092',
    fg: 'text-fg-info',
  },
] as const

function Meter({ fg, bg }: { fg: string; bg: string }) {
  const w = wcagContrast(fg, bg)
  const lc = apcaLc(fg, bg)
  const passW = w >= 4.5
  const passA = Math.abs(lc) >= 60
  return (
    <span className="font-mono text-[0.6rem] tabular-nums">
      <span className={passW ? 'text-fg-success' : 'text-fg-danger'}>
        {w.toFixed(2)}:1 {passW ? '✓' : '✕'}
      </span>{' '}
      <span className={passA ? 'text-fg-success' : 'text-fg-warning'}>
        Lc {Math.abs(lc).toFixed(0)} {passA ? '✓' : '⚠'}
      </span>
    </span>
  )
}

export function StatusSoftAndSolid() {
  return (
    <Demo
      caption={
        <>
          Each status family owes the full kit from chapter 17 — a soft surface,
          a solid, and their text partners, on both meters. The{' '}
          <strong className="text-fg">soft</strong> style (family-800 text on
          the family-muted surface) clears both meters for all four,
          comfortably. The <strong className="text-fg">solid</strong> style at
          step 500 is chapter 8&rsquo;s orange-button fight, four times over: a
          black label passes WCAG (5.8&ndash;7.1:1) but fails APCA (Lc
          42&ndash;49, under the 60 body floor), while a white label passes APCA
          (Lc 61&ndash;68) but fails WCAG (2.97&ndash;3.60:1). At step 500{' '}
          <em>neither</em> label passes both — a solid that carries a label
          belongs at step 600&ndash;700 (danger-600 + white clears 4.87:1, Lc
          78). Status doesn&rsquo;t get to skip the pairing promise for being
          &ldquo;just&rdquo; a warning.
        </>
      }
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-md text-left text-xs">
          <thead>
            <tr className="text-fg-muted">
              <th className="py-1 pr-3 font-normal">family</th>
              <th className="py-1 pr-3 font-normal">soft · fg-800 on muted</th>
              <th className="py-1 pr-3 font-normal">solid · black label</th>
              <th className="py-1 font-normal">solid · white label</th>
            </tr>
          </thead>
          <tbody>
            {FAMILIES.map((f) => (
              <tr key={f.name} className="border-t align-middle">
                <td className={`py-2 pr-3 font-medium ${f.fg}`}>{f.name}</td>
                <td className="py-2 pr-3">
                  <div className="flex flex-col gap-1">
                    <span
                      className="w-fit rounded-md px-2.5 py-1 font-medium"
                      style={{ backgroundColor: f.soft, color: f.text }}
                    >
                      Soft
                    </span>
                    <Meter fg={f.text} bg={f.soft} />
                  </div>
                </td>
                <td className="py-2 pr-3">
                  <div className="flex flex-col gap-1">
                    <span
                      className="w-fit rounded-md px-2.5 py-1 font-medium"
                      style={{ backgroundColor: f.solid, color: '#000000' }}
                    >
                      Solid
                    </span>
                    <Meter fg="#000000" bg={f.solid} />
                  </div>
                </td>
                <td className="py-2">
                  <div className="flex flex-col gap-1">
                    <span
                      className="w-fit rounded-md px-2.5 py-1 font-medium"
                      style={{ backgroundColor: f.solid, color: '#ffffff' }}
                    >
                      Solid
                    </span>
                    <Meter fg="#ffffff" bg={f.solid} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Demo>
  )
}
