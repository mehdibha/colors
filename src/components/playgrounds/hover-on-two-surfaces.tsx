import { converter, differenceEuclidean, formatHex } from 'culori'

import { Demo } from '@/components/demo'

const toOklch = converter('oklch')
const toRgb = converter('rgb')
const dEok = differenceEuclidean('oklab')

// CSS composites alpha in gamma-encoded sRGB — match it channel-for-channel.
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

const CARD = '#f6f5f1' // neutral-100 — the surface the solid hover was tuned on
const PANEL = '#b0dcff' // accent-200 — a colored callout it was never tuned for
const SOLID = '#ecebe7' // neutral-200 — the designed hover step
const TEXT = '#1d1d1a' // neutral-800
const OPACITY = 0.08 // Material 3 hover state-layer opacity

const chroma = (hex: string) => (toOklch(hex)?.c ?? 0).toFixed(3)

function Item({ surface, fill }: { surface: string; fill: string }) {
  return (
    <div
      className="flex flex-col gap-1 rounded-md border p-2"
      style={{ backgroundColor: surface }}
    >
      <span className="rounded px-2.5 py-1.5 text-xs" style={{ color: TEXT }}>
        Rename
      </span>
      <span
        className="rounded px-2.5 py-1.5 text-xs font-medium"
        style={{ backgroundColor: fill, color: TEXT }}
      >
        Duplicate — hover
      </span>
    </div>
  )
}

export function HoverOnTwoSurfaces() {
  const alphaCard = over('#000000', CARD, OPACITY)
  const alphaPanel = over('#000000', PANEL, OPACITY)

  const rows = [
    {
      mech: 'solid step',
      card: SOLID,
      panel: SOLID,
      good: false,
      note: 'gray on blue',
    },
    {
      mech: 'alpha overlay',
      card: alphaCard,
      panel: alphaPanel,
      good: true,
      note: 'stays blue',
    },
  ]

  return (
    <Demo
      caption={
        <>
          The hover is tuned to look right on the card, then dropped on a tinted
          panel. The <strong className="text-fg">solid step</strong> is one
          frozen hex ({SOLID}, chroma {chroma(SOLID)}) — a whisper on the card
          (ΔEok {dEok(CARD, SOLID).toFixed(3)}) and a gray smudge on the panel
          (ΔEok {dEok(PANEL, SOLID).toFixed(3)}), because it has no term for
          what it covers. The <strong className="text-fg">alpha overlay</strong>{' '}
          is one token — black at {OPACITY * 100}% — that recomputes per surface
          ({alphaPanel}, chroma {chroma(alphaPanel)}): it keeps the
          panel&rsquo;s blue and holds a consistent delta (ΔEok{' '}
          {dEok(CARD, alphaCard).toFixed(3)} on the card,{' '}
          {dEok(PANEL, alphaPanel).toFixed(3)} on the panel). One overlay
          composes over anything; one solid step only fits the surface it was
          tuned against.
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <span className="text-xs text-fg-muted">Solid step — one hex</span>
            <div className="grid grid-cols-2 gap-2">
              <Item surface={CARD} fill={SOLID} />
              <Item surface={PANEL} fill={SOLID} />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-xs text-fg-muted">
              Alpha overlay — one token
            </span>
            <div className="grid grid-cols-2 gap-2">
              <Item surface={CARD} fill={alphaCard} />
              <Item surface={PANEL} fill={alphaPanel} />
            </div>
          </div>
        </div>
        <div
          aria-live="polite"
          className="overflow-x-auto rounded-md bg-muted/50 p-2.5"
        >
          <table className="w-full min-w-sm text-left font-mono text-[0.65rem] tabular-nums">
            <thead>
              <tr className="text-fg-muted">
                <th className="py-1 pr-3 font-normal">hover fill</th>
                <th className="py-1 pr-3 font-normal">on card</th>
                <th className="py-1 font-normal">on tinted panel</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.mech} className="border-t">
                  <td className="py-1.5 pr-3">{r.mech}</td>
                  <td className="py-1.5 pr-3">
                    {r.card} · C {chroma(r.card)}
                  </td>
                  <td
                    className={`py-1.5 ${r.good ? 'text-fg-success' : 'text-fg-danger'}`}
                  >
                    {r.panel} · C {chroma(r.panel)} {r.good ? '✓' : '✕'}{' '}
                    {r.note}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Demo>
  )
}
