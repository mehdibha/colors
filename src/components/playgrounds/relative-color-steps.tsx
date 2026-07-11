import { useState } from 'react'
import { clampChroma, converter, formatHex } from 'culori'

import { Demo } from '@/components/demo'
import { ToggleButton } from '@/ui/toggle-button'
import { ToggleButtonGroup } from '@/ui/toggle-button-group'

type SeedKey = 'blue' | 'violet' | 'amber'

const toOklch = converter('oklch')
const clamp01 = (x: number) => Math.min(1, Math.max(0, x))

const SEEDS: Record<SeedKey, { label: string; hex: string }> = {
  blue: { label: 'Blue', hex: '#4992dd' },
  violet: { label: 'Violet', hex: '#6e56cf' },
  amber: { label: 'Amber', hex: '#f0bf46' },
}

const DERIVE = [
  { name: 'subtle-bg', expr: 'calc(l + 0.24) c h', dL: 0.24, cMul: 1 },
  { name: 'hover', expr: 'calc(l - 0.08) c h', dL: -0.08, cMul: 1 },
  { name: 'active', expr: 'calc(l - 0.16) c h', dL: -0.16, cMul: 1 },
]

// `from` extracts channels as numbers; for oklch, l resolves in the 0–1 range,
// so the delta is a genuine lightness offset. Chroma clamped back under the tent.
const rel = (hex: string, dL: number, cMul: number) => {
  const c = toOklch(hex)
  if (!c) return hex
  return (
    formatHex(
      clampChroma(
        {
          mode: 'oklch' as const,
          l: clamp01((c.l ?? 0) + dL),
          c: Math.max(0, (c.c ?? 0) * cMul),
          h: c.h ?? 0,
        },
        'oklch',
      ),
    ) ?? hex
  )
}

export function RelativeColorSteps() {
  const [seed, setSeed] = useState<SeedKey>('blue')
  const base = SEEDS[seed].hex

  return (
    <Demo
      caption={
        <>
          One <span className="font-mono">--seed</span>, three steps derived by
          pulling its channels apart. <span className="font-mono">from</span>{' '}
          resolves each channel to a number &mdash; oklch{' '}
          <span className="font-mono">l</span> in 0&ndash;1, so{' '}
          <span className="font-mono">calc(l - 0.08)</span> darkens by exactly
          0.08. Repoint the seed and every step follows at parse time. Relative
          color reached Baseline only in September 2024.
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs text-fg-muted">--seed &rarr;</span>
          <ToggleButtonGroup
            selectionMode="single"
            disallowEmptySelection
            selectedKeys={[seed]}
            onSelectionChange={(keys) => {
              const next = [...keys][0]
              if (typeof next === 'string' && next in SEEDS)
                setSeed(next as SeedKey)
            }}
            size="sm"
            aria-label="Seed color"
            className="max-w-full overflow-x-auto"
          >
            {(Object.keys(SEEDS) as SeedKey[]).map((k) => (
              <ToggleButton key={k} id={k}>
                {SEEDS[k].label}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </div>

        <div className="grid gap-2 sm:grid-cols-4">
          <div className="flex flex-col gap-1.5">
            <div
              className="h-14 w-full rounded-md border outline-2 outline-offset-2 outline-fg/50"
              style={{ backgroundColor: base }}
            />
            <span className="font-mono text-[0.65rem] tabular-nums">
              --accent
            </span>
            <span className="font-mono text-[0.6rem] text-fg-muted tabular-nums">
              {base} (seed)
            </span>
          </div>
          {DERIVE.map((d) => {
            const hex = rel(base, d.dL, d.cMul)
            return (
              <div key={d.name} className="flex flex-col gap-1.5">
                <div
                  className="h-14 w-full rounded-md border"
                  style={{ backgroundColor: hex }}
                />
                <span className="font-mono text-[0.65rem] tabular-nums">
                  {d.name}
                </span>
                <span className="font-mono text-[0.6rem] text-fg-muted tabular-nums">
                  {hex}
                </span>
              </div>
            )
          })}
        </div>

        <div
          aria-live="polite"
          className="overflow-x-auto rounded-md bg-muted/50 p-3"
        >
          <pre className="font-mono text-[0.65rem] whitespace-pre">
            {`--seed: ${base};\n` +
              DERIVE.map(
                (d) => `--accent-${d.name}: oklch(from var(--seed) ${d.expr});`,
              ).join('\n')}
          </pre>
        </div>
      </div>
    </Demo>
  )
}
