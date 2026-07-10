import { converter, wcagContrast } from 'culori'

import { Demo } from '@/components/demo'

const toOklch = converter('oklch')

// Shipped pairs: Radix red/yellow 11 (light.ts / dark.ts), Material baseline error.
const ROWS = [
  {
    name: 'Red — Radix step 11',
    lightText: '#ce2c31',
    lightBg: '#fff7f7',
    darkText: '#ff9592',
    darkBg: '#201314',
  },
  {
    name: 'Yellow — Radix step 11',
    lightText: '#9e6c00',
    lightBg: '#fefce9',
    darkText: '#f5e147',
    darkBg: '#1b180f',
  },
  {
    name: 'Error — Material baseline',
    lightText: '#b00020',
    lightBg: '#ffffff',
    darkText: '#cf6679',
    darkBg: '#121212',
  },
]

function Cell({ text, bg }: { text: string; bg: string }) {
  return (
    <div
      className="flex min-w-0 flex-1 flex-col gap-0.5 rounded-md border px-3 py-2"
      style={{ backgroundColor: bg }}
    >
      <span className="truncate text-xs font-medium" style={{ color: text }}>
        Payment failed
      </span>
      <span
        className="font-mono text-[0.6rem] tabular-nums"
        style={{ color: text, opacity: 0.8 }}
      >
        {text} · {wcagContrast(text, bg).toFixed(2)}:1
      </span>
    </div>
  )
}

export function StatusColorsGoSoft() {
  return (
    <Demo
      caption={
        <>
          Left to right: the shipped light value on its light background, the
          same value carried onto the dark background, and the shipped dark
          value. Red desaturates and lifts (C 0.197 &rarr; 0.128, L 0.557 &rarr;
          0.780); Material&rsquo;s error is the light error under a 40% white
          overlay. Yellow breaks the rule: its light-mode text was the
          compromise (a brown &mdash; chapter 13&rsquo;s olive problem), and the
          dark room finally lets it be yellow, chroma <em>up</em>.
        </>
      }
    >
      <div className="flex flex-col gap-3">
        {ROWS.map((row) => {
          const lo = toOklch(row.lightText)
          const dk = toOklch(row.darkText)
          return (
            <div key={row.name} className="flex flex-col gap-1">
              <div className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-0.5">
                <span className="text-xs text-fg-muted">{row.name}</span>
                <span className="font-mono text-[0.6rem] text-fg-muted tabular-nums">
                  L {(lo?.l ?? 0).toFixed(3)} → {(dk?.l ?? 0).toFixed(3)} · C{' '}
                  {(lo?.c ?? 0).toFixed(3)} → {(dk?.c ?? 0).toFixed(3)}
                </span>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Cell text={row.lightText} bg={row.lightBg} />
                <Cell text={row.lightText} bg={row.darkBg} />
                <Cell text={row.darkText} bg={row.darkBg} />
              </div>
            </div>
          )
        })}
      </div>
    </Demo>
  )
}
