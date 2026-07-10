import { converter, displayable, formatHex } from 'culori'

import { Demo } from '@/components/demo'

const toRgb = converter('rgb')

const L_TOP = 0.97
const L_BOTTOM = 0.03
const L_SPAN = L_TOP - L_BOTTOM

function maxChroma(l: number, h: number) {
  let lo = 0
  let hi = 0.5
  for (let i = 0; i < 16; i++) {
    const mid = (lo + hi) / 2
    if (displayable({ mode: 'oklch', l, c: mid, h })) lo = mid
    else hi = mid
  }
  return lo
}

const HUES = Array.from({ length: 60 }, (_, i) => i * 6)
const LS = Array.from({ length: 22 }, (_, i) => L_BOTTOM + (i * L_SPAN) / 21)

const COLUMNS = HUES.map((h) => {
  const cs = LS.map((l) => maxChroma(l, h))
  let cusp = 0
  for (let i = 1; i < cs.length; i++)
    if ((cs[i] ?? 0) > (cs[cusp] ?? 0)) cusp = i
  const stops = LS.map((l, i) => {
    const hex = formatHex(
      toRgb({ mode: 'oklch', l, c: (cs[i] ?? 0) * 0.995, h }),
    )
    return `${hex} ${(((L_TOP - l) / L_SPAN) * 100).toFixed(1)}%`
  }).reverse()
  return {
    h,
    cuspL: LS[cusp] ?? 0.5,
    gradient: `linear-gradient(to bottom, ${stops.join(', ')})`,
  }
})

const ridgePoints = COLUMNS.map(
  (col, i) =>
    `${(((i + 0.5) / COLUMNS.length) * 100).toFixed(2)},${(((L_TOP - col.cuspL) / L_SPAN) * 100).toFixed(2)}`,
).join(' ')

const markerFor = (hue: number) => {
  const i = Math.round(hue / 6)
  const col = COLUMNS[i]
  return {
    x: ((i + 0.5) / COLUMNS.length) * 100,
    y: ((L_TOP - (col?.cuspL ?? 0.5)) / L_SPAN) * 100,
  }
}

const YELLOW = markerFor(108)
const BLUE = markerFor(264)

export function TentUnrolled() {
  return (
    <Demo
      caption={
        <>
          The outer skin of the sRGB gamut, unrolled: each column is one hue
          pushed to its maximum chroma at every lightness, hue running 0–360°
          left to right, lightness top to bottom. The line rides the cusp — the
          most vivid point of each hue. Yellow's cusp sits nearly at white:{' '}
          <code className="font-mono text-[0.8rem]">#ffff00</code> is{' '}
          <code className="font-mono text-[0.8rem]">oklch(0.97 0.211 110)</code>
          . Blue's sits far down:{' '}
          <code className="font-mono text-[0.8rem]">#0000ff</code> is{' '}
          <code className="font-mono text-[0.8rem]">oklch(0.45 0.313 264)</code>
          . No single lightness — and no single chroma — reaches every hue's
          peak.
        </>
      }
    >
      <div className="relative h-44 overflow-hidden rounded-lg border">
        <div className="flex h-full">
          {COLUMNS.map((col) => (
            <div
              key={col.h}
              className="flex-1"
              style={{ background: col.gradient }}
            />
          ))}
        </div>
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="absolute inset-0 h-full w-full"
          aria-hidden
        >
          <polyline
            points={ridgePoints}
            fill="none"
            stroke="black"
            strokeOpacity={0.5}
            strokeWidth={3}
            vectorEffect="non-scaling-stroke"
          />
          <polyline
            points={ridgePoints}
            fill="none"
            stroke="white"
            strokeWidth={1.25}
            vectorEffect="non-scaling-stroke"
          />
          {[YELLOW, BLUE].map((m, i) => (
            <circle
              key={i}
              cx={m.x}
              cy={m.y}
              r={2.5}
              fill="none"
              stroke="white"
              strokeWidth={1.5}
              vectorEffect="non-scaling-stroke"
            />
          ))}
        </svg>
      </div>
      <div className="mt-1.5 flex justify-between font-mono text-[0.7rem] text-fg-muted tabular-nums">
        <span>0°</span>
        <span>90°</span>
        <span>180°</span>
        <span>270°</span>
        <span>360°</span>
      </div>
    </Demo>
  )
}
