import { useState } from 'react'
import { clampChroma, formatHex, wcagContrast } from 'culori'

import { apcaLc } from '@/lib/apca'
import { cn } from '@/lib/utils'
import { Demo } from '@/components/demo'
import { ToggleButton } from '@/ui/toggle-button'
import { ToggleButtonGroup } from '@/ui/toggle-button-group'

type Bg = 'light' | 'dark'

const BG: Record<Bg, string> = { light: '#f8f8f8', dark: '#191919' }

// Lightness-anchored ramp (ch11, philosophy 1): L is fixed, contrast is whatever falls out.
const HUE = 255
const CHROMA = 0.13
const L_ANCHORS = [0.97, 0.92, 0.85, 0.75, 0.65, 0.55, 0.45, 0.33]
const RAMP = L_ANCHORS.map((l) =>
  formatHex(
    clampChroma({ mode: 'oklch' as const, l, c: CHROMA, h: HUE }, 'oklch'),
  ),
)

// two steps carry text jobs (ch10): a large-text step (3:1) and a body step (4.5:1)
const JOBS = [
  { idx: 6, label: 'large text / icon', need: 3 },
  { idx: 7, label: 'body text', need: 4.5 },
]

export function FixedLAudit() {
  const [bg, setBg] = useState<Bg>('light')
  const bgHex = BG[bg]

  return (
    <Demo
      caption={
        <>
          Lightness-anchored (chapter 11, philosophy 1): the eight L values are
          fixed, so the contrast against the surface is a <em>consequence</em>{' '}
          you read off the meter. On light both text jobs pass. Flip to dark and
          the same colors keep their L and lose their contrast &mdash; fixed
          lightness can&rsquo;t follow the room, and the guarantee was only ever
          post-hoc.
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <ToggleButtonGroup
          selectionMode="single"
          disallowEmptySelection
          selectedKeys={[bg]}
          onSelectionChange={(keys) => {
            const next = [...keys][0]
            if (next === 'light' || next === 'dark') setBg(next)
          }}
          size="sm"
          aria-label="Background"
          className="max-w-full overflow-x-auto"
        >
          <ToggleButton id="light">Light surface</ToggleButton>
          <ToggleButton id="dark">Dark surface</ToggleButton>
        </ToggleButtonGroup>

        <div
          className="flex gap-1 rounded-lg border p-3"
          style={{ backgroundColor: bgHex }}
        >
          {RAMP.map((hex, i) => (
            <div
              key={i}
              className="flex min-w-0 flex-1 flex-col items-center gap-1"
            >
              <div
                className={cn(
                  'h-11 w-full rounded-md border',
                  JOBS.some((j) => j.idx === i) &&
                    'outline-2 outline-offset-2 outline-fg/50',
                )}
                style={{ backgroundColor: hex }}
              />
            </div>
          ))}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-sm text-left font-mono text-[0.65rem] tabular-nums">
            <thead>
              <tr className="text-fg-muted">
                <th className="py-1 pr-3 font-normal">text job</th>
                <th className="py-1 pr-3 font-normal">needs</th>
                <th className="py-1 pr-3 font-normal">WCAG here</th>
                <th className="py-1 font-normal">APCA</th>
              </tr>
            </thead>
            <tbody>
              {JOBS.map((j) => {
                const hex = RAMP[j.idx] ?? '#000000'
                const w = wcagContrast(hex, bgHex)
                const lc = apcaLc(hex, bgHex)
                const pass = w >= j.need
                return (
                  <tr key={j.label} className="border-t">
                    <td className="py-1.5 pr-3">{j.label}</td>
                    <td className="py-1.5 pr-3 text-fg-muted">
                      {j.need.toFixed(1)}:1
                    </td>
                    <td
                      className={cn(
                        'py-1.5 pr-3',
                        pass ? 'text-fg-success' : 'text-fg-danger',
                      )}
                    >
                      {w.toFixed(2)}:1 {pass ? '✓' : '✕'}
                    </td>
                    <td className="py-1.5 text-fg-muted">Lc {lc.toFixed(1)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <span aria-live="polite" className="text-xs text-fg-muted">
          {bg === 'light'
            ? 'Both jobs clear their ratio — but you only know because you measured.'
            : 'Same L, new room: the text steps have collapsed toward the surface. Nothing regenerated.'}
        </span>
      </div>
    </Demo>
  )
}
