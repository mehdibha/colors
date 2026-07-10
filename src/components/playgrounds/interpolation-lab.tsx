import { useState } from 'react'
import type { Color } from 'culori'
import {
  converter,
  fixupHueDecreasing,
  fixupHueIncreasing,
  fixupHueLonger,
  fixupHueShorter,
  formatHex,
  interpolate,
  wcagLuminance,
} from 'culori'

import { Playground } from '@/components/playground'
import { ToggleButton } from '@/ui/toggle-button'
import { ToggleButtonGroup } from '@/ui/toggle-button-group'

const toRgb = converter('rgb')
const toOklch = converter('oklch')

const N = 64
const EPS = 1e-6

const grayHexFor = (y: number) =>
  formatHex(toRgb({ mode: 'lrgb', r: y, g: y, b: y }))

// hue re-rendered at one fixed L/C — chapter 5's steering instrument
const hueChip = (h: number | undefined) =>
  formatHex(
    toRgb({ mode: 'oklch', l: 0.7, c: h === undefined ? 0 : 0.1, h: h ?? 0 }),
  )

const inSrgb = (color: Color) => {
  const rgb = toRgb(color)
  return [rgb.r, rgb.g, rgb.b].every((v) => v >= -EPS && v <= 1 + EPS)
}

const HUE_PATHS = [
  { id: 'shorter', fixup: fixupHueShorter },
  { id: 'longer', fixup: fixupHueLonger },
  { id: 'increasing', fixup: fixupHueIncreasing },
  { id: 'decreasing', fixup: fixupHueDecreasing },
] as const

type HuePathId = (typeof HUE_PATHS)[number]['id']

function buildRow(
  a: string,
  b: string,
  mode: 'rgb' | 'lrgb' | 'oklab' | 'oklch',
  fixup?: (typeof HUE_PATHS)[number]['fixup'],
) {
  // empty channel entries appease @types/culori; runtime ignores them
  const at = fixup
    ? interpolate([a, b], 'oklch', { l: {}, c: {}, h: { fixup }, alpha: {} })
    : interpolate([a, b], mode)
  const samples = Array.from({ length: N }, (_, i) => at(i / (N - 1)))
  // formatHex clips per channel — exactly what an sRGB screen shows
  const hexes = samples.map((c) => formatHex(toRgb(c)))
  const outMask = samples.map((c) => !inSrgb(c))
  const midLch = toOklch(at(0.5))
  return {
    hexes,
    twins: hexes.map((hex) => grayHexFor(wcagLuminance(hex ?? '#000'))),
    hueChips: samples.map((c) => hueChip(toOklch(c).h)),
    outMask,
    outPct: Math.round((outMask.filter(Boolean).length / N) * 100),
    mid: { hex: formatHex(toRgb(at(0.5))), chroma: midLch.c ?? 0 },
  }
}

const PAIRS = [
  { id: 'blue-yellow', label: 'Blue → Yellow', a: '#0000ff', b: '#ffff00' },
  { id: 'red-green', label: 'Red → Green', a: '#ff0000', b: '#00ff00' },
  { id: 'black-white', label: 'Black → White', a: '#000000', b: '#ffffff' },
  { id: 'two-blues', label: 'Two blues', a: '#1e3a8a', b: '#93c5fd' },
] as const

const ROWS = new Map<string, ReturnType<typeof buildRow>>(
  PAIRS.flatMap((pair) => [
    ...(['rgb', 'lrgb', 'oklab'] as const).map(
      (mode) => [`${pair.id}:${mode}`, buildRow(pair.a, pair.b, mode)] as const,
    ),
    ...HUE_PATHS.map(
      (path) =>
        [
          `${pair.id}:oklch:${path.id}`,
          buildRow(pair.a, pair.b, 'oklch', path.fixup),
        ] as const,
    ),
  ]),
)

export function InterpolationLab() {
  const [pairId, setPairId] = useState<string>('blue-yellow')
  const [huePath, setHuePath] = useState<HuePathId>('shorter')

  const rows = [
    { label: 'sRGB — gamma values', row: ROWS.get(`${pairId}:rgb`) },
    { label: 'Linear sRGB — light', row: ROWS.get(`${pairId}:lrgb`) },
    { label: 'OKLab — perceptual', row: ROWS.get(`${pairId}:oklab`) },
    {
      label: `OKLCH — perceptual, polar (${huePath} hue)`,
      row: ROWS.get(`${pairId}:oklch:${huePath}`),
    },
  ]

  const reset = () => {
    setPairId('blue-yellow')
    setHuePath('shorter')
  }

  return (
    <Playground
      question="Same two endpoints — who picks the middle?"
      onReset={reset}
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-fg-muted">Endpoints</span>
            <ToggleButtonGroup
              selectionMode="single"
              disallowEmptySelection
              selectedKeys={[pairId]}
              onSelectionChange={(keys) => setPairId([...keys][0] as string)}
              size="sm"
              aria-label="Endpoint pair"
            >
              {PAIRS.map((pair) => (
                <ToggleButton key={pair.id} id={pair.id}>
                  {pair.label}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-fg-muted">OKLCH hue path</span>
            <ToggleButtonGroup
              selectionMode="single"
              disallowEmptySelection
              selectedKeys={[huePath]}
              onSelectionChange={(keys) =>
                setHuePath([...keys][0] as HuePathId)
              }
              size="sm"
              aria-label="OKLCH hue path"
            >
              {HUE_PATHS.map((path) => (
                <ToggleButton key={path.id} id={path.id}>
                  {path.id}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          {rows.map(({ label, row }) =>
            row ? (
              <div key={label} className="flex flex-col gap-1.5">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="font-mono text-[0.7rem] tracking-wider text-fg-muted uppercase">
                    {label}
                  </span>
                  <span className="font-mono text-[0.7rem] text-fg-muted tabular-nums">
                    mid {row.mid.hex} · C {row.mid.chroma.toFixed(3)}
                    {row.outPct > 0 && ` · ${row.outPct}% out of sRGB`}
                  </span>
                </div>
                <div className="flex h-12 overflow-hidden rounded-lg border">
                  {row.hexes.map((hex, i) => (
                    <div
                      key={i}
                      className="flex-1"
                      style={{ backgroundColor: hex }}
                    />
                  ))}
                </div>
                {row.outPct > 0 && (
                  <div className="flex h-1">
                    {row.outMask.map((out, i) => (
                      <div
                        key={i}
                        className={out ? 'flex-1 bg-fg/60' : 'flex-1'}
                      />
                    ))}
                  </div>
                )}
                <div className="flex h-3 overflow-hidden rounded-sm border">
                  {row.twins.map((hex, i) => (
                    <div
                      key={i}
                      className="flex-1"
                      style={{ backgroundColor: hex }}
                    />
                  ))}
                </div>
                <div className="flex h-3 overflow-hidden rounded-sm border">
                  {row.hueChips.map((hex, i) => (
                    <div
                      key={i}
                      className="flex-1"
                      style={{ backgroundColor: hex }}
                    />
                  ))}
                </div>
              </div>
            ) : null,
          )}
        </div>

        <p className="text-sm text-fg-muted">
          Chapter 5's two instruments under each gradient: its light as
          luminance-matched grays (is the pacing even, or does the middle sag
          dark or balloon bright?), and its hue path re-rendered at one fixed
          lightness and chroma (does the walk stay on course? it turns gray
          where the path is literally hueless). The dark ticks are new: they
          mark where a path asked for colors outside sRGB — your screen is
          clipping those pixels, which is the next section's subject.
        </p>
      </div>
    </Playground>
  )
}
