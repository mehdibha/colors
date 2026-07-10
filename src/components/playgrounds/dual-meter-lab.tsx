import { useState } from 'react'
import { clampChroma, converter, formatHex, wcagContrast } from 'culori'
import { ArrowLeftRightIcon } from 'lucide-react'

import { apcaLc } from '@/lib/apca'
import { Playground } from '@/components/playground'
import { Button } from '@/ui/button'
import { Slider, SliderControl } from '@/ui/slider'
import { ToggleButton } from '@/ui/toggle-button'
import { ToggleButtonGroup } from '@/ui/toggle-button-group'

const toOklch = converter('oklch')

interface Lch {
  l: number
  c: number
  h: number
}

const lchOf = (hex: string): Lch => {
  const color = toOklch(hex)
  return { l: color?.l ?? 0, c: color?.c ?? 0, h: color?.h ?? 0 }
}
const hexOf = (lch: Lch) =>
  formatHex(clampChroma({ mode: 'oklch', ...lch }, 'oklch'))

const PRESETS = [
  { id: 'orange-white', label: 'Orange · white', fg: '#ffffff', bg: '#ff6600' },
  { id: 'orange-black', label: 'Orange · black', fg: '#000000', bg: '#ff6600' },
  { id: 'indigo-white', label: 'Indigo · white', fg: '#ffffff', bg: '#6366f1' },
  { id: 'indigo-black', label: 'Indigo · black', fg: '#000000', bg: '#6366f1' },
  { id: 'dark-muted', label: 'Dark muted', fg: '#858585', bg: '#1e1e1e' },
  { id: 'light-muted', label: 'Light muted', fg: '#767676', bg: '#ffffff' },
  { id: 'agree', label: 'Both agree', fg: '#475569', bg: '#f8fafc' },
] as const

const wcagVerdict = (r: number) =>
  r >= 7
    ? 'passes AAA — any text'
    : r >= 4.5
      ? 'passes AA — body text'
      : r >= 3
        ? 'large text and non-text only'
        : 'fails — no text, no icons'

const apcaVerdict = (lc: number) => {
  const a = Math.abs(lc)
  if (a >= 90) return 'body text, preferred'
  if (a >= 75) return 'body text minimum (18px/400)'
  if (a >= 60) return 'content text, 24px and up — not body'
  if (a >= 45) return 'large headlines only (36px, or 24px bold)'
  if (a >= 30) return 'spot text only — never blocks of it'
  if (a >= 15) return 'non-text elements only'
  return 'below the non-text floor'
}

const WCAG_TICKS = [
  { at: Math.log(3) / Math.log(21), label: '3' },
  { at: Math.log(4.5) / Math.log(21), label: '4.5' },
  { at: Math.log(7) / Math.log(21), label: '7' },
]
const APCA_TICKS = [45, 60, 75, 90].map((v) => ({
  at: v / 108,
  label: String(v),
}))

export function DualMeterLab() {
  const [presetId, setPresetId] = useState<string>(PRESETS[0].id)
  const [fg, setFg] = useState<Lch>(() => lchOf(PRESETS[0].fg))
  const [bg, setBg] = useState<string>(PRESETS[0].bg)

  const fgHex = hexOf(fg)
  const ratio = wcagContrast(fgHex, bg)
  const lc = apcaLc(fgHex, bg)

  const selectPreset = (id: string) => {
    const preset = PRESETS.find((p) => p.id === id)
    if (!preset) return
    setPresetId(id)
    setFg(lchOf(preset.fg))
    setBg(preset.bg)
  }

  const swap = () => {
    setFg(lchOf(bg))
    setBg(fgHex)
  }

  return (
    <Playground
      question="When the two contrast meters disagree, whose side is your eye on?"
      onReset={() => selectPreset(PRESETS[0].id)}
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <span className="shrink-0 text-xs text-fg-muted">Pair</span>
          <ToggleButtonGroup
            selectionMode="single"
            disallowEmptySelection
            selectedKeys={[presetId]}
            onSelectionChange={(keys) => selectPreset([...keys][0] as string)}
            size="sm"
            aria-label="Preset pair"
            className="flex-wrap"
          >
            {PRESETS.map((p) => (
              <ToggleButton key={p.id} id={p.id}>
                {p.label}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div
            className="rounded-lg border p-4"
            style={{ backgroundColor: bg }}
          >
            <div className="flex items-center gap-2">
              <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
                <circle
                  cx="9"
                  cy="9"
                  r="7"
                  fill="none"
                  stroke={fgHex}
                  strokeWidth="1.5"
                />
                <path
                  d="M9 5.5v4M9 12.2v.3"
                  stroke={fgHex}
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
              <span
                className="text-[17px] font-semibold"
                style={{ color: fgHex }}
              >
                Payment failed
              </span>
            </div>
            <p className="mt-2 text-sm" style={{ color: fgHex }}>
              We couldn't charge the card ending in 4242. Update your billing
              details to keep this workspace active.
            </p>
            <div className="mt-3 border-t pt-2" style={{ borderColor: fgHex }}>
              <span className="text-xs" style={{ color: fgHex }}>
                2 minutes ago · billing · retry scheduled
              </span>
            </div>
          </div>

          <div className="flex flex-col justify-center gap-4">
            <ScoreMeter
              label="WCAG 2"
              display={`${ratio.toFixed(2)}:1`}
              at={Math.log(Math.max(ratio, 1)) / Math.log(21)}
              ticks={WCAG_TICKS}
              maxLabel="21"
              verdict={wcagVerdict(ratio)}
              fg={fgHex}
              bg={bg}
            />
            <ScoreMeter
              label="APCA"
              display={`Lc ${lc.toFixed(1)}`}
              at={Math.abs(lc) / 108}
              ticks={APCA_TICKS}
              maxLabel="108"
              verdict={apcaVerdict(lc)}
              fg={fgHex}
              bg={bg}
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex min-w-48 flex-1 items-center gap-3">
            <span className="shrink-0 text-xs text-fg-muted">
              Text lightness (OKLCH L)
            </span>
            <Slider
              aria-label="Text lightness"
              value={fg.l}
              onChange={(v) => setFg({ ...fg, l: v as number })}
              minValue={0}
              maxValue={1}
              step={0.005}
              className="flex-1"
            >
              <SliderControl />
            </Slider>
          </div>
          <Button size="sm" onPress={swap}>
            <ArrowLeftRightIcon />
            Swap
          </Button>
        </div>

        <p className="text-sm text-fg-muted">
          Drag the text lightness on the dark presets and watch the order the
          thresholds fall in: WCAG's 4.5:1 arrives long before APCA is willing
          to call the pair body text. Swap on any preset: one meter freezes, the
          other takes a side. The card is the tiebreaker — the paragraph is
          14px, the heading 17px semibold, and the hairline and icon are
          non-text elements, the kind 1.4.11 holds to 3:1.
        </p>
      </div>
    </Playground>
  )
}

function ScoreMeter({
  label,
  display,
  at,
  ticks,
  maxLabel,
  verdict,
  fg,
  bg,
}: {
  label: string
  display: string
  at: number
  ticks: { at: number; label: string }[]
  maxLabel: string
  verdict: string
  fg: string
  bg: string
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-baseline justify-between">
        <span className="font-mono text-[0.7rem] tracking-wider text-fg-muted uppercase">
          {label}
        </span>
        <span className="font-mono text-xs text-fg tabular-nums">
          {display}
        </span>
      </div>
      <div
        className="relative h-3 overflow-hidden rounded-full border"
        style={{ backgroundColor: bg }}
      >
        <div
          className="absolute inset-y-0 left-0"
          style={{
            width: `${Math.min(at, 1) * 100}%`,
            backgroundColor: fg,
          }}
        />
        {ticks.map((t) => (
          <div
            key={t.label}
            className="absolute inset-y-0 w-px bg-fg/40"
            style={{ left: `${t.at * 100}%` }}
          />
        ))}
      </div>
      <div className="relative h-4 font-mono text-[0.65rem] text-fg-muted">
        {ticks.map((t) => (
          <span
            key={t.label}
            className="absolute -translate-x-1/2"
            style={{ left: `${t.at * 100}%` }}
          >
            {t.label}
          </span>
        ))}
        <span className="absolute right-0">{maxLabel}</span>
      </div>
      <span className="text-xs text-fg-muted">{verdict}</span>
    </div>
  )
}
