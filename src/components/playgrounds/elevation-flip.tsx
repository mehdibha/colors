import { useState } from 'react'
import { wcagContrast } from 'culori'

import { Demo } from '@/components/demo'
import { ToggleButton } from '@/ui/toggle-button'
import { ToggleButtonGroup } from '@/ui/toggle-button-group'

// MDC-Android elevation overlay: alpha = (4.5·ln(1+dp) + 2)% of white over #121212.
const overlay = (dp: number) => {
  const alpha = (4.5 * Math.log1p(dp) + 2) / 100
  const v = Math.round(0x12 * (1 - alpha) + 255 * alpha)
  const ch = v.toString(16).padStart(2, '0')
  return { alpha, hex: `#${ch}${ch}${ch}` }
}

const LEVELS = [
  { dp: 1, shadow: 'shadow-sm' },
  { dp: 8, shadow: 'shadow-md' },
  { dp: 24, shadow: 'shadow-xl' },
]

export function ElevationFlip() {
  const [mode, setMode] = useState<'light' | 'dark'>('light')
  const isDark = mode === 'dark'
  const bg = isDark ? '#121212' : '#ebebeb'
  const fg = isDark ? '#ffffffde' : '#000000de'

  return (
    <Demo
      caption={
        <>
          Three heights, both rooms. In light mode every card stays the same
          white and the shadow does the talking. In dark mode the shadows are
          nearly invisible against{' '}
          <code className="font-mono text-[0.8rem]">#121212</code>, so Material
          lightens the surface instead: a white overlay at (4.5&thinsp;&middot;
          &thinsp;ln(1+dp)&thinsp;+&thinsp;2)% &mdash; the shipped formula.
          Elevation changes direction: in the dark, higher means lighter.
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
          <ToggleButton id="light">Light mode</ToggleButton>
          <ToggleButton id="dark">Dark mode</ToggleButton>
        </ToggleButtonGroup>
        <div
          className="flex flex-col gap-4 rounded-lg p-5 sm:flex-row"
          style={{ backgroundColor: bg }}
        >
          {LEVELS.map(({ dp, shadow }) => {
            const o = overlay(dp)
            const surface = isDark ? o.hex : '#ffffff'
            return (
              <div
                key={dp}
                className={`flex flex-1 flex-col gap-1 rounded-lg p-4 ${shadow}`}
                style={{ backgroundColor: surface }}
              >
                <span className="text-sm font-medium" style={{ color: fg }}>
                  {dp}dp
                </span>
                <span
                  aria-live="polite"
                  className="font-mono text-[0.65rem] tabular-nums"
                  style={{ color: fg, opacity: 0.65 }}
                >
                  {surface}
                  {isDark
                    ? ` · +${(o.alpha * 100).toFixed(1)}% white`
                    : ' · shadow only'}
                  {isDark
                    ? ` · white ${wcagContrast('#ffffff', surface).toFixed(2)}:1`
                    : ''}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </Demo>
  )
}
