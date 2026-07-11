import { useState } from 'react'
import { converter, formatHex } from 'culori'
import type { Rgb } from 'culori'

import { Demo } from '@/components/demo'
import { ToggleButton } from '@/ui/toggle-button'
import { ToggleButtonGroup } from '@/ui/toggle-button-group'

const toOklch = converter('oklch')

const clamp01 = (x: number) => Math.max(0, Math.min(1, x))

// Classic MATLAB jet: three overlapping triangle waves.
function jet(t: number): Rgb {
  return {
    mode: 'rgb',
    r: clamp01(Math.min(4 * t - 1.5, -4 * t + 4.5)),
    g: clamp01(Math.min(4 * t - 0.5, -4 * t + 3.5)),
    b: clamp01(Math.min(4 * t + 0.5, -4 * t + 2.5)),
  }
}

// matplotlib viridis, sampled at ninths from the shipped 256-entry table.
const VIRIDIS_ANCHORS = [
  '#440154',
  '#472d7b',
  '#3b528b',
  '#2c728e',
  '#21918c',
  '#27ad81',
  '#5cc863',
  '#aadc32',
  '#fde725',
].map((hex) => {
  const c = converter('rgb')(hex)
  if (!c) throw new Error('bad viridis anchor')
  return c
})

function viridis(t: number): Rgb {
  const x = clamp01(t) * (VIRIDIS_ANCHORS.length - 1)
  const i = Math.min(Math.floor(x), VIRIDIS_ANCHORS.length - 2)
  const f = x - i
  const a = VIRIDIS_ANCHORS[i]
  const b = VIRIDIS_ANCHORS[i + 1]
  if (!a || !b) throw new Error('unreachable')
  return {
    mode: 'rgb',
    r: a.r + (b.r - a.r) * f,
    g: a.g + (b.g - a.g) * f,
    b: a.b + (b.b - a.b) * f,
  }
}

const COLS = 30
const ROWS = 13

// One smooth field: a diagonal trend plus a soft bump. Normalized to [0, 1].
const FIELD: number[] = []
{
  const raw: number[] = []
  for (let y = 0; y < ROWS; y++)
    for (let x = 0; x < COLS; x++) {
      const u = x / (COLS - 1)
      const v = y / (ROWS - 1)
      raw.push(
        0.55 * u +
          0.2 * v +
          0.3 * Math.exp(-((u - 0.35) ** 2 + (v - 0.45) ** 2) * 7),
      )
    }
  const min = Math.min(...raw)
  const max = Math.max(...raw)
  for (const z of raw) FIELD.push((z - min) / (max - min))
}

const grayAt = (l: number) => formatHex({ mode: 'oklch', l, c: 0 }) ?? '#000000'

type Mode = 'color' | 'lightness'

function Panel({
  label,
  ramp,
  mode,
}: {
  label: string
  ramp: (t: number) => Rgb
  mode: Mode
}) {
  const cell = (t: number) => {
    const c = ramp(t)
    if (mode === 'lightness') return grayAt(toOklch(c).l)
    return formatHex(c) ?? '#000000'
  }
  const curve = Array.from({ length: 33 }, (_, i) => {
    const t = i / 32
    return `${t * 120},${34 - toOklch(ramp(t)).l * 32}`
  }).join(' ')

  return (
    <div className="flex min-w-56 flex-1 flex-col gap-2">
      <span className="text-xs text-fg-muted">{label}</span>
      <div
        className="grid overflow-hidden rounded-md border"
        style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)` }}
      >
        {FIELD.map((z, i) => (
          // oxlint-disable-next-line no-array-index-key -- fixed grid
          <div
            key={i}
            className="aspect-square"
            style={{ backgroundColor: cell(z) }}
          />
        ))}
      </div>
      <div className="flex items-center gap-2">
        <div className="flex h-3 flex-1 overflow-hidden rounded-sm border">
          {Array.from({ length: 48 }, (_, i) => (
            // oxlint-disable-next-line no-array-index-key -- fixed strip
            <div
              key={i}
              className="flex-1"
              style={{ backgroundColor: cell(i / 47) }}
            />
          ))}
        </div>
        <svg
          viewBox="0 0 120 36"
          className="h-8 w-24 shrink-0 rounded-sm border"
          role="img"
          aria-label={`Lightness curve of the ${label} ramp`}
        >
          <polyline
            points={curve}
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="text-fg-muted"
          />
        </svg>
      </div>
    </div>
  )
}

export function JetVsViridis() {
  const [mode, setMode] = useState<Mode>('color')

  return (
    <Demo
      caption={
        <>
          The same smooth field twice. Jet&rsquo;s lightness climbs from 0.27,
          plateaus across cyan&ndash;green, peaks at 0.97 on yellow, then falls
          to 0.38 &mdash; so the top of the data range runs downhill, and the
          cyan and yellow crests print as bands the data doesn&rsquo;t have.
          Toggle to lightness: jet stops being a function of the data (values
          near 12% and 97% of the range print the same gray) while viridis stays
          a single clean ramp &mdash; in the shipped 256-entry table, OKLCH L
          rises 0.29 to 0.92 in steps that never leave 0.0023&ndash;0.0030.
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-fg-muted">Show</span>
          <ToggleButtonGroup
            selectionMode="single"
            disallowEmptySelection
            selectedKeys={[mode]}
            onSelectionChange={(keys) => {
              const next = [...keys][0]
              if (next === 'color' || next === 'lightness') setMode(next)
            }}
            size="sm"
            aria-label="Rendering mode"
            className="max-w-full overflow-x-auto"
          >
            <ToggleButton id="color">Full color</ToggleButton>
            <ToggleButton id="lightness">Lightness only</ToggleButton>
          </ToggleButtonGroup>
        </div>
        <div className="flex flex-wrap gap-4">
          <Panel label="jet" ramp={jet} mode={mode} />
          <Panel label="viridis" ramp={viridis} mode={mode} />
        </div>
      </div>
    </Demo>
  )
}
