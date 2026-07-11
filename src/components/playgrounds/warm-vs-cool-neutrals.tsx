import { useState } from 'react'

import { Demo } from '@/components/demo'
import { ToggleButton } from '@/ui/toggle-button'
import { ToggleButtonGroup } from '@/ui/toggle-button-group'

interface Ramp {
  label: string
  note: string
  steps: string[]
}

// Radix light ramps, verified by name from radix-ui/colors light.ts.
const RAMPS = {
  sand: {
    label: 'Sand (warm)',
    note: 'tinted toward yellow, h ≈ 107',
    steps: [
      '#fdfdfc',
      '#f9f9f8',
      '#f1f0ef',
      '#e9e8e6',
      '#e2e1de',
      '#dad9d6',
      '#cfceca',
      '#bcbbb5',
      '#8d8d86',
      '#82827c',
      '#63635e',
      '#21201c',
    ],
  },
  gray: {
    label: 'Gray (pure)',
    note: 'C 0.000 at every step',
    steps: [
      '#fcfcfc',
      '#f9f9f9',
      '#f0f0f0',
      '#e8e8e8',
      '#e0e0e0',
      '#d9d9d9',
      '#cecece',
      '#bbbbbb',
      '#8d8d8d',
      '#838383',
      '#646464',
      '#202020',
    ],
  },
  slate: {
    label: 'Slate (cool)',
    note: 'tinted toward blue, h ≈ 278',
    steps: [
      '#fcfcfd',
      '#f9f9fb',
      '#f0f0f3',
      '#e8e8ec',
      '#e0e1e6',
      '#d9d9e0',
      '#cdced6',
      '#b9bbc6',
      '#8b8d98',
      '#80838d',
      '#60646c',
      '#1c2024',
    ],
  },
} satisfies Record<string, Ramp>

type RampId = keyof typeof RAMPS

export function WarmVsCoolNeutrals() {
  const [ramp, setRamp] = useState<RampId>('sand')
  const active: Ramp = RAMPS[ramp]
  const s = (n: number) => active.steps[n - 1] ?? '#000000'

  return (
    <Demo
      caption={
        <>
          No accent anywhere on this screen &mdash; the temperature is carried
          entirely by which whisper the neutrals hold. Warm reads paper and
          print; cool reads tool and dashboard; pure sits between and commits to
          neither.
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div
          className="flex overflow-hidden rounded-lg border"
          style={{ backgroundColor: s(1), borderColor: s(6) }}
        >
          <aside
            className="hidden w-32 shrink-0 flex-col gap-1 border-r p-2 sm:flex"
            style={{ backgroundColor: s(2), borderColor: s(6) }}
          >
            <span
              className="rounded-md px-2 py-1 text-xs font-medium"
              style={{ backgroundColor: s(5), color: s(12) }}
            >
              Notes
            </span>
            {['Projects', 'Archive'].map((item) => (
              <span
                key={item}
                className="px-2 py-1 text-xs"
                style={{ color: s(11) }}
              >
                {item}
              </span>
            ))}
          </aside>
          <main className="flex flex-1 flex-col gap-2 p-4">
            <span className="text-sm font-semibold" style={{ color: s(12) }}>
              Meeting notes
            </span>
            <span className="text-xs" style={{ color: s(11) }}>
              Ship dates moved to Thursday. Design review pending.
            </span>
            <div
              className="mt-1 rounded-md border p-2"
              style={{ borderColor: s(7), backgroundColor: s(3) }}
            >
              <span className="text-xs" style={{ color: s(11) }}>
                3 unresolved comments
              </span>
            </div>
          </main>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <ToggleButtonGroup
            selectionMode="single"
            disallowEmptySelection
            selectedKeys={[ramp]}
            onSelectionChange={(keys) => {
              const id = [...keys][0]
              if (typeof id === 'string' && id in RAMPS) setRamp(id as RampId)
            }}
            size="sm"
            aria-label="Neutral ramp"
            className="max-w-full overflow-x-auto"
          >
            {Object.entries(RAMPS).map(([id, r]) => (
              <ToggleButton key={id} id={id}>
                {r.label}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
          <span
            className="font-mono text-[0.65rem] text-fg-muted"
            aria-live="polite"
          >
            {active.note}
          </span>
        </div>
      </div>
    </Demo>
  )
}
