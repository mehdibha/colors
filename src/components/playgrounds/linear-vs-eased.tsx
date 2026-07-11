import { useState } from 'react'
import { clampChroma, formatHex } from 'culori'

import { Demo } from '@/components/demo'
import { Switch } from '@/ui/switch'

const HUE = 250

// dotUI's fixed lightness anchors (11 steps), resampled to 12.
const ANCHORS = [
  0.9778, 0.9356, 0.8811, 0.8267, 0.7422, 0.6478, 0.5733, 0.4689, 0.3944, 0.32,
  0.2378,
]

function resample(anchors: number[], n: number): number[] {
  const last = anchors.length - 1
  return Array.from({ length: n }, (_, i) => {
    const t = (i / (n - 1)) * last
    const lo = Math.floor(t)
    const hi = Math.min(lo + 1, last)
    const f = t - lo
    return (anchors[lo] ?? 0) * (1 - f) + (anchors[hi] ?? 0) * f
  })
}

const EASED = resample(ANCHORS, 12)
const LINEAR = Array.from({ length: 12 }, (_, i) => 0.98 - (i * 0.7) / 11)
const CCURVE = Array.from(
  { length: 12 },
  (_, i) => 0.02 + 0.18 * Math.sin((Math.PI * i) / 11),
)

const swatch = (l: number, i: number) =>
  formatHex(
    clampChroma({ mode: 'oklch', l, c: CCURVE[i] ?? 0, h: HUE }, 'oklch'),
  )

const W = 480
const H = 190
const PAD = { left: 40, right: 12, top: 10, bottom: 26 }
const px = (i: number) => PAD.left + (i / 11) * (W - PAD.left - PAD.right)
const py = (l: number) => PAD.top + (1 - l) * (H - PAD.top - PAD.bottom)
const path = (ls: number[]) =>
  ls
    .map(
      (l, i) => `${i === 0 ? 'M' : 'L'}${px(i).toFixed(1)},${py(l).toFixed(1)}`,
    )
    .join(' ')

export function LinearVsEased() {
  const [eased, setEased] = useState(false)

  const ls = eased ? EASED : LINEAR
  const hexes = ls.map((l, i) => swatch(l, i))

  return (
    <Demo
      caption={
        <>
          Twelve steps of one blue, two lightness skeletons. The straight line
          spends the same 0.064 L on every gap; the eased one spends 0.038
          between the first backgrounds and up to 0.087 in the middle, where no
          job needs fine steps. Watch the card mock: under the straight line,
          the &ldquo;same surface&rdquo; steps 1–3 read as three different
          rooms.
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="h-auto w-full text-fg"
          role="img"
          aria-label="Lightness per step: linear versus eased skeleton"
        >
          <line
            x1={PAD.left}
            y1={py(0)}
            x2={px(11)}
            y2={py(0)}
            stroke="currentColor"
            strokeOpacity={0.25}
          />
          <line
            x1={PAD.left}
            y1={py(0)}
            x2={PAD.left}
            y2={py(1)}
            stroke="currentColor"
            strokeOpacity={0.25}
          />
          <path
            d={path(eased ? LINEAR : EASED)}
            fill="none"
            stroke="currentColor"
            strokeOpacity={0.2}
            strokeDasharray="4 4"
          />
          <path
            d={path(ls)}
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          />
          {ls.map((l, i) => (
            <circle
              key={i}
              cx={px(i)}
              cy={py(l)}
              r={4}
              fill={hexes[i]}
              stroke="currentColor"
              strokeOpacity={0.5}
            />
          ))}
          <g
            className="font-mono text-[0.6rem]"
            fill="currentColor"
            fillOpacity={0.55}
          >
            <text x={px(0)} y={H - 8} textAnchor="middle">
              1
            </text>
            <text x={px(11)} y={H - 8} textAnchor="middle">
              12
            </text>
            <text x={PAD.left - 6} y={py(1) + 4} textAnchor="end">
              1
            </text>
            <text x={PAD.left - 6} y={py(0) + 4} textAnchor="end">
              0
            </text>
            <text
              x={12}
              y={(py(0) + py(1)) / 2}
              textAnchor="middle"
              transform={`rotate(-90 12 ${(py(0) + py(1)) / 2})`}
            >
              L
            </text>
          </g>
        </svg>

        <div className="flex gap-1">
          {hexes.map((hex, i) => (
            <div
              key={i}
              className="flex min-w-0 flex-1 flex-col items-center gap-1"
            >
              <div
                className="h-9 w-full rounded-md border"
                style={{ backgroundColor: hex }}
              />
              <span className="font-mono text-[0.6rem] text-fg-muted">
                {i + 1}
              </span>
            </div>
          ))}
        </div>

        <div
          className="rounded-lg border p-4"
          style={{ backgroundColor: hexes[0] }}
        >
          <div
            className="mx-auto flex max-w-xs flex-col gap-1.5 rounded-lg border p-3"
            style={{ backgroundColor: hexes[1], borderColor: hexes[5] }}
          >
            <span
              className="text-[13px] font-semibold"
              style={{ color: hexes[11] }}
            >
              Steps 1, 2 and 3 at work
            </span>
            <span className="text-[12px]" style={{ color: hexes[10] }}>
              Page, card, and a hovered row — three neighbors from the light
              end.
            </span>
            <span
              className="self-start rounded-md px-2 py-1 text-[12px]"
              style={{ backgroundColor: hexes[2], color: hexes[11] }}
            >
              Hovered row
            </span>
          </div>
        </div>

        <Switch isSelected={eased} onChange={setEased} size="sm">
          Eased skeleton
        </Switch>
      </div>
    </Demo>
  )
}
