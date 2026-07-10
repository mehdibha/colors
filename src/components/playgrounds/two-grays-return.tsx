import { converter, formatHex, interpolate } from 'culori'

import { Demo } from '@/components/demo'

const toRgb = converter('rgb')
const toLab = converter('lab')

const A = '#0000ff'
const B = '#ffff00'

const ROWS = (
  [
    ['average the values — gamma sRGB', 'rgb'],
    ['average the light — srgb-linear', 'lrgb'],
    ['average the perception — OKLab', 'oklab'],
  ] as const
).map(([label, mode]) => {
  const mid = toRgb(interpolate([A, B], mode)(0.5))
  return { label, hex: formatHex(mid), lstar: Math.round(toLab(mid).l) }
})

export function TwoGraysReturn() {
  return (
    <Demo
      caption={
        <>
          The endpoints never move; only the ladder the average runs on does.
          The value ladder lands on{' '}
          <code className="font-mono text-[0.8rem]">#808080</code> — chapter 3's
          128 gray, at a dead L* 53: the gray hole in the middle of every naive
          blue-to-yellow gradient. The light ladder lands on{' '}
          <code className="font-mono text-[0.8rem]">#bcbcbc</code> — chapter 3's
          half-light gray: the physically honest mix (squint at a fine
          blue-and-yellow checkerboard and this is what fuses), which reads
          about three-quarters of the way to white, not halfway. OKLab's
          midpoint is the one your eye files as "between" — L* 67, believably
          mid. Notice what it still is, though: barely a color.
        </>
      }
    >
      <div className="flex flex-col gap-4">
        {ROWS.map((row) => (
          <div key={row.label} className="flex flex-col gap-1.5">
            <div className="flex items-baseline justify-between">
              <span className="font-mono text-[0.7rem] tracking-wider text-fg-muted uppercase">
                {row.label}
              </span>
              <span className="font-mono text-[0.7rem] text-fg-muted tabular-nums">
                {row.hex} · L* {row.lstar}
              </span>
            </div>
            <div className="flex h-12 overflow-hidden rounded-lg border">
              <div className="flex-1" style={{ backgroundColor: A }} />
              <div
                className="flex-[1.6]"
                style={{ backgroundColor: row.hex }}
              />
              <div className="flex-1" style={{ backgroundColor: B }} />
            </div>
          </div>
        ))}
      </div>
    </Demo>
  )
}
