import { useState } from 'react'
import {
  clampChroma,
  converter,
  differenceEuclidean,
  formatHex,
  interpolate,
  parse,
  wcagContrast,
} from 'culori'

import { apcaLc } from '@/lib/apca'
import { Playground } from '@/components/playground'
import { ToggleButton } from '@/ui/toggle-button'
import { ToggleButtonGroup } from '@/ui/toggle-button-group'

const toOklch = converter('oklch')
const toRgb = converter('rgb')
const dEok = differenceEuclidean('oklab')

// Radix blue + slate, light.ts / dark.ts.
const BLUE = {
  light: [
    '#fbfdff',
    '#f4faff',
    '#e6f4fe',
    '#d5efff',
    '#c2e5ff',
    '#acd8fc',
    '#8ec8f6',
    '#5eb1ef',
    '#0090ff',
    '#0588f0',
    '#0d74ce',
    '#113264',
  ],
  dark: [
    '#0d1520',
    '#111927',
    '#0d2847',
    '#003362',
    '#004074',
    '#104d87',
    '#205d9e',
    '#2870bd',
    '#0090ff',
    '#3b9eff',
    '#70b8ff',
    '#c2e6ff',
  ],
} as const

const SLATE = {
  light: [
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
  ],
  dark: [
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
  ],
} as const

type Mode = 'light' | 'dark'
type Strategy = 'walk' | 'shift' | 'layer'

const step = (scale: readonly string[], n: number): string =>
  scale[n - 1] ?? '#000000'

function shiftL(hex: string, delta: number): string {
  const o = toOklch(hex)
  if (!o) return hex
  return formatHex(
    clampChroma(
      { mode: 'oklch' as const, l: o.l + delta, c: o.c ?? 0, h: o.h ?? 0 },
      'oklch',
    ),
  )
}

// a state layer is alpha compositing — a gamma-sRGB lerp, what the browser does
const layer = (bg: string, content: string, alpha: number): string =>
  formatHex(interpolate([bg, content], 'rgb')(alpha))

function compositeOver(fg: string, bg: string): string {
  const f = toRgb(parse(fg))
  const b = toRgb(parse(bg))
  if (!f || !b) return bg
  const a = f.alpha ?? 1
  return formatHex({
    mode: 'rgb' as const,
    r: a * f.r + (1 - a) * b.r,
    g: a * f.g + (1 - a) * b.g,
    b: a * f.b + (1 - a) * b.b,
  })
}

interface Derived {
  fill: string | null
  note?: string
}

// hover/pressed fills per widget × strategy; null = the ramp designed no step for it.
function derive(
  widget: 'button' | 'list' | 'input',
  state: 'hover' | 'pressed',
  strategy: Strategy,
  mode: Mode,
): Derived {
  const blue = BLUE[mode]
  const slate = SLATE[mode]
  const dir = mode === 'light' ? -1 : 1
  const content = mode === 'light' ? '#1c2024' : '#edeef0'
  if (widget === 'button') {
    const rest = step(blue, 9)
    if (strategy === 'walk')
      return state === 'hover'
        ? { fill: step(blue, 10) }
        : { fill: null, note: 'the ramp stops at 10' }
    if (strategy === 'shift')
      return { fill: shiftL(rest, dir * (state === 'hover' ? 0.04 : 0.07)) }
    return { fill: layer(rest, '#ffffff', state === 'hover' ? 0.08 : 0.12) }
  }
  if (widget === 'list') {
    const rest = step(slate, 3)
    if (strategy === 'walk')
      return { fill: step(slate, state === 'hover' ? 4 : 5) }
    if (strategy === 'shift')
      return { fill: shiftL(rest, dir * (state === 'hover' ? 0.03 : 0.06)) }
    return { fill: layer(rest, content, state === 'hover' ? 0.08 : 0.12) }
  }
  // input: the state lives on the border
  const rest = step(slate, 7)
  if (strategy === 'walk')
    return state === 'hover'
      ? { fill: step(slate, 8) }
      : { fill: null, note: 'inputs have no pressed border job' }
  if (strategy === 'shift')
    return state === 'hover'
      ? { fill: shiftL(rest, dir * 0.06) }
      : { fill: null, note: 'not applicable' }
  return state === 'hover'
    ? { fill: layer(rest, content, 0.12) }
    : { fill: null, note: 'not applicable' }
}

const STATES = ['rest', 'hover', 'pressed', 'focus', 'disabled'] as const
type StateName = (typeof STATES)[number]

export function StateDerivationLab() {
  const [strategy, setStrategy] = useState<Strategy>('walk')
  const [mode, setMode] = useState<Mode>('light')

  const blue = BLUE[mode]
  const slate = SLATE[mode]
  const page = step(slate, 1)
  const text = step(slate, 12)
  const mutedOnPage = mode === 'light' ? '#60646c' : '#b0b4ba'
  const ring = step(blue, 9)
  const onSurface = mode === 'light' ? '28, 32, 36' : '237, 238, 240'

  const disabledFill = compositeOver(`rgba(${onSurface}, 0.12)`, page)
  const disabledText = compositeOver(`rgba(${onSurface}, 0.38)`, disabledFill)

  // --- button row ---
  const buttonFills: Record<StateName, Derived> = {
    rest: { fill: step(blue, 9) },
    hover: derive('button', 'hover', strategy, mode),
    pressed: derive('button', 'pressed', strategy, mode),
    focus: { fill: step(blue, 9) },
    disabled: { fill: disabledFill },
  }
  // --- list row ---
  const listFills: Record<StateName, Derived> = {
    rest: { fill: step(slate, 3) },
    hover: derive('list', 'hover', strategy, mode),
    pressed: derive('list', 'pressed', strategy, mode),
    focus: { fill: step(slate, 3) },
    disabled: { fill: step(slate, 3) },
  }
  // --- input row (state on the border) ---
  const inputBorders: Record<StateName, Derived> = {
    rest: { fill: step(slate, 7) },
    hover: derive('input', 'hover', strategy, mode),
    pressed: derive('input', 'pressed', strategy, mode),
    focus: { fill: ring },
    disabled: { fill: step(slate, 6) },
  }

  // visibility check: a state you can't see is a state you don't have
  const invisible: string[] = []
  for (const [name, row, restFill] of [
    ['button', buttonFills, step(blue, 9)],
    ['list item', listFills, step(slate, 3)],
  ] as const) {
    for (const s of ['hover', 'pressed'] as const) {
      const f = row[s].fill
      if (f && dEok(f, restFill) < 0.02) invisible.push(`${name} ${s}`)
    }
  }
  const ringVsPage = wcagContrast(ring, page)
  const summary = [
    invisible.length > 0
      ? `Invisible states (ΔEok < 0.02 from rest): ${invisible.join(', ')}.`
      : 'Every derived state is visibly different from rest.',
    `Focus ring vs page ${ringVsPage.toFixed(2)}:1 ${ringVsPage >= 3 ? '(clears 1.4.11)' : '(fails 1.4.11)'};`,
    'the 2px offset gap carries the control frontier.',
  ].join(' ')

  const cellNote = (d: Derived) =>
    d.fill === null ? (d.note ?? 'no designed step') : null

  return (
    <Playground
      question="Walk the ramp, compute a shift, or overlay a layer — which state strategy keeps its promises in both modes?"
      onReset={() => {
        setStrategy('walk')
        setMode('light')
      }}
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs text-fg-muted">Strategy</span>
            <ToggleButtonGroup
              selectionMode="single"
              disallowEmptySelection
              selectedKeys={[strategy]}
              onSelectionChange={(keys) => {
                const next = [...keys][0]
                if (next === 'walk' || next === 'shift' || next === 'layer')
                  setStrategy(next)
              }}
              size="sm"
              aria-label="State derivation strategy"
              className="max-w-full overflow-x-auto"
            >
              <ToggleButton id="walk">Walk the ramp</ToggleButton>
              <ToggleButton id="shift">Compute ΔL</ToggleButton>
              <ToggleButton id="layer">State layer</ToggleButton>
            </ToggleButtonGroup>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-fg-muted">Mode</span>
            <ToggleButtonGroup
              selectionMode="single"
              disallowEmptySelection
              selectedKeys={[mode]}
              onSelectionChange={(keys) => {
                const next = [...keys][0]
                if (next === 'light' || next === 'dark') setMode(next)
              }}
              size="sm"
              aria-label="Preview mode"
              className="max-w-full overflow-x-auto"
            >
              <ToggleButton id="light">Light</ToggleButton>
              <ToggleButton id="dark">Dark</ToggleButton>
            </ToggleButtonGroup>
          </div>
        </div>

        <div className="overflow-x-auto">
          <div
            className="min-w-[640px] rounded-lg border p-4"
            style={{ backgroundColor: page }}
          >
            <div className="grid grid-cols-[4rem_repeat(5,1fr)] gap-x-3 gap-y-4">
              <span />
              {STATES.map((s) => (
                <span
                  key={s}
                  className="text-[0.65rem] capitalize"
                  style={{ color: mutedOnPage }}
                >
                  {s}
                </span>
              ))}

              {/* Button: contract = white label on the fill */}
              <span
                className="self-center text-[0.65rem]"
                style={{ color: mutedOnPage }}
              >
                Button
              </span>
              {STATES.map((s) => {
                const d = buttonFills[s]
                const fill = d.fill
                const label = s === 'disabled' ? disabledText : '#ffffff'
                return (
                  <div key={s} className="flex flex-col gap-1">
                    {fill ? (
                      <span
                        className="rounded-md px-2 py-1.5 text-center text-[0.7rem] font-medium"
                        style={{
                          backgroundColor: fill,
                          color: label,
                          boxShadow:
                            s === 'focus'
                              ? `0 0 0 2px ${page}, 0 0 0 4px ${ring}`
                              : undefined,
                        }}
                      >
                        Save
                      </span>
                    ) : (
                      <span
                        className="rounded-md border border-dashed px-2 py-1.5 text-center text-[0.65rem]"
                        style={{ color: mutedOnPage, borderColor: mutedOnPage }}
                      >
                        —
                      </span>
                    )}
                    <span
                      className="font-mono text-[0.55rem] tabular-nums"
                      style={{ color: mutedOnPage }}
                    >
                      {fill
                        ? s === 'disabled'
                          ? `${wcagContrast(label, fill).toFixed(2)}:1 exempt`
                          : `${fill} · ${wcagContrast(label, fill).toFixed(2)}:1 · Lc ${Math.abs(apcaLc(label, fill)).toFixed(0)}`
                        : cellNote(d)}
                    </span>
                  </div>
                )
              })}

              {/* List item: contract = step-12 text on the fill */}
              <span
                className="self-center text-[0.65rem]"
                style={{ color: mutedOnPage }}
              >
                List item
              </span>
              {STATES.map((s) => {
                const d = listFills[s]
                const fill = d.fill ?? step(slate, 3)
                const rowText =
                  s === 'disabled'
                    ? compositeOver(`rgba(${onSurface}, 0.38)`, fill)
                    : text
                return (
                  <div key={s} className="flex flex-col gap-1">
                    <span
                      className="truncate rounded-md px-2 py-1.5 text-[0.7rem]"
                      style={{
                        backgroundColor: fill,
                        color: rowText,
                        boxShadow:
                          s === 'focus' ? `inset 0 0 0 2px ${ring}` : undefined,
                      }}
                    >
                      Inbox
                    </span>
                    <span
                      className="font-mono text-[0.55rem] tabular-nums"
                      style={{ color: mutedOnPage }}
                    >
                      {s === 'disabled'
                        ? `${wcagContrast(rowText, fill).toFixed(2)}:1 exempt`
                        : `${fill} · ${wcagContrast(rowText, fill).toFixed(2)}:1`}
                    </span>
                  </div>
                )
              })}

              {/* Input: contract = border vs field, 3:1 (1.4.11) */}
              <span
                className="self-center text-[0.65rem]"
                style={{ color: mutedOnPage }}
              >
                Input
              </span>
              {STATES.map((s) => {
                const d = inputBorders[s]
                const border = d.fill
                const field = s === 'disabled' ? step(slate, 2) : page
                return (
                  <div key={s} className="flex flex-col gap-1">
                    {border ? (
                      <span
                        className="rounded-md border-2 px-2 py-1.5 text-[0.7rem]"
                        style={{
                          backgroundColor: field,
                          borderColor: border,
                          color:
                            s === 'disabled'
                              ? compositeOver(`rgba(${onSurface}, 0.38)`, field)
                              : mutedOnPage,
                          boxShadow:
                            s === 'focus'
                              ? `0 0 0 2px ${page}, 0 0 0 4px ${ring}`
                              : undefined,
                        }}
                      >
                        Email
                      </span>
                    ) : (
                      <span
                        className="rounded-md border border-dashed px-2 py-1.5 text-center text-[0.65rem]"
                        style={{ color: mutedOnPage, borderColor: mutedOnPage }}
                      >
                        —
                      </span>
                    )}
                    <span
                      className="font-mono text-[0.55rem] tabular-nums"
                      style={{ color: mutedOnPage }}
                    >
                      {border
                        ? s === 'disabled'
                          ? 'exempt'
                          : `border ${wcagContrast(border, field).toFixed(2)}:1 ${wcagContrast(border, field) >= 3 ? '✓' : '✕'} (needs 3)`
                        : cellNote(d)}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <p aria-live="polite" className="text-xs text-fg-muted">
          {summary}
        </p>
      </div>
    </Playground>
  )
}
