import { useState } from 'react'
import { converter } from 'culori'

import { Demo } from '@/components/demo'
import { Switch } from '@/ui/switch'

const toLab = converter('lab')
const lstar = (hex: string) => (toLab(hex)?.l ?? 0).toFixed(1)

// Radix Colors light mode, from radix-ui/colors src/light.ts.
const BLUE = [
  '#fbfdff',
  '#f4faff',
  '#e6f4fe',
  '#d5efff',
  '#c2e5ff',
  '#acd8fc',
  '#8ec8f6',
  '#5eb1ef',
  '#0090ff',
  '#0588f0',
  '#0d74ce',
  '#113264',
]
const SLATE = [
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
]

const JOBS = [
  'App background',
  'Subtle background',
  'UI element background',
  'Hovered UI element background',
  'Active / Selected UI element background',
  'Subtle borders and separators',
  'UI element border and focus rings',
  'Hovered UI element border',
  'Solid backgrounds',
  'Hovered solid backgrounds',
  'Low-contrast text',
  'High-contrast text',
]

const GROUPS = [
  { label: 'Backgrounds', span: 2 },
  { label: 'Component states', span: 3 },
  { label: 'Borders', span: 3 },
  { label: 'Solids', span: 2 },
  { label: 'Text', span: 2 },
]

export function TwelveJobsLegend() {
  const [neutral, setNeutral] = useState(false)
  const scale = neutral ? SLATE : BLUE

  return (
    <Demo
      caption={
        <>
          Radix blue and slate, light mode, with L* under each step. The spacing
          between neighbors runs from 1.3 L* (steps 1–2) to 26.7 (steps 11–12),
          computed on unrounded values — even spacing was never the goal; the
          jobs dictate the spacing. Flip to slate: same slots, same jobs,
          different paint. That interchangeability is what makes swapping a
          scale a refactor instead of a redesign.
        </>
      }
    >
      <div className="flex flex-col gap-3">
        <div className="flex gap-1">
          {scale.map((hex, i) => (
            <div
              key={hex}
              className="flex min-w-0 flex-1 flex-col items-center gap-1"
            >
              <div
                className="h-12 w-full rounded-md border"
                style={{ backgroundColor: hex }}
                title={JOBS[i] ?? ''}
              />
              <span className="font-mono text-[0.65rem] text-fg">{i + 1}</span>
              <span className="font-mono text-[0.6rem] text-fg-muted tabular-nums">
                {lstar(hex)}
              </span>
            </div>
          ))}
        </div>
        <div className="flex gap-1">
          {GROUPS.map((g) => (
            <div
              key={g.label}
              className="border-t pt-1 text-center text-[0.65rem] text-fg-muted"
              style={{ flex: g.span }}
            >
              {g.label}
            </div>
          ))}
        </div>
        <Switch isSelected={neutral} onChange={setNeutral} size="sm">
          Show slate instead of blue
        </Switch>
      </div>
    </Demo>
  )
}
