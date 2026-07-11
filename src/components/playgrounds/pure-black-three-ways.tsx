import { converter, wcagContrast } from 'culori'

import { Demo } from '@/components/demo'

const toOklch = converter('oklch')

const FLOORS = [
  {
    name: 'Pure black — Apple base',
    bg: '#000000',
    card: '#1c1c1e',
    note: 'OLED pixels off',
  },
  {
    name: 'Dark gray — Material',
    bg: '#121212',
    card: '#1e1e1e',
    note: 'room for elevation',
  },
  {
    name: 'Tinted — Radix slateDark',
    bg: '#111113',
    card: '#18191b',
    note: 'carries the accent hue',
  },
]

export function PureBlackThreeWays() {
  return (
    <Demo
      caption={
        <>
          Three shipped floors. Apple&rsquo;s base background really is{' '}
          <code className="font-mono text-[0.8rem]">#000000</code> &mdash; pure
          black is a legitimate choice, not a beginner mistake. Material&rsquo;s{' '}
          <code className="font-mono text-[0.8rem]">#121212</code> trades a
          little contrast for elevation headroom; Radix&rsquo;s{' '}
          <code className="font-mono text-[0.8rem]">#111113</code> adds chapter
          15&rsquo;s whisper of tint (C&nbsp;0.004) on top.
        </>
      }
    >
      <div className="flex flex-col gap-3 sm:flex-row">
        {FLOORS.map((f) => {
          const o = toOklch(f.bg)
          return (
            <div
              key={f.bg}
              className="flex flex-1 flex-col gap-2 rounded-lg border p-4"
              style={{ backgroundColor: f.bg }}
            >
              <span className="text-xs font-medium text-white/90">
                {f.name}
              </span>
              <div
                className="rounded-md p-2 text-[0.7rem] text-white/70"
                style={{ backgroundColor: f.card }}
              >
                a raised card · {f.note}
              </div>
              <span className="font-mono text-[0.65rem] text-white/60 tabular-nums">
                {f.bg} · L {(o?.l ?? 0).toFixed(3)} C {(o?.c ?? 0).toFixed(3)} ·
                white {wcagContrast('#ffffff', f.bg).toFixed(2)}:1
              </span>
            </div>
          )
        })}
      </div>
    </Demo>
  )
}
