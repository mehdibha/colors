import { useState } from 'react'
import { clampChroma, converter, formatHex, wcagContrast } from 'culori'

import { apcaLc } from '@/lib/apca'
import { Demo } from '@/components/demo'
import { ToggleButton } from '@/ui/toggle-button'
import { ToggleButtonGroup } from '@/ui/toggle-button-group'

type Bg = 'light' | 'dark'

const toOklch = converter('oklch')
const BG: Record<Bg, string> = { light: '#f8f8f8', dark: '#151517' }
const HUE = 255
const CHROMA = 0.14
const RATIOS = [3, 4.5, 7, 12]

// Approximates Leonardo: walk OKLCH lightness until wcagContrast hits the target.
function solveWcag(bgHex: string, target: number) {
  const bgL = toOklch(bgHex)?.l ?? 1
  const wantDarker = bgL > 0.5
  let best: { hex: string; w: number } | null = null
  let extreme: { hex: string; w: number } | null = null
  const N = 240
  for (let i = 0; i <= N; i++) {
    const l = i / N
    if (wantDarker && l > bgL) continue
    if (!wantDarker && l < bgL) continue
    const hex = formatHex(
      clampChroma({ mode: 'oklch' as const, l, c: CHROMA, h: HUE }, 'oklch'),
    )
    const w = wcagContrast(hex, bgHex)
    if (extreme === null || w > extreme.w) extreme = { hex, w }
    if (w >= target && (best === null || w < best.w)) best = { hex, w }
  }
  return best ?? extreme ?? { hex: bgHex, w: 1 }
}

export function ContrastAsInput() {
  const [target, setTarget] = useState(4.5)
  const [bg, setBg] = useState<Bg>('light')

  const bgHex = BG[bg]
  const { hex, w } = solveWcag(bgHex, target)
  const lc = apcaLc(hex, bgHex)

  return (
    <Demo
      caption={
        <>
          Contrast is the input; the color is the output. You ask for a ratio
          and get the OKLCH color that hits it &mdash; guaranteed by
          construction, no audit. Swap the surface and the same target
          regenerates against the new room: chapter 16&rsquo;s modes-for-free,
          from one parameter.
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-fg-muted">target</span>
            <ToggleButtonGroup
              selectionMode="single"
              disallowEmptySelection
              selectedKeys={[String(target)]}
              onSelectionChange={(keys) => {
                const next = Number([...keys][0])
                if (RATIOS.includes(next)) setTarget(next)
              }}
              size="sm"
              aria-label="Target contrast ratio"
              className="max-w-full overflow-x-auto"
            >
              {RATIOS.map((r) => (
                <ToggleButton key={r} id={String(r)}>
                  {r}:1
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-fg-muted">surface</span>
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
              <ToggleButton id="light">Light</ToggleButton>
              <ToggleButton id="dark">Dark</ToggleButton>
            </ToggleButtonGroup>
          </div>
        </div>

        <div
          className="flex items-center gap-4 rounded-lg border p-4"
          style={{ backgroundColor: bgHex }}
        >
          <div
            className="size-16 shrink-0 rounded-md border"
            style={{ backgroundColor: hex }}
          />
          <span className="text-sm font-medium" style={{ color: hex }}>
            You asked for {target}:1
          </span>
        </div>

        <span
          aria-live="polite"
          className="font-mono text-[0.65rem] text-fg-muted tabular-nums"
        >
          solved {hex} — measures {w.toFixed(2)}:1 (≥ {target}, by construction)
          · Lc {lc.toFixed(1)}
        </span>
      </div>
    </Demo>
  )
}
