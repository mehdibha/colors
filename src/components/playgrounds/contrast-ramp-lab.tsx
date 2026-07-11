import { useMemo, useState } from 'react'
import { clampChroma, converter, formatHex, wcagContrast } from 'culori'

import { apcaLc } from '@/lib/apca'
import { cn } from '@/lib/utils'
import { Playground } from '@/components/playground'
import { ToggleButton } from '@/ui/toggle-button'
import { ToggleButtonGroup } from '@/ui/toggle-button-group'

type Bg = 'light' | 'dark'
type Meter = 'wcag' | 'apca'
type HueKey = 'blue' | 'red' | 'green' | 'amber'

const toOklch = converter('oklch')

const BG: Record<Bg, string> = { light: '#f8f8f8', dark: '#151517' }
const HUES: Record<HueKey, { h: number; c: number; label: string }> = {
  blue: { h: 255, c: 0.14, label: 'Blue' },
  red: { h: 27, c: 0.16, label: 'Red' },
  green: { h: 150, c: 0.15, label: 'Green' },
  amber: { h: 75, c: 0.15, label: 'Amber' },
}

// Spectrum's index-to-ratio anchors live in the WCAG column (700 ≈ 3:1, 900 ≈ 4.5:1).
// The APCA column mirrors chapter 8's thresholds (Lc 75 = 18px body-text minimum).
const TARGETS: Record<Meter, { t: number; label: string }[]> = {
  wcag: [
    { t: 1.5, label: 'subtle surface' },
    { t: 2.2, label: 'hovered surface' },
    { t: 3, label: '700 · 3:1 large text / icon' },
    { t: 4.5, label: '900 · 4.5:1 body text' },
    { t: 7, label: 'AAA body text' },
    { t: 12, label: 'max text' },
  ],
  apca: [
    { t: 15, label: 'subtle surface' },
    { t: 30, label: 'hovered surface' },
    { t: 45, label: 'large headline' },
    { t: 60, label: 'large / secondary text' },
    { t: 75, label: 'body text' },
    { t: 90, label: 'preferred body' },
  ],
}

interface Solved {
  t: number
  label: string
  hex: string
  l: number
  w: number
  a: number
  met: boolean
}

// Approximates Leonardo: walk OKLCH lightness until the chosen meter hits the target.
function solve(
  bgHex: string,
  bgL: number,
  target: number,
  h: number,
  c: number,
  meter: Meter,
) {
  const wantDarker = bgL > 0.5
  let best: { hex: string; l: number; w: number; a: number; c: number } | null =
    null
  let extreme: {
    hex: string
    l: number
    w: number
    a: number
    c: number
  } | null = null
  const N = 240
  for (let i = 0; i <= N; i++) {
    const l = i / N
    if (wantDarker && l > bgL) continue
    if (!wantDarker && l < bgL) continue
    const hex = formatHex(
      clampChroma({ mode: 'oklch' as const, l, c, h }, 'oklch'),
    )
    const w = wcagContrast(hex, bgHex)
    const a = Math.abs(apcaLc(hex, bgHex))
    const metric = meter === 'wcag' ? w : a
    if (extreme === null || metric > extreme.c)
      extreme = { hex, l, w, a, c: metric }
    if (metric >= target && (best === null || metric < best.c))
      best = { hex, l, w, a, c: metric }
  }
  const pick = best ?? extreme ?? { hex: bgHex, l: bgL, w: 1, a: 0, c: 0 }
  return {
    hex: pick.hex,
    l: pick.l,
    w: pick.w,
    a: pick.a,
    met: best !== null,
  }
}

const W = 520
const H = 96
const PAD = { left: 8, right: 8, top: 10, bottom: 10 }

export function ContrastRampLab() {
  const [bg, setBg] = useState<Bg>('light')
  const [hue, setHue] = useState<HueKey>('blue')
  const [meter, setMeter] = useState<Meter>('wcag')

  const bgHex = BG[bg]
  const bgL = toOklch(bgHex)?.l ?? 1
  const { h, c } = HUES[hue]

  const steps: Solved[] = useMemo(
    () =>
      TARGETS[meter].map((tg) => ({
        t: tg.t,
        label: tg.label,
        ...solve(bgHex, bgL, tg.t, h, c, meter),
      })),
    [bgHex, bgL, h, c, meter],
  )

  const allMet = steps.every((s) => s.met)

  const n = steps.length
  const px = (i: number) =>
    PAD.left + (i / (n - 1)) * (W - PAD.left - PAD.right)
  const py = (l: number) => PAD.top + (1 - l) * (H - PAD.top - PAD.bottom)
  const first = steps[0]?.l ?? 0
  const last = steps[n - 1]?.l ?? 0
  const evenRef = `M${px(0).toFixed(1)},${py(first).toFixed(1)} L${px(n - 1).toFixed(1)},${py(last).toFixed(1)}`
  const actual = steps
    .map(
      (s, i) =>
        `${i === 0 ? 'M' : 'L'}${px(i).toFixed(1)},${py(s.l).toFixed(1)}`,
    )
    .join(' ')

  const meterLabel = meter === 'wcag' ? 'WCAG ratio' : 'APCA Lc'

  return (
    <Playground
      question="Make contrast the input and lightness the output — what falls out free, and what do you bake in?"
      onReset={() => {
        setBg('light')
        setHue('blue')
        setMeter('wcag')
      }}
    >
      <div className="flex flex-col gap-5">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
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
          <div className="flex items-center gap-2">
            <span className="text-xs text-fg-muted">hue</span>
            <ToggleButtonGroup
              selectionMode="single"
              disallowEmptySelection
              selectedKeys={[hue]}
              onSelectionChange={(keys) => {
                const next = [...keys][0]
                if (typeof next === 'string' && next in HUES)
                  setHue(next as HueKey)
              }}
              size="sm"
              aria-label="Key hue"
              className="max-w-full overflow-x-auto"
            >
              {(Object.keys(HUES) as HueKey[]).map((k) => (
                <ToggleButton key={k} id={k}>
                  {HUES[k].label}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-fg-muted">target meter</span>
            <ToggleButtonGroup
              selectionMode="single"
              disallowEmptySelection
              selectedKeys={[meter]}
              onSelectionChange={(keys) => {
                const next = [...keys][0]
                if (next === 'wcag' || next === 'apca') setMeter(next)
              }}
              size="sm"
              aria-label="Contrast formula the ramp targets"
              className="max-w-full overflow-x-auto"
            >
              <ToggleButton id="wcag">WCAG</ToggleButton>
              <ToggleButton id="apca">APCA</ToggleButton>
            </ToggleButtonGroup>
          </div>
        </div>

        <div
          className="flex gap-1 rounded-lg border p-3"
          style={{ backgroundColor: bgHex }}
        >
          {steps.map((s, i) => (
            <div
              key={i}
              className="flex min-w-0 flex-1 flex-col items-center gap-1"
            >
              <div
                className="h-12 w-full rounded-md border"
                style={{ backgroundColor: s.hex }}
              />
              <span
                className="font-mono text-[0.6rem] tabular-nums"
                style={{ color: bg === 'light' ? '#666' : '#999' }}
              >
                {meter === 'wcag' ? `${s.t}:1` : `Lc ${s.t}`}
              </span>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-xs text-fg-muted">
            Lightness per step &mdash; solid line is what landed, dashed is even
            spacing. The gap is chapter 11&rsquo;s drift.
          </span>
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="h-auto w-full text-fg"
            role="img"
            aria-label="OKLCH lightness of each solved step versus an even-spacing reference line"
          >
            <path
              d={evenRef}
              fill="none"
              stroke="currentColor"
              strokeOpacity={0.25}
              strokeDasharray="4 4"
            />
            <path
              d={actual}
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              strokeOpacity={0.7}
            />
            {steps.map((s, i) => (
              <circle
                key={i}
                cx={px(i)}
                cy={py(s.l)}
                r={4}
                fill={s.hex}
                stroke="currentColor"
                strokeOpacity={0.6}
              />
            ))}
          </svg>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-md text-left font-mono text-[0.65rem] tabular-nums">
            <thead>
              <tr className="text-fg-muted">
                <th className="py-1 pr-3 font-normal">job · target</th>
                <th className="py-1 pr-3 font-normal">L</th>
                <th className="py-1 pr-3 font-normal">ΔL</th>
                <th className="py-1 pr-3 font-normal">WCAG</th>
                <th className="py-1 font-normal">APCA</th>
              </tr>
            </thead>
            <tbody>
              {steps.map((s, i) => {
                const prev = steps[i - 1]
                const dL = prev ? s.l - prev.l : 0
                return (
                  <tr key={i} className="border-t">
                    <td className="py-1.5 pr-3">{s.label}</td>
                    <td className="py-1.5 pr-3 text-fg-muted">
                      {s.l.toFixed(3)}
                    </td>
                    <td className="py-1.5 pr-3 text-fg-muted">
                      {i === 0 ? '—' : `${dL >= 0 ? '+' : ''}${dL.toFixed(3)}`}
                    </td>
                    <td
                      className={cn(
                        'py-1.5 pr-3',
                        meter === 'wcag' && 'font-medium',
                      )}
                    >
                      {s.w.toFixed(2)}:1
                    </td>
                    <td
                      className={cn(
                        'py-1.5',
                        meter === 'apca' && 'font-medium',
                      )}
                    >
                      Lc {s.a.toFixed(0)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <span aria-live="polite" className="text-xs text-fg-muted">
          Targeting {meterLabel} against the {bg} surface.{' '}
          {allMet
            ? 'Every step meets its target by construction — no audit ran.'
            : 'A target sits past this hue’s reach; that step ships the strongest color available.'}{' '}
          Toggle the surface for a second mode at the same targets; toggle the
          meter to watch the ramp shift.
        </span>
      </div>
    </Playground>
  )
}
