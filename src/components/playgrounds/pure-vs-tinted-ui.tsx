import { converter, formatHex } from 'culori'

import { Demo } from '@/components/demo'

const toOklch = converter('oklch')

// Radix slate (light) — the tinted ramp; the pure ramp zeroes its chroma at identical L.
const SLATE = [
  '#fcfcfd',
  '#f9f9fb',
  '#f0f0f3',
  '#e8e8ec',
  '#e0e1e6',
  '#d9d9e0',
  '#cdced6',
  '#b9bbc6',
  '#8b8d98',
  '#80838d',
  '#60646c',
  '#1c2024',
]
const PURE = SLATE.map((hex) =>
  formatHex({ mode: 'oklch' as const, l: toOklch(hex)?.l ?? 0, c: 0, h: 0 }),
)

const IRIS9 = '#5b5bd6'

function MiniUI({ ramp, name }: { ramp: string[]; name: string }) {
  const s = (n: number) => ramp[n - 1] ?? '#000000'
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-1.5">
      <div
        className="flex flex-col gap-2 rounded-lg border p-3"
        style={{ backgroundColor: s(1), borderColor: s(6) }}
      >
        <span className="text-xs font-semibold" style={{ color: s(12) }}>
          Quarterly review
        </span>
        <span className="text-xs" style={{ color: s(11) }}>
          Numbers are in — draft attached. Sarah, 2h ago.
        </span>
        <div className="border-t" style={{ borderColor: s(6) }} aria-hidden />
        <div className="flex items-center gap-2">
          <span
            className="rounded-md px-3 py-1 text-xs font-medium"
            style={{ backgroundColor: IRIS9, color: '#ffffff' }}
          >
            Reply
          </span>
          <span
            className="rounded-md border px-3 py-1 text-xs font-medium"
            style={{ borderColor: s(7), color: s(11), backgroundColor: s(3) }}
          >
            Archive
          </span>
        </div>
      </div>
      <span className="font-mono text-[0.65rem] text-fg-muted">{name}</span>
    </div>
  )
}

export function PureVsTintedUI() {
  return (
    <Demo
      caption={
        <>
          Same twelve lightness values, same accent button. The grays on the
          left carry C 0 exactly; the right card is Radix slate &mdash; the
          identical L values carrying up to C 0.017 of the accent&rsquo;s
          blue-violet. Swatch against swatch you might need a second look. As a
          whole surface, the left one sits apart from its own button; the right
          one belongs to it.
        </>
      }
    >
      <div className="flex flex-col gap-4 sm:flex-row">
        <MiniUI ramp={PURE} name="pure gray — C 0" />
        <MiniUI
          ramp={SLATE}
          name="Radix slate — C ≤ 0.017, hue ≈ 278 at the peak"
        />
      </div>
    </Demo>
  )
}
