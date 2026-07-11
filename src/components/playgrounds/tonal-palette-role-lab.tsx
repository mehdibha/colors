import { useMemo, useState } from 'react'
import { clampChroma, converter, formatHex, wcagContrast } from 'culori'

import { apcaLc } from '@/lib/apca'
import { cn } from '@/lib/utils'
import { Playground } from '@/components/playground'
import { ToggleButton } from '@/ui/toggle-button'
import { ToggleButtonGroup } from '@/ui/toggle-button-group'

const toLab = converter('lab')
const toOklch = converter('oklch')

// HONEST APPROXIMATION: Tone is kept EXACT — every swatch is solved so its CIE
// L* equals the requested Tone (the axis that carries the contrast argument).
// Hue and chroma are OKLCH stand-ins for CAM16. Models Material's policy, not
// the HCT space. See the chapter.
function toneColorOf(hue: number, chroma: number, tone: number) {
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
  return clampChroma(
    { mode: 'oklch' as const, l: (lo + hi) / 2, c: chroma, h: hue },
    'oklch',
  )
}
const hexOf = (hue: number, chroma: number, tone: number) =>
  formatHex(toneColorOf(hue, chroma, tone))

type Scheme = 'light' | 'dark'
type Level = 'standard' | 'medium' | 'high'

const SEEDS = [
  { id: 'violet', label: 'M3 Violet', hex: '#6750A4' },
  { id: 'blue', label: 'Google Blue', hex: '#0b57d0' },
  { id: 'red', label: 'Error Red', hex: '#b3261e' },
  { id: 'neutral', label: 'Near-neutral', hex: '#5b6066' },
] as const
type SeedId = (typeof SEEDS)[number]['id']

// contrastLevel is numeric in Material (-1..1). Widening each pair's tones by k
// per side is a faithful approximation of the per-role ContrastCurve.
const LEVEL_K: Record<Level, number> = { standard: 0, medium: 3, high: 6 }
const PALETTE_TONES = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 95, 99, 100]
const NEUTRAL_C = 0.01

// Baseline scheme.ts Tone picks.
const PAIRS: {
  label: string
  pal: 'accent' | 'neutral'
  base: Record<Scheme, number>
  on: Record<Scheme, number>
}[] = [
  {
    label: 'primary / on-primary',
    pal: 'accent',
    base: { light: 40, dark: 80 },
    on: { light: 100, dark: 20 },
  },
  {
    label: 'container / on-container',
    pal: 'accent',
    base: { light: 90, dark: 30 },
    on: { light: 10, dark: 90 },
  },
  {
    label: 'surface / on-surface',
    pal: 'neutral',
    base: { light: 99, dark: 10 },
    on: { light: 10, dark: 90 },
  },
  {
    label: 'surface-var / on-surface-var',
    pal: 'neutral',
    base: { light: 90, dark: 30 },
    on: { light: 30, dark: 80 },
  },
]

function widen(base: number, on: number, k: number): [number, number] {
  if (on > base) return [Math.max(0, base - k), Math.min(100, on + k)]
  return [Math.min(100, base + k), Math.max(0, on - k)]
}

export function TonalPaletteRoleLab() {
  const [seedId, setSeedId] = useState<SeedId>('violet')
  const [scheme, setScheme] = useState<Scheme>('light')
  const [level, setLevel] = useState<Level>('standard')

  const seedHex = SEEDS.find((s) => s.id === seedId)?.hex ?? '#6750A4'
  const k = LEVEL_K[level]

  const { aH, aC } = useMemo(() => {
    const o = toOklch(seedHex)
    return { aH: o?.h ?? 300, aC: o?.c ?? 0.12 }
  }, [seedHex])

  const chromaOf = (pal: 'accent' | 'neutral') =>
    pal === 'accent' ? aC : NEUTRAL_C

  const pairs = PAIRS.map((p) => {
    const [baseTone, onTone] = widen(p.base[scheme], p.on[scheme], k)
    const c = chromaOf(p.pal)
    const baseHex = hexOf(aH, c, baseTone)
    const onHex = hexOf(aH, c, onTone)
    const delta = Math.abs(baseTone - onTone)
    const w = wcagContrast(onHex, baseHex)
    const lc = apcaLc(onHex, baseHex)
    return {
      ...p,
      baseHex,
      onHex,
      delta,
      w,
      lc,
      pass: w >= 4.5 && Math.abs(lc) >= 60,
    }
  })

  const passing = pairs.filter((p) => p.pass).length

  // Resolved roles for the mini card.
  const primary = pairs[0]?.baseHex ?? '#000'
  const onPrimary = pairs[0]?.onHex ?? '#fff'
  const container = pairs[1]?.baseHex ?? '#000'
  const onContainer = pairs[1]?.onHex ?? '#fff'
  const surface = pairs[2]?.baseHex ?? '#fff'
  const onSurface = pairs[2]?.onHex ?? '#000'

  // Nominal accent tones the primary + container roles read (for the strip).
  const usedTones = new Set<number>([
    PAIRS[0]?.base[scheme] ?? -1,
    PAIRS[0]?.on[scheme] ?? -1,
    PAIRS[1]?.base[scheme] ?? -1,
    PAIRS[1]?.on[scheme] ?? -1,
  ])

  return (
    <Playground
      question="Material ships thousands of color pairs and audits none of them — how does every pair pass?"
      onReset={() => {
        setSeedId('violet')
        setScheme('light')
        setLevel('standard')
      }}
    >
      <div className="flex flex-col gap-5">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-fg-muted">seed</span>
            <ToggleButtonGroup
              selectionMode="single"
              disallowEmptySelection
              selectedKeys={[seedId]}
              onSelectionChange={(keys) => {
                const next = [...keys][0]
                if (
                  typeof next === 'string' &&
                  SEEDS.some((s) => s.id === next)
                )
                  setSeedId(next as SeedId)
              }}
              size="sm"
              aria-label="Seed color"
              className="max-w-full overflow-x-auto"
            >
              {SEEDS.map((s) => (
                <ToggleButton key={s.id} id={s.id}>
                  {s.label}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-fg-muted">scheme</span>
            <ToggleButtonGroup
              selectionMode="single"
              disallowEmptySelection
              selectedKeys={[scheme]}
              onSelectionChange={(keys) => {
                const next = [...keys][0]
                if (next === 'light' || next === 'dark') setScheme(next)
              }}
              size="sm"
              aria-label="Scheme"
              className="max-w-full overflow-x-auto"
            >
              <ToggleButton id="light">Light</ToggleButton>
              <ToggleButton id="dark">Dark</ToggleButton>
            </ToggleButtonGroup>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-fg-muted">contrast</span>
            <ToggleButtonGroup
              selectionMode="single"
              disallowEmptySelection
              selectedKeys={[level]}
              onSelectionChange={(keys) => {
                const next = [...keys][0]
                if (next === 'standard' || next === 'medium' || next === 'high')
                  setLevel(next)
              }}
              size="sm"
              aria-label="Contrast level"
              className="max-w-full overflow-x-auto"
            >
              <ToggleButton id="standard">Standard</ToggleButton>
              <ToggleButton id="medium">Medium</ToggleButton>
              <ToggleButton id="high">High</ToggleButton>
            </ToggleButtonGroup>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="text-xs text-fg-muted">
            Accent tonal palette — one hue, one chroma, Tone 0→100. Ringed cells
            are the tones the primary and container roles read.
          </span>
          <div className="flex gap-1">
            {PALETTE_TONES.map((t) => (
              <div
                key={t}
                className="flex min-w-0 flex-1 flex-col items-center gap-1"
              >
                <div
                  className={cn(
                    'h-9 w-full rounded-sm border',
                    usedTones.has(t) &&
                      'outline-2 outline-offset-2 outline-fg/70',
                  )}
                  style={{ backgroundColor: hexOf(aH, aC, t) }}
                />
                <span className="font-mono text-[0.55rem] text-fg-muted tabular-nums">
                  {t}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-4 lg:flex-row">
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <span className="text-xs text-fg-muted">Roles, painted</span>
            <div
              className="flex flex-col gap-3 rounded-lg border p-4"
              style={{ backgroundColor: surface }}
            >
              <span
                className="text-sm font-medium"
                style={{ color: onSurface }}
              >
                Quarterly review
              </span>
              <div
                className="flex flex-col gap-1 rounded-md p-3"
                style={{ backgroundColor: container }}
              >
                <span
                  className="text-xs font-medium"
                  style={{ color: onContainer }}
                >
                  In progress
                </span>
                <span className="text-[0.7rem]" style={{ color: onContainer }}>
                  Awaiting review from Sarah
                </span>
              </div>
              <span
                className="w-fit rounded-md px-3 py-1.5 text-[0.7rem] font-medium"
                style={{ backgroundColor: primary, color: onPrimary }}
              >
                Reply
              </span>
            </div>
          </div>

          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <span className="text-xs text-fg-muted">
              Pairs — delta drives contrast, on both meters
            </span>
            <div className="overflow-x-auto">
              <table className="w-full min-w-sm text-left font-mono text-[0.65rem] tabular-nums">
                <thead>
                  <tr className="text-fg-muted">
                    <th className="py-1 pr-2 font-normal">pair</th>
                    <th className="py-1 pr-2 font-normal">Δ</th>
                    <th className="py-1 pr-2 font-normal">WCAG</th>
                    <th className="py-1 font-normal">APCA</th>
                  </tr>
                </thead>
                <tbody aria-live="polite">
                  {pairs.map((p) => (
                    <tr key={p.label} className="border-t">
                      <td className="py-1.5 pr-2">{p.label}</td>
                      <td className="py-1.5 pr-2">{p.delta}</td>
                      <td
                        className={cn(
                          'py-1.5 pr-2',
                          p.w >= 4.5 ? 'text-fg-success' : 'text-fg-warning',
                        )}
                      >
                        {p.w.toFixed(2)}:1
                      </td>
                      <td
                        className={cn(
                          'py-1.5',
                          Math.abs(p.lc) >= 60
                            ? 'text-fg-success'
                            : 'text-fg-warning',
                        )}
                      >
                        Lc {p.lc.toFixed(1)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <span aria-live="polite" className="text-xs text-fg-muted">
              {passing} of {pairs.length} pairs clear both meters — constructed
              by Tone delta, not one of them audited.
            </span>
          </div>
        </div>
      </div>
    </Playground>
  )
}
