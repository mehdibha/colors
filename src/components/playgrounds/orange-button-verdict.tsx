import { wcagContrast } from 'culori'

import { apcaLc } from '@/lib/apca'
import { Demo } from '@/components/demo'

const ORANGE = '#ff6600'

const wcagVerdict = (r: number) =>
  r >= 7
    ? 'passes AAA'
    : r >= 4.5
      ? 'passes AA'
      : r >= 3
        ? 'large text only'
        : 'fails everything'

const BUTTONS = [
  { fg: '#ffffff', name: 'white on orange' },
  { fg: '#000000', name: 'black on orange' },
].map((b) => ({
  ...b,
  ratio: wcagContrast(b.fg, ORANGE),
  lc: apcaLc(b.fg, ORANGE),
}))

const strongest = Math.max(...BUTTONS.map((b) => Math.abs(b.lc)))

export function OrangeButtonVerdict() {
  return (
    <Demo
      caption={
        <>
          One background, <code className="font-mono text-[0.8rem]">#f60</code>.
          WCAG 2 scores black nearly two and a half times higher — white fails
          even the relaxed large-text bar. APCA ranks the same two buttons the
          other way around. Both meters are computing exactly what their specs
          say.
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        {BUTTONS.map((b) => (
          <div key={b.fg} className="flex flex-col items-center gap-3">
            <span
              className="rounded-lg px-5 py-2.5 text-sm font-medium"
              style={{ backgroundColor: ORANGE, color: b.fg }}
            >
              Pay now
            </span>
            <div className="flex flex-col items-center gap-1 font-mono text-[0.7rem] text-fg-muted tabular-nums">
              <span>
                WCAG 2 {b.ratio.toFixed(2)}:1 — {wcagVerdict(b.ratio)}
              </span>
              <span>
                APCA Lc {b.lc.toFixed(1)} —{' '}
                {Math.abs(b.lc) === strongest
                  ? 'the stronger pair'
                  : 'the weaker pair'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </Demo>
  )
}
