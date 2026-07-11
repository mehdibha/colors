import { useState } from 'react'
import { clampChroma, converter, formatHex, wcagContrast } from 'culori'

import { apcaLc } from '@/lib/apca'
import { cn } from '@/lib/utils'
import { Demo } from '@/components/demo'
import { ToggleButton } from '@/ui/toggle-button'
import { ToggleButtonGroup } from '@/ui/toggle-button-group'

type Bg = 'light' | 'dark'
type Meter = 'wcag' | 'apca'

const toOklch = converter('oklch')
const BG: Record<Bg, string> = { light: '#f8f8f8', dark: '#151517' }
const HUE = 255
const CHROMA = 0.14

// Body-text bar per chapter 8: WCAG 4.5:1 vs APCA Lc 75 (the 18px-regular minimum).
const APCA_BODY = 75

// Solve for the body-text step two ways: WCAG 4.5 target vs APCA Lc 75 target.
function solve(bgHex: string, target: number, meter: Meter) {
  const bgL = toOklch(bgHex)?.l ?? 1
  const wantDarker = bgL > 0.5
  let best: { hex: string; w: number; a: number; c: number } | null = null
  let extreme: { hex: string; w: number; a: number; c: number } | null = null
  const N = 240
  for (let i = 0; i <= N; i++) {
    const l = i / N
    if (wantDarker && l > bgL) continue
    if (!wantDarker && l < bgL) continue
    const hex = formatHex(
      clampChroma({ mode: 'oklch' as const, l, c: CHROMA, h: HUE }, 'oklch'),
    )
    const w = wcagContrast(hex, bgHex)
    const a = Math.abs(apcaLc(hex, bgHex))
    const metric = meter === 'wcag' ? w : a
    if (extreme === null || metric > extreme.c)
      extreme = { hex, w, a, c: metric }
    if (metric >= target && (best === null || metric < best.c))
      best = { hex, w, a, c: metric }
  }
  return best ?? extreme ?? { hex: bgHex, w: 1, a: 0, c: 0 }
}

export function MeterSplitRamps() {
  const [bg, setBg] = useState<Bg>('dark')
  const bgHex = BG[bg]

  const byWcag = solve(bgHex, 4.5, 'wcag')
  const byApca = solve(bgHex, APCA_BODY, 'apca')

  const cards = [
    { title: 'Targeted WCAG 4.5:1', pick: byWcag },
    { title: 'Targeted APCA Lc 75', pick: byApca },
  ]

  return (
    <Demo
      caption={
        <>
          One body-text step, solved two ways against the same surface.
          Targeting the WCAG ratio and targeting APCA Lc pick{' '}
          <em>different colors</em> &mdash; and on dark the gap is widest,
          because WCAG&rsquo;s flare term over-credits dark backgrounds (chapter
          8). The meter you target is the flaw you bake in: the WCAG pick clears
          its 4.5:1 ratio and still falls short of the Lc 75 body-text bar.
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

        <div className="grid gap-3 sm:grid-cols-2">
          {cards.map((card) => {
            const passW = card.pick.w >= 4.5
            const passA = card.pick.a >= APCA_BODY
            return (
              <div
                key={card.title}
                className="flex flex-col gap-3 rounded-lg border p-3"
                style={{ backgroundColor: bgHex }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="size-10 shrink-0 rounded-md border"
                    style={{ backgroundColor: card.pick.hex }}
                  />
                  <span
                    className="text-sm font-medium"
                    style={{ color: card.pick.hex }}
                  >
                    Body text sample
                  </span>
                </div>
                <div className="flex flex-col gap-0.5 font-mono text-[0.65rem] tabular-nums">
                  <span className="text-fg-muted">{card.title}</span>
                  <span
                    className={cn(passW ? 'text-fg-success' : 'text-fg-danger')}
                  >
                    WCAG {card.pick.w.toFixed(2)}:1 {passW ? '✓' : '✕'}
                  </span>
                  <span
                    className={cn(
                      passA ? 'text-fg-success' : 'text-fg-warning',
                    )}
                  >
                    APCA Lc {card.pick.a.toFixed(0)} {passA ? '✓' : '⚠'}
                  </span>
                </div>
              </div>
            )
          })}
        </div>

        <span aria-live="polite" className="text-xs text-fg-muted">
          {bg === 'dark'
            ? 'On dark, the WCAG-targeted step passes 4.5:1 yet lands far below Lc 75 — certified and thin.'
            : 'On light the gap is modest; against the dark surface the two picks diverge sharply.'}
        </span>
      </div>
    </Demo>
  )
}
