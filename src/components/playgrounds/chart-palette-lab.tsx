import { useMemo, useState } from 'react'
import {
  clampChroma,
  converter,
  differenceEuclidean,
  filterDeficiencyDeuter,
  filterDeficiencyProt,
  filterDeficiencyTrit,
  formatHex,
  samples,
  wcagContrast,
} from 'culori'

import { Playground } from '@/components/playground'
import { ToggleButton } from '@/ui/toggle-button'
import { ToggleButtonGroup } from '@/ui/toggle-button-group'

const toOklch = converter('oklch')
const toRgb = converter('rgb')
const dEOK = differenceEuclidean('oklab')

type PType = 'categorical' | 'sequential' | 'diverging'
type Source = 'generated' | 'okabe'
type Cvd = 'none' | 'deutan' | 'protan' | 'tritan'
type Tone = 'ok' | 'warn' | 'bad'

const PLOT_BG = '#ffffff'
const RISKY = 0.12 // ch9's glance-apart heuristic (ΔEOK)
const MERGED = 0.06
const CEILING = 8

// Okabe-Ito 8-color CVD-safe qualitative set (jfly.uni-koeln.de/color), canonical order.
const OKABE = [
  '#E69F00',
  '#56B4E9',
  '#009E73',
  '#F0E442',
  '#0072B2',
  '#D55E00',
  '#CC79A7',
  '#000000',
]

const maxC = (l: number, h: number): number =>
  clampChroma({ mode: 'oklch', l, c: 0.4, h }, 'oklch').c ?? 0

// N hues evenly spaced at one L and one C; C capped by the tent's tightest hue (ch6).
function categorical(n: number): string[] {
  const L = 0.65
  const base = 25
  const hues = Array.from({ length: n }, (_, i) => (base + (i * 360) / n) % 360)
  const cSet = Math.min(...hues.map((h) => maxC(L, h)))
  return hues.map((h) =>
    formatHex(clampChroma({ mode: 'oklch', l: L, c: cSet, h }, 'oklch')),
  )
}

// One hue, monotonic lightness top to bottom (ch11 lightness-anchored).
function sequential(n: number): string[] {
  const h = 255
  return samples(n).map((t) =>
    formatHex(
      clampChroma(
        {
          mode: 'oklch',
          l: 0.95 - t * (0.95 - 0.3),
          c: 0.02 + 0.12 * Math.sin(Math.PI * t),
          h,
        },
        'oklch',
      ),
    ),
  )
}

// Two arms climbing to a light neutral center (ch15), never gray concrete (ch7).
// Parity-independent: the innermost sample(s) sit at a near-white neutral for any n,
// so the midpoint meter reads a real light center whether n is even or odd.
function diverging(n: number): string[] {
  const center = (n - 1) / 2
  const ds = Array.from({ length: n }, (_, i) => Math.abs(i - center))
  const levels = Array.from(new Set(ds.filter((d) => d > 1e-9))).sort(
    (a, b) => a - b,
  )
  const maxRank = levels.length
  return ds.map((d, i) => {
    let l: number
    let c: number
    if (d < 1e-9) {
      l = 0.96
      c = 0.006
    } else {
      const rank = levels.indexOf(d) + 1
      const f = maxRank > 1 ? (rank - 1) / (maxRank - 1) : 1
      l = 0.94 - f * (0.94 - 0.44)
      c = 0.02 + f * (0.16 - 0.02)
    }
    const h = i < center ? 250 : 25
    return formatHex(clampChroma({ mode: 'oklch', l, c, h }, 'oklch'))
  })
}

function makeSeen(cvd: Cvd): (hex: string) => string {
  if (cvd === 'none') return (hex) => hex
  const f =
    cvd === 'deutan'
      ? filterDeficiencyDeuter(1)
      : cvd === 'protan'
        ? filterDeficiencyProt(1)
        : filterDeficiencyTrit(1)
  return (hex) => {
    const rgb = toRgb(hex)
    return rgb ? (formatHex(f(rgb)) ?? hex) : hex
  }
}

function minPairwise(p: string[], seen: (h: string) => string): number {
  let m = Infinity
  for (let i = 0; i < p.length; i++) {
    const a = p[i]
    if (!a) continue
    for (let j = i + 1; j < p.length; j++) {
      const b = p[j]
      if (!b) continue
      m = Math.min(m, dEOK(seen(a), seen(b)))
    }
  }
  return Number.isFinite(m) ? m : 0
}

function minAdjacent(p: string[], seen: (h: string) => string): number {
  let m = Infinity
  for (let i = 1; i < p.length; i++) {
    const a = p[i - 1]
    const b = p[i]
    if (!a || !b) continue
    m = Math.min(m, dEOK(seen(a), seen(b)))
  }
  return Number.isFinite(m) ? m : 0
}

function collisions(p: string[], seen: (h: string) => string): number {
  let n = 0
  for (let i = 0; i < p.length; i++) {
    const a = p[i]
    if (!a) continue
    for (let j = i + 1; j < p.length; j++) {
      const b = p[j]
      if (!b) continue
      if (dEOK(seen(a), seen(b)) < RISKY) n++
    }
  }
  return n
}

const GROUPS = ['Q1', 'Q2', 'Q3', 'Q4']
const catData = (n: number): number[][] =>
  GROUPS.map((_, g) =>
    Array.from({ length: n }, (_, i) => 24 + ((i * 37 + g * 19) % 60)),
  )
const seqData = (n: number): number[] =>
  Array.from({ length: n }, (_, i) => 16 + (n > 1 ? i / (n - 1) : 0) * 80)

const DW = 520
const DH = 150
const DPAD = 6
const DGAP = 6

const toneOf = (de: number): Tone =>
  de < MERGED ? 'bad' : de < RISKY ? 'warn' : 'ok'

const COUNTS = [3, 4, 5, 6, 7, 8, 9, 10]

export function ChartPaletteLab() {
  const [type, setType] = useState<PType>('categorical')
  const [count, setCount] = useState(6)
  const [source, setSource] = useState<Source>('generated')
  const [cvd, setCvd] = useState<Cvd>('none')

  const palette = useMemo(() => {
    if (type === 'sequential') return sequential(count)
    if (type === 'diverging') return diverging(count)
    if (source === 'okabe') return OKABE.slice(0, Math.min(count, 8))
    return categorical(count)
  }, [type, count, source])

  const seen = useMemo(() => makeSeen(cvd), [cvd])

  const n = palette.length
  const minPair = minPairwise(palette, seen)
  const minAdj = minAdjacent(palette, seen)
  const cols = collisions(palette, seen)
  const minBg = Math.min(...palette.map((h) => wcagContrast(h, PLOT_BG)))
  const ls = palette.map((h) => toOklch(h)?.l ?? 0)
  const monotone = ls.every((l, i) => i === 0 || l < (ls[i - 1] ?? 1))
  // The scale's midpoint is its lightest point — parity-independent, so even
  // counts (no exact center swatch) still report the near-white neutral.
  const midL = ls.length ? Math.max(...ls) : 0
  let sym = 0
  for (let i = 0; i < Math.floor(n / 2); i++) {
    sym = Math.max(sym, Math.abs((ls[i] ?? 0) - (ls[n - 1 - i] ?? 0)))
  }
  const lightEnd = wcagContrast(palette[0] ?? '#ffffff', PLOT_BG)

  const rows: { title: string; body: string; tone: Tone }[] = []
  if (type === 'categorical') {
    rows.push({
      title: 'Distinguishability (as seen)',
      body: `min pairwise ΔEOK ${minPair.toFixed(2)} — ${
        minPair < MERGED
          ? 'a pair has merged'
          : minPair < RISKY
            ? 'a pair is hard at a glance'
            : 'all pairs glance-apart'
      }${cvd !== 'none' ? ` under ${cvd}` : ''}.`,
      tone: toneOf(minPair),
    })
    rows.push({
      title: 'Collisions',
      body: `${cols} of ${(n * (n - 1)) / 2} pairs below the glance-apart bound.`,
      tone: cols === 0 ? 'ok' : cols <= 1 ? 'warn' : 'bad',
    })
    rows.push({
      title: 'Background floor',
      body: `min series-vs-white ${minBg.toFixed(2)}:1 (WCAG 1.4.11 wants 3:1 for a meaningful mark).`,
      tone: minBg >= 3 ? 'ok' : 'warn',
    })
  } else if (type === 'sequential') {
    rows.push({
      title: 'Monotonic lightness',
      body: monotone
        ? 'lightness decreases every step — magnitude is legible.'
        : 'lightness reverses — the ramp invents a false boundary.',
      tone: monotone ? 'ok' : 'bad',
    })
    rows.push({
      title: 'Even steps',
      body: `min adjacent ΔEOK ${minAdj.toFixed(2)} — the smallest jump between neighbors.`,
      tone: toneOf(minAdj),
    })
    rows.push({
      title: 'Light-end floor',
      body: `lightest step vs white ${lightEnd.toFixed(2)}:1 — the pale end is where the background bites.`,
      tone: lightEnd >= 3 ? 'ok' : 'warn',
    })
  } else {
    rows.push({
      title: 'Midpoint',
      body: `center L ${midL.toFixed(2)} — ${
        midL >= 0.9
          ? 'a light neutral; zero recedes.'
          : 'too dark; zero reads as high-magnitude (ch7 gray concrete).'
      }`,
      tone: midL >= 0.9 ? 'ok' : 'bad',
    })
    rows.push({
      title: 'Arm symmetry',
      body: `mirror-pair lightness differs by at most ${sym.toFixed(3)} — the two arms climb in step.`,
      tone: sym < 0.02 ? 'ok' : sym < 0.05 ? 'warn' : 'bad',
    })
    rows.push({
      title: 'Background floor',
      body: `min series-vs-white ${minBg.toFixed(2)}:1.`,
      tone: minBg >= 3 ? 'ok' : 'warn',
    })
  }

  const data = catData(n)
  const sdata = seqData(n)
  const bw = (DW - DPAD * 2 - DGAP * Math.max(n - 1, 0)) / Math.max(n, 1)

  return (
    <Playground
      question="Is the UI accent ramp the right source for chart colors — or does data-viz need its own palette engine?"
      onReset={() => {
        setType('categorical')
        setCount(6)
        setSource('generated')
        setCvd('none')
      }}
    >
      <div className="flex flex-col gap-5">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-fg-muted">type</span>
            <ToggleButtonGroup
              selectionMode="single"
              disallowEmptySelection
              selectedKeys={[type]}
              onSelectionChange={(keys) => {
                const next = [...keys][0]
                if (
                  next === 'categorical' ||
                  next === 'sequential' ||
                  next === 'diverging'
                )
                  setType(next)
              }}
              size="sm"
              aria-label="Palette type"
              className="max-w-full overflow-x-auto"
            >
              <ToggleButton id="categorical">Categorical</ToggleButton>
              <ToggleButton id="sequential">Sequential</ToggleButton>
              <ToggleButton id="diverging">Diverging</ToggleButton>
            </ToggleButtonGroup>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-fg-muted">count</span>
            <ToggleButtonGroup
              selectionMode="single"
              disallowEmptySelection
              selectedKeys={[String(count)]}
              onSelectionChange={(keys) => {
                const next = Number([...keys][0])
                if (next >= 3 && next <= 10) setCount(next)
              }}
              size="sm"
              aria-label="Number of colors"
              className="max-w-full overflow-x-auto"
            >
              {COUNTS.map((c) => (
                <ToggleButton key={c} id={String(c)}>
                  {c}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </div>
          {type === 'categorical' && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-fg-muted">source</span>
              <ToggleButtonGroup
                selectionMode="single"
                disallowEmptySelection
                selectedKeys={[source]}
                onSelectionChange={(keys) => {
                  const next = [...keys][0]
                  if (next === 'generated' || next === 'okabe') setSource(next)
                }}
                size="sm"
                aria-label="Categorical source"
                className="max-w-full overflow-x-auto"
              >
                <ToggleButton id="generated">Generated</ToggleButton>
                <ToggleButton id="okabe">Okabe–Ito</ToggleButton>
              </ToggleButtonGroup>
            </div>
          )}
          <div className="flex items-center gap-2">
            <span className="text-xs text-fg-muted">simulate</span>
            <ToggleButtonGroup
              selectionMode="single"
              disallowEmptySelection
              selectedKeys={[cvd]}
              onSelectionChange={(keys) => {
                const next = [...keys][0]
                if (
                  next === 'none' ||
                  next === 'deutan' ||
                  next === 'protan' ||
                  next === 'tritan'
                )
                  setCvd(next)
              }}
              size="sm"
              aria-label="Color vision deficiency"
              className="max-w-full overflow-x-auto"
            >
              <ToggleButton id="none">None</ToggleButton>
              <ToggleButton id="deutan">Deutan</ToggleButton>
              <ToggleButton id="protan">Protan</ToggleButton>
              <ToggleButton id="tritan">Tritan</ToggleButton>
            </ToggleButtonGroup>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1fr_18rem]">
          <div className="flex flex-col gap-3">
            <div
              className="overflow-hidden rounded-lg border p-4"
              style={{ backgroundColor: PLOT_BG }}
            >
              <div
                className="mb-3 font-mono text-[0.65rem] uppercase"
                style={{ color: '#6b7280' }}
              >
                {type === 'categorical'
                  ? 'Traffic by channel — series side by side'
                  : type === 'sequential'
                    ? 'One ordered variable, low to high'
                    : 'Signed variable around zero'}
              </div>
              {type === 'categorical' && (
                <div className="flex h-44 items-end gap-4">
                  {GROUPS.map((g, gi) => {
                    const vals = data[gi] ?? []
                    return (
                      <div
                        key={g}
                        className="flex flex-1 flex-col items-center gap-1"
                      >
                        <div className="flex w-full flex-1 items-end gap-0.5">
                          {palette.map((hex, i) => (
                            <div
                              key={i}
                              className="flex-1 rounded-t-sm"
                              style={{
                                height: `${vals[i] ?? 0}%`,
                                backgroundColor: seen(hex),
                              }}
                            />
                          ))}
                        </div>
                        <span
                          className="text-[0.6rem]"
                          style={{ color: '#6b7280' }}
                        >
                          {g}
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}
              {type === 'sequential' && (
                <div className="flex h-44 items-end gap-1">
                  {palette.map((hex, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-t-sm"
                      style={{
                        height: `${sdata[i] ?? 0}%`,
                        backgroundColor: seen(hex),
                      }}
                    />
                  ))}
                </div>
              )}
              {type === 'diverging' && (
                <svg
                  viewBox={`0 0 ${DW} ${DH}`}
                  className="h-auto w-full"
                  role="img"
                  aria-label="Diverging bars around a central zero baseline"
                >
                  <line
                    x1={0}
                    y1={DH / 2}
                    x2={DW}
                    y2={DH / 2}
                    stroke="#9ca3af"
                    strokeWidth={1}
                  />
                  {palette.map((hex, i) => {
                    const t = n > 1 ? (i / (n - 1)) * 2 - 1 : 0
                    const hh = Math.abs(t) * (DH / 2 - 14)
                    const x = DPAD + i * (bw + DGAP)
                    const y = t >= 0 ? DH / 2 - hh : DH / 2
                    return (
                      <rect
                        key={i}
                        x={x}
                        y={y}
                        width={bw}
                        height={hh}
                        rx={2}
                        fill={seen(hex)}
                      />
                    )
                  })}
                </svg>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {palette.map((hex, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1.5 font-mono text-[0.6rem] text-fg-muted tabular-nums"
                >
                  <span
                    className="size-3 rounded-sm border"
                    style={{ backgroundColor: seen(hex) }}
                  />
                  {type === 'categorical' ? `S${i + 1} ` : ''}
                  {hex}
                </span>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3 rounded-lg border bg-muted p-4">
            <div className="font-mono text-[0.7rem] tracking-wider text-fg-muted uppercase">
              Readout
            </div>
            {type === 'categorical' && count > CEILING && (
              <div className="rounded-md border p-2.5 text-xs text-fg-warning">
                Past ~{CEILING} CVD-safe hues. The honest engine returns{' '}
                {CEILING} and asks you to re-encode with position, shape, or
                labels — not a {count}th color.
              </div>
            )}
            {rows.map((r) => (
              <Readout
                key={r.title}
                title={r.title}
                body={r.body}
                tone={r.tone}
              />
            ))}
          </div>
        </div>

        <p className="text-sm text-fg-muted" aria-live="polite">
          {type === 'categorical'
            ? 'Categorical wants many hues at one lightness — and even spacing in OKLCH is necessary, not sufficient. Simulate a deficiency and watch the min distance drop; the vetted Okabe–Ito set was chosen to survive exactly this.'
            : type === 'sequential'
              ? 'Sequential is the accent ramp: one hue, monotonic lightness. This is the one chart job the UI system already builds.'
              : 'Diverging is two arms and a light-neutral center — a shape one hue cannot make. The midpoint decides whether zero recedes or shouts.'}
        </p>
      </div>
    </Playground>
  )
}

function Readout({
  title,
  body,
  tone,
}: {
  title: string
  body: string
  tone: Tone
}) {
  const dot =
    tone === 'ok' ? 'bg-success' : tone === 'warn' ? 'bg-warning' : 'bg-danger'
  return (
    <div className="flex flex-col gap-0.5" aria-live="polite">
      <div className="flex items-center gap-2">
        <span className={`size-2 shrink-0 rounded-full ${dot}`} />
        <span className="text-xs font-medium">{title}</span>
      </div>
      <p className="text-xs text-fg-muted tabular-nums">{body}</p>
    </div>
  )
}
