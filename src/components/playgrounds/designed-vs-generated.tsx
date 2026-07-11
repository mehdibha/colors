import { useMemo, useState } from 'react'
import { clampChroma, converter, differenceEuclidean, formatHex } from 'culori'

import { cn } from '@/lib/utils'
import { Demo } from '@/components/demo'
import { ToggleButton } from '@/ui/toggle-button'
import { ToggleButtonGroup } from '@/ui/toggle-button-group'

const toOklch = converter('oklch')
const dEOK = differenceEuclidean('oklab')

// Geist blue, light theme, steps 100–1000 — verified from vercel.com/design.md.
const GEIST_BLUE = [
  '#f0f7ff',
  '#e9f4ff',
  '#dfefff',
  '#cae7ff',
  '#94ccff',
  '#48aeff',
  '#006bff',
  '#0059ec',
  '#005ff2',
  '#002359',
]

// Geist's AUTHORED Display-P3 oklch() values (design.md) — the source the prose
// quotes. The hue drifts by hand and the lightness is non-monotone (900 > 800).
// These differ from the sRGB-hex conversions above (e.g. hex solid reads ~260°).
const GEIST_H = [
  251.56, 250.59, 249.85, 245.12, 248.48, 248.13, 258.23, 257.85, 256.99,
  254.34,
]
const GEIST_L = [
  97.32, 96.29, 94.58, 91.58, 82.75, 73.08, 57.61, 51.51, 53.18, 26.67,
]

// A minimal engine: fixed lightness skeleton (ch11) + chroma bell peaking at
// the solid (ch12), hue from the seed (ch13). Monotone by construction.
const L_ANCHORS = [0.972, 0.955, 0.93, 0.895, 0.83, 0.72, 0.6, 0.52, 0.42, 0.29]
const C_SHAPE = [0.06, 0.12, 0.22, 0.38, 0.62, 0.85, 1.0, 0.93, 0.72, 0.42]

function genRamp(seed: string): string[] {
  const s = toOklch(seed)
  const c = s?.c ?? 0.1
  const h = s?.h ?? 250
  return L_ANCHORS.map((l, i) =>
    formatHex(
      clampChroma(
        { mode: 'oklch' as const, l, c: c * (C_SHAPE[i] ?? 0), h },
        'oklch',
      ),
    ),
  )
}

const SEEDS = [
  { label: 'Vercel blue', value: '#006bff' },
  { label: 'Violet', value: '#635bff' },
  { label: 'Emerald', value: '#00ad47' },
  { label: 'Crimson', value: '#f34847' },
]

function Row({ ramp, dim }: { ramp: string[]; dim?: boolean }) {
  return (
    <div className={cn('flex gap-1', dim && 'opacity-30')}>
      {ramp.map((hex, i) => (
        <div
          key={i}
          className="h-8 min-w-0 flex-1 rounded-md border"
          style={{ backgroundColor: hex }}
        />
      ))}
    </div>
  )
}

function LinePlot({
  title,
  geist,
  engine,
  min,
  max,
  fmt,
}: {
  title: string
  geist: number[]
  engine: number[]
  min: number
  max: number
  fmt: (v: number) => string
}) {
  const W = 300
  const H = 72
  const padX = 10
  const padY = 12
  const x = (i: number) => padX + (i / 9) * (W - 2 * padX)
  const y = (v: number) => padY + (1 - (v - min) / (max - min)) * (H - 2 * padY)
  const path = (vals: number[]) =>
    vals.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ')
  return (
    <div className="flex flex-1 flex-col gap-1">
      <span className="font-mono text-[0.6rem] text-fg-muted tabular-nums">
        {title} · Geist {fmt(geist[0] ?? 0)}→{fmt(geist[9] ?? 0)} · engine{' '}
        {fmt(engine[0] ?? 0)}
      </span>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-auto w-full text-fg"
        role="img"
        aria-label={`${title}: Geist hand-authored versus engine generated`}
      >
        {/* engine — generated, flat/monotone by rule */}
        <polyline
          points={path(engine)}
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          strokeDasharray="4 3"
          opacity={0.45}
        />
        {/* Geist — hand-authored */}
        <polyline
          points={path(geist)}
          fill="none"
          stroke="currentColor"
          strokeWidth={1.75}
        />
        {geist.map((v, i) => (
          <circle key={i} cx={x(i)} cy={y(v)} r={1.8} fill="currentColor" />
        ))}
      </svg>
    </div>
  )
}

export function DesignedVsGenerated() {
  const [seed, setSeed] = useState('#006bff')
  const engine = useMemo(() => genRamp(seed), [seed])
  const isVercel = seed === '#006bff'
  const drift = dEOK(engine[6] ?? '#000000', '#006bff')
  const seedHue = toOklch(seed)?.h ?? 250
  const engineHue = Array(10).fill(seedHue)
  const engineL = L_ANCHORS.map((l) => l * 100)

  return (
    <Demo
      caption={
        <>
          Geist reached its blue by hand, for one brand. The engine reaches a
          ramp for <em>any</em> seed by function — near Geist&rsquo;s on the
          Vercel blue (&Delta;EOK &asymp; 0.033 at the solid), but it
          can&rsquo;t copy Geist&rsquo;s per-step hue drift or non-monotone
          ladder (the plots, read from Geist&rsquo;s authored P3{' '}
          <span className="font-mono">oklch()</span> values). Switch to violet
          or emerald and the engine follows into a region where no Geist ramp
          exists. The hand can&rsquo;t be generated; the reach can&rsquo;t be
          hand-authored.
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-fg-muted">seed</span>
          <ToggleButtonGroup
            selectionMode="single"
            disallowEmptySelection
            selectedKeys={[seed]}
            onSelectionChange={(keys) => {
              const next = [...keys][0]
              if (typeof next === 'string') setSeed(next)
            }}
            size="sm"
            aria-label="Engine seed"
            className="max-w-full overflow-x-auto"
          >
            {SEEDS.map((s) => (
              <ToggleButton key={s.value} id={s.value}>
                {s.label}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-fg-muted">Geist — hand-designed</span>
            {!isVercel && (
              <span className="text-[0.7rem] text-fg-warning">
                no Geist ramp for this brand
              </span>
            )}
          </div>
          <Row ramp={GEIST_BLUE} dim={!isVercel} />
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-xs text-fg-muted">
            Engine — generated from {seed}
          </span>
          <Row ramp={engine} />
        </div>

        {isVercel ? (
          <div className="flex flex-col gap-3 rounded-lg border bg-muted/40 p-3 sm:flex-row">
            <LinePlot
              title="hue (°)"
              geist={GEIST_H}
              engine={engineHue}
              min={243}
              max={262}
              fmt={(v) => `${v.toFixed(0)}°`}
            />
            <LinePlot
              title="lightness (%)"
              geist={GEIST_L}
              engine={engineL}
              min={20}
              max={100}
              fmt={(v) => `${v.toFixed(0)}`}
            />
          </div>
        ) : (
          <span className="rounded-lg border bg-muted/40 p-3 text-[0.7rem] text-fg-muted">
            Curves compare only against Geist — switch back to Vercel blue to
            see the hand-drawn hue drift and non-monotone ladder against the
            engine&rsquo;s flat, monotone rule.
          </span>
        )}

        <span
          aria-live="polite"
          className="font-mono text-[0.65rem] text-fg-muted tabular-nums"
        >
          {isVercel
            ? `engine solid ${engine[6]} vs Geist blue-700 #006bff — ΔEOK ${drift.toFixed(3)} (near, not on: two tunings of one target)`
            : `engine solid ${engine[6]} — the road reached a destination Geist never designed`}
        </span>
      </div>
    </Demo>
  )
}
