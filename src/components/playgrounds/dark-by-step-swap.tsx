import { useState } from 'react'
import { clampRgb, converter, formatHex, wcagContrast } from 'culori'

import { Demo } from '@/components/demo'
import { ToggleButton } from '@/ui/toggle-button'
import { ToggleButtonGroup } from '@/ui/toggle-button-group'

import { twFamily, twOklch } from './tailwind-v4-palette'

const toRgb = converter('rgb')
const gray = (stepIndex: number) => {
  const s = twFamily('gray').steps[stepIndex]
  return s ? formatHex(clampRgb(toRgb(twOklch(s)))) : '#000000'
}

const MODES = {
  light: {
    bg: '#ffffff',
    bgClass: 'bg-white',
    heading: gray(9),
    headingClass: 'text-gray-900',
    body: gray(5),
    bodyClass: 'text-gray-500',
  },
  dark: {
    bg: gray(8),
    bgClass: 'dark:bg-gray-800',
    heading: '#ffffff',
    headingClass: 'dark:text-white',
    body: gray(4),
    bodyClass: 'dark:text-gray-400',
  },
}

export function DarkByStepSwap() {
  const [mode, setMode] = useState<'light' | 'dark'>('light')
  const m = MODES[mode]
  const headingRatio = wcagContrast(m.heading, m.bg)
  const bodyRatio = wcagContrast(m.body, m.bg)

  return (
    <Demo
      caption={
        <>
          The docs&rsquo; own dark-mode recipe, measured: no second palette,
          just different indexes into the same ladder — white&nbsp;→&nbsp;800
          for the surface, 900&nbsp;→&nbsp;white and 500&nbsp;→&nbsp;400 for the
          text. The picks are good (body text clears 4.5:1 in both modes) — but
          they&rsquo;re picks a human made in an example, not values a system
          solved. Chapter 16&rsquo;s second design, outsourced to whoever writes
          the class list.
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
        >
          <ToggleButton id="light">Light</ToggleButton>
          <ToggleButton id="dark">Dark</ToggleButton>
        </ToggleButtonGroup>

        <div
          className="rounded-lg border p-5"
          style={{ backgroundColor: m.bg }}
        >
          <p className="text-sm font-medium" style={{ color: m.heading }}>
            Writes upside-down
          </p>
          <p className="mt-1 text-sm" style={{ color: m.body }}>
            The Zero Gravity Pen can be used to write in any orientation,
            including upside-down. It even works in outer space.
          </p>
        </div>

        <div
          aria-live="polite"
          className="flex flex-col gap-1 font-mono text-[0.65rem] text-fg-muted tabular-nums"
        >
          <span>
            {MODES.light.bgClass}{' '}
            <span className={mode === 'dark' ? 'font-semibold text-fg' : ''}>
              {MODES.dark.bgClass}
            </span>
          </span>
          <span>
            {MODES.light.headingClass}{' '}
            <span className={mode === 'dark' ? 'font-semibold text-fg' : ''}>
              {MODES.dark.headingClass}
            </span>{' '}
            — {headingRatio.toFixed(2)}:1
          </span>
          <span>
            {MODES.light.bodyClass}{' '}
            <span className={mode === 'dark' ? 'font-semibold text-fg' : ''}>
              {MODES.dark.bodyClass}
            </span>{' '}
            — {bodyRatio.toFixed(2)}:1
          </span>
        </div>
      </div>
    </Demo>
  )
}
