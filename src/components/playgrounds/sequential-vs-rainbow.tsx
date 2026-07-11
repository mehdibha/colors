import { useState } from 'react'
import { converter } from 'culori'

import { Demo } from '@/components/demo'
import { ToggleButton } from '@/ui/toggle-button'
import { ToggleButtonGroup } from '@/ui/toggle-button-group'

type Colormap = 'viridis' | 'jet'

const toOklch = converter('oklch')

// Real reference colormaps, sampled to 9 stops.
// Viridis: matplotlib's default since 2.0, monotonic luminance. bids.github.io/colormap.
const VIRIDIS = [
  '#440154',
  '#472d7b',
  '#3b528b',
  '#2c728e',
  '#21918c',
  '#28ae80',
  '#5ec962',
  '#addc30',
  '#fde725',
]
// Jet: the classic rainbow — dark ends, bright middle, non-monotonic luminance.
const JET = [
  '#00007f',
  '#0000ff',
  '#007fff',
  '#00ffff',
  '#7fff7f',
  '#ffff00',
  '#ff7f00',
  '#ff0000',
  '#7f0000',
]

const lOf = (hex: string) => toOklch(hex)?.l ?? 0

const W = 520
const H = 120
const PAD = { l: 8, r: 8, t: 10, b: 10 }
const px = (i: number, n: number) => PAD.l + (i / (n - 1)) * (W - PAD.l - PAD.r)
const py = (l: number) => PAD.t + (1 - l) * (H - PAD.t - PAD.b)

function monotonic(ls: number[]): boolean {
  return ls.every((l, i) => i === 0 || l > (ls[i - 1] ?? -1))
}

export function SequentialVsRainbow() {
  const [map, setMap] = useState<Colormap>('viridis')
  const stops = map === 'viridis' ? VIRIDIS : JET
  const ls = stops.map(lOf)
  const path = ls
    .map(
      (l, i) =>
        `${i === 0 ? 'M' : 'L'}${px(i, ls.length).toFixed(1)},${py(l).toFixed(1)}`,
    )
    .join(' ')
  const ok = monotonic(ls)

  return (
    <Demo
      caption={
        <>
          The band is the colormap; the line is its true OKLCH lightness, low
          index to high. Viridis climbs monotonically &mdash; equal data steps
          read as equal steps. Jet dips and spikes: the bright middle bands
          invent boundaries where the data is flat, the dark ends hide real
          gradients. This is why viridis replaced jet as matplotlib&rsquo;s
          default in 2.0.
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <ToggleButtonGroup
          selectionMode="single"
          disallowEmptySelection
          selectedKeys={[map]}
          onSelectionChange={(keys) => {
            const next = [...keys][0]
            if (next === 'viridis' || next === 'jet') setMap(next)
          }}
          size="sm"
          aria-label="Colormap"
          className="max-w-full overflow-x-auto"
        >
          <ToggleButton id="viridis">Viridis (right)</ToggleButton>
          <ToggleButton id="jet">Jet / rainbow (wrong)</ToggleButton>
        </ToggleButtonGroup>

        <div className="flex h-8 overflow-hidden rounded-md border">
          {stops.map((hex, i) => (
            <div key={i} className="flex-1" style={{ backgroundColor: hex }} />
          ))}
        </div>

        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="h-auto w-full text-fg"
          role="img"
          aria-label="Lightness of the colormap per index"
        >
          <line
            x1={PAD.l}
            y1={py(0)}
            x2={W - PAD.r}
            y2={py(0)}
            stroke="currentColor"
            strokeOpacity={0.2}
          />
          <path
            d={path}
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            strokeOpacity={0.65}
          />
          {ls.map((l, i) => (
            <circle
              key={i}
              cx={px(i, ls.length)}
              cy={py(l)}
              r={4}
              fill={stops[i]}
              stroke="currentColor"
              strokeOpacity={0.5}
            />
          ))}
        </svg>

        <span
          aria-live="polite"
          className="font-mono text-[0.65rem] tabular-nums"
        >
          <span className={ok ? 'text-fg-success' : 'text-fg-danger'}>
            lightness {ok ? 'monotonic ✓' : 'non-monotonic ✕'}
          </span>
          <span className="text-fg-muted">
            {' '}
            · span {(Math.max(...ls) - Math.min(...ls)).toFixed(2)} L
          </span>
        </span>
      </div>
    </Demo>
  )
}
