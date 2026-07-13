import { useState } from 'react'
import { wcagContrast } from 'culori'

import { apcaLc } from '@/lib/apca'
import { cn } from '@/lib/utils'
import { Demo } from '@/components/demo'
import { ToggleButton } from '@/ui/toggle-button'
import { ToggleButtonGroup } from '@/ui/toggle-button-group'

type Mode = 'light' | 'dark' | 'contrast'

interface Cell {
  primitive: string
  hex: string
}

// Light/dark cells are Radix slate/slateDark/blue (light.ts / dark.ts hexes).
// The high-contrast column is ours — Radix ships no high-contrast set.
const TABLE: { token: string; cells: Record<Mode, Cell> }[] = [
  {
    token: 'bg',
    cells: {
      light: { primitive: 'slate-1', hex: '#fcfcfd' },
      dark: { primitive: 'slateDark-1', hex: '#111113' },
      contrast: { primitive: 'white', hex: '#ffffff' },
    },
  },
  {
    token: 'bg-card',
    cells: {
      light: { primitive: 'slate-2', hex: '#f9f9fb' },
      dark: { primitive: 'slateDark-2', hex: '#18191b' },
      contrast: { primitive: 'white', hex: '#ffffff' },
    },
  },
  {
    token: 'border',
    cells: {
      light: { primitive: 'slate-6', hex: '#d9d9e0' },
      dark: { primitive: 'slateDark-6', hex: '#363a3f' },
      contrast: { primitive: 'slate-12', hex: '#1c2024' },
    },
  },
  {
    token: 'fg',
    cells: {
      light: { primitive: 'slate-12', hex: '#1c2024' },
      dark: { primitive: 'slateDark-12', hex: '#edeef0' },
      contrast: { primitive: 'black', hex: '#000000' },
    },
  },
  {
    token: 'fg-muted',
    cells: {
      light: { primitive: 'slate-11', hex: '#60646c' },
      dark: { primitive: 'slateDark-11', hex: '#b0b4ba' },
      contrast: { primitive: 'slate-12', hex: '#1c2024' },
    },
  },
  {
    token: 'accent',
    cells: {
      light: { primitive: 'blue-9', hex: '#0090ff' },
      dark: { primitive: 'blue-9', hex: '#0090ff' },
      contrast: { primitive: 'blue-12', hex: '#113264' },
    },
  },
  {
    token: 'fg-on-accent',
    cells: {
      light: { primitive: 'white', hex: '#ffffff' },
      dark: { primitive: 'white', hex: '#ffffff' },
      contrast: { primitive: 'white', hex: '#ffffff' },
    },
  },
]

const cellFor = (token: string, mode: Mode): Cell =>
  TABLE.find((r) => r.token === token)?.cells[mode] ?? {
    primitive: 'black',
    hex: '#000000',
  }

export function ModeAliasTable() {
  const [mode, setMode] = useState<Mode>('light')

  const v = (token: string) => cellFor(token, mode).hex

  return (
    <Demo
      caption={
        <>
          One column of names, three columns of paint. The component below the
          toggle consumes only the names, so switching mode never touches it.
          The light and dark cells are Radix values; the high-contrast column is
          our own picks &mdash; chapter 9&rsquo;s point that{' '}
          <code>prefers-contrast</code> is new values in the same slots, not a
          new API.
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
          className="max-w-full self-start overflow-x-auto"
        >
          <ToggleButton id="light">Light</ToggleButton>
          <ToggleButton id="dark">Dark</ToggleButton>
          <ToggleButton id="contrast">High contrast</ToggleButton>
        </ToggleButtonGroup>

        <div
          className="flex flex-col gap-2 rounded-lg border p-3"
          style={{ backgroundColor: v('bg'), borderColor: v('border') }}
        >
          <div
            className="flex flex-col gap-1.5 rounded-md border p-3"
            style={{ backgroundColor: v('bg-card'), borderColor: v('border') }}
          >
            <span className="text-xs font-medium" style={{ color: v('fg') }}>
              Quarterly review
            </span>
            <span className="text-[0.7rem]" style={{ color: v('fg-muted') }}>
              Sarah · 2h ago
            </span>
            <span
              className="mt-1 self-start rounded-md px-2.5 py-1 text-[0.7rem] font-medium"
              style={{
                backgroundColor: v('accent'),
                color: v('fg-on-accent'),
              }}
            >
              Reply
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-100 text-left font-mono text-[0.65rem]">
            <thead>
              <tr className="text-fg-muted">
                <th className="py-1 pr-3 font-normal">semantic token</th>
                <th className="py-1 pr-3 font-normal">resolves to ({mode})</th>
                <th className="py-1 font-normal">value</th>
              </tr>
            </thead>
            <tbody>
              {TABLE.map((row) => {
                const cell = row.cells[mode]
                const changed = cell.primitive !== row.cells.light.primitive
                return (
                  <tr key={row.token} className="border-t">
                    <td className="py-1.5 pr-3">{row.token}</td>
                    <td
                      className={cn(
                        'py-1.5 pr-3',
                        changed ? 'font-medium' : 'text-fg-muted',
                      )}
                    >
                      {cell.primitive}
                      {mode === 'dark' &&
                        row.token === 'accent' &&
                        ' — same hex as light'}
                    </td>
                    <td className="py-1.5">
                      <span className="flex items-center gap-2 tabular-nums">
                        <span
                          className="size-3.5 rounded-sm border"
                          style={{ backgroundColor: cell.hex }}
                          aria-hidden
                        />
                        {cell.hex}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <p
          aria-live="polite"
          className="font-mono text-[0.65rem] text-fg-muted tabular-nums"
        >
          fg on bg {wcagContrast(v('fg'), v('bg')).toFixed(2)}:1 / Lc{' '}
          {apcaLc(v('fg'), v('bg')).toFixed(1)} · fg-muted on bg{' '}
          {wcagContrast(v('fg-muted'), v('bg')).toFixed(2)}:1 / Lc{' '}
          {apcaLc(v('fg-muted'), v('bg')).toFixed(1)} · fg-on-accent on accent{' '}
          {wcagContrast(v('fg-on-accent'), v('accent')).toFixed(2)}:1 / Lc{' '}
          {apcaLc(v('fg-on-accent'), v('accent')).toFixed(1)}
        </p>
      </div>
    </Demo>
  )
}
