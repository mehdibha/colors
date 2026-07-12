import { useState } from 'react'
import { wcagContrast } from 'culori'

import { Demo } from '@/components/demo'
import { ToggleButton } from '@/ui/toggle-button'
import { ToggleButtonGroup } from '@/ui/toggle-button-group'

import { ratioOfTones } from './material-hct-data'

// Scheme.light / Scheme.dark for the baseline seed #6750a4 (material-color-utilities).
interface RoleFill {
  hex: string
  tone: number
  label: string
}

const ROLES: Record<string, { light: RoleFill; dark: RoleFill }> = {
  surface: {
    light: { hex: '#fffbff', tone: 99, label: 'N99' },
    dark: { hex: '#1c1b1e', tone: 10, label: 'N10' },
  },
  onSurface: {
    light: { hex: '#1c1b1e', tone: 10, label: 'N10' },
    dark: { hex: '#e6e1e6', tone: 90, label: 'N90' },
  },
  onSurfaceVariant: {
    light: { hex: '#49454e', tone: 30, label: 'NV30' },
    dark: { hex: '#cac4cf', tone: 80, label: 'NV80' },
  },
  outline: {
    light: { hex: '#7a757f', tone: 50, label: 'NV50' },
    dark: { hex: '#948f99', tone: 60, label: 'NV60' },
  },
  primary: {
    light: { hex: '#6750a4', tone: 40, label: 'P40' },
    dark: { hex: '#cfbcff', tone: 80, label: 'P80' },
  },
  onPrimary: {
    light: { hex: '#ffffff', tone: 100, label: 'P100' },
    dark: { hex: '#381e72', tone: 20, label: 'P20' },
  },
  primaryContainer: {
    light: { hex: '#e9ddff', tone: 90, label: 'P90' },
    dark: { hex: '#4f378a', tone: 30, label: 'P30' },
  },
  onPrimaryContainer: {
    light: { hex: '#22005d', tone: 10, label: 'P10' },
    dark: { hex: '#e9ddff', tone: 90, label: 'P90' },
  },
  secondaryContainer: {
    light: { hex: '#e8def8', tone: 90, label: 'S90' },
    dark: { hex: '#4a4458', tone: 30, label: 'S30' },
  },
  onSecondaryContainer: {
    light: { hex: '#1e192b', tone: 10, label: 'S10' },
    dark: { hex: '#e8def8', tone: 90, label: 'S90' },
  },
}

const PAIRS = [
  ['onPrimary', 'primary'],
  ['onPrimaryContainer', 'primaryContainer'],
  ['onSecondaryContainer', 'secondaryContainer'],
  ['onSurface', 'surface'],
] as const

export function M3RoleCard() {
  const [mode, setMode] = useState<'light' | 'dark'>('light')
  const r = (name: keyof typeof ROLES): RoleFill => {
    const role = ROLES[name]
    return role ? role[mode] : { hex: '#000000', tone: 0, label: '?' }
  }

  return (
    <Demo
      caption={
        <>
          The baseline scheme&rsquo;s roles are tone assignments, and the mode
          switch is arithmetic: every role re-picks a tone from the same five
          palettes. Note the asymmetry chapter 16 demanded — primary goes
          40&nbsp;→&nbsp;80, not to a mirror — and note that every
          pairing&rsquo;s ratio was decided the moment the two tone numbers
          were.
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
          aria-label="Theme mode"
        >
          <ToggleButton id="light">Light</ToggleButton>
          <ToggleButton id="dark">Dark</ToggleButton>
        </ToggleButtonGroup>

        <div
          className="rounded-lg border p-5"
          style={{
            backgroundColor: r('surface').hex,
            borderColor: r('outline').hex,
          }}
        >
          <p
            className="text-sm font-medium"
            style={{ color: r('onSurface').hex }}
          >
            Inbox zero, almost
          </p>
          <p
            className="mt-1 text-sm"
            style={{ color: r('onSurfaceVariant').hex }}
          >
            Three messages left, and one of them is from Future You.
          </p>
          <div
            className="mt-3 rounded-md px-3 py-2 text-sm"
            style={{ backgroundColor: r('primaryContainer').hex }}
          >
            <span style={{ color: r('onPrimaryContainer').hex }}>
              Draft saved to primary container
            </span>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span
              className="rounded-full px-4 py-1.5 text-sm font-medium"
              style={{
                backgroundColor: r('primary').hex,
                color: r('onPrimary').hex,
              }}
            >
              Reply
            </span>
            <span
              className="rounded-full px-4 py-1.5 text-sm"
              style={{
                backgroundColor: r('secondaryContainer').hex,
                color: r('onSecondaryContainer').hex,
              }}
            >
              Snooze
            </span>
          </div>
        </div>

        <div
          aria-live="polite"
          className="flex flex-col gap-1 font-mono text-[0.65rem] text-fg-muted tabular-nums"
        >
          {PAIRS.map(([fg, bg]) => {
            const f = r(fg)
            const b = r(bg)
            const delta = Math.abs(f.tone - b.tone)
            return (
              <span key={fg}>
                {fg} on {bg} — {f.label} on {b.label} — Δ{delta} → predicted{' '}
                {ratioOfTones(f.tone, b.tone).toFixed(2)}:1, measured{' '}
                {wcagContrast(f.hex, b.hex).toFixed(2)}:1
              </span>
            )
          })}
        </div>
      </div>
    </Demo>
  )
}
