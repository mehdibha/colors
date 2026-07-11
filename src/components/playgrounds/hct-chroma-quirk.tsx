import { clampChroma, converter, formatHex } from 'culori'

import { Demo } from '@/components/demo'

const toLab = converter('lab')

// Solve an OKLCH color whose CIE L* equals the tone, then read the chroma that
// actually survived the gamut clamp. The point: the chroma ceiling moves with
// hue AND tone — HCT's documented quirk, and it falls straight out of OKLCH.
function toneColor(hue: number, chroma: number, tone: number) {
  let lo = 0
  let hi = 1
  for (let i = 0; i < 22; i++) {
    const mid = (lo + hi) / 2
    const c = clampChroma(
      { mode: 'oklch' as const, l: mid, c: chroma, h: hue },
      'oklch',
    )
    if ((toLab(c)?.l ?? 0) < tone) lo = mid
    else hi = mid
  }
  return clampChroma(
    { mode: 'oklch' as const, l: (lo + hi) / 2, c: chroma, h: hue },
    'oklch',
  )
}

const REQUESTED = 0.2
const TONES = [10, 20, 30, 40, 50, 60, 70, 80, 90]
const HUES = [
  { name: 'blue', hue: 264, opacity: 0.9 },
  { name: 'yellow', hue: 100, opacity: 0.55 },
]

const W = 520
const H = 190
const PAD = { left: 44, right: 60, top: 12, bottom: 26 }
const CMAX = 0.26
const px = (tone: number) =>
  PAD.left + (tone / 100) * (W - PAD.left - PAD.right)
const py = (c: number) => PAD.top + (1 - c / CMAX) * (H - PAD.top - PAD.bottom)

export function HctChromaQuirk() {
  const series = HUES.map((h) => {
    const points = TONES.map((tone) => {
      const col = toneColor(h.hue, REQUESTED, tone)
      return { tone, c: col.c ?? 0, hex: formatHex(col) }
    })
    const path = points
      .map(
        (p, i) =>
          `${i === 0 ? 'M' : 'L'}${px(p.tone).toFixed(1)},${py(p.c).toFixed(1)}`,
      )
      .join(' ')
    return { ...h, points, path }
  })

  return (
    <Demo
      caption={
        <>
          Ask both hues for chroma {REQUESTED} at every Tone; plot what the
          gamut actually delivers. Blue peaks in the midtones and collapses
          toward the light end; yellow climbs the whole way, because its ceiling
          is highest exactly where blue&rsquo;s is lowest &mdash; &ldquo;chroma
          has a different maximum for any given hue and tone.&rdquo; Computed in
          OKLCH with <span className="font-mono">clampChroma</span>, no CAM16:
          the one truth HCT&rsquo;s quirk teaches, OKLCH already knows.
        </>
      }
    >
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-auto w-full text-fg"
        role="img"
        aria-label="Delivered chroma versus tone for blue and yellow at a fixed requested chroma"
      >
        <line
          x1={PAD.left}
          y1={py(0)}
          x2={px(100)}
          y2={py(0)}
          stroke="currentColor"
          strokeOpacity={0.25}
        />
        <line
          x1={PAD.left}
          y1={py(0)}
          x2={PAD.left}
          y2={py(CMAX)}
          stroke="currentColor"
          strokeOpacity={0.25}
        />
        <line
          x1={PAD.left}
          y1={py(REQUESTED)}
          x2={px(100)}
          y2={py(REQUESTED)}
          stroke="currentColor"
          strokeOpacity={0.2}
          strokeDasharray="3 3"
        />
        {series.map((s) => (
          <g key={s.name}>
            <path
              d={s.path}
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              strokeOpacity={s.opacity}
            />
            {s.points.map((p) => (
              <circle
                key={p.tone}
                cx={px(p.tone)}
                cy={py(p.c)}
                r={3}
                fill={p.hex}
                stroke="currentColor"
                strokeOpacity={0.5}
              />
            ))}
            <text
              x={px(100) + 6}
              y={py(s.points[s.points.length - 1]?.c ?? 0) + 3}
              className="font-mono text-[0.6rem]"
              fill="currentColor"
              fillOpacity={0.7}
            >
              {s.name}
            </text>
          </g>
        ))}
        <g
          className="font-mono text-[0.6rem]"
          fill="currentColor"
          fillOpacity={0.55}
        >
          <text x={px(0)} y={H - 8} textAnchor="middle">
            0
          </text>
          <text x={px(100)} y={H - 8} textAnchor="middle">
            100
          </text>
          <text x={(px(0) + px(100)) / 2} y={H - 8} textAnchor="middle">
            Tone
          </text>
          <text x={PAD.left - 6} y={py(REQUESTED) + 3} textAnchor="end">
            .20
          </text>
          <text x={PAD.left - 6} y={py(0) + 3} textAnchor="end">
            0
          </text>
        </g>
      </svg>
    </Demo>
  )
}
