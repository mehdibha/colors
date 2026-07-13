import { wcagContrast } from 'culori'

import { apcaLc } from '@/lib/apca'
import { Demo } from '@/components/demo'

import { GEIST_SCALES } from './geist-palette'

const s = (scale: 'blue' | 'red' | 'amber' | 'green', i: number): string =>
  GEIST_SCALES[scale].light[i - 1] ?? '#000000'

const CHIPS = [
  { label: 'Success', hex: s('blue', 7), fg: '#ffffff', note: 'blue-700' },
  { label: 'Error', hex: s('red', 8), fg: '#ffffff', note: 'red-800' },
  // Warning takes gray-1000, the dark-text side of the label flip.
  { label: 'Warning', hex: s('amber', 7), fg: '#171717', note: 'amber-700' },
  { label: 'Ready', hex: s('green', 7), fg: '#ffffff', note: 'green-700' },
]

export function GeistStatusFold() {
  const red7 = s('red', 7)
  const red8 = s('red', 8)
  return (
    <Demo
      caption={
        <>
          Status lives inside four ordinary scales — there are no status tokens.
          Two tells that a human routed around the numbers: the error{' '}
          <em>button</em> ships on red-800, because white on red-700 measures{' '}
          {wcagContrast('#ffffff', red7).toFixed(2)}:1 (under 4.5) while red-800
          clears it at {wcagContrast('#ffffff', red8).toFixed(2)}:1 — and the
          amber solid takes dark text, chapter 10&rsquo;s label flip: white on
          amber-700 is {wcagContrast('#ffffff', s('amber', 7)).toFixed(2)}:1,
          gray-1000 on it is {wcagContrast('#171717', s('amber', 7)).toFixed(2)}
          :1.
        </>
      }
    >
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {CHIPS.map((chip) => {
          const fg = chip.fg
          const ratio = wcagContrast(fg, chip.hex)
          const lc = Math.abs(apcaLc(fg, chip.hex))
          return (
            <div key={chip.label} className="flex flex-col gap-1.5">
              <div
                className="flex h-14 items-center justify-center rounded-md text-sm font-medium"
                style={{ backgroundColor: chip.hex, color: fg }}
              >
                {chip.label}
              </div>
              <span className="font-mono text-[0.6rem] text-fg-muted tabular-nums">
                {chip.note} · {ratio.toFixed(2)}:1 / Lc {lc.toFixed(1)}
              </span>
            </div>
          )
        })}
      </div>
    </Demo>
  )
}
