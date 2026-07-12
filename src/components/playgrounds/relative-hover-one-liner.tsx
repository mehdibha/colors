import { useState } from 'react'
import { converter, differenceEuclidean, formatHex, interpolate } from 'culori'

import { Demo } from '@/components/demo'
import { ToggleButton } from '@/ui/toggle-button'
import { ToggleButtonGroup } from '@/ui/toggle-button-group'

const dEok = differenceEuclidean('oklab')

type Mode = 'light' | 'dark'

// dotUI accent-500; designed hover = accent-600 per mode (colors.css).
const REST = { mode: 'oklch' as const, l: 0.6478, c: 0.1337, h: 251.06 }
const SHIFT: Record<Mode, number> = { light: -0.0745, dark: 0.0944 }
const DESIGNED: Record<Mode, { l: number; c: number; h: number }> = {
  light: { l: 0.5733, c: 0.1301, h: 251.06 },
  dark: { l: 0.7422, c: 0.1301, h: 251.06 },
}
const PAGE: Record<Mode, string> = { light: '#fafafa', dark: '#070707' }

const toOklch = converter('oklch')
// mix percentage chosen so the mix lands at the same L as the RCS shift
const MIX_TOWARD: Record<Mode, string> = { light: '#000000', dark: '#ffffff' }
const MIX_T: Record<Mode, number> = {
  light: -SHIFT.light / REST.l,
  dark: SHIFT.dark / (1 - REST.l),
}

export function RelativeHoverOneLiner() {
  const [mode, setMode] = useState<Mode>('light')

  const rest = formatHex(REST) ?? '#000000'
  const derivedColor = { ...REST, l: REST.l + SHIFT[mode] }
  const derived = formatHex(derivedColor) ?? '#000000'
  const designedColor = { mode: 'oklch' as const, ...DESIGNED[mode] }
  const designed = formatHex(designedColor) ?? '#000000'
  const gap = dEok(derivedColor, designedColor)
  const mixedColor = interpolate([REST, MIX_TOWARD[mode]], 'oklab')(MIX_T[mode])
  const mixed = formatHex(mixedColor) ?? '#000000'
  const mixedC = toOklch(mixedColor).c
  const mixGap = dEok(mixedColor, designedColor)
  const labelColor = mode === 'dark' ? '#b0b4ba' : '#60646c'

  return (
    <Demo
      caption={
        <>
          One relative-color line derives the hover from whatever the accent is
          &mdash; and the sign rides in a custom property, flipped per mode,
          which is chapter 18&rsquo;s &ldquo;signed per mode&rdquo; rule shipped
          as CSS. With dotUI&rsquo;s own deltas it lands &Delta;Eok 0.004 from
          the designed step in both modes &mdash; the derivation only holds the
          chroma the designed step slightly sheds. The fourth chip is
          color-mix() pushed to the same lightness: it can&rsquo;t hold a
          channel, so chroma drags down with the mix &mdash; a whisper in light
          mode, past the JND in dark.
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

        <pre
          className="overflow-x-auto rounded-lg p-4 font-mono text-[0.7rem] leading-relaxed"
          style={{ backgroundColor: '#0d1117' }}
        >
          <div style={{ color: mode === 'light' ? '#7ee787' : '#8b949e' }}>
            {':root { --hover-shift: -0.0745; }'}
          </div>
          <div style={{ color: mode === 'dark' ? '#7ee787' : '#8b949e' }}>
            {'.dark { --hover-shift: 0.0944; }'}
          </div>
          <div style={{ color: '#e6edf3' }}>
            {
              '--color-accent-hover: oklch(from var(--accent-500) calc(l + var(--hover-shift)) c h);'
            }
          </div>
        </pre>

        <div
          className="grid grid-cols-2 gap-3 rounded-lg border p-4 sm:grid-cols-4"
          style={{ backgroundColor: PAGE[mode] }}
        >
          {[
            { label: 'Rest — accent-500', value: rest, c: REST.c },
            { label: 'Derived hover (RCS)', value: derived, c: REST.c },
            {
              label: 'Designed hover (accent-600)',
              value: designed,
              c: DESIGNED[mode].c,
            },
            { label: 'color-mix, same ΔL', value: mixed, c: mixedC },
          ].map((s) => (
            <div key={s.label} className="flex flex-col gap-1.5">
              <span
                className="rounded-md px-3 py-3 text-center text-xs font-medium text-white"
                style={{ backgroundColor: s.value }}
              >
                {s.value}
              </span>
              <span className="text-[0.65rem]" style={{ color: labelColor }}>
                {s.label}
              </span>
              <span
                className="font-mono text-[0.6rem] tabular-nums"
                style={{ color: labelColor }}
              >
                C {s.c.toFixed(3)}
              </span>
            </div>
          ))}
        </div>

        <p
          aria-live="polite"
          className="font-mono text-[0.7rem] text-fg-muted tabular-nums"
        >
          derived vs designed — ΔEok {gap.toFixed(4)} · mix vs designed — ΔEok{' '}
          {mixGap.toFixed(4)} (JND 0.02)
        </p>
      </div>
    </Demo>
  )
}
