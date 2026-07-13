import { useState } from 'react'
import { wcagContrast } from 'culori'

import { cn } from '@/lib/utils'
import { Demo } from '@/components/demo'
import { ToggleButton } from '@/ui/toggle-button'
import { ToggleButtonGroup } from '@/ui/toggle-button-group'

const RING = '#0090ff'
const CONTROL = '#0090ff'
const INNER = '#ffffff'
const OUTER = '#1c2024'

const PANELS = [
  { name: 'White page', bg: '#ffffff' },
  { name: 'Tinted section (blue 3)', bg: '#e6f4fe' },
  { name: 'Dark section (slate dark 1)', bg: '#111113' },
]

type Style = 'solid' | 'offset' | 'two-tone'

function ringShadow(style: Style, pageBg: string): string {
  if (style === 'solid') return `0 0 0 2px ${RING}`
  if (style === 'offset') return `0 0 0 2px ${pageBg}, 0 0 0 4px ${RING}`
  return `0 0 0 2px ${INNER}, 0 0 0 4px ${OUTER}`
}

// The two frontiers 1.4.11 measures: the ring against what it touches on each side.
function frontiers(style: Style, pageBg: string) {
  if (style === 'solid')
    return [
      { label: 'ring vs control', ratio: wcagContrast(RING, CONTROL) },
      { label: 'ring vs page', ratio: wcagContrast(RING, pageBg) },
    ]
  if (style === 'offset')
    return [
      { label: 'gap vs control', ratio: wcagContrast(pageBg, CONTROL) },
      { label: 'ring vs page', ratio: wcagContrast(RING, pageBg) },
    ]
  return [
    { label: 'inner vs control', ratio: wcagContrast(INNER, CONTROL) },
    { label: 'outer vs page', ratio: wcagContrast(OUTER, pageBg) },
  ]
}

export function FocusRingTwoFrontiers() {
  const [style, setStyle] = useState<Style>('solid')

  return (
    <Demo
      caption={
        <>
          The same focus ring token on three page surfaces. A solid blue-9 ring
          clears 3:1 on white (3.26) and on the dark section (5.78), fails on
          the brand-tinted panel (2.91) &mdash; and is invisible against the
          control it wraps (1.00). The offset repaints the control frontier with
          the page color; the two-tone ring carries both frontiers with it.
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs text-fg-muted">Ring construction</span>
          <ToggleButtonGroup
            selectionMode="single"
            disallowEmptySelection
            selectedKeys={[style]}
            onSelectionChange={(keys) => {
              const next = [...keys][0]
              if (next === 'solid' || next === 'offset' || next === 'two-tone')
                setStyle(next)
            }}
            size="sm"
            aria-label="Focus ring construction"
            className="max-w-full overflow-x-auto"
          >
            <ToggleButton id="solid">Solid ring</ToggleButton>
            <ToggleButton id="offset">Ring + offset</ToggleButton>
            <ToggleButton id="two-tone">Two-tone</ToggleButton>
          </ToggleButtonGroup>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {PANELS.map((p) => (
            <div
              key={p.name}
              className="flex flex-col items-center gap-3 rounded-lg border px-3 py-5"
              style={{ backgroundColor: p.bg }}
            >
              <span
                className="rounded-md px-3.5 py-2 text-xs font-medium text-white"
                style={{
                  backgroundColor: CONTROL,
                  boxShadow: ringShadow(style, p.bg),
                }}
              >
                Focused
              </span>
              <div
                aria-live="polite"
                className="flex flex-col gap-0.5 font-mono text-[0.6rem] tabular-nums"
                style={{ color: p.bg === '#111113' ? '#b0b4ba' : '#60646c' }}
              >
                <span className="font-sans text-[0.65rem]">{p.name}</span>
                {frontiers(style, p.bg).map((f) => (
                  <span
                    key={f.label}
                    className={cn(f.ratio < 3 && 'font-semibold')}
                  >
                    {f.label}: {f.ratio.toFixed(2)}:1 {f.ratio >= 3 ? '✓' : '✕'}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Demo>
  )
}
