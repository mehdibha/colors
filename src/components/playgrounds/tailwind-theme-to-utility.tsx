import { useState } from 'react'
import { formatHex } from 'culori'

import { Demo } from '@/components/demo'
import { ToggleButton } from '@/ui/toggle-button'
import { ToggleButtonGroup } from '@/ui/toggle-button-group'

const SEEDS = {
  avocado: 'oklch(0.84 0.18 117)',
  coral: 'oklch(0.70 0.18 25)',
  iris: 'oklch(0.62 0.2 285)',
} as const

type Seed = keyof typeof SEEDS

export function TailwindThemeToUtility() {
  const [seed, setSeed] = useState<Seed>('avocado')
  const value = SEEDS[seed]
  const hex = formatHex(value) ?? '#000000'
  const varName = `--color-${seed}-500`

  return (
    <Demo
      caption={
        <>
          One declaration, two outputs:{' '}
          <span className="font-mono">@theme</span> emits a real CSS custom
          property <em>and</em> generates every color utility from it &mdash;
          chapter 20&rsquo;s delivery mechanism, shipped. The palette
          isn&rsquo;t a config object anymore; it&rsquo;s{' '}
          <span className="font-mono">--color-*</span> variables you can read at
          runtime in plain CSS, and exactly the substrate a semantic alias like{' '}
          <span className="font-mono">--color-accent</span> would point at.
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <ToggleButtonGroup
          selectionMode="single"
          disallowEmptySelection
          selectedKeys={[seed]}
          onSelectionChange={(keys) => {
            const next = [...keys][0]
            if (typeof next === 'string' && next in SEEDS) setSeed(next as Seed)
          }}
          size="sm"
          aria-label="Custom color added to the theme"
          className="max-w-full overflow-x-auto"
        >
          {(Object.keys(SEEDS) as Seed[]).map((k) => (
            <ToggleButton key={k} id={k}>
              {k}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>

        <div className="flex flex-col gap-2 font-mono text-[0.65rem] tabular-nums">
          <div className="rounded-md bg-muted/50 p-3">
            <span className="text-fg-muted">@theme &#123;</span>
            <br />
            <span className="pl-4">
              {varName}: {value};
            </span>
            <br />
            <span className="text-fg-muted">&#125;</span>
          </div>
          <div className="text-center text-fg-muted">↓ emits</div>
          <div className="rounded-md bg-muted/50 p-3">
            <span className="text-fg-muted">:root &#123;</span>{' '}
            <span>
              {varName}: {value};
            </span>{' '}
            <span className="text-fg-muted">&#125;</span>
          </div>
          <div className="text-center text-fg-muted">↓ generates</div>
          <div className="flex flex-col gap-1 rounded-md bg-muted/50 p-3">
            <span>
              .bg-{seed}-500 &#123; background-color: var({varName}) &#125;
            </span>
            <span>
              .text-{seed}-500 &#123; color: var({varName}) &#125;
            </span>
            <span>
              .border-{seed}-500 &#123; border-color: var({varName}) &#125;
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span
            className="flex h-10 items-center rounded-md border-2 px-3 text-xs font-medium"
            style={{ borderColor: hex, color: hex }}
          >
            .border / .text-{seed}-500
          </span>
          <span
            className="flex h-10 items-center rounded-md px-3 text-xs font-medium text-white"
            style={{ backgroundColor: hex }}
          >
            .bg-{seed}-500
          </span>
          <span className="font-mono text-[0.65rem] text-fg-muted tabular-nums">
            {hex}
          </span>
        </div>
      </div>
    </Demo>
  )
}
