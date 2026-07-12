import { useMemo, useState } from 'react'

import { apcaLc } from '@/lib/apca'
import { Demo } from '@/components/demo'
import { ToggleButton } from '@/ui/toggle-button'
import { ToggleButtonGroup } from '@/ui/toggle-button-group'

import {
  dEok,
  labLightness,
  LEONARDO_BLUE_KEYS,
  makeScale,
  solveApca,
  solveWcag,
  wcagRatio,
} from './leonardo-mini'

const SCALE = makeScale(LEONARDO_BLUE_KEYS)
const BGS = { light: '#f8f8f8', dark: '#1d1d1d' } as const

export function MeterSwapSolve() {
  const [mode, setMode] = useState<keyof typeof BGS>('light')
  const bg = BGS[mode]

  const { wcagPick, apcaPick } = useMemo(
    () => ({
      wcagPick: solveWcag(SCALE, bg, 4.5),
      apcaPick: solveApca(SCALE, bg, 75),
    }),
    [bg],
  )
  const gap = dEok(wcagPick.hex, apcaPick.hex)

  const picks = [
    { label: 'formula: wcag2, target 4.5:1', hex: wcagPick.hex },
    { label: 'formula: wcag3, target Lc 75', hex: apcaPick.hex },
  ]

  return (
    <Demo
      caption={
        <>
          The same scale solved twice — once to WCAG 4.5:1, once to APCA Lc 75,
          chapter 8's rough bridge pair. On the light background the picks sit
          ΔEok 0.061 apart: close, arguable. Switch to the dark background and
          they're 0.258 apart — the WCAG pick scores Lc −36, deep below APCA's
          body-text floor, because the ratio's flare term over-credits dark
          pairs. The solver guarantees exactly what its ruler measures.
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
          aria-label="Theme background"
          className="max-w-full overflow-x-auto"
        >
          <ToggleButton id="light">Light bg ({BGS.light})</ToggleButton>
          <ToggleButton id="dark">Dark bg ({BGS.dark})</ToggleButton>
        </ToggleButtonGroup>

        <div className="grid gap-3 sm:grid-cols-2">
          {picks.map(({ label, hex }) => {
            const ratio = wcagRatio(hex, bg)
            const lc = apcaLc(hex, bg)
            const labelColor = labLightness(bg) >= 50 ? '#3f3f46' : '#a1a1aa'
            return (
              <div key={label} className="flex flex-col gap-2">
                <div
                  className="rounded-lg border p-4"
                  style={{ backgroundColor: bg }}
                >
                  <span
                    className="mb-2 block font-mono text-[0.65rem]"
                    style={{ color: labelColor }}
                  >
                    {label}
                  </span>
                  <p className="text-sm font-medium" style={{ color: hex }}>
                    Body text solved to a target — {hex}
                  </p>
                </div>
                <div
                  aria-live="polite"
                  className="flex flex-wrap gap-x-3 gap-y-1 font-mono text-xs tabular-nums"
                >
                  <span>{ratio.toFixed(2)}:1</span>
                  <span>Lc {lc.toFixed(1)}</span>
                </div>
              </div>
            )
          })}
        </div>

        <p aria-live="polite" className="text-xs text-fg-muted tabular-nums">
          Distance between the two picks: ΔEok{' '}
          <span className="font-mono">{gap.toFixed(3)}</span>
        </p>
      </div>
    </Demo>
  )
}
