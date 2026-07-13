import { useState } from 'react'
import { converter, parse } from 'culori'

import { cn } from '@/lib/utils'
import { Demo } from '@/components/demo'
import { ToggleButton } from '@/ui/toggle-button'
import { ToggleButtonGroup } from '@/ui/toggle-button-group'

import { GEIST_SCALES, GEIST_STEPS } from './geist-palette'

const toOklch = converter('oklch')

type ScalePick = 'gray' | 'blue' | 'amber'
const PICKS: ScalePick[] = ['gray', 'blue', 'amber']

const GROUPS = [
  { label: 'backgrounds', from: 0, to: 2 },
  { label: 'borders', from: 3, to: 5 },
  { label: 'solids', from: 6, to: 7 },
  { label: 'text', from: 8, to: 9 },
]

function okL(hex: string): number {
  return toOklch(parse(hex))?.l ?? 0
}

export function GeistLadderWobble() {
  const [pick, setPick] = useState<ScalePick>('gray')
  const steps = GEIST_SCALES[pick].light

  return (
    <Demo
      caption={
        <>
          Geist&rsquo;s light ladders, OKLCH lightness under each step. The
          ladder is not monotonic — gray-400 (default border) is{' '}
          <em>lighter</em> than gray-300 (active background), blue-900
          (secondary text) is lighter than blue-800 (hover solid), amber-700
          (the solid) is lighter than amber-600 (active border). Every wobble
          sits at a seam between job groups: the step number is a job ID, not a
          position on a lightness ramp.
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <ToggleButtonGroup
          selectionMode="single"
          disallowEmptySelection
          selectedKeys={[pick]}
          onSelectionChange={(keys) => {
            const next = [...keys][0]
            if (next === 'gray' || next === 'blue' || next === 'amber')
              setPick(next)
          }}
          size="sm"
          aria-label="Scale"
          className="max-w-full overflow-x-auto"
        >
          {PICKS.map((name) => (
            <ToggleButton key={name} id={name}>
              {name}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>

        <div className="flex gap-1">
          {steps.map((hex, i) => {
            const l = okL(hex)
            const prev = i > 0 ? okL(steps[i - 1] ?? hex) : 1
            const wobble = i > 0 && l > prev + 1e-6
            return (
              <div key={i} className="flex min-w-0 flex-1 flex-col gap-1">
                <div
                  className={cn(
                    'h-12 rounded-md border',
                    wobble && 'ring-2 ring-amber-500',
                  )}
                  style={{ backgroundColor: hex }}
                  title={`${(i + 1) * 100} · ${hex}`}
                />
                <span className="text-center font-mono text-[0.6rem] text-fg-muted tabular-nums">
                  {GEIST_STEPS[i]}
                </span>
                <span
                  className={cn(
                    'text-center font-mono text-[0.6rem] tabular-nums',
                    wobble ? 'font-semibold text-fg' : 'text-fg-muted',
                  )}
                >
                  {wobble ? '↑' : ''}
                  {l.toFixed(3).slice(1)}
                </span>
              </div>
            )
          })}
        </div>

        <div className="flex gap-1" aria-hidden>
          {GROUPS.map((g) => (
            <div
              key={g.label}
              className="flex flex-col items-center gap-0.5"
              style={{ flexGrow: g.to - g.from + 1, flexBasis: 0 }}
            >
              <div className="h-1.5 w-full rounded-b-sm border-r border-b border-l" />
              <span className="font-mono text-[0.6rem] text-fg-muted">
                {g.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </Demo>
  )
}
