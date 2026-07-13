import { useState } from 'react'
import { converter } from 'culori'

import { Demo } from '@/components/demo'
import { ToggleButton } from '@/ui/toggle-button'
import { ToggleButtonGroup } from '@/ui/toggle-button-group'

const toOklch = converter('oklch')

// radix-ui/colors light.ts: slate, sage, and the jade accent, by name.
const GRAYS = {
  slate: [
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
  sage: [
    '#fbfdfc',
    '#f7f9f8',
    '#eef1f0',
    '#e6e9e8',
    '#dfe2e0',
    '#d7dad9',
    '#cbcfcd',
    '#b8bcba',
    '#868e8b',
    '#7c8481',
    '#5f6563',
    '#1a211e',
  ],
} as const

const JADE = { s3: '#e6f7ed', s9: '#29a383', s11: '#208368' }
const JADE_H = toOklch(JADE.s9)?.h ?? 0

type GrayName = keyof typeof GRAYS

export function GrayPairingSwap() {
  const [gray, setGray] = useState<GrayName>('sage')
  const g = GRAYS[gray]
  const s = (n: number) => g[n - 1] ?? '#000000'
  const h9 = toOklch(s(9))?.h ?? 0

  return (
    <Demo
      caption={
        <>
          One jade accent, two documented grays. Sage &mdash; jade&rsquo;s
          &ldquo;natural pairing&rdquo; &mdash; carries the accent&rsquo;s own
          hue at a hundredth of the chroma; slate leans blue instead, 107&deg;
          away. The two step&nbsp;9s are ΔEok 0.023 apart &mdash; barely a
          swatch difference, plainly a different page.
        </>
      }
    >
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <ToggleButtonGroup
            selectionMode="single"
            disallowEmptySelection
            selectedKeys={[gray]}
            onSelectionChange={(keys) => {
              const next = [...keys][0]
              if (next === 'slate' || next === 'sage') setGray(next)
            }}
            size="sm"
            aria-label="Gray scale"
            className="max-w-full overflow-x-auto"
          >
            <ToggleButton id="sage">sage (paired)</ToggleButton>
            <ToggleButton id="slate">slate (blue-based)</ToggleButton>
          </ToggleButtonGroup>
          <span
            aria-live="polite"
            className="font-mono text-[0.65rem] text-fg-muted tabular-nums"
          >
            gray h {h9.toFixed(1)}° · jade h {JADE_H.toFixed(1)}°
          </span>
        </div>

        <div
          className="flex flex-col gap-3 rounded-lg border p-4"
          style={{ backgroundColor: s(1), borderColor: s(6) }}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-semibold" style={{ color: s(12) }}>
              Deploys
            </span>
            <span
              className="rounded-full px-2 py-0.5 text-[0.65rem] font-medium"
              style={{ backgroundColor: JADE.s3, color: JADE.s11 }}
            >
              all green
            </span>
          </div>
          <div
            className="flex flex-col gap-2 rounded-lg border p-3"
            style={{ backgroundColor: s(2), borderColor: s(6) }}
          >
            <span className="text-xs font-medium" style={{ color: s(12) }}>
              production &mdash; 2 minutes ago
            </span>
            <span className="text-xs" style={{ color: s(11) }}>
              main · build 4182 · 34s
            </span>
            <div className="flex items-center gap-3">
              <span
                className="rounded-md px-3 py-1 text-xs font-medium text-white"
                style={{ backgroundColor: JADE.s9 }}
              >
                Promote
              </span>
              <span className="text-xs font-medium" style={{ color: JADE.s11 }}>
                View logs
              </span>
            </div>
          </div>
        </div>
      </div>
    </Demo>
  )
}
