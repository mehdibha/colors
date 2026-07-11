import { useState } from 'react'
import {
  clampChroma,
  differenceEuclidean,
  formatHex,
  wcagContrast,
} from 'culori'

import { Demo } from '@/components/demo'
import { ToggleButton } from '@/ui/toggle-button'
import { ToggleButtonGroup } from '@/ui/toggle-button-group'

const dEok = differenceEuclidean('oklab')

// ColorBrewer RdBu, 11 classes (colorbrewer2.org).
const RDBU = [
  '#67001f',
  '#b2182b',
  '#d6604d',
  '#f4a582',
  '#fddbc7',
  '#f7f7f7',
  '#d1e5f0',
  '#92c5de',
  '#4393c3',
  '#2166ac',
  '#053061',
]

type Surface = 'light' | 'dark'
const SURFACE = { light: '#ffffff', dark: '#111113' }

// Two sequential arms meeting at a midpoint pinned to the surface neutral.
function matched(t: number, surface: Surface): string {
  const dark = surface === 'dark'
  const u = Math.abs(2 * t - 1)
  const midL = dark ? 0.24 : 0.976
  const endL = dark ? 0.8 : 0.4
  const l = midL + (endL - midL) * u
  const c = 0.004 + 0.15 * u ** 0.9
  const h = t < 0.5 ? 25 : 251
  return (
    formatHex(clampChroma({ mode: 'oklch', l, c, h }, 'oklch')) ?? '#000000'
  )
}

function Strip({
  label,
  colors,
  surface,
}: {
  label: string
  colors: string[]
  surface: Surface
}) {
  const mid = colors[Math.floor(colors.length / 2)] ?? '#000000'
  const de = dEok(mid, SURFACE[surface])
  const ratio = wcagContrast(mid, SURFACE[surface])
  return (
    <div className="flex flex-col gap-1.5">
      <span
        className="text-xs"
        style={{ color: surface === 'dark' ? '#a1a1aa' : '#52525b' }}
      >
        {label}
      </span>
      <div className="flex h-10 overflow-hidden rounded-md">
        {colors.map((hex, i) => (
          // oxlint-disable-next-line no-array-index-key -- fixed strip
          <div key={i} className="flex-1" style={{ backgroundColor: hex }} />
        ))}
      </div>
      <span
        aria-live="polite"
        className="font-mono text-[0.65rem] tabular-nums"
        style={{ color: surface === 'dark' ? '#a1a1aa' : '#52525b' }}
      >
        midpoint vs surface — ΔEok {de.toFixed(2)} · {ratio.toFixed(2)}:1
      </span>
    </div>
  )
}

export function DivergingMidpoint() {
  const [surface, setSurface] = useState<Surface>('light')
  const matchedColors = Array.from({ length: 11 }, (_, i) =>
    matched(i / 10, surface),
  )

  return (
    <Demo
      caption={
        <>
          Eleven steps from &ldquo;below the mean&rdquo; to &ldquo;above the
          mean.&rdquo; On white, RdBu&rsquo;s #f7f7f7 midpoint sits a
          just-noticeable difference off the surface (&Delta;Eok 0.02) &mdash;
          zero is quiet, as it should be. Switch the dashboard to dark and the
          same midpoint lands at 17.6:1 against the background: the cells that
          mean <em>nothing happened</em> are now the brightest thing on screen.
          The matched palette rebuilds both arms around the dark surface&rsquo;s
          own neutral, so the loudness stays with the extremes.
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-fg-muted">Dashboard surface</span>
          <ToggleButtonGroup
            selectionMode="single"
            disallowEmptySelection
            selectedKeys={[surface]}
            onSelectionChange={(keys) => {
              const next = [...keys][0]
              if (next === 'light' || next === 'dark') setSurface(next)
            }}
            size="sm"
            aria-label="Dashboard surface"
            className="max-w-full overflow-x-auto"
          >
            <ToggleButton id="light">Light</ToggleButton>
            <ToggleButton id="dark">Dark</ToggleButton>
          </ToggleButtonGroup>
        </div>

        <div
          className="flex flex-col gap-5 rounded-lg border p-5"
          style={{ backgroundColor: SURFACE[surface] }}
        >
          <Strip
            label="ColorBrewer RdBu — midpoint designed for white paper"
            colors={RDBU}
            surface={surface}
          />
          <Strip
            label="Surface-matched — midpoint pinned to this background"
            colors={matchedColors}
            surface={surface}
          />
        </div>
      </div>
    </Demo>
  )
}
