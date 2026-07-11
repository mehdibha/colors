import { useState } from 'react'
import { wcagContrast } from 'culori'

import { apcaLc } from '@/lib/apca'
import { Demo } from '@/components/demo'
import { ToggleButton } from '@/ui/toggle-button'
import { ToggleButtonGroup } from '@/ui/toggle-button-group'

type Mode = 'light' | 'dark' | 'contrast'

// Radix slate / slateDark / blue / blueDark, verified against light.ts / dark.ts.
// The high-contrast column is constructed here with chapter 9's mechanism:
// same slots, values re-picked (border 6 → 9, muted text 11 → 12).
interface Resolved {
  primitive: string
  value: string
}

const TOKENS: { name: string; note: string; modes: Record<Mode, Resolved> }[] =
  [
    {
      name: 'bg',
      note: 'app background',
      modes: {
        light: { primitive: 'slate 1', value: '#fcfcfd' },
        dark: { primitive: 'slateDark 1', value: '#111113' },
        contrast: { primitive: 'white', value: '#ffffff' },
      },
    },
    {
      name: 'bg-elevated',
      note: 'raised surfaces',
      modes: {
        light: { primitive: 'slate 1', value: '#fcfcfd' },
        dark: { primitive: 'slateDark 3', value: '#212225' },
        contrast: { primitive: 'white', value: '#ffffff' },
      },
    },
    {
      name: 'border',
      note: 'separators',
      modes: {
        light: { primitive: 'slate 6', value: '#d9d9e0' },
        dark: { primitive: 'slateDark 6', value: '#363a3f' },
        contrast: { primitive: 'slate 9', value: '#8b8d98' },
      },
    },
    {
      name: 'fg-muted',
      note: 'secondary text',
      modes: {
        light: { primitive: 'slate 11', value: '#60646c' },
        dark: { primitive: 'slateDark 11', value: '#b0b4ba' },
        contrast: { primitive: 'slate 12', value: '#1c2024' },
      },
    },
    {
      name: 'fg',
      note: 'primary text',
      modes: {
        light: { primitive: 'slate 12', value: '#1c2024' },
        dark: { primitive: 'slateDark 12', value: '#edeef0' },
        contrast: { primitive: 'black', value: '#000000' },
      },
    },
    {
      name: 'fg-accent',
      note: 'links',
      modes: {
        light: { primitive: 'blue 11', value: '#0d74ce' },
        dark: { primitive: 'blueDark 11', value: '#70b8ff' },
        contrast: { primitive: 'blue 12', value: '#113264' },
      },
    },
  ]

const get = (name: string, mode: Mode) =>
  TOKENS.find((t) => t.name === name)?.modes[mode].value ?? '#000000'

export function ModeAliasTable() {
  const [mode, setMode] = useState<Mode>('light')

  const bg = get('bg', mode)
  const elevated = get('bg-elevated', mode)
  const border = get('border', mode)
  const muted = get('fg-muted', mode)
  const fg = get('fg', mode)
  const accent = get('fg-accent', mode)

  return (
    <Demo
      caption={
        <>
          One column of names, three columns of values. The component consumes{' '}
          <span className="font-mono">fg-muted</span> and never learns which
          room it&rsquo;s in; the theme re-points every slot per mode. Light and
          dark are Radix&rsquo;s shipped scales; the high-contrast column is
          constructed here with chapter 9&rsquo;s mechanism &mdash; same slots,
          stronger values.
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
            if (next === 'light' || next === 'dark' || next === 'contrast')
              setMode(next)
          }}
          size="sm"
          aria-label="Theme mode"
          className="max-w-full overflow-x-auto"
        >
          <ToggleButton id="light">Light</ToggleButton>
          <ToggleButton id="dark">Dark</ToggleButton>
          <ToggleButton id="contrast">High contrast</ToggleButton>
        </ToggleButtonGroup>

        <div
          className="flex flex-col gap-2 rounded-lg border p-3"
          style={{ backgroundColor: bg, borderColor: border }}
        >
          <div
            className="flex flex-col gap-1 rounded-md border p-3"
            style={{ backgroundColor: elevated, borderColor: border }}
          >
            <span className="text-xs font-medium" style={{ color: fg }}>
              Quarterly review
            </span>
            <span className="text-[0.7rem]" style={{ color: muted }}>
              Sarah · 2h ago
            </span>
            <span
              className="text-[0.7rem] font-medium"
              style={{ color: accent }}
            >
              Open thread
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-md text-left font-mono text-[0.65rem] tabular-nums">
            <thead>
              <tr className="text-fg-muted">
                <th className="py-1 pr-3 font-normal">token</th>
                <th className="py-1 pr-3 font-normal">resolves to</th>
                <th className="py-1 pr-3 font-normal">value</th>
                <th className="py-1 font-normal" />
              </tr>
            </thead>
            <tbody>
              {TOKENS.map((t) => {
                const r = t.modes[mode]
                return (
                  <tr key={t.name} className="border-t">
                    <td className="py-1.5 pr-3">{t.name}</td>
                    <td className="py-1.5 pr-3 text-fg-muted">{r.primitive}</td>
                    <td className="py-1.5 pr-3 text-fg-muted">{r.value}</td>
                    <td className="py-1.5">
                      <span
                        className="inline-block size-4 rounded-sm border align-middle"
                        style={{ backgroundColor: r.value }}
                      />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <span
          aria-live="polite"
          className="font-mono text-[0.65rem] text-fg-muted tabular-nums"
        >
          fg-muted on bg {wcagContrast(muted, bg).toFixed(2)}:1 · Lc{' '}
          {apcaLc(muted, bg).toFixed(1)} — fg-accent on bg{' '}
          {wcagContrast(accent, bg).toFixed(2)}:1 · Lc{' '}
          {apcaLc(accent, bg).toFixed(1)}
        </span>
      </div>
    </Demo>
  )
}
