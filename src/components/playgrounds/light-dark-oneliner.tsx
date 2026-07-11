import { useState } from 'react'
import { wcagContrast } from 'culori'

import { Demo } from '@/components/demo'
import { ToggleButton } from '@/ui/toggle-button'
import { ToggleButtonGroup } from '@/ui/toggle-button-group'

type Mode = 'light' | 'dark'

// Radix slate 1/12 and slateDark 1/12, verified against light.ts / dark.ts.
const BG: Record<Mode, string> = { light: '#fcfcfd', dark: '#111113' }
const FG: Record<Mode, string> = { light: '#1c2024', dark: '#edeef0' }

export function LightDarkOneliner() {
  const [mode, setMode] = useState<Mode>('light')
  const bg = BG[mode]
  const fg = FG[mode]

  return (
    <Demo
      caption={
        <>
          Same result, two ways to say it: one name carrying both values, or two
          rules. <span className="font-mono">light-dark()</span> needs{' '}
          <span className="font-mono">color-scheme: light dark</span> on the
          root to resolve &mdash; without it the function does nothing. It has
          been Baseline newly available only since May 2024.
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <ToggleButtonGroup
          selectionMode="single"
          disallowEmptySelection
          selectedKeys={[mode]}
          onSelectionChange={(keys) => {
            const next = [...keys][0]
            if (next === 'light' || next === 'dark') setMode(next)
          }}
          size="sm"
          aria-label="Active color scheme"
          className="max-w-full overflow-x-auto"
        >
          <ToggleButton id="light">Light</ToggleButton>
          <ToggleButton id="dark">Dark</ToggleButton>
        </ToggleButtonGroup>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <span className="text-xs text-fg-muted">one name, two values</span>
            <div className="overflow-x-auto rounded-md bg-muted/50 p-3">
              <pre className="font-mono text-[0.65rem] leading-relaxed whitespace-pre">{`:root {
  color-scheme: light dark;
  --bg: light-dark(#fcfcfd, #111113);
  --fg: light-dark(#1c2024, #edeef0);
}`}</pre>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="text-xs text-fg-muted">
              a name and an override
            </span>
            <div className="overflow-x-auto rounded-md bg-muted/50 p-3">
              <pre className="font-mono text-[0.65rem] leading-relaxed whitespace-pre">{`:root { --bg: #fcfcfd; --fg: #1c2024; }
.dark { --bg: #111113; --fg: #edeef0; }`}</pre>
            </div>
          </div>
        </div>

        <div
          className="flex flex-col gap-1 rounded-md border p-4"
          style={{ backgroundColor: bg }}
        >
          <span className="text-sm font-medium" style={{ color: fg }}>
            Quarterly review
          </span>
          <span
            aria-live="polite"
            className="font-mono text-[0.65rem] tabular-nums"
            style={{ color: fg, opacity: 0.7 }}
          >
            {mode} · fg on bg {wcagContrast(fg, bg).toFixed(2)}:1 (both
            approaches resolve to this)
          </span>
        </div>
      </div>
    </Demo>
  )
}
