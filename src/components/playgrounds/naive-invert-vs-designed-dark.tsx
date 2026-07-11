import { useState } from 'react'
import { clampChroma, converter, formatHex, wcagContrast } from 'culori'

import { apcaLc } from '@/lib/apca'
import { cn } from '@/lib/utils'
import { Playground } from '@/components/playground'
import { ToggleButton } from '@/ui/toggle-button'
import { ToggleButtonGroup } from '@/ui/toggle-button-group'

const toOklch = converter('oklch')

// Radix slate + blue, light.ts / dark.ts hexes.
const S = [
  '#fcfcfd',
  '#f9f9fb',
  '#f0f0f3',
  '#e8e8ec',
  '#e0e1e6',
  '#d9d9e0',
  '#cdced6',
  '#b9bbc6',
  '#8b8d98',
  '#80838d',
  '#60646c',
  '#1c2024',
]
const SD = [
  '#111113',
  '#18191b',
  '#212225',
  '#272a2d',
  '#2e3135',
  '#363a3f',
  '#43484e',
  '#5a6169',
  '#696e77',
  '#777b84',
  '#b0b4ba',
  '#edeef0',
]
const BLUE9 = '#0090ff'
const BLUE11 = '#0d74ce'
const BLUE_DARK11 = '#70b8ff'

/** Mirror in OKLCH: L → 1−L, chroma and hue kept, clamped to sRGB. */
function flip(hex: string): string {
  const o = toOklch(hex)
  if (!o) return hex
  return formatHex(
    clampChroma(
      { mode: 'oklch' as const, l: 1 - o.l, c: o.c ?? 0, h: o.h ?? 0 },
      'oklch',
    ),
  )
}

interface Palette {
  bg: string
  card: string
  hover: string
  border: string
  muted: string
  text: string
  button: string
  label: string
  link: string
}

const s = (n: number) => S[n - 1] ?? '#000000'
const sd = (n: number) => SD[n - 1] ?? '#000000'

const LIGHT: Palette = {
  bg: s(1),
  card: s(2),
  hover: s(3),
  border: s(6),
  muted: s(11),
  text: s(12),
  button: BLUE9,
  label: '#ffffff',
  link: BLUE11,
}
// Neutrals mirrored; the accent carries over untouched, same as REVERSE.
const MIRROR: Palette = {
  bg: flip(s(1)),
  card: flip(s(2)),
  hover: flip(s(3)),
  border: flip(s(6)),
  muted: flip(s(11)),
  text: flip(s(12)),
  button: BLUE9,
  label: '#ffffff',
  link: BLUE11,
}
const REVERSE: Palette = {
  bg: s(12),
  card: s(11),
  hover: s(10),
  border: s(7),
  muted: s(2),
  text: s(1),
  button: BLUE9,
  label: '#ffffff',
  link: BLUE11,
}
const DESIGNED: Palette = {
  bg: sd(1),
  card: sd(2),
  hover: sd(3),
  border: sd(6),
  muted: sd(11),
  text: sd(12),
  button: BLUE9,
  label: '#ffffff',
  link: BLUE_DARK11,
}

type Lens = 'surfaces' | 'accent' | 'text' | 'elevation'
type Strategy = 'mirror' | 'reverse'

const L = (hex: string) => toOklch(hex)?.l ?? 0

function readout(p: Palette, lens: Lens): string {
  const dCard = Math.abs(L(p.card) - L(p.bg))
  const dHover = Math.abs(L(p.hover) - L(p.card))
  if (lens === 'surfaces')
    return `bg→card ΔL ${dCard.toFixed(3)} · card→hover ΔL ${dHover.toFixed(3)}`
  if (lens === 'accent') {
    const c = toOklch(p.link)?.c ?? 0
    return `link C ${c.toFixed(3)} · on card ${wcagContrast(p.link, p.card).toFixed(2)}:1 / Lc ${apcaLc(p.link, p.card).toFixed(1)}`
  }
  if (lens === 'text')
    return `text on bg ${wcagContrast(p.text, p.bg).toFixed(2)}:1 / Lc ${apcaLc(p.text, p.bg).toFixed(1)}`
  return `card ΔL ${dCard >= 0.001 ? '+' : ''}${dCard.toFixed(3)} vs bg, plus a shadow`
}

const LENS_NOTES: Record<Lens, string> = {
  surfaces:
    'The mirror sends slate 1–3 (L 0.991 / 0.983 / 0.956) to 0.009 / 0.017 / 0.044 — all three render as #000000. The reversal puts the text end’s loud strides at the quiet end. The designed ladder spends ~0.035 per surface step — the first stride is 4× light mode’s.',
  accent:
    'Mirroring and reversing both keep light’s accent chroma. The designed dark link sheds chroma and lifts lightness (blue 11: L 0.556 → 0.764, C 0.162 → 0.126); the solid button ships the identical hex in both modes.',
  text: 'The ratios barely move across columns — WCAG is polarity-blind. APCA changes sign with the room, and its magnitude drops on dark: same number from the old meter, a different read on the wall.',
  elevation:
    'Light mode raises the card with a shadow on a near-identical surface. On any dark floor the shadow disappears — the designed column lightens the raised surface instead. Higher means lighter, only in the dark.',
}

function Column({ name, p, lens }: { name: string; p: Palette; lens: Lens }) {
  const ring = 'ring-2 ring-fg/50 ring-offset-1'
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-2">
      <span className="text-xs text-fg-muted">
        {name} · <span className="font-mono tabular-nums">{p.bg}</span>
      </span>
      <div
        className="flex flex-col gap-2 rounded-lg border p-3"
        style={{ backgroundColor: p.bg, borderColor: p.border }}
      >
        <div
          className={cn(
            'flex flex-col gap-1.5 rounded-md border p-3 shadow-md',
            lens === 'elevation' && ring,
          )}
          style={{ backgroundColor: p.card, borderColor: p.border }}
        >
          <span
            className={cn('text-xs font-medium', lens === 'text' && ring)}
            style={{ color: p.text }}
          >
            Quarterly review
          </span>
          <span className="text-[0.7rem]" style={{ color: p.muted }}>
            Sarah · 2h ago
          </span>
          <div className="mt-1 flex items-center gap-2.5">
            <span
              className={cn(
                'rounded-md px-2.5 py-1 text-[0.7rem] font-medium',
                lens === 'accent' && ring,
              )}
              style={{ backgroundColor: p.button, color: p.label }}
            >
              Reply
            </span>
            <span
              className={cn(
                'text-[0.7rem] font-medium',
                lens === 'accent' && ring,
              )}
              style={{ color: p.link }}
            >
              Open thread
            </span>
          </div>
        </div>
        <span className="px-2 py-1 text-[0.7rem]" style={{ color: p.muted }}>
          Archive
        </span>
        <span
          className={cn(
            'rounded-md px-2 py-1 text-[0.7rem]',
            lens === 'surfaces' && ring,
          )}
          style={{ backgroundColor: p.hover, color: p.text }}
        >
          Archive — hovered
        </span>
      </div>
      <span
        aria-live="polite"
        className="font-mono text-[0.6rem] text-fg-muted tabular-nums"
      >
        {readout(p, lens)}
      </span>
    </div>
  )
}

export function NaiveInvertVsDesignedDark() {
  const [strategy, setStrategy] = useState<Strategy>('mirror')
  const [lens, setLens] = useState<Lens>('surfaces')

  const naive = strategy === 'mirror' ? MIRROR : REVERSE

  return (
    <Playground
      question="What breaks when dark mode is just the light ramp flipped upside down?"
      onReset={() => {
        setStrategy('mirror')
        setLens('surfaces')
      }}
    >
      <div className="flex flex-col gap-5">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-fg-muted">Naive flip</span>
            <ToggleButtonGroup
              selectionMode="single"
              disallowEmptySelection
              selectedKeys={[strategy]}
              onSelectionChange={(keys) => {
                const next = [...keys][0]
                if (next === 'mirror' || next === 'reverse') setStrategy(next)
              }}
              size="sm"
              aria-label="Naive flip strategy"
              className="max-w-full overflow-x-auto"
            >
              <ToggleButton id="mirror">Mirror L</ToggleButton>
              <ToggleButton id="reverse">Reverse the steps</ToggleButton>
            </ToggleButtonGroup>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-fg-muted">Lens</span>
            <ToggleButtonGroup
              selectionMode="single"
              disallowEmptySelection
              selectedKeys={[lens]}
              onSelectionChange={(keys) => {
                const next = [...keys][0]
                if (
                  next === 'surfaces' ||
                  next === 'accent' ||
                  next === 'text' ||
                  next === 'elevation'
                )
                  setLens(next)
              }}
              size="sm"
              aria-label="What to annotate"
              className="max-w-full overflow-x-auto"
            >
              <ToggleButton id="surfaces">Surfaces</ToggleButton>
              <ToggleButton id="accent">Accent</ToggleButton>
              <ToggleButton id="text">Text</ToggleButton>
              <ToggleButton id="elevation">Elevation</ToggleButton>
            </ToggleButtonGroup>
          </div>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row">
          <Column name="Light — Radix slate" p={LIGHT} lens={lens} />
          <Column
            name={
              strategy === 'mirror'
                ? 'Naive — L → 1−L'
                : 'Naive — steps reversed'
            }
            p={naive}
            lens={lens}
          />
          <Column name="Designed — Radix slateDark" p={DESIGNED} lens={lens} />
        </div>

        <p aria-live="polite" className="text-xs text-fg-muted">
          {LENS_NOTES[lens]}
        </p>
      </div>
    </Playground>
  )
}
