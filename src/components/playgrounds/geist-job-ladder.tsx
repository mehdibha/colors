import { useState } from 'react'
import { converter, wcagContrast } from 'culori'

import { apcaLc } from '@/lib/apca'
import { cn } from '@/lib/utils'
import { Demo } from '@/components/demo'
import { ToggleButton } from '@/ui/toggle-button'
import { ToggleButtonGroup } from '@/ui/toggle-button-group'

type Family = 'gray' | 'blue'

const toOklch = converter('oklch')

// Geist light-theme ramps, steps 100–1000, verified from vercel.com/design.md.
// Steps are JOBS, not a monotone lightness ramp — gray 400 (border) is a hair
// lighter than 300 (active bg): #eaeaea over #e6e6e6.
const RAMPS: Record<Family, string[]> = {
  gray: [
    '#f2f2f2',
    '#ebebeb',
    '#e6e6e6',
    '#eaeaea',
    '#c9c9c9',
    '#a8a8a8',
    '#8f8f8f',
    '#7d7d7d',
    '#4d4d4d',
    '#171717',
  ],
  blue: [
    '#f0f7ff',
    '#e9f4ff',
    '#dfefff',
    '#cae7ff',
    '#94ccff',
    '#48aeff',
    '#006bff',
    '#0059ec',
    '#005ff2',
    '#002359',
  ],
}
const STEPS = [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000]
const JOBS = [
  'default bg',
  'hover bg',
  'active bg',
  'default border',
  'hover border',
  'active border',
  'solid fill',
  'solid hover',
  'secondary text',
  'primary text',
]
const BG = '#ffffff' // background-100

function lightness(hex: string): number {
  return (toOklch(hex)?.l ?? 0) * 100
}

export function GeistJobLadder() {
  const [family, setFamily] = useState<Family>('gray')
  const ramp = RAMPS[family]
  const L = ramp.map(lightness)
  const border = ramp[3] ?? '#000000'
  const solid = ramp[6] ?? '#000000'
  const secondary = ramp[8] ?? '#000000'
  const primary = ramp[9] ?? '#000000'
  const label =
    wcagContrast('#ffffff', solid) >= wcagContrast('#000000', solid)
      ? '#ffffff'
      : '#000000'
  const showBlip = family === 'gray'

  return (
    <Demo
      caption={
        <>
          Ten steps, ten jobs — the same structure for every hue, on a tighter
          grid than Radix&rsquo;s twelve. Step 700 is the solid, 1000 the ink.
          The <span className="font-mono">L</span> row is each step&rsquo;s
          OKLCH lightness: in gray it does <em>not</em> fall monotonically —
          step 400 (default border) sits lighter than step 300 (active bg). A
          ramp of jobs, not a lightness index.
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <ToggleButtonGroup
          selectionMode="single"
          disallowEmptySelection
          selectedKeys={[family]}
          onSelectionChange={(keys) => {
            const next = [...keys][0]
            if (next === 'gray' || next === 'blue') setFamily(next)
          }}
          size="sm"
          aria-label="Geist scale"
          className="max-w-full overflow-x-auto"
        >
          <ToggleButton id="gray">Gray</ToggleButton>
          <ToggleButton id="blue">Blue</ToggleButton>
        </ToggleButtonGroup>

        <div className="overflow-x-auto">
          <div className="flex gap-1">
            {ramp.map((hex, i) => {
              const marked = showBlip && (i === 2 || i === 3)
              return (
                <div
                  key={i}
                  className="flex w-16 shrink-0 flex-col items-center gap-1"
                >
                  <div
                    className={cn(
                      'h-12 w-full rounded-md border',
                      marked && 'ring-2 ring-fg-warning ring-offset-1',
                    )}
                    style={{ backgroundColor: hex }}
                  />
                  <span className="font-mono text-[0.6rem] text-fg tabular-nums">
                    {STEPS[i]}
                  </span>
                  <span
                    className={cn(
                      'font-mono text-[0.6rem] tabular-nums',
                      marked ? 'text-fg-warning' : 'text-fg-muted',
                    )}
                  >
                    L{(L[i] ?? 0).toFixed(0)}
                  </span>
                  <span className="text-center text-[0.6rem] leading-tight text-fg-muted">
                    {JOBS[i]}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {showBlip && (
          <span
            aria-live="polite"
            className="font-mono text-[0.65rem] text-fg-warning tabular-nums"
          >
            blip: gray-400 L {(L[3] ?? 0).toFixed(1)}% &gt; gray-300 L{' '}
            {(L[2] ?? 0).toFixed(1)}% — the border reads lighter than the active
            bg it separates.
          </span>
        )}

        <div
          className="flex w-fit flex-col gap-1 rounded-lg border p-3"
          style={{ backgroundColor: BG, borderColor: border }}
        >
          <span className="text-xs font-medium" style={{ color: primary }}>
            Deploy summary
          </span>
          <span className="text-[0.7rem]" style={{ color: secondary }}>
            Building · 2 checks pending
          </span>
          <span
            className="mt-1 w-fit rounded-md px-2.5 py-1 text-[0.7rem] font-medium"
            style={{ backgroundColor: solid, color: label }}
          >
            Redeploy
          </span>
        </div>

        <span
          aria-live="polite"
          className="font-mono text-[0.65rem] text-fg-muted tabular-nums"
        >
          step 1000 on background-100 {wcagContrast(primary, BG).toFixed(2)}:1 ·
          Lc {apcaLc(primary, BG).toFixed(0)} — step 900{' '}
          {wcagContrast(secondary, BG).toFixed(2)}:1 · Lc{' '}
          {apcaLc(secondary, BG).toFixed(0)}
        </span>
      </div>
    </Demo>
  )
}
