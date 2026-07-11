import { useState } from 'react'

import { Demo } from '@/components/demo'
import { ToggleButton } from '@/ui/toggle-button'
import { ToggleButtonGroup } from '@/ui/toggle-button-group'

// dotUI accent/success primitives (registry base/colors.css), oklch → hex via culori.
const BLUE = { 100: '#d0edff', 700: '#1a5c9b', 800: '#0f487b' }
const GREEN = { 100: '#b0ffbf', 700: '#00711e', 800: '#005912' }

type Brand = 'blue' | 'green'

function MiniCard({ brand }: { brand: Brand }) {
  const c = brand === 'blue' ? BLUE : GREEN
  return (
    <div className="flex flex-col gap-2 rounded-lg border bg-white p-3">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-[#070707]">Invoices</span>
        <span
          className="rounded-full px-2 py-0.5 text-[0.6rem] font-medium"
          style={{ backgroundColor: c[100], color: c[800] }}
        >
          4 due
        </span>
      </div>
      <span className="text-[0.7rem] text-[#626262]">
        Next payout on Friday
      </span>
      <div className="flex items-center gap-2.5">
        <span
          className="rounded-md px-2.5 py-1 text-[0.7rem] font-medium text-white"
          style={{ backgroundColor: c[700] }}
        >
          Review
        </span>
        <span className="text-[0.7rem] font-medium" style={{ color: c[800] }}>
          See history
        </span>
      </div>
    </div>
  )
}

function DiffLine({ from, to }: { from: string; to: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-fg-danger">− {from}</span>
      <span className="text-fg">+ {to}</span>
    </div>
  )
}

export function NumericVsSemantic() {
  const [brand, setBrand] = useState<Brand>('blue')
  const green = brand === 'green'

  return (
    <Demo
      caption={
        <>
          The same rebrand in two dialects. Numeric names pin the hue into every
          call site &mdash; the rebrand is a find-and-replace across the
          codebase, four edits in this one card. Semantic names moved the
          decision into the theme &mdash; one alias re-points and every consumer
          follows, untouched.
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
              if (next === 'blue' || next === 'green') setBrand(next)
            }}
            size="sm"
            aria-label="Brand color"
            className="max-w-full overflow-x-auto"
          >
            <ToggleButton id="blue">Blue</ToggleButton>
            <ToggleButton id="green">Rebrand to green</ToggleButton>
          </ToggleButtonGroup>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <span className="text-xs text-fg-muted">
              Numeric dialect — <span className="font-mono">bg-blue-700</span>
            </span>
            <MiniCard brand={brand} />
            <div className="min-h-24 rounded-md bg-muted/50 p-2.5 font-mono text-[0.6rem] leading-relaxed">
              {green ? (
                <>
                  <DiffLine from="bg-blue-700" to="bg-green-700" />
                  <DiffLine from="text-blue-800" to="text-green-800" />
                  <DiffLine from="bg-blue-100" to="bg-green-100" />
                  <DiffLine from="text-blue-800" to="text-green-800" />
                </>
              ) : (
                <span className="text-fg-muted">
                  4 edits waiting, in this card alone
                </span>
              )}
            </div>
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <span className="text-xs text-fg-muted">
              Semantic dialect — <span className="font-mono">bg-accent</span>
            </span>
            <MiniCard brand={brand} />
            <div className="min-h-24 rounded-md bg-muted/50 p-2.5 font-mono text-[0.6rem] leading-relaxed">
              {green ? (
                <>
                  <span className="text-fg-muted">theme.css, one line</span>
                  <DiffLine
                    from="--accent: var(--blue)"
                    to="--accent: var(--green)"
                  />
                </>
              ) : (
                <span className="text-fg-muted">
                  1 edit waiting, in the theme
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Demo>
  )
}
