import { useState } from 'react'

import { Demo } from '@/components/demo'
import { ToggleButton } from '@/ui/toggle-button'
import { ToggleButtonGroup } from '@/ui/toggle-button-group'

type Scheme = 'light' | 'dark'

// Radix blue 11 light/dark and the slate page backgrounds (ch16's pair).
const PANEL_CSS = {
  backgroundColor: 'light-dark(#fcfcfd, #111113)',
  borderColor: 'light-dark(#dddde3, #363a3f)',
}
const TEXT_CSS = 'light-dark(#0d74ce, #70b8ff)'
const MUTED_CSS = 'light-dark(#60646c, #b0b4ba)'

export function LightDarkFlip() {
  const [scheme, setScheme] = useState<Scheme>('light')

  return (
    <Demo
      caption={
        <>
          Nothing below is computed in JavaScript &mdash; every color is a
          literal <code>light-dark()</code> value, and the toggle only sets{' '}
          <code>color-scheme</code> on the panel. Your browser resolves the
          rest: chapter 17&rsquo;s mode-alias table as one function per token,
          no <code>.dark</code> block. Baseline newly available since May 2024
          &mdash; and it does nothing without <code>color-scheme</code> set.
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs text-fg-muted">color-scheme</span>
          <ToggleButtonGroup
            selectionMode="single"
            disallowEmptySelection
            selectedKeys={[scheme]}
            onSelectionChange={(keys) => {
              const next = [...keys][0]
              if (next === 'light' || next === 'dark') setScheme(next)
            }}
            size="sm"
            aria-label="color-scheme"
            className="max-w-full overflow-x-auto"
          >
            <ToggleButton id="light">light</ToggleButton>
            <ToggleButton id="dark">dark</ToggleButton>
          </ToggleButtonGroup>
        </div>

        <div
          className="flex flex-col gap-2 rounded-lg border p-5"
          style={{ colorScheme: scheme, ...PANEL_CSS }}
        >
          <span className="text-sm font-medium" style={{ color: TEXT_CSS }}>
            fg-accent — one name, two values, zero JavaScript
          </span>
          <span
            className="font-mono text-[0.65rem]"
            style={{ color: MUTED_CSS }}
          >
            color: light-dark(#0d74ce, #70b8ff);
          </span>
        </div>
      </div>
    </Demo>
  )
}
