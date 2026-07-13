import { useState } from 'react'

import { Demo } from '@/components/demo'
import { ToggleButton } from '@/ui/toggle-button'
import { ToggleButtonGroup } from '@/ui/toggle-button-group'

type Browser = 'modern' | 'old'

// dotUI accent-500: oklch(0.6478 0.1337 251.06) serializes to #4992dd.
const HEX = '#4992dd'

export function FallbackTwoWays() {
  const [browser, setBrowser] = useState<Browser>('modern')
  const old = browser === 'old'

  return (
    <Demo
      caption={
        <>
          The classic two-declaration fallback only works on <em>real</em>{' '}
          properties: an old browser drops the <code>oklch()</code> declaration
          at parse time and keeps the hex. Custom properties skip that
          validation &mdash; the <code>oklch()</code> line wins the cascade even
          in a browser that can&rsquo;t paint it, and the failure happens later,
          at <code>var()</code> substitution, where per MDN &ldquo;the initial
          or inherited value of the property is used&rdquo; &mdash; not your hex
          line. If your tokens live in custom properties, hex fallback lines
          beside them are dead code.
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs text-fg-muted">Browser</span>
          <ToggleButtonGroup
            selectionMode="single"
            disallowEmptySelection
            selectedKeys={[browser]}
            onSelectionChange={(keys) => {
              const next = [...keys][0]
              if (next === 'modern' || next === 'old') setBrowser(next)
            }}
            size="sm"
            aria-label="Simulated browser"
            className="max-w-full overflow-x-auto"
          >
            <ToggleButton id="modern">Knows oklch()</ToggleButton>
            <ToggleButton id="old">Pre-2023, hex only</ToggleButton>
          </ToggleButtonGroup>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <pre
              className="overflow-x-auto rounded-lg p-3 font-mono text-[0.65rem] leading-relaxed"
              style={{ backgroundColor: '#0d1117' }}
            >
              <div style={{ color: old ? '#7ee787' : '#8b949e' }}>
                {`background: ${HEX};`}
              </div>
              <div
                style={{
                  color: old ? '#8b949e' : '#7ee787',
                  textDecoration: old ? 'line-through' : 'none',
                }}
              >
                background: oklch(0.6478 0.1337 251.06);
              </div>
            </pre>
            <div
              aria-live="polite"
              className="flex h-14 items-center justify-center rounded-lg border text-xs font-medium text-white"
              style={{ backgroundColor: HEX }}
            >
              real property — paints {HEX} either way
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <pre
              className="overflow-x-auto rounded-lg p-3 font-mono text-[0.65rem] leading-relaxed"
              style={{ backgroundColor: '#0d1117' }}
            >
              <div style={{ color: '#8b949e' }}>{`--accent: ${HEX};`}</div>
              <div style={{ color: '#e6edf3' }}>
                --accent: oklch(0.6478 0.1337 251.06);
              </div>
              <div style={{ color: old ? '#f85149' : '#7ee787' }}>
                background: var(--accent);
              </div>
            </pre>
            <div
              aria-live="polite"
              className="flex h-14 items-center justify-center rounded-lg border text-xs font-medium"
              style={
                old
                  ? {
                      borderStyle: 'dashed',
                      backgroundColor: 'transparent',
                    }
                  : { backgroundColor: HEX, color: '#ffffff' }
              }
            >
              {old
                ? 'custom property — invalid at use time, falls to initial'
                : 'custom property — paints the oklch value'}
            </div>
          </div>
        </div>
      </div>
    </Demo>
  )
}
