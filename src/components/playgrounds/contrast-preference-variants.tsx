import { useState } from 'react'
import { wcagContrast } from 'culori'

import { Demo } from '@/components/demo'
import { SegmentedControl, SegmentedControlItem } from '@/ui/segmented-control'

const SURFACE = '#ffffff'

// Two token sets for the same surface: a default look and a higher-contrast
// variant the engine can swap in under prefers-contrast: more.
const TOKENS = {
  default: { muted: '#94a3b8', border: '#e2e8f0', ghostFg: '#64748b' },
  more: { muted: '#475569', border: '#94a3b8', ghostFg: '#1e293b' },
}

export function ContrastPreferenceVariants() {
  const [mode, setMode] = useState<'default' | 'more'>('default')
  const t = TOKENS[mode]
  const mutedRatio = wcagContrast(t.muted, SURFACE)
  const borderRatio = wcagContrast(t.border, SURFACE)

  return (
    <Demo
      caption={
        <>
          The default set leans on faint tokens — a barely-there border, muted
          secondary text — that a design chooses for calm. Switch to{' '}
          <code className="font-mono text-[0.8rem]">more</code> and the same
          slots take a higher-contrast variant. In production the switch is a
          media query,{' '}
          <code className="font-mono text-[0.8rem]">
            @media (prefers-contrast: more)
          </code>
          , driven by the operating system, not a button — this toggle stands in
          for that setting.
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <SegmentedControl
          selectedKeys={[mode]}
          onSelectionChange={(k) => setMode([...k][0] as 'default' | 'more')}
          aria-label="Contrast preference"
          className="w-fit"
        >
          <SegmentedControlItem id="default">
            No preference
          </SegmentedControlItem>
          <SegmentedControlItem id="more">
            prefers-contrast: more
          </SegmentedControlItem>
        </SegmentedControl>

        <div
          className="rounded-lg p-4"
          style={{ backgroundColor: SURFACE, border: `1px solid ${t.border}` }}
        >
          <span className="text-sm font-semibold text-slate-900">
            Invoice #4821
          </span>
          <p className="mt-1 text-sm" style={{ color: t.muted }}>
            Due in 14 days · Sent to billing@acme.co
          </p>
          <div className="mt-3 flex gap-2">
            <button
              className="rounded-md px-3 py-1.5 text-sm font-medium"
              style={{ border: `1px solid ${t.border}`, color: t.ghostFg }}
            >
              Remind later
            </button>
            <button className="rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white">
              Pay now
            </button>
          </div>
        </div>

        <div
          className="flex gap-6 font-mono text-xs text-fg-muted tabular-nums"
          aria-live="polite"
        >
          <span>secondary text {mutedRatio.toFixed(2)}:1</span>
          <span>border {borderRatio.toFixed(2)}:1</span>
        </div>
      </div>
    </Demo>
  )
}
