import { useState } from 'react'
import { converter, differenceEuclidean, formatHex, parse } from 'culori'

import { cn } from '@/lib/utils'
import { Demo } from '@/components/demo'
import { ToggleButton } from '@/ui/toggle-button'
import { ToggleButtonGroup } from '@/ui/toggle-button-group'

import {
  GEIST_BACKGROUNDS,
  GEIST_SCALES,
  GEIST_STEPS,
  type GeistMode,
} from './geist-palette'

const toRgb = converter('rgb')
const dEok = differenceEuclidean('oklab')

function compositeOver(fg: string, bg: string): string {
  const f = toRgb(parse(fg))
  const b = toRgb(parse(bg))
  if (!f || !b) return bg
  const a = f.alpha ?? 1
  return formatHex({
    mode: 'rgb' as const,
    r: a * f.r + (1 - a) * b.r,
    g: a * f.g + (1 - a) * b.g,
    b: a * f.b + (1 - a) * b.b,
  })
}

export function GeistAlphaComposite() {
  const [mode, setMode] = useState<GeistMode>('light')
  const page = GEIST_BACKGROUNDS[mode][0]
  const solids = GEIST_SCALES.gray[mode]
  const alphas = GEIST_SCALES.grayAlpha[mode]

  return (
    <Demo
      caption={
        <>
          Chapter 21&rsquo;s test, run on Geist: composite each{' '}
          <code>gray-alpha</code> step over the page and compare it to the solid
          gray at the same step. Light mode half-passes — five composites land
          on the solid hex exactly, four miss by a hex tick, and gray-alpha-600
          misses by ΔEok 0.082. Dark mode never lands (worst ΔEok 0.041). Radix
          composites all 372 light twins to their solids exactly and holds the
          dark twins within ΔEok 0.015; Geist&rsquo;s alpha ramp is a
          hand-picked wash, not a twin doctrine.
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <ToggleButtonGroup
          selectionMode="single"
          disallowEmptySelection
          selectedKeys={[mode]}
          onSelectionChange={(keys) => {
            const next = [...keys][0]
            if (next === 'light' || next === 'dark') setMode(next)
          }}
          size="sm"
          aria-label="Mode"
          className="max-w-full overflow-x-auto"
        >
          <ToggleButton id="light">Light</ToggleButton>
          <ToggleButton id="dark">Dark</ToggleButton>
        </ToggleButtonGroup>

        <div
          className="rounded-lg border p-3"
          style={{ backgroundColor: page }}
        >
          <div className="flex gap-1">
            {GEIST_STEPS.map((step, i) => {
              const solid = solids[i] ?? '#000000'
              const alpha = alphas[i] ?? '#00000000'
              const over = compositeOver(alpha, page)
              const d = dEok(over, solid)
              const exact = over === solid.toLowerCase()
              return (
                <div key={step} className="flex min-w-0 flex-1 flex-col gap-1">
                  <div
                    className="h-7 rounded-t-md"
                    style={{ backgroundColor: solid }}
                    title={`gray-${step} ${solid}`}
                  />
                  <div
                    className="h-7 rounded-b-md"
                    style={{ backgroundColor: alpha }}
                    title={`gray-alpha-${step} ${alpha} over ${page}`}
                  />
                  <span
                    className={cn(
                      'text-center font-mono text-[0.55rem] tabular-nums',
                      exact || d < 0.004 ? 'opacity-60' : 'font-semibold',
                    )}
                    style={{ color: mode === 'light' ? '#4d4d4d' : '#a0a0a0' }}
                  >
                    {exact ? '=' : d.toFixed(3).slice(1)}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
        <p className="font-mono text-[0.6rem] text-fg-muted">
          top row solid gray · bottom row gray-alpha over the {mode} page (
          {page}) · number = ΔEok between them (= means exact)
        </p>
      </div>
    </Demo>
  )
}
