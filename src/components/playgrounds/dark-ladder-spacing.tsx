import { converter } from 'culori'

import { Demo } from '@/components/demo'

const toOklch = converter('oklch')

// Radix slate, light and dark — published hexes, quiet end first in both.
const SLATE = ['#fcfcfd', '#f9f9fb', '#f0f0f3', '#e8e8ec', '#e0e1e6', '#d9d9e0']
const SLATE_DARK = [
  '#111113',
  '#18191b',
  '#212225',
  '#272a2d',
  '#2e3135',
  '#363a3f',
]

const gaps = (hexes: string[]) => {
  const ls = hexes.map((h) => toOklch(h)?.l ?? 0)
  return ls.map((l, i) => (i === 0 ? 0 : Math.abs(l - (ls[i - 1] ?? l))))
}
const LIGHT_GAPS = gaps(SLATE)
const DARK_GAPS = gaps(SLATE_DARK)
const MAX_GAP = Math.max(...LIGHT_GAPS, ...DARK_GAPS)

function Row({
  label,
  hexes,
  gapList,
}: {
  label: string
  hexes: string[]
  gapList: number[]
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-fg-muted">{label}</span>
      <div className="flex gap-1">
        {hexes.map((hex, i) => (
          <div
            key={hex}
            className="flex min-w-0 flex-1 flex-col items-center gap-1"
          >
            <div
              className="h-9 w-full rounded-md border"
              style={{ backgroundColor: hex }}
            />
            <div className="flex h-10 w-full items-end justify-center">
              {i > 0 && (
                <div
                  className="w-2 rounded-t-sm bg-fg/60"
                  style={{ height: `${((gapList[i] ?? 0) / MAX_GAP) * 100}%` }}
                />
              )}
            </div>
            <span className="font-mono text-[0.55rem] text-fg-muted tabular-nums">
              {i > 0 ? `Δ ${(gapList[i] ?? 0).toFixed(3)}` : `step 1`}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function DarkLadderSpacing() {
  return (
    <Demo
      caption={
        <>
          The quiet end of Radix slate, both modes: steps 1&ndash;6, with the
          OKLCH lightness gap to the previous step drawn as a bar. The light
          ladder opens with a whisper &mdash; 0.009, then 0.027 &mdash; where
          the dark ladder strides: 0.035, then 0.039. The first distinction gets
          four times the lightness in the dark; every gap in the dark stack is
          wider than its light twin.
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <Row
          label="slate light, steps 1–6"
          hexes={SLATE}
          gapList={LIGHT_GAPS}
        />
        <Row
          label="slate dark, steps 1–6"
          hexes={SLATE_DARK}
          gapList={DARK_GAPS}
        />
      </div>
    </Demo>
  )
}
