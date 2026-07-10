import { useState } from 'react'
import { converter } from 'culori'

import { Demo } from '@/components/demo'
import { ToggleButton } from '@/ui/toggle-button'
import { ToggleButtonGroup } from '@/ui/toggle-button-group'

type SetId = 'tailwind' | 'radix'

const toOklch = converter('oklch')
const huesOf = (hexes: string[]) => hexes.map((hex) => toOklch(hex)?.h ?? 0)

// Tailwind v4 theme.css — the hue component of each oklch() value, verbatim.
const TW = [
  {
    name: 'yellow',
    stroke: 'oklch(0.75 0.14 95)',
    hues: [
      102.212, 103.193, 101.54, 98.111, 91.936, 86.047, 75.834, 66.442, 61.907,
      57.708, 53.813,
    ],
  },
  {
    name: 'amber',
    stroke: 'oklch(0.7 0.14 75)',
    hues: [
      95.277, 95.617, 95.746, 91.605, 84.429, 70.08, 58.318, 48.998, 46.201,
      45.904, 45.635,
    ],
  },
  {
    name: 'orange',
    stroke: 'oklch(0.65 0.17 50)',
    hues: [
      73.684, 75.164, 70.697, 66.29, 55.934, 47.604, 41.116, 38.402, 37.304,
      38.172, 36.259,
    ],
  },
  {
    name: 'green',
    stroke: 'oklch(0.6 0.15 148)',
    hues: [
      155.826, 156.743, 155.995, 154.449, 151.711, 149.579, 149.214, 150.069,
      151.328, 152.535, 152.934,
    ],
  },
  {
    name: 'blue',
    stroke: 'oklch(0.55 0.18 255)',
    hues: [
      254.604, 255.585, 254.128, 251.813, 254.624, 259.815, 262.881, 264.376,
      265.638, 265.522, 267.935,
    ],
  },
]

// Radix light scales (radix-ui/colors src/light.ts) — hues measured live.
const RADIX = [
  {
    name: 'yellow',
    stroke: 'oklch(0.75 0.14 95)',
    hues: huesOf([
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
    ]),
  },
  {
    name: 'amber',
    stroke: 'oklch(0.7 0.14 75)',
    hues: huesOf([
      '#fefdfb',
      '#fefbe9',
      '#fff7c2',
      '#ffee9c',
      '#fbe577',
      '#f3d673',
      '#e9c162',
      '#e2a336',
      '#ffc53d',
      '#ffba18',
      '#ab6400',
      '#4f3422',
    ]),
  },
  {
    name: 'red',
    stroke: 'oklch(0.577 0.2 30)',
    hues: huesOf([
      '#fffcfc',
      '#fff7f7',
      '#feebec',
      '#ffdbdc',
      '#ffcdce',
      '#fdbdbe',
      '#f4a9aa',
      '#eb8e90',
      '#e5484d',
      '#dc3e42',
      '#ce2c31',
      '#641723',
    ]),
  },
  {
    name: 'green',
    stroke: 'oklch(0.6 0.15 148)',
    hues: huesOf([
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
    ]),
  },
  {
    name: 'blue',
    stroke: 'oklch(0.55 0.18 255)',
    hues: huesOf([
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
    ]),
  },
]

const SETS: Record<
  SetId,
  {
    label: string
    solid: number
    solidLabel: string
    families: { name: string; stroke: string; hues: number[] }[]
  }
> = {
  tailwind: {
    label: 'Tailwind v4',
    solid: 5,
    solidLabel: '500',
    families: TW,
  },
  radix: { label: 'Radix', solid: 8, solidLabel: 'step 9', families: RADIX },
}

const W = 560
const H = 250
const PAD = { left: 44, right: 60, top: 14, bottom: 26 }
const Y_MIN = -36
const Y_MAX = 30
const px = (t: number) => PAD.left + t * (W - PAD.left - PAD.right)
const py = (d: number) =>
  PAD.top + ((Y_MAX - d) / (Y_MAX - Y_MIN)) * (H - PAD.top - PAD.bottom)

export function ShippedHueBends() {
  const [set, setSet] = useState<SetId>('tailwind')
  const { solid, solidLabel, families } = SETS[set]

  const lines = families.map((f) => {
    const anchor = f.hues[solid] ?? 0
    const deltas = f.hues.map((h) => h - anchor)
    return { ...f, deltas, dark: deltas[deltas.length - 1] ?? 0 }
  })
  const n = lines[0]?.deltas.length ?? 2
  const solidX = px(solid / (n - 1))

  return (
    <Demo
      caption={
        <>
          Every family plotted as degrees of hue away from its own solid step (
          {solidLabel}), lightest on the left &mdash; the printed figure is the
          darkest step&rsquo;s offset; a curve&rsquo;s full sweep is its
          vertical extent. The yellow&ndash;orange arc bends by tens of degrees;
          blue drifts a little toward violet; green &mdash; and, in the Radix
          set, red &mdash; wanders under ~10&deg; with no consistent direction.
          And note the left edge: the near-white steps carry almost no chroma (C
          0.003&ndash;0.026), so hue is nearly free there &mdash;
          Tailwind&rsquo;s orange tints{' '}
          <span
            aria-hidden
            className="inline-block size-3 translate-y-0.5 rounded-xs border"
            style={{ backgroundColor: '#fff7ed' }}
          />{' '}
          sit 26&deg; yellow-ward of their solid{' '}
          <span
            aria-hidden
            className="inline-block size-3 translate-y-0.5 rounded-xs border"
            style={{ backgroundColor: '#ff6900' }}
          />{' '}
          and read as peach, not as the wrong hue.
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <ToggleButtonGroup
          selectionMode="single"
          disallowEmptySelection
          selectedKeys={[set]}
          onSelectionChange={(keys) => {
            const next = [...keys][0]
            if (typeof next === 'string') setSet(next as SetId)
          }}
          size="sm"
          aria-label="Palette"
          className="max-w-full overflow-x-auto"
        >
          <ToggleButton id="tailwind">Tailwind v4</ToggleButton>
          <ToggleButton id="radix">Radix</ToggleButton>
        </ToggleButtonGroup>

        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="h-auto w-full text-fg"
          role="img"
          aria-label="Hue drift from the solid step across each palette's scale"
        >
          <line
            x1={px(0)}
            y1={py(0)}
            x2={px(1)}
            y2={py(0)}
            stroke="currentColor"
            strokeOpacity={0.25}
          />
          <line
            x1={solidX}
            y1={PAD.top}
            x2={solidX}
            y2={H - PAD.bottom}
            stroke="currentColor"
            strokeOpacity={0.15}
            strokeDasharray="3 3"
          />
          {lines.map((f) => {
            const d = f.deltas
              .map(
                (delta, i) =>
                  `${i === 0 ? 'M' : 'L'}${px(i / (n - 1)).toFixed(1)},${py(delta).toFixed(1)}`,
              )
              .join(' ')
            return (
              <g key={f.name}>
                <path d={d} fill="none" stroke={f.stroke} strokeWidth={2} />
                <text
                  x={px(1) + 6}
                  y={py(f.dark) + 3}
                  fill={f.stroke}
                  className="font-mono text-[0.6rem]"
                >
                  {f.name} {f.dark > 0 ? '+' : ''}
                  {f.dark.toFixed(0)}&deg;
                </text>
              </g>
            )
          })}
          <g
            className="font-mono text-[0.6rem]"
            fill="currentColor"
            fillOpacity={0.55}
          >
            <text x={px(0)} y={H - 8} textAnchor="middle">
              lightest
            </text>
            <text x={solidX} y={H - 8} textAnchor="middle">
              solid
            </text>
            <text x={px(1)} y={H - 8} textAnchor="middle">
              darkest
            </text>
            <text x={PAD.left - 6} y={py(0) + 3} textAnchor="end">
              0&deg;
            </text>
            <text x={PAD.left - 6} y={py(Y_MAX) + 4} textAnchor="end">
              +{Y_MAX}&deg;
            </text>
            <text x={PAD.left - 6} y={py(Y_MIN) + 4} textAnchor="end">
              {Y_MIN}&deg;
            </text>
          </g>
        </svg>
      </div>
    </Demo>
  )
}
