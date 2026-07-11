import { useState } from 'react'
import { clampChroma, converter, formatHex, wcagContrast } from 'culori'

import { apcaLc } from '@/lib/apca'
import { cn } from '@/lib/utils'
import { Demo } from '@/components/demo'
import { ToggleButton } from '@/ui/toggle-button'
import { ToggleButtonGroup } from '@/ui/toggle-button-group'

const toLab = converter('lab')

// Tone is kept EXACT: solve OKLCH L so the sRGB result's CIE L* equals the
// requested tone (0-100). Hue/chroma are OKLCH stand-ins for CAM16 — a neutral
// swatch here isolates the tone gap from both.
function toneHex(hue: number, chroma: number, tone: number): string {
  let lo = 0
  let hi = 1
  for (let i = 0; i < 22; i++) {
    const mid = (lo + hi) / 2
    const c = clampChroma(
      { mode: 'oklch' as const, l: mid, c: chroma, h: hue },
      'oklch',
    )
    if ((toLab(c)?.l ?? 0) < tone) lo = mid
    else hi = mid
  }
  return formatHex(
    clampChroma(
      { mode: 'oklch' as const, l: (lo + hi) / 2, c: chroma, h: hue },
      'oklch',
    ),
  )
}

const SURFACE_TONE = 90
const TEXT_TONES = [70, 60, 50, 40, 30]

export function ToneIsContrast() {
  const [tone, setTone] = useState(50)

  const surface = toneHex(0, 0, SURFACE_TONE)
  const text = toneHex(0, 0, tone)
  const gap = SURFACE_TONE - tone
  const w = wcagContrast(text, surface)
  const lc = apcaLc(text, surface)
  const passW = w >= 4.5
  const passA = Math.abs(lc) >= 60

  return (
    <Demo
      caption={
        <>
          Two neutral tones, the surface held at Tone {SURFACE_TONE}. Widen the
          gap and both meters climb together &mdash; contrast is a function of
          the Tone delta and nothing else. Near a gap of 40 the pair clears 3:1;
          near 50 it clears 4.5:1 (approximate). No hue, no chroma, no audit.
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs text-fg-muted">text Tone</span>
          <ToggleButtonGroup
            selectionMode="single"
            disallowEmptySelection
            selectedKeys={[String(tone)]}
            onSelectionChange={(keys) => {
              const next = Number([...keys][0])
              if (TEXT_TONES.includes(next)) setTone(next)
            }}
            size="sm"
            aria-label="Text tone against a Tone-90 surface"
            className="max-w-full overflow-x-auto"
          >
            {TEXT_TONES.map((t) => (
              <ToggleButton key={t} id={String(t)}>
                {t}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </div>

        <div
          className="flex items-center justify-center rounded-lg border p-6"
          style={{ backgroundColor: surface }}
        >
          <span className="text-lg font-medium" style={{ color: text }}>
            Tone {tone} on Tone {SURFACE_TONE}
          </span>
        </div>

        <span
          aria-live="polite"
          className="font-mono text-[0.65rem] text-fg-muted tabular-nums"
        >
          Tone delta {gap} &middot; WCAG{' '}
          <span className={cn(passW ? 'text-fg-success' : 'text-fg-warning')}>
            {w.toFixed(2)}:1 {passW ? '✓' : w >= 3 ? '(3:1)' : '✕'}
          </span>{' '}
          &middot; APCA{' '}
          <span className={cn(passA ? 'text-fg-success' : 'text-fg-warning')}>
            Lc {lc.toFixed(1)} {passA ? '✓' : '⚠'}
          </span>
        </span>
      </div>
    </Demo>
  )
}
