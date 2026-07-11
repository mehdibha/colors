import { converter } from 'culori'

import { Demo } from '@/components/demo'
const toOklch = converter('oklch')
// radix-ui/colors src/light.ts + src/dark.ts (blue / blueDark), verified at HEAD.
const LIGHT = [
  '#fbfdff',
  '#f4faff',
  '#e6f4fe',
  '#d5efff',
  '#c2e5ff',
  '#acd8fc',
  '#8ec8f6',
  '#5eb1ef',
  '#0090ff',
  '#0588f0',
  '#0d74ce',
  '#113264',
]
const DARK = [
  '#0d1520',
  '#111927',
  '#0d2847',
  '#003362',
  '#004074',
  '#104d87',
  '#205d9e',
  '#2870bd',
  '#0090ff',
  '#3b9eff',
  '#70b8ff',
  '#c2e6ff',
]
const LL = LIGHT.map((h) => toOklch(h)?.l ?? 0)
const DL = DARK.map((h) => toOklch(h)?.l ?? 0)
const FLIP = LL.map((l) => 1 - l)
const W = 560
const H = 200
const PAD = { left: 34, right: 12, top: 12, bottom: 26 }
const px = (i: number) => PAD.left + (i / 11) * (W - PAD.left - PAD.right)
const py = (l: number) => PAD.top + (1 - l) * (H - PAD.top - PAD.bottom)
const linePath = (ls: number[]) =>
  ls
    .map(
      (l, i) => `${i === 0 ? 'M' : 'L'}${px(i).toFixed(1)},${py(l).toFixed(1)}`,
    )
    .join(' ')
export function RadixLightDarkCurves() {
  return (
    <Demo
      caption={
        <>
          OKLCH lightness per step, Radix blue. The dashed line is what a flip
          would produce &mdash; each dark step at 1 minus its light lightness.
          The shipped dark curve ignores it: the quiet end sits at L 0.19, not
          0.007, and its steps are nearly 3&times; wider. Dark is a second
          hand-tuning, not an inversion (chapter 16).
        </>
      }
    >
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-auto w-full text-fg"
        role="img"
        aria-label="OKLCH lightness per step for Radix blue in light and dark, with a dashed flip reference"
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
          d={linePath(FLIP)}
          fill="none"
          stroke="currentColor"
          strokeOpacity={0.3}
          strokeDasharray="4 4"
        />
        <path
          d={linePath(LL)}
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          strokeOpacity={0.85}
        />
        <path
          d={linePath(DL)}
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          strokeOpacity={0.45}
        />
        {LIGHT.map((hex, i) => (
          <circle
            key={`l${i}`}
            cx={px(i)}
            cy={py(LL[i] ?? 0)}
            r={4}
            fill={hex}
            stroke="currentColor"
            strokeOpacity={0.5}
          />
        ))}
        {DARK.map((hex, i) => (
          <circle
            key={`d${i}`}
            cx={px(i)}
            cy={py(DL[i] ?? 0)}
            r={4}
            fill={hex}
            stroke="currentColor"
            strokeOpacity={0.5}
          />
        ))}
        <g
          className="font-mono text-[0.6rem]"
          fill="currentColor"
          fillOpacity={0.55}
        >
          <text x={px(0)} y={H - 6} textAnchor="middle">
            1
          </text>
          <text x={px(11)} y={H - 6} textAnchor="middle">
            12
          </text>
          <text x={PAD.left - 6} y={py(1) + 4} textAnchor="end">
            1
          </text>
          <text x={PAD.left - 6} y={py(0) + 4} textAnchor="end">
            0
          </text>
        </g>
      </svg>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 font-mono text-[0.6rem] text-fg-muted">
        <span>&mdash; light L</span>
        <span>&mdash; dark L (fainter)</span>
        <span>---- flip of light (1 &minus; L)</span>
      </div>
    </Demo>
  )
}
