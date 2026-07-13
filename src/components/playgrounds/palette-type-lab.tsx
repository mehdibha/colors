import { useState } from 'react'
import {
  clampChroma,
  converter,
  differenceEuclidean,
  filterDeficiencyDeuter,
  filterDeficiencyProt,
  filterDeficiencyTrit,
  formatHex,
} from 'culori'
import type { Rgb } from 'culori'

import { Playground } from '@/components/playground'
import { Slider, SliderControl } from '@/ui/slider'
import { ToggleButton } from '@/ui/toggle-button'
import { ToggleButtonGroup } from '@/ui/toggle-button-group'

const toRgb = converter('rgb')
const toOklch = converter('oklch')
const dEok = differenceEuclidean('oklab')

type PaletteType = 'categorical' | 'sequential' | 'rainbow' | 'diverging'
type View = 'bar' | 'line' | 'heatmap'
type Sim = 'none' | 'deutan' | 'protan' | 'tritan'
type Surface = 'light' | 'dark'

const SURFACE = { light: '#ffffff', dark: '#111113' }
const LABEL = { light: '#52525b', dark: '#a1a1aa' }

// ch9's judgment thresholds.
const MERGED = 0.06
const RISKY = 0.12

const FILTERS: Record<Exclude<Sim, 'none'>, (c: Rgb) => Rgb> = {
  deutan: filterDeficiencyDeuter(1),
  protan: filterDeficiencyProt(1),
  tritan: filterDeficiencyTrit(1),
}

// One dataset: 6 series × 12 points.
const SERIES = ['North', 'South', 'East', 'West', 'Online', 'Retail']
const DATA = SERIES.map((_, s) =>
  Array.from(
    { length: 12 },
    (_, m) =>
      40 + s * 7 + 24 * Math.sin((m / 11) * Math.PI * 1.6 + s * 0.9) + m * 1.2,
  ),
)
const FLAT = DATA.flat()
const VMIN = Math.min(...FLAT)
const VMAX = Math.max(...FLAT)
const VMEAN = FLAT.reduce((a, b) => a + b, 0) / FLAT.length
const MAXDEV = Math.max(...FLAT.map((v) => Math.abs(v - VMEAN)))
const norm = (v: number) => (v - VMIN) / (VMAX - VMIN)
const dev = (v: number) => 0.5 + (v - VMEAN) / (2 * MAXDEV)

const clamp01 = (x: number) => Math.max(0, Math.min(1, x))
const oklch = (l: number, c: number, h: number) =>
  formatHex(clampChroma({ mode: 'oklch', l, c, h }, 'oklch')) ?? '#000000'

// Categorical: even hue spread from the seed, three-cycle L stagger.
function categorical(seed: number, n: number): string[] {
  const offs = [0, 0.11, -0.09]
  return Array.from({ length: n }, (_, i) =>
    oklch(0.62 + (offs[i % 3] ?? 0), 0.15, (seed + (360 / n) * i) % 360),
  )
}

// Sequential: L a straight line anchored to the surface, hue drifting, C arced under the tent.
function sequential(t: number, seed: number, surface: Surface): string {
  const l = surface === 'dark' ? 0.25 + 0.65 * t : 0.93 - 0.61 * t
  const c = 0.03 + 0.22 * Math.sin(Math.PI * (0.15 + 0.85 * t))
  return oklch(l, c, (seed - 40 * t + 360) % 360)
}

// Classic MATLAB jet.
function rainbow(t: number): string {
  return (
    formatHex({
      mode: 'rgb',
      r: clamp01(Math.min(4 * t - 1.5, -4 * t + 4.5)),
      g: clamp01(Math.min(4 * t - 0.5, -4 * t + 3.5)),
      b: clamp01(Math.min(4 * t + 0.5, -4 * t + 2.5)),
    }) ?? '#000000'
  )
}

// Diverging: two sequential arms, midpoint pinned to the surface neutral.
function diverging(t: number, seed: number, surface: Surface): string {
  const dark = surface === 'dark'
  const u = Math.abs(2 * t - 1)
  const midL = dark ? 0.24 : 0.976
  const endL = dark ? 0.8 : 0.4
  const h = t < 0.5 ? (seed + 180) % 360 : seed
  return oklch(midL + (endL - midL) * u, 0.004 + 0.15 * u ** 0.9, h)
}

const verdictTone = (de: number) =>
  de < MERGED ? 'bad' : de < RISKY ? 'warn' : 'ok'

export function PaletteTypeLab() {
  const [palette, setPalette] = useState<PaletteType>('categorical')
  const [view, setView] = useState<View>('line')
  const [sim, setSim] = useState<Sim>('none')
  const [surface, setSurface] = useState<Surface>('light')
  const [seed, setSeed] = useState(251)

  const shown = (hex: string) => {
    if (sim === 'none') return hex
    const rgb = toRgb(hex)
    return rgb ? (formatHex(FILTERS[sim](rgb)) ?? hex) : hex
  }

  const ramp = (t: number) =>
    palette === 'sequential'
      ? sequential(t, seed, surface)
      : palette === 'rainbow'
        ? rainbow(t)
        : diverging(t, seed, surface)

  // What the legend hands each series.
  const legend =
    palette === 'categorical'
      ? categorical(seed, 6)
      : SERIES.map((_, i) => ramp(i / 5))

  const valueColor = (v: number, s: number) =>
    palette === 'categorical'
      ? (legend[s] ?? '#000000')
      : palette === 'diverging'
        ? ramp(dev(v))
        : ramp(norm(v))

  // Meter 1 — legend separation under the current filter.
  let worst = { de: Infinity, a: 0, b: 0 }
  for (let i = 0; i < legend.length; i++)
    for (let j = i + 1; j < legend.length; j++) {
      const a = legend[i]
      const b = legend[j]
      if (!a || !b) continue
      const de = dEok(shown(a), shown(b))
      if (de < worst.de) worst = { de, a: i, b: j }
    }

  // Meter 2 — lightness path of the ramp (or the categorical set, in order).
  const lPath =
    palette === 'categorical'
      ? legend.map((hex) => toOklch(hex)?.l ?? 0)
      : Array.from({ length: 25 }, (_, i) => toOklch(ramp(i / 24))?.l ?? 0)
  let reversals = 0
  let lastDir = 0
  for (let i = 1; i < lPath.length; i++) {
    const d = (lPath[i] ?? 0) - (lPath[i - 1] ?? 0)
    if (Math.abs(d) < 0.004) continue
    const s = Math.sign(d)
    if (lastDir !== 0 && s !== lastDir) reversals++
    lastDir = s
  }
  const monoVerdict =
    palette === 'categorical'
      ? {
          text: 'no order encoded — six disjoint colors, by design',
          tone: 'ok' as const,
        }
      : palette === 'diverging'
        ? reversals === 1
          ? {
              text: 'two monotonic arms meeting mid-scale — by design',
              tone: 'ok' as const,
            }
          : {
              text: `${reversals} direction changes — arms are not clean`,
              tone: 'bad' as const,
            }
        : reversals === 0
          ? {
              text: 'monotonic — lightness climbs the whole range',
              tone: 'ok' as const,
            }
          : {
              text: `${reversals} direction changes — equal data steps get unequal (even opposite) lightness steps`,
              tone: 'bad' as const,
            }

  // Meter 3 — the quiet point vs the surface.
  const quietT = palette === 'diverging' ? 0.5 : 0
  const quiet = palette === 'categorical' ? undefined : ramp(quietT)
  const quietDe = quiet ? dEok(quiet, SURFACE[surface]) : 0
  const quietVerdict = quiet
    ? quietDe < 0.12
      ? {
          text: `${palette === 'diverging' ? 'midpoint' : 'low end'} sits near the surface (ΔEok ${quietDe.toFixed(2)}) — “nothing” stays quiet`,
          tone: 'ok' as const,
        }
      : {
          text: `${palette === 'diverging' ? 'midpoint' : 'low end'} is ΔEok ${quietDe.toFixed(2)} off the surface — the quiet end shouts`,
          tone: 'bad' as const,
        }
    : { text: 'not a ramp — no anchor to check', tone: 'ok' as const }

  const labelColor = LABEL[surface]
  const barTotals = DATA.map((row) => row.reduce((a, b) => a + b, 0) / 12)

  return (
    <Playground
      question="Which of the three palette contracts does your chart need — and does your palette keep it under other eyes?"
      onReset={() => {
        setPalette('categorical')
        setView('line')
        setSim('none')
        setSurface('light')
        setSeed(251)
      }}
    >
      <div className="flex flex-col gap-5">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="shrink-0 text-xs text-fg-muted">Palette</span>
            <ToggleButtonGroup
              selectionMode="single"
              disallowEmptySelection
              selectedKeys={[palette]}
              onSelectionChange={(keys) =>
                setPalette([...keys][0] as PaletteType)
              }
              size="sm"
              aria-label="Palette type"
              className="max-w-full overflow-x-auto"
            >
              <ToggleButton id="categorical">Categorical</ToggleButton>
              <ToggleButton id="sequential">Sequential</ToggleButton>
              <ToggleButton id="rainbow">Rainbow</ToggleButton>
              <ToggleButton id="diverging">Diverging</ToggleButton>
            </ToggleButtonGroup>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="shrink-0 text-xs text-fg-muted">View</span>
            <ToggleButtonGroup
              selectionMode="single"
              disallowEmptySelection
              selectedKeys={[view]}
              onSelectionChange={(keys) => setView([...keys][0] as View)}
              size="sm"
              aria-label="Chart type"
              className="max-w-full overflow-x-auto"
            >
              <ToggleButton id="bar">Bar</ToggleButton>
              <ToggleButton id="line">Line</ToggleButton>
              <ToggleButton id="heatmap">Heatmap</ToggleButton>
            </ToggleButtonGroup>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="shrink-0 text-xs text-fg-muted">Simulate</span>
            <ToggleButtonGroup
              selectionMode="single"
              disallowEmptySelection
              selectedKeys={[sim]}
              onSelectionChange={(keys) => setSim([...keys][0] as Sim)}
              size="sm"
              aria-label="Color vision deficiency"
              className="max-w-full overflow-x-auto"
            >
              <ToggleButton id="none">Normal</ToggleButton>
              <ToggleButton id="deutan">Deutan</ToggleButton>
              <ToggleButton id="protan">Protan</ToggleButton>
              <ToggleButton id="tritan">Tritan</ToggleButton>
            </ToggleButtonGroup>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="shrink-0 text-xs text-fg-muted">Surface</span>
            <ToggleButtonGroup
              selectionMode="single"
              disallowEmptySelection
              selectedKeys={[surface]}
              onSelectionChange={(keys) => setSurface([...keys][0] as Surface)}
              size="sm"
              aria-label="Dashboard surface"
            >
              <ToggleButton id="light">Light</ToggleButton>
              <ToggleButton id="dark">Dark</ToggleButton>
            </ToggleButtonGroup>
          </div>
          <div className="flex min-w-44 flex-1 items-center gap-3">
            <span className="shrink-0 text-xs text-fg-muted">Seed hue</span>
            <Slider
              aria-label="Seed hue"
              value={seed}
              onChange={(v) => setSeed(v as number)}
              minValue={0}
              maxValue={359}
              step={1}
              className="flex-1"
            >
              <SliderControl />
            </Slider>
            <span className="w-9 shrink-0 text-right font-mono text-xs text-fg-muted tabular-nums">
              {seed}°
            </span>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1fr_17rem]">
          <div
            className="flex flex-col gap-3 rounded-lg border p-4"
            style={{ backgroundColor: SURFACE[surface] }}
          >
            {view === 'bar' && (
              <div className="flex h-44 items-end gap-2">
                {barTotals.map((v, s) => (
                  <div
                    key={SERIES[s]}
                    className="flex flex-1 flex-col items-center gap-1"
                  >
                    <div className="flex w-full flex-1 items-end">
                      <div
                        className="w-full rounded-t-sm"
                        style={{
                          height: `${norm(v) * 80 + 15}%`,
                          backgroundColor: shown(valueColor(v, s)),
                        }}
                      />
                    </div>
                    <span
                      className="truncate text-[0.6rem]"
                      style={{ color: labelColor }}
                    >
                      {SERIES[s]}
                    </span>
                  </div>
                ))}
              </div>
            )}
            {view === 'line' && (
              <svg
                viewBox="0 0 480 170"
                className="w-full"
                role="img"
                aria-label="Line chart of six series"
              >
                {DATA.map((row, s) => (
                  <polyline
                    key={SERIES[s]}
                    fill="none"
                    stroke={shown(legend[s] ?? '#000000')}
                    strokeWidth="2.5"
                    points={row
                      .map(
                        (v, m) =>
                          `${14 + (m / 11) * 452},${158 - norm(v) * 146}`,
                      )
                      .join(' ')}
                  />
                ))}
              </svg>
            )}
            {view === 'heatmap' && (
              <div className="flex flex-col gap-1">
                {DATA.map((row, s) => (
                  <div key={SERIES[s]} className="flex items-center gap-2">
                    <span
                      className="w-10 shrink-0 text-right text-[0.6rem]"
                      style={{ color: labelColor }}
                    >
                      {SERIES[s]}
                    </span>
                    <div className="flex flex-1 gap-1">
                      {row.map((v, m) => (
                        // oxlint-disable-next-line no-array-index-key -- fixed grid
                        <div
                          key={m}
                          className="h-6 flex-1 rounded-xs"
                          style={{ backgroundColor: shown(valueColor(v, s)) }}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              {palette === 'categorical' ? (
                SERIES.map((name, i) => (
                  <span key={name} className="inline-flex items-center gap-1.5">
                    <span
                      className="size-2.5 rounded-sm"
                      style={{ backgroundColor: shown(legend[i] ?? '#000000') }}
                    />
                    <span
                      className="text-[0.65rem]"
                      style={{ color: labelColor }}
                    >
                      {name}
                    </span>
                  </span>
                ))
              ) : (
                <div className="flex h-3 w-full max-w-72 overflow-hidden rounded-sm">
                  {Array.from({ length: 48 }, (_, i) => (
                    // oxlint-disable-next-line no-array-index-key -- fixed strip
                    <div
                      key={i}
                      className="flex-1"
                      style={{ backgroundColor: shown(ramp(i / 47)) }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-3 rounded-lg border bg-muted p-4">
            <div className="font-mono text-[0.7rem] tracking-wider text-fg-muted uppercase">
              Contract checks
            </div>
            <Meter
              title="Distinguishable series (categorical)"
              tone={verdictTone(worst.de)}
              body={`Closest legend pair ${SERIES[worst.a] ?? ''} vs ${SERIES[worst.b] ?? ''}: ΔEok ${worst.de.toFixed(3)} under ${sim === 'none' ? 'normal vision' : sim} — ${worst.de < MERGED ? 'merged' : worst.de < RISKY ? 'risky' : 'distinct'}.`}
            />
            <div className="flex flex-col gap-1">
              <Meter
                title="Monotonic lightness (sequential)"
                tone={monoVerdict.tone}
                body={monoVerdict.text}
              />
              <svg
                viewBox="0 0 120 30"
                className="h-8 w-28 rounded-sm border bg-card"
                role="img"
                aria-label="Lightness along the palette"
              >
                <polyline
                  points={lPath
                    .map(
                      (l, i) =>
                        `${4 + (i / (lPath.length - 1)) * 112},${27 - l * 24}`,
                    )
                    .join(' ')}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="text-fg-muted"
                />
              </svg>
            </div>
            <Meter
              title="Quiet point vs surface (diverging)"
              tone={quietVerdict.tone}
              body={quietVerdict.text}
            />
          </div>
        </div>

        <p className="text-sm text-fg-muted">
          Each palette type passes exactly one check by construction. The
          categorical set holds the separation row (watch it under each filter);
          the sequential ramp owns the lightness row; the diverging scale owns
          the anchor row. Rainbow passes none — and switching the view shows the
          other half of the story: a sequential ramp on the line chart hands
          adjacent series near-identical colors, and the categorical set on the
          heatmap throws the values away entirely.
        </p>
      </div>
    </Playground>
  )
}

function Meter({
  title,
  body,
  tone,
}: {
  title: string
  body: string
  tone: 'ok' | 'warn' | 'bad'
}) {
  const dot =
    tone === 'ok' ? 'bg-success' : tone === 'warn' ? 'bg-warning' : 'bg-danger'
  return (
    <div className="flex flex-col gap-0.5">
      <div className="flex items-center gap-2">
        <span className={`size-2 shrink-0 rounded-full ${dot}`} />
        <span className="text-xs font-medium">{title}</span>
      </div>
      <p aria-live="polite" className="text-xs text-fg-muted tabular-nums">
        {body}
      </p>
    </div>
  )
}
