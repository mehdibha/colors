import { useMemo, useState } from 'react'
import { clampChroma, converter } from 'culori'

import { Playground } from '@/components/playground'
import { Slider, SliderControl } from '@/ui/slider'
import { ToggleButton } from '@/ui/toggle-button'
import { ToggleButtonGroup } from '@/ui/toggle-button-group'

import {
  DEFAULT_RATIOS,
  grayAt,
  LEONARDO_BLUE_KEYS,
  makeScale,
  solveWcag,
} from './leonardo-mini'

const QUESTION =
  'Name the background and the target ratios — what does the solver hand back, and what does it trade away?'

const PRESETS = [
  { id: 'blue', name: 'Leonardo blue', keys: LEONARDO_BLUE_KEYS },
  { id: 'yellow', name: 'Vivid yellow', keys: ['#ffe100'] },
  { id: 'purple', name: 'Brand purple', keys: ['#635bff'] },
] as const

type PresetId = (typeof PRESETS)[number]['id']

const toOklch = converter('oklch')

interface StepReadout {
  name: string
  target: number
  hex: string
  measured: number
  l: number
  c: number
  ceilingPct: number | undefined
  reached: boolean
}

export function MiniLeonardo() {
  const [presetId, setPresetId] = useState<PresetId>('blue')
  const [bgL, setBgL] = useState(98)
  const [ratios, setRatios] = useState<number[]>([...DEFAULT_RATIOS])

  const preset = PRESETS.find((p) => p.id === presetId) ?? PRESETS[0]
  const scale = useMemo(() => makeScale([...preset.keys]), [preset])
  const bg = grayAt(bgL)

  const steps = useMemo<StepReadout[]>(
    () =>
      ratios.map((target, i) => {
        const solve = solveWcag(scale, bg, target)
        const ok = toOklch(solve.hex)
        const l = ok?.l ?? 0
        const c = ok?.c ?? 0
        const h = ok?.h
        const ceilingPct =
          h !== undefined && c >= 0.01
            ? (c / clampChroma({ mode: 'oklch', l, c: 0.5, h }, 'oklch').c) *
              100
            : undefined
        return {
          name: `${(i + 1) * 100}`,
          target,
          hex: solve.hex,
          measured: solve.measured,
          l,
          c,
          ceilingPct,
          reached: Math.abs(solve.measured - target) <= 0.05,
        }
      }),
    [ratios, scale, bg],
  )

  const keyC = Math.max(...preset.keys.map((k) => toOklch(k)?.c ?? 0))
  const bodyStep = steps[3]
  const labelColor = bgL >= 50 ? '#3f3f46' : '#a1a1aa'

  const reset = () => {
    setPresetId('blue')
    setBgL(98)
    setRatios([...DEFAULT_RATIOS])
  }

  return (
    <Playground question={QUESTION} onReset={reset}>
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <ToggleButtonGroup
              selectionMode="single"
              disallowEmptySelection
              selectedKeys={[presetId]}
              onSelectionChange={(keys) => {
                const next = [...keys][0]
                if (next === 'blue' || next === 'yellow' || next === 'purple') {
                  setPresetId(next)
                }
              }}
              size="sm"
              aria-label="Key colors"
              className="max-w-full overflow-x-auto"
            >
              {PRESETS.map((p) => (
                <ToggleButton key={p.id} id={p.id}>
                  {p.keys.map((k) => (
                    <span
                      key={k}
                      aria-hidden
                      className="mr-1.5 inline-block size-3 rounded-full border align-[-1px]"
                      style={{ backgroundColor: k }}
                    />
                  ))}
                  {p.name}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </div>

          <div className="flex items-center gap-3">
            <span className="w-24 shrink-0 text-xs text-fg-muted">
              Background L*
            </span>
            <Slider
              aria-label="Theme background lightness"
              value={bgL}
              onChange={(v) => setBgL(v as number)}
              minValue={0}
              maxValue={100}
              step={1}
              className="flex-1"
            >
              <SliderControl />
            </Slider>
            <span className="w-16 shrink-0 text-right font-mono text-xs text-fg-muted tabular-nums">
              {bgL} · {bg}
            </span>
          </div>

          {ratios.map((r, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="w-24 shrink-0 font-mono text-xs text-fg-muted tabular-nums">
                {(i + 1) * 100} target
              </span>
              <Slider
                aria-label={`Target contrast ratio for step ${(i + 1) * 100}`}
                value={r}
                onChange={(v) =>
                  setRatios((prev) =>
                    prev.map((x, j) => (j === i ? (v as number) : x)),
                  )
                }
                minValue={1.1}
                maxValue={15}
                step={0.1}
                className="flex-1"
              >
                <SliderControl />
              </Slider>
              <span className="w-16 shrink-0 text-right font-mono text-xs text-fg-muted tabular-nums">
                {r.toFixed(1)}:1
              </span>
            </div>
          ))}
        </div>

        <div className="rounded-lg border p-4" style={{ backgroundColor: bg }}>
          <div className="flex gap-2">
            {steps.map((step) => (
              <div
                key={step.name}
                className="flex min-w-0 flex-1 flex-col items-center gap-1"
              >
                <div
                  className="h-10 w-full rounded-md"
                  style={{ backgroundColor: step.hex }}
                />
                <span
                  className="font-mono text-[0.6rem] tabular-nums"
                  style={{ color: labelColor }}
                >
                  {step.name}
                </span>
              </div>
            ))}
          </div>
          {bodyStep && (
            <p
              className="mt-3 text-sm font-medium"
              style={{ color: bodyStep.hex }}
            >
              Body text set in the step-400 solve — whatever color that
              currently is.
            </p>
          )}
        </div>

        <div aria-live="polite" className="overflow-x-auto">
          <table className="w-full min-w-105 text-left text-xs tabular-nums">
            <thead>
              <tr className="border-b text-fg-muted">
                <th className="py-1.5 pr-2 font-normal">step</th>
                <th className="py-1.5 pr-2 font-normal">target</th>
                <th className="py-1.5 pr-2 font-normal">solved</th>
                <th className="py-1.5 pr-2 font-normal">measured</th>
                <th className="py-1.5 pr-2 font-normal">oklch L / C</th>
                <th className="py-1.5 font-normal">of chroma ceiling</th>
              </tr>
            </thead>
            <tbody className="font-mono">
              {steps.map((step) => (
                <tr key={step.name} className="border-b border-dashed">
                  <td className="py-1.5 pr-2">{step.name}</td>
                  <td className="py-1.5 pr-2">{step.target.toFixed(1)}:1</td>
                  <td className="py-1.5 pr-2">{step.hex}</td>
                  <td className="py-1.5 pr-2">
                    {step.measured.toFixed(2)}:1
                    {!step.reached && (
                      <span className="ml-1.5 text-danger">out of reach</span>
                    )}
                  </td>
                  <td className="py-1.5 pr-2">
                    {step.l.toFixed(3)} / {step.c.toFixed(3)}
                  </td>
                  <td className="py-1.5">
                    {step.ceilingPct === undefined
                      ? '—'
                      : `${step.ceilingPct.toFixed(0)}%`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p aria-live="polite" className="text-xs text-fg-muted tabular-nums">
          Key colors carry chroma up to{' '}
          <span className="font-mono">{keyC.toFixed(3)}</span>
          {bodyStep && (
            <>
              ; the 400 solve delivers{' '}
              <span className="font-mono">{bodyStep.c.toFixed(3)}</span>
              {bodyStep.ceilingPct !== undefined &&
                bodyStep.ceilingPct >= 95 &&
                ' — riding the gamut ceiling: the ratio dictated the lightness, and the tent decided the rest'}
            </>
          )}
          .
        </p>

        <p className="text-xs text-fg-muted">
          This solver reproduces <code>@adobe/leonardo-contrast-colors</code>{' '}
          v1.1.0 within ΔEok 0.004 across 25 checked swatches — three
          backgrounds, both scoring formulas.
        </p>
      </div>
    </Playground>
  )
}
