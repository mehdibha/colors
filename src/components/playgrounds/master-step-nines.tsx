import { converter, wcagContrast } from 'culori'

import { Demo } from '@/components/demo'

const toOklch = converter('oklch')

// Radix light-mode step 9s, with the label color Radix ships on each.
const MASTERS = [
  { name: 'Blue 9', hex: '#0090ff', text: '#ffffff', textName: 'white' },
  { name: 'Violet 9', hex: '#6e56cf', text: '#ffffff', textName: 'white' },
  { name: 'Yellow 9', hex: '#ffe629', text: '#000000', textName: 'black' },
].map((m) => ({
  ...m,
  l: toOklch(m.hex)?.l ?? 0,
  ratio: wcagContrast(m.text, m.hex),
}))

export function MasterStepNines() {
  return (
    <Demo
      caption={
        <>
          Three Radix masters, step 9 only — the solid a human tuned per hue,
          wearing the text color Radix ships on it. Violet sits 0.11 L deeper
          than blue because that&rsquo;s where violet looks right; yellow
          abandons the mid-lightness slot entirely, ships bright, and flips the
          label to black. No fixed skeleton — in L or in ratios — produces this
          row.
        </>
      }
    >
      <div className="flex gap-1.5">
        {MASTERS.map((m) => (
          <div
            key={m.name}
            className="flex min-w-0 flex-1 flex-col items-center gap-1"
          >
            <div
              className="flex h-16 w-full items-center justify-center rounded-md border text-base font-medium"
              style={{ backgroundColor: m.hex, color: m.text }}
            >
              Aa
            </div>
            <span className="font-mono text-[0.6rem] text-fg">{m.name}</span>
            <span className="font-mono text-[0.6rem] text-fg-muted tabular-nums">
              L {m.l.toFixed(3)}
            </span>
            <span className="font-mono text-[0.6rem] text-fg-muted tabular-nums">
              {m.textName} {m.ratio.toFixed(2)}:1
            </span>
          </div>
        ))}
      </div>
    </Demo>
  )
}
