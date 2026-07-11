import { useState } from 'react'

import { cn } from '@/lib/utils'
import { Demo } from '@/components/demo'
import { ToggleButton } from '@/ui/toggle-button'
import { ToggleButtonGroup } from '@/ui/toggle-button-group'

// Radix blue + violet, light.ts hexes.
const SCALES = {
  blue: {
    3: '#e6f4fe',
    6: '#acd8fc',
    9: '#0090ff',
    11: '#0d74ce',
  },
  violet: {
    3: '#f4f0fe',
    6: '#d4cafe',
    9: '#6e56cf',
    11: '#6550b9',
  },
}

type Brand = keyof typeof SCALES

const NUMERIC = [
  { file: 'Card.tsx', code: (b: Brand) => `border-${b}-6`, changes: true },
  {
    file: 'Badge.tsx',
    code: (b: Brand) => `bg-${b}-3 text-${b}-11`,
    changes: true,
  },
  {
    file: 'Button.tsx',
    code: (b: Brand) => `bg-${b}-9 text-white`,
    changes: true,
  },
  { file: 'Link.tsx', code: (b: Brand) => `text-${b}-11`, changes: true },
  { file: 'Menu.tsx', code: (b: Brand) => `bg-${b}-3`, changes: true },
]

const SEMANTIC = [
  {
    file: 'theme.css',
    code: (b: Brand) => `--accent-*: var(--${b}-*)`,
    changes: true,
  },
  { file: 'Card.tsx', code: () => 'border-accent-subtle', changes: false },
  {
    file: 'Badge.tsx',
    code: () => 'bg-accent-muted text-fg-accent',
    changes: false,
  },
  {
    file: 'Button.tsx',
    code: () => 'bg-accent text-fg-on-accent',
    changes: false,
  },
  { file: 'Link.tsx', code: () => 'text-fg-accent', changes: false },
  { file: 'Menu.tsx', code: () => 'bg-accent-muted', changes: false },
]

function MiniUi({ brand }: { brand: Brand }) {
  const s = SCALES[brand]
  return (
    <div
      className="flex flex-col gap-2 rounded-lg border bg-white p-3"
      style={{ borderColor: s[6] }}
    >
      <div className="flex items-center gap-2">
        <span
          className="rounded-md px-2 py-0.5 text-[0.65rem] font-medium"
          style={{ backgroundColor: s[3], color: s[11] }}
        >
          Active
        </span>
        <span className="text-[0.7rem] font-medium" style={{ color: s[11] }}>
          View plan
        </span>
      </div>
      <span
        className="self-start rounded-md px-2.5 py-1 text-[0.7rem] font-medium"
        style={{ backgroundColor: s[9], color: '#ffffff' }}
      >
        Upgrade
      </span>
    </div>
  )
}

function CodeColumn({
  title,
  lines,
  brand,
  edits,
}: {
  title: string
  lines: { file: string; code: (b: Brand) => string; changes: boolean }[]
  brand: Brand
  edits: string
}) {
  const rebranded = brand !== 'blue'
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-2">
      <span className="text-xs font-medium">{title}</span>
      <MiniUi brand={brand} />
      <div className="flex flex-col gap-0.5">
        {lines.map((l) => (
          <div
            key={l.file}
            className={cn(
              'flex items-baseline gap-2 rounded px-2 py-1',
              rebranded && l.changes && 'bg-warning-muted',
            )}
          >
            <span className="w-18 shrink-0 text-[0.6rem] text-fg-muted">
              {l.file}
            </span>
            <code className="font-mono text-[0.65rem]">{l.code(brand)}</code>
          </div>
        ))}
      </div>
      <span aria-live="polite" className="text-[0.65rem] text-fg-muted">
        {rebranded ? edits : 'the original — no edits yet'}
      </span>
    </div>
  )
}

export function NumericVsSemantic() {
  const [brand, setBrand] = useState<Brand>('blue')

  return (
    <Demo
      caption={
        <>
          The pixels are identical in both columns &mdash; naming is invisible
          on screen. Switch the brand and the difference appears in the diff:
          numeric names are woven through every component; the semantic layer
          concentrates the same decision into one line.
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs text-fg-muted">Brand</span>
          <ToggleButtonGroup
            selectionMode="single"
            disallowEmptySelection
            selectedKeys={[brand]}
            onSelectionChange={(keys) => {
              const next = [...keys][0]
              if (next === 'blue' || next === 'violet') setBrand(next)
            }}
            size="sm"
            aria-label="Brand color"
            className="max-w-full overflow-x-auto"
          >
            <ToggleButton id="blue">Blue</ToggleButton>
            <ToggleButton id="violet">Rebrand to violet</ToggleButton>
          </ToggleButtonGroup>
        </div>
        <div className="flex flex-col gap-5 sm:flex-row">
          <CodeColumn
            title="Numeric names"
            lines={NUMERIC}
            brand={brand}
            edits="5 edits across 5 files — and nothing found them but grep"
          />
          <CodeColumn
            title="Semantic names"
            lines={SEMANTIC}
            brand={brand}
            edits="1 edit in 1 file — the components never heard about it"
          />
        </div>
      </div>
    </Demo>
  )
}
