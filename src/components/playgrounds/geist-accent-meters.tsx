import { useState } from 'react'
import { wcagContrast } from 'culori'

import { apcaLc } from '@/lib/apca'
import { cn } from '@/lib/utils'
import { Demo } from '@/components/demo'
import { ToggleButton } from '@/ui/toggle-button'
import { ToggleButtonGroup } from '@/ui/toggle-button-group'

type Step = '600' | '700' | '800'

// Geist blue solids, verified from vercel.com/design.md. 700 is the primary.
const BLUE: Record<Step, string> = {
  '600': '#48aeff',
  '700': '#006bff',
  '800': '#0059ec',
}

export function GeistAccentMeters() {
  const [step, setStep] = useState<Step>('700')
  const solid = BLUE[step]
  const wW = wcagContrast('#ffffff', solid)
  const wB = wcagContrast('#000000', solid)
  const aW = apcaLc('#ffffff', solid)
  const aB = apcaLc('#000000', solid)
  const pick = wW >= wB ? 'white' : 'black'
  const label = pick === 'white' ? '#ffffff' : '#000000'

  return (
    <Demo
      caption={
        <>
          Step the solid across blue&rsquo;s neighbours. At 600 black wins, at
          800 white wins; 700 sits on the seam — WCAG a near-tie (white 4.62:1,
          black 4.55:1), APCA breaking it decisively for white. Geist parked its
          primary blue at 700, on the white side of the crossover. WCAG 2 is the
          floor; APCA predicts the read.
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-fg-muted">solid step</span>
          <ToggleButtonGroup
            selectionMode="single"
            disallowEmptySelection
            selectedKeys={[step]}
            onSelectionChange={(keys) => {
              const next = [...keys][0]
              if (next === '600' || next === '700' || next === '800')
                setStep(next)
            }}
            size="sm"
            aria-label="Geist blue solid step"
            className="max-w-full overflow-x-auto"
          >
            <ToggleButton id="600">blue-600</ToggleButton>
            <ToggleButton id="700">blue-700</ToggleButton>
            <ToggleButton id="800">blue-800</ToggleButton>
          </ToggleButtonGroup>
          {step === '700' && (
            <span className="text-[0.7rem] text-fg-muted">
              ← Geist&rsquo;s primary
            </span>
          )}
        </div>

        <div className="flex items-center gap-4">
          <span
            className="rounded-md px-4 py-2 text-sm font-medium"
            style={{ backgroundColor: solid, color: label }}
          >
            Deploy
          </span>
          <span className="font-mono text-[0.7rem] text-fg-muted tabular-nums">
            {solid} · auto-picks {pick}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-sm text-left font-mono text-[0.65rem] tabular-nums">
            <thead>
              <tr className="text-fg-muted">
                <th className="py-1 pr-3 font-normal">label</th>
                <th className="py-1 pr-3 font-normal">WCAG</th>
                <th className="py-1 font-normal">APCA</th>
              </tr>
            </thead>
            <tbody aria-live="polite">
              <tr className="border-t">
                <td className="py-1.5 pr-3">white</td>
                <td
                  className={cn(
                    'py-1.5 pr-3',
                    wW >= 4.5 ? 'text-fg-success' : 'text-fg-danger',
                  )}
                >
                  {wW.toFixed(2)}:1 {wW >= 4.5 ? '✓' : '✕'}
                </td>
                <td
                  className={cn(
                    'py-1.5',
                    Math.abs(aW) >= 60 ? 'text-fg-success' : 'text-fg-warning',
                  )}
                >
                  Lc {aW.toFixed(0)} {Math.abs(aW) >= 60 ? '✓' : '⚠'}
                </td>
              </tr>
              <tr className="border-t">
                <td className="py-1.5 pr-3">black</td>
                <td
                  className={cn(
                    'py-1.5 pr-3',
                    wB >= 4.5 ? 'text-fg-success' : 'text-fg-danger',
                  )}
                >
                  {wB.toFixed(2)}:1 {wB >= 4.5 ? '✓' : '✕'}
                </td>
                <td
                  className={cn(
                    'py-1.5',
                    Math.abs(aB) >= 60 ? 'text-fg-success' : 'text-fg-warning',
                  )}
                >
                  Lc {aB.toFixed(0)} {Math.abs(aB) >= 60 ? '✓' : '⚠'}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <span aria-live="polite" className="text-xs text-fg-muted">
          {step === '700'
            ? 'Both meters lean white — the pair is unambiguous. This is the slot Geist shipped.'
            : pick === 'black'
              ? 'Lighter solid — black wins here; a white label would fail the floor.'
              : 'Darker solid — white wins comfortably on both meters.'}
        </span>
      </div>
    </Demo>
  )
}
