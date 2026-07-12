import { useState, type KeyboardEvent } from 'react'
import {
  clampRgb,
  converter,
  differenceEuclidean,
  displayable,
  formatHex,
  wcagContrast,
  wcagLuminance,
} from 'culori'

import { Playground } from '@/components/playground'
import { ToggleButton } from '@/ui/toggle-button'
import { ToggleButtonGroup } from '@/ui/toggle-button-group'

import {
  TW_FAMILIES,
  TW_STEPS,
  twCss,
  twFamily,
  twOklch,
  type TwStep,
} from './tailwind-v4-palette'

type View = 'l' | 'c'

const toRgb = converter('rgb')
const dEok = differenceEuclidean('oklab')

const clippedHex = (s: TwStep) => formatHex(clampRgb(toRgb(twOklch(s))))

// Contrast-anchored ghost: re-solve each chromatic step's L so its clipped
// sRGB rendering emits the gray ladder's luminance, holding the family's C and h.
const GRAY_Y = twFamily('gray').steps.map((s) =>
  wcagLuminance(clampRgb(toRgb(twOklch(s)))),
)

function solveGhostL(c: number, h: number, targetY: number): number {
  let lo = 0
  let hi = 1
  for (let i = 0; i < 28; i++) {
    const mid = (lo + hi) / 2
    const y = wcagLuminance(clampRgb(toRgb({ mode: 'oklch', l: mid, c, h })))
    if (y < targetY) lo = mid
    else hi = mid
  }
  return (lo + hi) / 2
}

const CHROMATIC = TW_FAMILIES.filter((f) => !f.neutral)

const GHOSTS = new Map(
  CHROMATIC.map((f) => [
    f.name,
    f.steps.map((s, i) => solveGhostL(s[1], s[2], GRAY_Y[i] ?? 0)),
  ]),
)

// Median chromatic L per step, for the Δ-from-median readout.
const MEDIAN_L = TW_STEPS.map((_, i) => {
  const ls = CHROMATIC.map((f) => (f.steps[i]?.[0] ?? 0) / 100).sort(
    (a, b) => a - b,
  )
  return ls[Math.floor(ls.length / 2)] ?? 0
})

const W = 620
const H = 320
const PAD = { left: 46, right: 16, top: 14, bottom: 30 }
const px = (i: number) =>
  PAD.left + (i / (TW_STEPS.length - 1)) * (W - PAD.left - PAD.right)
const pyFor = (view: View) => (v: number) => {
  const [min, max] = view === 'l' ? [0.1, 1] : [0, 0.3]
  return PAD.top + ((max - v) / (max - min)) * (H - PAD.top - PAD.bottom)
}

interface Sel {
  family: string
  step: number
}

export function TailwindSkeletonPlot() {
  const [view, setView] = useState<View>('l')
  const [ghost, setGhost] = useState(false)
  const [neutrals, setNeutrals] = useState(false)
  const [sel, setSel] = useState<Sel>({ family: 'yellow', step: 5 })

  const py = pyFor(view)
  const shown = neutrals ? TW_FAMILIES : CHROMATIC

  const onPlotKeyDown = (e: KeyboardEvent<SVGSVGElement>) => {
    const fi = Math.max(
      0,
      shown.findIndex((f) => f.name === sel.family),
    )
    let nextFamily = fi
    let nextStep = sel.step
    if (e.key === 'ArrowRight')
      nextStep = Math.min(TW_STEPS.length - 1, nextStep + 1)
    else if (e.key === 'ArrowLeft') nextStep = Math.max(0, nextStep - 1)
    else if (e.key === 'ArrowDown') nextFamily = (fi + 1) % shown.length
    else if (e.key === 'ArrowUp')
      nextFamily = (fi - 1 + shown.length) % shown.length
    else return
    e.preventDefault()
    const name = shown[nextFamily]?.name
    if (name) setSel({ family: name, step: nextStep })
  }

  const selFamily = twFamily(sel.family)
  const selStep = selFamily.steps[sel.step] ?? selFamily.steps[0]
  const readout = selStep
    ? {
        css: twCss(selStep),
        hex: clippedHex(selStep),
        white: wcagContrast(clippedHex(selStep), '#ffffff'),
        out: !displayable(twOklch(selStep)),
        clip: dEok(twOklch(selStep), clampRgb(toRgb(twOklch(selStep)))),
        dMedian: selFamily.neutral
          ? null
          : selStep[0] / 100 - (MEDIAN_L[sel.step] ?? 0),
        ghostL: GHOSTS.get(sel.family)?.[sel.step],
      }
    : null

  return (
    <Playground
      question="Twenty-six families ride one lightness skeleton — where does it hold, where does it bend, and what does it never promise?"
      onReset={() => {
        setView('l')
        setGhost(false)
        setNeutrals(false)
        setSel({ family: 'yellow', step: 5 })
      }}
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <ToggleButtonGroup
            selectionMode="single"
            disallowEmptySelection
            selectedKeys={[view]}
            onSelectionChange={(keys) => {
              const next = [...keys][0]
              if (next === 'l' || next === 'c') setView(next)
            }}
            size="sm"
            aria-label="Plotted channel"
            className="max-w-full overflow-x-auto"
          >
            <ToggleButton id="l">Lightness L</ToggleButton>
            <ToggleButton id="c">Chroma C</ToggleButton>
          </ToggleButtonGroup>
          <ToggleButton
            size="sm"
            isSelected={ghost && view === 'l'}
            isDisabled={view === 'c'}
            onChange={setGhost}
            aria-label="Show contrast-anchored ghost"
          >
            Contrast-anchored ghost
          </ToggleButton>
          <ToggleButton
            size="sm"
            isSelected={neutrals}
            onChange={setNeutrals}
            aria-label="Show the nine neutral families"
          >
            + 9 neutrals
          </ToggleButton>
        </div>

        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="h-auto w-full rounded-lg text-fg focus-reset focus-visible:focus-ring"
          role="application"
          tabIndex={0}
          onKeyDown={onPlotKeyDown}
          aria-label={
            (view === 'l'
              ? 'OKLCH lightness of every Tailwind family across steps 50 to 950.'
              : 'OKLCH chroma of every Tailwind family across steps 50 to 950.') +
            ' Left and right arrows move between steps, up and down between families; the readout below announces the selected value.'
          }
        >
          <g
            className="font-mono text-[0.6rem]"
            fill="currentColor"
            fillOpacity={0.55}
          >
            {(view === 'l' ? [1, 0.8, 0.6, 0.4, 0.2] : [0.3, 0.2, 0.1, 0]).map(
              (v) => (
                <g key={v}>
                  <line
                    x1={PAD.left}
                    y1={py(v)}
                    x2={W - PAD.right}
                    y2={py(v)}
                    stroke="currentColor"
                    strokeOpacity={0.08}
                  />
                  <text x={PAD.left - 6} y={py(v) + 3} textAnchor="end">
                    {v.toFixed(1)}
                  </text>
                </g>
              ),
            )}
            {TW_STEPS.map((s, i) => (
              <text key={s} x={px(i)} y={H - 10} textAnchor="middle">
                {s}
              </text>
            ))}
          </g>

          {ghost &&
            view === 'l' &&
            CHROMATIC.map((f) => {
              const ls = GHOSTS.get(f.name) ?? []
              const d = ls
                .map(
                  (l, i) =>
                    `${i === 0 ? 'M' : 'L'}${px(i).toFixed(1)},${py(l).toFixed(1)}`,
                )
                .join(' ')
              return (
                <path
                  key={`ghost-${f.name}`}
                  d={d}
                  fill="none"
                  stroke={twCss(f.steps[5] ?? [50, 0, 0])}
                  strokeWidth={1}
                  strokeOpacity={0.5}
                  strokeDasharray="3 3"
                />
              )
            })}

          {shown.map((f) => {
            const active = f.name === sel.family
            const d = f.steps
              .map(
                (s, i) =>
                  `${i === 0 ? 'M' : 'L'}${px(i).toFixed(1)},${py(view === 'l' ? s[0] / 100 : s[1]).toFixed(1)}`,
              )
              .join(' ')
            return (
              <path
                key={f.name}
                d={d}
                fill="none"
                stroke={twCss(f.steps[5] ?? [50, 0, 0])}
                strokeWidth={active ? 2.5 : 1.25}
                strokeOpacity={active ? 1 : ghost && view === 'l' ? 0.25 : 0.45}
              />
            )
          })}

          {shown.map((f) =>
            f.steps.map((s, i) => {
              const active = f.name === sel.family && i === sel.step
              return (
                <circle
                  key={`${f.name}-${i}`}
                  cx={px(i)}
                  cy={py(view === 'l' ? s[0] / 100 : s[1])}
                  r={active ? 5 : 6}
                  fill={active ? twCss(s) : 'transparent'}
                  stroke={active ? 'currentColor' : 'none'}
                  strokeWidth={1.5}
                  className="cursor-pointer"
                  onMouseEnter={() => setSel({ family: f.name, step: i })}
                  onClick={() => setSel({ family: f.name, step: i })}
                />
              )
            }),
          )}

          {view === 'l' && !ghost && (
            <g
              className="font-mono text-[0.6rem]"
              fill="currentColor"
              fillOpacity={0.55}
            >
              <text x={px(5)} y={py(0.815)} textAnchor="middle">
                yellow
              </text>
              <text x={px(5)} y={py(0.562)} textAnchor="middle">
                indigo
              </text>
              {neutrals && (
                <text x={px(5)} y={py(0.523)} textAnchor="middle">
                  gray
                </text>
              )}
            </g>
          )}
        </svg>

        {readout && (
          <div
            aria-live="polite"
            className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-lg border p-3 text-xs"
          >
            <span
              aria-hidden
              className="size-9 shrink-0 rounded-md border"
              style={{ backgroundColor: readout.css }}
            />
            <span className="font-mono font-medium">
              {sel.family}-{TW_STEPS[sel.step]}
            </span>
            <span className="font-mono text-fg-muted tabular-nums">
              {readout.css}
            </span>
            <span className="font-mono text-fg-muted tabular-nums">
              sRGB {readout.hex}
            </span>
            <span className="text-fg-muted tabular-nums">
              white text {readout.white.toFixed(2)}:1
            </span>
            {readout.dMedian !== null && (
              <span className="text-fg-muted tabular-nums">
                ΔL vs median {readout.dMedian >= 0 ? '+' : ''}
                {readout.dMedian.toFixed(3)}
              </span>
            )}
            {readout.out && (
              <span className="rounded-sm bg-warning-muted px-1.5 py-0.5 font-medium tabular-nums">
                outside sRGB — clips ΔEok {readout.clip.toFixed(3)}
              </span>
            )}
            {ghost && view === 'l' && readout.ghostL !== undefined && (
              <span className="text-fg-muted tabular-nums">
                ghost L {readout.ghostL.toFixed(3)} (shipped{' '}
                {((selStep?.[0] ?? 0) / 100).toFixed(3)})
              </span>
            )}
          </div>
        )}

        <p className="text-xs text-fg-muted">
          Every curve is the shipped v4.3.2 value — hover any point, or focus
          the plot and use the arrow keys. The skeleton is tight at both ends
          (all 17 chromatic families within ±0.03 of the median at 50 and 950)
          and fans in the vivid middle (5 of 17 at 400) — yellow floats to L
          0.795 at 500 where indigo sits at 0.585. The ghost re-solves every
          step to emit gray&rsquo;s luminance at that step, holding each
          family&rsquo;s own chroma and hue: the fan collapses onto one contrast
          ladder, and yellow-500 falls from L 0.795 to ≈0.55 — a mustard.
          Tailwind chose the fan.
        </p>
      </div>
    </Playground>
  )
}
