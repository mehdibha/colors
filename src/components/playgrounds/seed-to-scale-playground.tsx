import { useMemo, useState } from 'react'
import {
  clampChroma,
  converter,
  differenceEuclidean,
  displayable,
  formatHex,
  wcagContrast,
} from 'culori'

import { apcaLc } from '@/lib/apca'
import { cn } from '@/lib/utils'
import { Playground } from '@/components/playground'
import { Button } from '@/ui/button'
import { Input } from '@/ui/input'
import { TextField } from '@/ui/text-field'
import { ToggleButton } from '@/ui/toggle-button'
import { ToggleButtonGroup } from '@/ui/toggle-button-group'

type Policy = 'snap' | 'verbatim'
type Anchor = 'nearest' | 'solid'

const toOklch = converter('oklch')
const dEOK = differenceEuclidean('oklab')

// ch11's skeleton: dotUI's fixed lightness anchors, resampled to 12 steps.
const ANCHORS = [
  0.9778, 0.9356, 0.8811, 0.8267, 0.7422, 0.6478, 0.5733, 0.4689, 0.3944, 0.32,
  0.2378,
]
const L12 = Array.from({ length: 12 }, (_, i) => {
  const t = (i / 11) * (ANCHORS.length - 1)
  const lo = Math.floor(t)
  const hi = Math.min(lo + 1, ANCHORS.length - 1)
  const f = t - lo
  return (ANCHORS[lo] ?? 0) * (1 - f) + (ANCHORS[hi] ?? 0) * f
})
const L1 = L12[0] ?? 1
const LN = L12[11] ?? 0

// ch12's envelope, normalized at the landing slot; ch13's per-family bend defaults.
const shape = (i: number) => 0.45 + 0.55 * Math.sin((Math.PI * i) / 11)
const bendFor = (h: number) =>
  h >= 75 && h <= 140
    ? -30
    : h >= 35 && h < 75
      ? -22
      : h >= 200 && h <= 290
        ? 13
        : 0
const norm = (h: number) => ((h % 360) + 360) % 360

const JOBS = [
  'app background',
  'subtle background',
  'UI element background',
  'hovered UI element',
  'active / selected',
  'subtle border',
  'UI element border',
  'hovered border',
  'solid',
  'hovered solid',
  'low-contrast text',
  'high-contrast text',
]

interface Step {
  l: number
  hex: string
}

interface Model {
  seed: { l: number; c: number; h: number }
  seedHex: string
  inSrgb: boolean
  mapCost: number
  slot: number
  bend: number
  steps: Step[]
}

function build(seedStr: string, anchor: Anchor): Model | null {
  const parsed = toOklch(seedStr)
  if (parsed === undefined) return null
  const inSrgb = displayable(seedStr)
  const mapped = inSrgb ? parsed : clampChroma(parsed, 'oklch')
  const seed = { l: mapped.l, c: mapped.c ?? 0, h: mapped.h ?? 0 }
  const seedHex = formatHex(mapped)
  const mapCost = inSrgb ? 0 : dEOK(parsed, mapped)
  const slot =
    anchor === 'solid'
      ? 8
      : L12.reduce(
          (bestIdx, l, i) =>
            Math.abs(l - seed.l) < Math.abs((L12[bestIdx] ?? 0) - seed.l)
              ? i
              : bestIdx,
          0,
        )
  const ambition = seed.c / shape(slot)
  const bend = bendFor(seed.h)
  const steps = L12.map((l, i) => {
    const w = (L1 - l) / (L1 - LN)
    const h = norm(seed.h + bend * w)
    const col = clampChroma(
      { mode: 'oklch' as const, l, c: ambition * shape(i), h },
      'oklch',
    )
    return { l, hex: formatHex(col) }
  })
  return { seed, seedHex, inSrgb, mapCost, slot, bend, steps }
}

function contractLine(slot: number, hex: string, steps: Step[]): string {
  const step1 = steps[0]?.hex ?? '#ffffff'
  const step2 = steps[1]?.hex ?? '#ffffff'
  if (slot >= 10) {
    const r = wcagContrast(hex, step2)
    const lc = Math.abs(apcaLc(hex, step2))
    return `text on step 2: ${r.toFixed(2)}:1 · Lc ${lc.toFixed(1)}`
  }
  if (slot >= 8) {
    const rw = wcagContrast('#ffffff', hex)
    const rb = wcagContrast('#000000', hex)
    return `label: white ${rw.toFixed(2)}:1 / black ${rb.toFixed(2)}:1`
  }
  if (slot >= 5) {
    const r = wcagContrast(hex, step1)
    return `border on step 1: ${r.toFixed(2)}:1 (3:1 target)`
  }
  return 'background job — spacing, not contrast'
}

const PRESETS = [
  { label: 'Violet-blue', value: '#635bff' },
  { label: 'Navy', value: '#1e2a5a' },
  { label: 'Pastel pink', value: '#ffd6e7' },
  { label: 'Mustard', value: '#eab308' },
  { label: 'Near-gray', value: '#6f7278' },
  { label: 'Near-white', value: '#fdfdfc' },
  { label: 'Near-black', value: '#0a0a0a' },
  { label: 'P3 green', value: 'color(display-p3 0 0.85 0.2)' },
]

const DEFAULT_SEED = '#635bff'

const W = 560
const H = 190
const PAD = { left: 40, right: 12, top: 10, bottom: 24 }
const px = (i: number) => PAD.left + (i / 11) * (W - PAD.left - PAD.right)
const py = (l: number) => PAD.top + (1 - l) * (H - PAD.top - PAD.bottom)
const linePath = (ls: number[]) =>
  ls
    .map(
      (l, i) => `${i === 0 ? 'M' : 'L'}${px(i).toFixed(1)},${py(l).toFixed(1)}`,
    )
    .join(' ')

export function SeedToScalePlayground() {
  const [input, setInput] = useState(DEFAULT_SEED)
  const [seedStr, setSeedStr] = useState(DEFAULT_SEED)
  const [policy, setPolicy] = useState<Policy>('snap')
  const [anchor, setAnchor] = useState<Anchor>('nearest')

  const invalid = toOklch(input.trim()) === undefined
  const model = useMemo(() => build(seedStr, anchor), [seedStr, anchor])

  if (!model) return null
  const { seed, seedHex, inSrgb, mapCost, slot, bend, steps } = model

  const slotL = L12[slot] ?? 0
  const dL = seed.l - slotL
  const snappedHex = steps[slot]?.hex ?? seedHex
  const brandCost = dEOK(seedHex, snappedHex)

  // What actually ships at each step under the current policy.
  const shipped: Step[] = steps.map((s, i) =>
    policy === 'verbatim' && i === slot ? { l: seed.l, hex: seedHex } : s,
  )
  const orderBroken = shipped.some(
    (s, i) => i > 0 && s.l >= (shipped[i - 1]?.l ?? 1),
  )

  const job = JOBS[slot] ?? ''
  const summary =
    policy === 'snap'
      ? `Slot ${slot + 1} (${job}): the ramp keeps the skeleton's L ${slotL.toFixed(3)}, and your exact ${seedHex} ships nowhere. Brand cost of the snap: ΔEOK ${brandCost.toFixed(3)} — ${
          brandCost > 0.02
            ? 'past the 0.02 just-noticeable difference; a brand eye will see it.'
            : 'under the 0.02 just-noticeable difference; nobody will see it.'
        }`
      : `Slot ${slot + 1} (${job}) is your exact seed; the skeleton kinks by ${dL >= 0 ? '+' : ''}${dL.toFixed(3)} L there. ${
          orderBroken
            ? 'The ladder is now out of order — a neighboring step is lighter than the one before it.'
            : 'Step order survives, but the slot’s guarantee now depends on whoever picked the brand color.'
        }`

  const warnings: string[] = []
  if (!inSrgb)
    warnings.push(
      `This seed lives outside sRGB — gamut-mapped to ${seedHex} before slotting, at a cost of ΔEOK ${mapCost.toFixed(3)}. The brand was off before the engine did anything.`,
    )
  if (seed.c < 0.03)
    warnings.push(
      `At C ${seed.c.toFixed(3)}, is this an accent or a neutral? The pipeline can't tell — that call is chapter 15's.`,
    )
  if (anchor === 'nearest' && (seed.l > L1 || seed.l < LN))
    warnings.push(
      `The seed's lightness sits beyond the skeleton's ends (L ${LN.toFixed(3)}–${L1.toFixed(3)}), so the nearest-slot miss is ${Math.abs(dL).toFixed(3)} L — the half-gap bound only holds inside the ladder.`,
    )
  if (bend !== 0)
    warnings.push(
      `Family bend applied: ${bend > 0 ? '+' : ''}${bend}° toward the dark end (chapter 13's term, at intake).`,
    )

  return (
    <Playground
      question="Paste any brand hex — where does it land, and what does shipping it verbatim cost?"
      onReset={() => {
        setInput(DEFAULT_SEED)
        setSeedStr(DEFAULT_SEED)
        setPolicy('snap')
        setAnchor('nearest')
      }}
    >
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <TextField
              aria-label="Seed color (any CSS color)"
              value={input}
              onChange={(v) => {
                setInput(v)
                if (toOklch(v.trim()) !== undefined) setSeedStr(v.trim())
              }}
              className="w-64 max-w-full"
            >
              <Input className="font-mono" />
            </TextField>
            <span className="text-xs text-fg-muted" aria-live="polite">
              {invalid && 'can’t parse that — showing the last valid seed'}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-fg-muted">Nasty seeds:</span>
            {PRESETS.map((p) => (
              <Button
                key={p.label}
                variant={seedStr === p.value ? 'primary' : 'default'}
                size="sm"
                onPress={() => {
                  setInput(p.value)
                  setSeedStr(p.value)
                }}
              >
                {p.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-fg-muted">Seed policy</span>
            <ToggleButtonGroup
              selectionMode="single"
              disallowEmptySelection
              selectedKeys={[policy]}
              onSelectionChange={(keys) => {
                const id = [...keys][0]
                if (typeof id === 'string') setPolicy(id as Policy)
              }}
              size="sm"
              aria-label="Seed policy"
              className="max-w-full overflow-x-auto"
            >
              <ToggleButton id="snap">Snap to the slot</ToggleButton>
              <ToggleButton id="verbatim">Ship the seed verbatim</ToggleButton>
            </ToggleButtonGroup>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-fg-muted">Anchor</span>
            <ToggleButtonGroup
              selectionMode="single"
              disallowEmptySelection
              selectedKeys={[anchor]}
              onSelectionChange={(keys) => {
                const id = [...keys][0]
                if (typeof id === 'string') setAnchor(id as Anchor)
              }}
              size="sm"
              aria-label="Landing slot rule"
              className="max-w-full overflow-x-auto"
            >
              <ToggleButton id="nearest">Nearest step by L</ToggleButton>
              <ToggleButton id="solid">Always step 9 (the solid)</ToggleButton>
            </ToggleButtonGroup>
          </div>
        </div>

        <div className="flex gap-1">
          {shipped.map((s, i) => (
            <div
              key={i}
              className="flex min-w-0 flex-1 flex-col items-center gap-1"
            >
              <div
                className={cn(
                  'h-11 w-full rounded-md border',
                  i === slot && 'outline-2 outline-offset-2 outline-fg/70',
                )}
                style={{ backgroundColor: s.hex }}
              />
              <span className="font-mono text-[0.6rem] text-fg-muted tabular-nums">
                {i + 1}
              </span>
            </div>
          ))}
        </div>

        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="h-auto w-full text-fg"
          role="img"
          aria-label="Lightness per step: the skeleton as a dashed line, the shipped ramp solid, with the landing slot marked"
        >
          <line
            x1={PAD.left}
            y1={py(0)}
            x2={px(11)}
            y2={py(0)}
            stroke="currentColor"
            strokeOpacity={0.25}
          />
          <line
            x1={PAD.left}
            y1={py(0)}
            x2={PAD.left}
            y2={py(1)}
            stroke="currentColor"
            strokeOpacity={0.25}
          />
          <path
            d={linePath(L12)}
            fill="none"
            stroke="currentColor"
            strokeOpacity={0.2}
            strokeDasharray="4 4"
          />
          <path
            d={linePath(shipped.map((s) => s.l))}
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            strokeOpacity={0.6}
          />
          {shipped.map((s, i) => (
            <circle
              key={i}
              cx={px(i)}
              cy={py(s.l)}
              r={i === slot ? 6 : 4}
              fill={s.hex}
              stroke="currentColor"
              strokeOpacity={i === slot ? 0.9 : 0.5}
              strokeWidth={i === slot ? 1.5 : 1}
            />
          ))}
          <g
            className="font-mono text-[0.6rem]"
            fill="currentColor"
            fillOpacity={0.55}
          >
            <text x={px(0)} y={H - 6} textAnchor="middle">
              1
            </text>
            <text x={px(11)} y={H - 6} textAnchor="middle">
              12
            </text>
            <text x={PAD.left - 6} y={py(1) + 4} textAnchor="end">
              1
            </text>
            <text x={PAD.left - 6} y={py(0) + 4} textAnchor="end">
              0
            </text>
            <text
              x={px(slot)}
              y={py(shipped[slot]?.l ?? 0) - 10}
              textAnchor="middle"
            >
              seed
            </text>
          </g>
        </svg>

        <div aria-live="polite" className="flex flex-col gap-5">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-md border p-3">
              <p className="font-mono text-[0.65rem] text-fg-muted uppercase">
                Seed
              </p>
              <p className="mt-1 font-mono text-xs tabular-nums">
                oklch({seed.l.toFixed(3)} {seed.c.toFixed(3)}{' '}
                {seed.h.toFixed(1)})
              </p>
              <p className="font-mono text-xs text-fg-muted tabular-nums">
                lands at step {slot + 1} · ΔL {dL >= 0 ? '+' : ''}
                {dL.toFixed(3)}
              </p>
            </div>
            <div className="rounded-md border p-3">
              <p className="font-mono text-[0.65rem] text-fg-muted uppercase">
                Seed verbatim
              </p>
              <p className="mt-1 font-mono text-xs tabular-nums">{seedHex}</p>
              <p className="font-mono text-xs text-fg-muted tabular-nums">
                {contractLine(slot, seedHex, steps)}
              </p>
            </div>
            <div className="rounded-md border p-3">
              <p className="font-mono text-[0.65rem] text-fg-muted uppercase">
                Snapped
              </p>
              <p className="mt-1 font-mono text-xs tabular-nums">
                {snappedHex} · ΔEOK {brandCost.toFixed(3)}
              </p>
              <p className="font-mono text-xs text-fg-muted tabular-nums">
                {contractLine(slot, snappedHex, steps)}
              </p>
            </div>
          </div>

          {warnings.length > 0 && (
            <ul className="flex flex-col gap-1">
              {warnings.map((w) => (
                <li key={w} className="text-xs text-fg-muted">
                  ⚠ {w}
                </li>
              ))}
            </ul>
          )}
        </div>

        <p className="text-sm text-fg-muted" aria-live="polite">
          {summary}
        </p>
      </div>
    </Playground>
  )
}
