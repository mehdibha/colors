import { useState } from 'react'
import { converter, displayable } from 'culori'

import { Demo } from '@/components/demo'
import { ToggleButton } from '@/ui/toggle-button'
import { ToggleButtonGroup } from '@/ui/toggle-button-group'

type ScaleId = 'blue' | 'yellow' | 'green'

const toOklch = converter('oklch')

const maxChroma = (l: number, h: number) => {
  let lo = 0
  let hi = 0.45
  for (let k = 0; k < 22; k++) {
    const mid = (lo + hi) / 2
    if (displayable({ mode: 'oklch', l, c: mid, h })) lo = mid
    else hi = mid
  }
  return lo
}

// Radix light-mode masters (radix-ui/colors src/light.ts).
const HEXES: Record<ScaleId, string[]> = {
  blue: [
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
  ],
  yellow: [
    '#fdfdf9',
    '#fefce9',
    '#fffab8',
    '#fff394',
    '#ffe770',
    '#f3d768',
    '#e4c767',
    '#d5ae39',
    '#ffe629',
    '#ffdc00',
    '#9e6c00',
    '#473b1f',
  ],
  green: [
    '#fbfefc',
    '#f4fbf6',
    '#e6f6eb',
    '#d6f1df',
    '#c4e8d1',
    '#adddc0',
    '#8eceaa',
    '#5bb98b',
    '#30a46c',
    '#2b9a66',
    '#218358',
    '#193b2d',
  ],
}

// ceiling computed at each step's own L and hue — Radix bends hue along the ramp (ch13)
const SCALES = (Object.keys(HEXES) as ScaleId[]).map((id) => {
  const steps = (HEXES[id] ?? []).map((hex) => {
    const o = toOklch(hex)
    const l = o?.l ?? 0
    const c = o?.c ?? 0
    const h = o?.h ?? 0
    const ceil = maxChroma(l, h)
    return { hex, c, ceil, pct: ceil > 1e-4 ? c / ceil : 0 }
  })
  return { id, steps }
})

const SUMMARIES: Record<ScaleId, string> = {
  blue: 'Blue’s tent is low, and the master rides it: steps 1–11 sit at 81–100% of the ceiling, and step 9 sits exactly on it — #0090ff has a zeroed red channel and a maxed blue one. It is a point on the gamut surface.',
  yellow:
    'Yellow touches its ceiling at six steps — 3–5 and 9–11 all sit at 100%. The solid, #ffe629, maxes the red channel: a point on the gamut surface again.',
  green:
    'Green’s tent is tall, so taste caps first: the mid steps sit at 29–45% of the ceiling, and even the solids stop at 88–90% — the only scale here that never touches its tent. Riding this ceiling mid-scale would be radioactive.',
}

const W = 520
const H = 190
const PAD = { left: 40, right: 12, top: 14, bottom: 24 }
const C_TOP = 0.3
const px = (i: number) => PAD.left + (i / 11) * (W - PAD.left - PAD.right)
const py = (c: number) => PAD.top + (1 - c / C_TOP) * (H - PAD.top - PAD.bottom)

const linePath = (values: number[]) =>
  values
    .map(
      (c, i) => `${i === 0 ? 'M' : 'L'}${px(i).toFixed(1)},${py(c).toFixed(1)}`,
    )
    .join(' ')

export function MastersUnderTheCeiling() {
  const [id, setId] = useState<ScaleId>('blue')
  const scale = SCALES.find((s) => s.id === id) ?? SCALES[0]
  if (!scale) return null

  return (
    <Demo
      caption={
        <>
          A hand-tuned master against its own ceiling &mdash; computed at each
          step&rsquo;s actual lightness <em>and</em> hue, because Radix bends
          hue along the ramp too (chapter 13&rsquo;s subject). The masters share
          no chroma curve and no percentage curve. What they share is the
          method: a smooth arc drawn under this hue&rsquo;s tent, touching it
          only where the design wants maximum vividness.
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <ToggleButtonGroup
          selectionMode="single"
          disallowEmptySelection
          selectedKeys={[id]}
          onSelectionChange={(keys) => {
            const next = [...keys][0]
            if (typeof next === 'string') setId(next as ScaleId)
          }}
          size="sm"
          aria-label="Radix master scale"
          className="max-w-full overflow-x-auto"
        >
          <ToggleButton id="blue">Radix blue</ToggleButton>
          <ToggleButton id="yellow">Radix yellow</ToggleButton>
          <ToggleButton id="green">Radix green</ToggleButton>
        </ToggleButtonGroup>

        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="h-auto w-full text-fg"
          role="img"
          aria-label={`Radix ${id} chroma per step under its gamut ceiling`}
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
            y2={py(C_TOP)}
            stroke="currentColor"
            strokeOpacity={0.25}
          />
          <path
            d={linePath(scale.steps.map((s) => s.ceil))}
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            strokeOpacity={0.5}
            strokeDasharray="5 3"
          />
          <path
            d={linePath(scale.steps.map((s) => s.c))}
            fill="none"
            stroke="currentColor"
            strokeOpacity={0.4}
          />
          {scale.steps.map((s, i) => (
            <circle
              key={i}
              cx={px(i)}
              cy={py(s.c)}
              r={4}
              fill={s.hex}
              stroke="currentColor"
              strokeOpacity={0.45}
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
            <text x={PAD.left - 6} y={py(C_TOP) + 4} textAnchor="end">
              {C_TOP}
            </text>
            <text x={PAD.left - 6} y={py(0) + 4} textAnchor="end">
              0
            </text>
            <text
              x={12}
              y={(py(0) + py(C_TOP)) / 2}
              textAnchor="middle"
              transform={`rotate(-90 12 ${(py(0) + py(C_TOP)) / 2})`}
            >
              C
            </text>
            <text x={px(0) + 4} y={py(scale.steps[0]?.ceil ?? 0) - 6}>
              ceiling (dashed)
            </text>
          </g>
        </svg>

        <div className="flex gap-1">
          {scale.steps.map((s, i) => (
            <div
              key={i}
              className="flex min-w-0 flex-1 flex-col items-center gap-1"
            >
              <div
                className="h-8 w-full rounded-md border"
                style={{ backgroundColor: s.hex }}
              />
              <span className="font-mono text-[0.55rem] text-fg-muted tabular-nums">
                {Math.round(s.pct * 100)}%
              </span>
            </div>
          ))}
        </div>
        <p className="-mt-2 text-xs text-fg-muted">
          Under each step: its chroma as a percentage of the ceiling at that
          step&rsquo;s L and H.
        </p>

        <p className="text-sm text-fg-muted" aria-live="polite">
          {SUMMARIES[id]}
        </p>
      </div>
    </Demo>
  )
}
