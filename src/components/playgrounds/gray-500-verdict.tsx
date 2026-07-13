import { useState } from 'react'
import { clampRgb, converter, formatHex, wcagContrast } from 'culori'

import { apcaLc } from '@/lib/apca'
import { Demo } from '@/components/demo'
import { ToggleButton } from '@/ui/toggle-button'
import { ToggleButtonGroup } from '@/ui/toggle-button-group'

import { twFamily, twOklch } from './tailwind-v4-palette'

const toRgb = converter('rgb')
const hexOf = (family: string, stepIndex: number) => {
  const s = twFamily(family).steps[stepIndex]
  return s ? formatHex(clampRgb(toRgb(twOklch(s)))) : '#000000'
}

const PAIRS = [
  {
    id: 'docs',
    label: 'text-gray-500 / bg-white',
    note: "the docs' own card",
    text: hexOf('gray', 5),
    bg: '#ffffff',
  },
  {
    id: 'subtle',
    label: 'text-gray-500 / bg-gray-100',
    note: 'same text, subtle-background convention',
    text: hexOf('gray', 5),
    bg: hexOf('gray', 1),
  },
  {
    id: 'placeholder',
    label: 'text-gray-400 / bg-white',
    note: 'the usual placeholder gray',
    text: hexOf('gray', 4),
    bg: '#ffffff',
  },
  {
    id: 'olive',
    label: 'text-olive-500 / bg-white',
    note: 'same slot, family added in v4.2',
    text: hexOf('olive', 5),
    bg: '#ffffff',
  },
]

export function Gray500Verdict() {
  const [id, setId] = useState('docs')
  const pair = PAIRS.find((p) => p.id === id) ?? PAIRS[0]
  if (!pair) return null
  const ratio = wcagContrast(pair.text, pair.bg)
  const lc = apcaLc(pair.text, pair.bg)
  const pass = ratio >= 4.5

  return (
    <Demo
      caption={
        <>
          The muted-text convention, checked. On white, gray-500 clears
          AA&nbsp;normal text by 0.34 — luck, not policy: slide the same
          convention onto a gray-100 card or swap in olive-500 (added in v4.2,
          same slot number) and it fails, and nothing in the system says so.
          Radix writes this exact promise down per scale; Tailwind&rsquo;s
          colors doc never contains the word &ldquo;contrast&rdquo;.
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <ToggleButtonGroup
          selectionMode="single"
          disallowEmptySelection
          selectedKeys={[id]}
          onSelectionChange={(keys) => {
            const next = [...keys][0]
            if (typeof next === 'string') setId(next)
          }}
          size="sm"
          aria-label="Text and background pair"
          className="max-w-full overflow-x-auto"
        >
          {PAIRS.map((p) => (
            <ToggleButton key={p.id} id={p.id}>
              {p.label}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>

        <div
          className="rounded-lg border p-5"
          style={{ backgroundColor: pair.bg }}
        >
          <p
            className="text-sm font-medium"
            style={{ color: hexOf('gray', 9) }}
          >
            Writes upside-down
          </p>
          <p className="mt-1 text-sm" style={{ color: pair.text }}>
            The Zero Gravity Pen can be used to write in any orientation,
            including upside-down. It even works in outer space.
          </p>
        </div>

        <div
          aria-live="polite"
          className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs tabular-nums"
        >
          <span className="text-fg-muted">{pair.note}</span>
          <span className="font-mono">{pair.text}</span>
          <span>WCAG {ratio.toFixed(2)}:1</span>
          <span>Lc {lc.toFixed(1)}</span>
          <span
            className={
              pass ? 'font-medium text-success' : 'font-medium text-danger'
            }
          >
            {pass ? 'passes 4.5:1' : 'fails 4.5:1'}
          </span>
        </div>
      </div>
    </Demo>
  )
}
