import { useState } from 'react'
import { formatHex } from 'culori'

import { Demo } from '@/components/demo'
import { ToggleButton } from '@/ui/toggle-button'
import { ToggleButtonGroup } from '@/ui/toggle-button-group'

type Mode = 'light' | 'dark'

const N50 = {
  light: { mode: 'oklch' as const, l: 0.985, c: 0, h: 0 },
  dark: { mode: 'oklch' as const, l: 0.13, c: 0, h: 0 },
}
const N950 = {
  light: { mode: 'oklch' as const, l: 0.13, c: 0, h: 0 },
  dark: { mode: 'oklch' as const, l: 0.985, c: 0, h: 0 },
}

export function FlipLivesDownstairs() {
  const [mode, setMode] = useState<Mode>('light')
  const bg = formatHex(N50[mode]) ?? '#ffffff'
  const fg = formatHex(N950[mode]) ?? '#000000'

  const lines: { text: string; active?: boolean; dim?: boolean }[] = [
    { text: '@theme {', dim: true },
    { text: '  --color-bg: var(--neutral-50);   /* never changes */' },
    { text: '}', dim: true },
    { text: ':root {', dim: true },
    {
      text: '  --neutral-50: oklch(0.985 0 0);',
      active: mode === 'light',
    },
    { text: '}', dim: true },
    { text: '.dark {', dim: true },
    {
      text: '  --neutral-50: oklch(0.13 0 0);   /* the flip lives here */',
      active: mode === 'dark',
    },
    { text: '}', dim: true },
  ]

  return (
    <Demo
      caption={
        <>
          dotUI&rsquo;s two emitted files, reduced to one token. The semantic
          alias is byte-identical in both modes; only the primitive block flips.
          It works because <code>var()</code> resolves at the element that uses
          it: <code>--color-bg</code> stores the <em>reference</em>{' '}
          <code>var(--neutral-50)</code>, and each element looks that name up
          where it stands &mdash; inside <code>.dark</code>, it finds the dark
          value. Theming is a value swap in the bottom tier; the names above
          never move.
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs text-fg-muted">Mode</span>
          <ToggleButtonGroup
            selectionMode="single"
            disallowEmptySelection
            selectedKeys={[mode]}
            onSelectionChange={(keys) => {
              const next = [...keys][0]
              if (next === 'light' || next === 'dark') setMode(next)
            }}
            size="sm"
            aria-label="Mode"
            className="max-w-full overflow-x-auto"
          >
            <ToggleButton id="light">Light</ToggleButton>
            <ToggleButton id="dark">Dark</ToggleButton>
          </ToggleButtonGroup>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto]">
          <pre
            className="overflow-x-auto rounded-lg p-4 font-mono text-[0.7rem] leading-relaxed"
            style={{ backgroundColor: '#0d1117' }}
          >
            {lines.map((line, i) => (
              // oxlint-disable-next-line no-array-index-key -- ordered CSS lines
              <div
                key={i}
                style={{
                  color: line.active
                    ? '#7ee787'
                    : line.dim
                      ? '#8b949e'
                      : '#e6edf3',
                }}
              >
                {line.text}
              </div>
            ))}
          </pre>
          <div
            aria-live="polite"
            className="flex min-w-40 flex-col items-center justify-center gap-1 rounded-lg border p-4"
            style={{ backgroundColor: bg }}
          >
            <span className="text-sm font-medium" style={{ color: fg }}>
              bg-bg
            </span>
            <span
              className="font-mono text-[0.65rem] tabular-nums"
              style={{ color: fg }}
            >
              resolves to {bg}
            </span>
          </div>
        </div>
      </div>
    </Demo>
  )
}
