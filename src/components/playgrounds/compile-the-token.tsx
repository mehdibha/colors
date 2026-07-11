import { useState } from 'react'
import {
  clampChroma,
  converter,
  differenceEuclidean,
  formatHex,
  interpolate,
  wcagContrast,
} from 'culori'

import { apcaLc } from '@/lib/apca'
import { cn } from '@/lib/utils'
import { Playground } from '@/components/playground'
import { ToggleButton } from '@/ui/toggle-button'
import { ToggleButtonGroup } from '@/ui/toggle-button-group'

type Hue = 'blue' | 'violet' | 'red'

const toOklch = converter('oklch')
const dEOK = differenceEuclidean('oklab')
const clamp01 = (x: number) => Math.min(1, Math.max(0, x))

// Each seed carries a light-room value AND a *designed* dark-room value
// (chapter 16's second design) — not a derivation of the light one.
const SEEDS: Record<Hue, { label: string; light: string; dark: string }> = {
  blue: { label: 'Blue', light: '#4992dd', dark: '#6fb2fb' },
  violet: { label: 'Violet', light: '#6e56cf', dark: '#b8a6ff' },
  red: { label: 'Red', light: '#e5484d', dark: '#ff9592' },
}

const BUILD_TIME: Hue = 'blue' // the hue the baked artifact froze at build
const LIGHT_SURFACE = '#fcfcfd'
const DARK_SURFACE = '#111113'

const mixBlack = (hex: string, t: number) =>
  formatHex(interpolate([hex, '#000000'], 'oklab')(t)) ?? hex

const rel = (hex: string, dL: number, cMul = 1) => {
  const c = toOklch(hex)
  if (!c) return hex
  return (
    formatHex(
      clampChroma(
        {
          mode: 'oklch' as const,
          l: clamp01((c.l ?? 0) + dL),
          c: Math.max(0, (c.c ?? 0) * cMul),
          h: c.h ?? 0,
        },
        'oklch',
      ),
    ) ?? hex
  )
}

const fgOn = (bg: string) =>
  wcagContrast('#000000', bg) >= wcagContrast('#ffffff', bg)
    ? '#000000'
    : '#ffffff'

interface Room {
  accent: string
  hover: string
  fg: string
}

function ButtonPreview({ surface, room }: { surface: string; room: Room }) {
  return (
    <div
      className="flex items-center gap-2 rounded-md border p-2.5"
      style={{ backgroundColor: surface }}
    >
      <span
        className="rounded px-2.5 py-1 text-[0.7rem] font-medium"
        style={{ backgroundColor: room.accent, color: room.fg }}
      >
        Reply
      </span>
      <span
        className="rounded px-2.5 py-1 text-[0.7rem] font-medium"
        style={{ backgroundColor: room.hover, color: room.fg }}
      >
        hover
      </span>
    </div>
  )
}

function StrategyCard({
  title,
  light,
  dark,
  css,
  stale,
  note,
}: {
  title: string
  light: Room
  dark: Room
  css: string
  stale?: boolean
  note?: string
}) {
  const w = wcagContrast(light.fg, light.accent)
  const lc = apcaLc(light.fg, light.accent)
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-2 rounded-lg border p-3">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium">{title}</span>
        {stale && (
          <span className="rounded-full bg-fg-warning/15 px-2 py-0.5 text-[0.55rem] font-medium text-fg-warning">
            needs rebuild
          </span>
        )}
      </div>
      <ButtonPreview surface={LIGHT_SURFACE} room={light} />
      <ButtonPreview surface={DARK_SURFACE} room={dark} />
      <span
        aria-live="polite"
        className="font-mono text-[0.6rem] text-fg-muted tabular-nums"
      >
        fg-on-accent {w.toFixed(2)}:1 · Lc {lc.toFixed(1)}
      </span>
      <div className="overflow-x-auto rounded-md bg-muted/50 p-2">
        <pre className="font-mono text-[0.6rem] whitespace-pre">{css}</pre>
      </div>
      {note && <span className="text-[0.7rem] text-fg-warning">{note}</span>}
    </div>
  )
}

type Tone = 'ok' | 'warn' | 'bad'
const toneClass = (t: Tone) =>
  t === 'ok'
    ? 'text-fg-success'
    : t === 'warn'
      ? 'text-fg-warning'
      : 'text-fg-danger'

const SCORE: { k: string; cells: [string, Tone][] }[] = [
  {
    k: 'Baked hex',
    cells: [
      ['Universal', 'ok'],
      ['Largest', 'warn'],
      ['Rebuild', 'bad'],
      ['In source', 'ok'],
    ],
  },
  {
    k: 'mix + light-dark',
    cells: [
      ['Baseline 2024', 'warn'],
      ['Small', 'ok'],
      ['Live', 'ok'],
      ['Must resolve', 'warn'],
    ],
  },
  {
    k: 'Relative from seed',
    cells: [
      ['Baseline 2024-09', 'warn'],
      ['Smallest', 'ok'],
      ['Live', 'ok'],
      ['Must resolve', 'warn'],
    ],
  },
]

export function CompileTheToken() {
  const [hue, setHue] = useState<Hue>('blue')
  const s = SEEDS[hue]

  // Strategy 1 — baked: frozen to the build-time hue, ignores the runtime seed.
  const b = SEEDS[BUILD_TIME]
  const bakedLight: Room = {
    accent: b.light,
    hover: mixBlack(b.light, 0.12),
    fg: fgOn(b.light),
  }
  const bakedDark: Room = {
    accent: b.dark,
    hover: mixBlack(b.dark, 0.12),
    fg: fgOn(b.dark),
  }

  // Strategy 2 — mix + light-dark: designed per-mode accent, computed hover.
  const mixLight: Room = {
    accent: s.light,
    hover: mixBlack(s.light, 0.12),
    fg: fgOn(s.light),
  }
  const mixDark: Room = {
    accent: s.dark,
    hover: mixBlack(s.dark, 0.12),
    fg: fgOn(s.dark),
  }

  // Strategy 3 — derive everything from one seed: dark is the ch16 flip.
  const derivedDark = rel(s.light, 0.2, 0.75)
  const derLight: Room = {
    accent: s.light,
    hover: rel(s.light, -0.08),
    fg: fgOn(s.light),
  }
  const derDark: Room = {
    accent: derivedDark,
    hover: rel(derivedDark, -0.08),
    fg: fgOn(derivedDark),
  }
  const flipCost = dEOK(derivedDark, s.dark)

  const stale = hue !== BUILD_TIME

  const bakedCss = `:root {\n  --accent: ${b.light};\n  --accent-hover: ${bakedLight.hover};\n  --fg-on-accent: ${bakedLight.fg};\n}\n.dark {\n  --accent: ${b.dark};\n  --accent-hover: ${bakedDark.hover};\n  --fg-on-accent: ${bakedDark.fg};\n}`

  const mixCss = `:root { color-scheme: light dark; }\n--accent: light-dark(${s.light}, ${s.dark});\n--accent-hover:\n  color-mix(in oklab, var(--accent), black 12%);\n--fg-on-accent:\n  light-dark(${mixLight.fg}, ${mixDark.fg});`

  const derCss = `:root { color-scheme: light dark; --seed: ${s.light}; }\n--accent: light-dark(\n  var(--seed),\n  oklch(from var(--seed) calc(l + 0.20) calc(c * 0.75) h)\n);\n--accent-hover:\n  oklch(from var(--accent) calc(l - 0.08) c h);`

  return (
    <Playground
      question="Ship the token table as baked hex or as CSS that computes at runtime — what does each artifact trade away?"
      onReset={() => setHue('blue')}
    >
      <div className="flex flex-col gap-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-fg-muted">runtime seed &rarr;</span>
          <ToggleButtonGroup
            selectionMode="single"
            disallowEmptySelection
            selectedKeys={[hue]}
            onSelectionChange={(keys) => {
              const next = [...keys][0]
              if (next === 'blue' || next === 'violet' || next === 'red')
                setHue(next)
            }}
            size="sm"
            aria-label="Runtime seed hue"
            className="max-w-full overflow-x-auto"
          >
            {(Object.keys(SEEDS) as Hue[]).map((k) => (
              <ToggleButton key={k} id={k}>
                {SEEDS[k].label}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
          <span className="text-[0.7rem] text-fg-muted">
            (each card: light room over dark room)
          </span>
        </div>

        <div className="flex flex-col gap-3 lg:flex-row">
          <StrategyCard
            title="1 · Baked hex"
            light={bakedLight}
            dark={bakedDark}
            css={bakedCss}
            stale={stale}
            note={
              stale
                ? 'frozen to the build-time hue — the runtime seed does not reach it'
                : undefined
            }
          />
          <StrategyCard
            title="2 · mix + light-dark()"
            light={mixLight}
            dark={mixDark}
            css={mixCss}
          />
          <StrategyCard
            title="3 · Relative from seed"
            light={derLight}
            dark={derDark}
            css={derCss}
            note={`derived dark accent is ΔEOK ${flipCost.toFixed(3)} from the designed dark — chapter 16's flip, smuggled back`}
          />
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-xs text-fg-muted">Scorecard</span>
          <div className="overflow-x-auto">
            <table className="w-full min-w-md text-left font-mono text-[0.65rem] tabular-nums">
              <thead>
                <tr className="text-fg-muted">
                  <th className="py-1 pr-3 font-normal">strategy</th>
                  <th className="py-1 pr-3 font-normal">support</th>
                  <th className="py-1 pr-3 font-normal">bytes</th>
                  <th className="py-1 pr-3 font-normal">theming</th>
                  <th className="py-1 font-normal">audit</th>
                </tr>
              </thead>
              <tbody>
                {SCORE.map((row) => (
                  <tr key={row.k} className="border-t">
                    <td className="py-1.5 pr-3 text-fg-muted">{row.k}</td>
                    {row.cells.map((c, i) => (
                      <td
                        key={i}
                        className={cn('py-1.5 pr-3', toneClass(c[1]))}
                      >
                        {c[0]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <span className="text-[0.7rem] text-fg-muted">
            support = worst Baseline tier the strategy needs · bytes = CSS to
            enumerate the family · theming = can a runtime seed repaint it ·
            audit = can contrast be read off the source value.
          </span>
        </div>

        <p className="text-sm text-fg-muted" aria-live="polite">
          {stale
            ? `Seed is ${SEEDS[hue].label}. Columns 2 and 3 followed — one variable moved. Column 1 is still Blue: baked values can't be repointed at runtime, so it needs a rebuild. And column 3's dark accent is ΔEOK ${flipCost.toFixed(3)} off the designed dark — full derivation reintroduces chapter 16's flip.`
            : `All three render the same accent at the build seed. Column 1's contrast is readable straight off its hex; columns 2 and 3 resolve the same color, but their source is an expression — the value you'd audit isn't there. Repoint the seed to see which artifact can follow.`}
        </p>
      </div>
    </Playground>
  )
}
