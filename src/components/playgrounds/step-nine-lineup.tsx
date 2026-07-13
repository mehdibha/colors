import { useState } from 'react'
import { converter } from 'culori'

import { Demo } from '@/components/demo'
import { ToggleButton } from '@/ui/toggle-button'
import { ToggleButtonGroup } from '@/ui/toggle-button-group'

const toOklch = converter('oklch')

// Every step 9 from radix-ui/colors light.ts, in the palette's own order.
const NINES = [
  { name: 'gray', hex: '#8d8d8d' },
  { name: 'mauve', hex: '#8e8c99' },
  { name: 'slate', hex: '#8b8d98' },
  { name: 'sage', hex: '#868e8b' },
  { name: 'olive', hex: '#898e87' },
  { name: 'sand', hex: '#8d8d86' },
  { name: 'tomato', hex: '#e54d2e' },
  { name: 'red', hex: '#e5484d' },
  { name: 'ruby', hex: '#e54666' },
  { name: 'crimson', hex: '#e93d82' },
  { name: 'pink', hex: '#d6409f' },
  { name: 'plum', hex: '#ab4aba' },
  { name: 'purple', hex: '#8e4ec6' },
  { name: 'violet', hex: '#6e56cf' },
  { name: 'iris', hex: '#5b5bd6' },
  { name: 'indigo', hex: '#3e63dd' },
  { name: 'blue', hex: '#0090ff' },
  { name: 'cyan', hex: '#00a2c7' },
  { name: 'teal', hex: '#12a594' },
  { name: 'jade', hex: '#29a383' },
  { name: 'green', hex: '#30a46c' },
  { name: 'grass', hex: '#46a758' },
  { name: 'brown', hex: '#ad7f58' },
  { name: 'bronze', hex: '#a18072' },
  { name: 'gold', hex: '#978365' },
  { name: 'sky', hex: '#7ce2fe' },
  { name: 'mint', hex: '#86ead4' },
  { name: 'lime', hex: '#bdee63' },
  { name: 'yellow', hex: '#ffe629' },
  { name: 'amber', hex: '#ffc53d' },
  { name: 'orange', hex: '#f76b15' },
].map((n) => ({ ...n, l: toOklch(n.hex)?.l ?? 0 }))

const BY_L = [...NINES].sort((a, b) => a.l - b.l)

export function StepNineLineup() {
  const [sorted, setSorted] = useState(false)
  const items = sorted ? BY_L : NINES

  return (
    <Demo
      caption={
        <>
          All 31 step&nbsp;9s from the light palette. Sorted by lightness, the
          hand shows: solids live wherever their hue&rsquo;s chroma peak lives
          &mdash; iris down at L&nbsp;0.540, yellow up at 0.918 &mdash; not on a
          shared skeleton. Tailwind holds blue and red within ~3 L points at the
          500 slot; Radix lets them drift 38.
        </>
      }
    >
      <div className="flex flex-col gap-3">
        <ToggleButtonGroup
          selectionMode="single"
          disallowEmptySelection
          selectedKeys={[sorted ? 'lightness' : 'palette']}
          onSelectionChange={(keys) => {
            setSorted([...keys][0] === 'lightness')
          }}
          size="sm"
          aria-label="Order"
          className="max-w-full overflow-x-auto"
        >
          <ToggleButton id="palette">Palette order</ToggleButton>
          <ToggleButton id="lightness">Sorted by L</ToggleButton>
        </ToggleButtonGroup>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(56px,1fr))] gap-1.5">
          {items.map((n) => (
            <div key={n.name} className="flex min-w-0 flex-col gap-0.5">
              <div
                className="h-9 rounded-md border"
                style={{ backgroundColor: n.hex }}
              />
              <span className="truncate text-[0.6rem] text-fg-muted">
                {n.name}
              </span>
              <span className="font-mono text-[0.55rem] text-fg-muted tabular-nums">
                {n.l.toFixed(3)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </Demo>
  )
}
