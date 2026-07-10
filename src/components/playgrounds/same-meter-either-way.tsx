import { wcagContrast } from 'culori'

import { apcaLc } from '@/lib/apca'
import { Demo } from '@/components/demo'

// Radix gray and slate (light), steps 1, 2, 11, 12.
const GRAY = { 1: '#fcfcfc', 2: '#f9f9f9', 11: '#646464', 12: '#202020' }
const SLATE = { 1: '#fcfcfd', 2: '#f9f9fb', 11: '#60646c', 12: '#1c2024' }

const PAIRS = [
  { label: 'high-contrast text on app background', fg: 12, bg: 1 },
  { label: 'low-contrast text on subtle background', fg: 11, bg: 2 },
] as const

export function SameMeterEitherWay() {
  return (
    <Demo
      caption={
        <>
          Chapter 10&rsquo;s text contracts, run on the pure and the tinted
          gray. The tint changes hue and chroma at near-constant lightness, and
          both of chapter 8&rsquo;s meters are driven almost entirely by
          lightness &mdash; so the scores move by a tenth at most, on a 16:1
          ratio. Tinting is free at the contrast register.
        </>
      }
    >
      <div className="flex flex-col gap-4 sm:flex-row">
        {[
          { name: 'gray (pure)', ramp: GRAY },
          { name: 'slate (tinted)', ramp: SLATE },
        ].map(({ name, ramp }) => (
          <div key={name} className="flex min-w-0 flex-1 flex-col gap-2">
            <span className="font-mono text-[0.65rem] text-fg-muted uppercase">
              {name}
            </span>
            {PAIRS.map((p) => {
              const fg = ramp[p.fg]
              const bg = ramp[p.bg]
              return (
                <div
                  key={p.label}
                  className="flex flex-col gap-1 rounded-md border p-3"
                  style={{ backgroundColor: bg }}
                >
                  <span className="text-sm" style={{ color: fg }}>
                    The quick brown fox
                  </span>
                  <span
                    className="font-mono text-[0.65rem] tabular-nums"
                    style={{ color: fg }}
                  >
                    {wcagContrast(fg, bg).toFixed(2)}:1 · Lc{' '}
                    {Math.abs(apcaLc(fg, bg)).toFixed(1)}
                  </span>
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </Demo>
  )
}
