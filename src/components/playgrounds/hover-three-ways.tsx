import { useState } from 'react'
import { clampChroma, converter, formatHex, interpolate } from 'culori'

import { Demo } from '@/components/demo'
import { ToggleButton } from '@/ui/toggle-button'
import { ToggleButtonGroup } from '@/ui/toggle-button-group'

const toOklch = converter('oklch')

// Radix blue9 is the same hex in light.ts and dark.ts; blue10 is not.
const REST = '#0090ff'
const DESIGNED = { light: '#0588f0', dark: '#3b9eff' }
const PAGE = { light: '#fcfcfd', dark: '#111113' }

function shiftL(hex: string, delta: number): string {
  const o = toOklch(hex)
  if (!o) return hex
  return formatHex(
    clampChroma(
      { mode: 'oklch' as const, l: o.l + delta, c: o.c ?? 0, h: o.h ?? 0 },
      'oklch',
    ),
  )
}

// 'rgb' = gamma-sRGB lerp, i.e. what compositing a translucent layer does
const mix = (
  hex: string,
  toward: string,
  amount: number,
  space: 'oklab' | 'rgb',
): string => formatHex(interpolate([hex, toward], space)(amount))

type Mode = 'light' | 'dark'

export function HoverThreeWays() {
  const [mode, setMode] = useState<Mode>('light')

  const candidates = [
    { label: 'Designed step (blue 10)', value: DESIGNED[mode] },
    { label: 'Computed: L − 0.04', value: shiftL(REST, -0.04) },
    {
      label: 'Computed: 8% black, oklab',
      value: mix(REST, '#000000', 0.08, 'oklab'),
    },
    {
      label: 'State layer: 8% white',
      value: mix(REST, '#ffffff', 0.08, 'rgb'),
    },
  ]
  const restL = toOklch(REST)?.l ?? 0

  return (
    <Demo
      caption={
        <>
          One solid, four hover derivations. Radix ships the same step-9 hex in
          both modes, but the designed hover flips direction: light blue 10
          darkens (L 0.649 &rarr; 0.622), dark blue 10 <em>lightens</em> (0.649
          &rarr; 0.688). The fixed &ldquo;darken&rdquo; rules keep marching down
          in the dark; the white state layer &mdash; the content color at 8%
          &mdash; lightens in both, which happens to be the dark room&rsquo;s
          answer.
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs text-fg-muted">Mode</span>
          <ToggleButtonGroup
            selectionMode="single"
            disallowEmptySelection
            selectedKeys={[mode]}
            onSelectionChange={(keys) => {
              const next = [...keys][0]
              if (next === 'light' || next === 'dark') setMode(next)
            }}
            size="sm"
            aria-label="Preview mode"
            className="max-w-full overflow-x-auto"
          >
            <ToggleButton id="light">Light</ToggleButton>
            <ToggleButton id="dark">Dark</ToggleButton>
          </ToggleButtonGroup>
        </div>

        <div
          aria-live="polite"
          className="grid grid-cols-1 gap-3 rounded-lg border p-4 sm:grid-cols-2 lg:grid-cols-4"
          style={{ backgroundColor: PAGE[mode] }}
        >
          {candidates.map((c) => {
            const l = toOklch(c.value)?.l ?? 0
            const dl = l - restL
            return (
              <div key={c.label} className="flex flex-col gap-1.5">
                <div className="flex flex-col gap-1">
                  <span
                    className="rounded-md px-3 py-2 text-center text-xs font-medium text-white"
                    style={{ backgroundColor: REST }}
                  >
                    Rest
                  </span>
                  <span
                    className="rounded-md px-3 py-2 text-center text-xs font-medium text-white"
                    style={{ backgroundColor: c.value }}
                  >
                    Hover
                  </span>
                </div>
                <span
                  className="text-[0.65rem]"
                  style={{ color: mode === 'dark' ? '#b0b4ba' : '#60646c' }}
                >
                  {c.label}
                </span>
                <span
                  className="font-mono text-[0.6rem] tabular-nums"
                  style={{ color: mode === 'dark' ? '#b0b4ba' : '#60646c' }}
                >
                  {c.value} · ΔL {dl >= 0 ? '+' : ''}
                  {dl.toFixed(3)}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </Demo>
  )
}
