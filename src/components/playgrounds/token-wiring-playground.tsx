import { useState, type MouseEvent } from 'react'
import { wcagContrast } from 'culori'

import { apcaLc } from '@/lib/apca'
import { cn } from '@/lib/utils'
import { Playground } from '@/components/playground'
import { ToggleButton } from '@/ui/toggle-button'
import { ToggleButtonGroup } from '@/ui/toggle-button-group'

// dotUI primitive ramps (registry base/colors.css), oklch → hex via culori,
// renamed by hue — the primitive tier has no opinions.
const STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950]
const RAMPS = {
  blue: [
    '#e8faff',
    '#d0edff',
    '#b0dcff',
    '#8fcbff',
    '#69b0fb',
    '#4992dd',
    '#347bc2',
    '#1a5c9b',
    '#0f487b',
    '#0a345b',
    '#05203a',
  ],
  green: [
    '#d6ffde',
    '#b0ffbf',
    '#8bf3a2',
    '#67e587',
    '#36cb66',
    '#00ad47',
    '#009432',
    '#00711e',
    '#005912',
    '#004208',
    '#002904',
  ],
  red: [
    '#fff0ed',
    '#ffdcd7',
    '#ffc2bb',
    '#ffa79e',
    '#ff766e',
    '#f34847',
    '#d62f33',
    '#ab091b',
    '#880010',
    '#65010a',
    '#410205',
  ],
  amber: [
    '#fff5c1',
    '#ffe69b',
    '#fcd271',
    '#f0bf46',
    '#d7a200',
    '#b78600',
    '#9c7000',
    '#775400',
    '#5e4100',
    '#462e00',
    '#2d1b00',
  ],
} as const

type RampKey = keyof typeof RAMPS
type OnAccent = 'auto' | 'white' | 'black'
type ElementId =
  | 'page'
  | 'card'
  | 'heading'
  | 'byline'
  | 'badge'
  | 'button'
  | 'link'

const GRAY = {
  bg: '#fafafa',
  card: '#f7f7f7',
  border: '#dbdbdb',
  fgMuted: '#626262',
  fg: '#070707',
}

const at = (ramp: RampKey, idx: number) => RAMPS[ramp][idx] ?? '#000000'

interface Wire {
  slot: string
  semantic: string
  primitive: string
  value: string
}

const RAMP_LABELS: Record<RampKey, string> = {
  blue: 'Blue',
  green: 'Green',
  red: 'Red',
  amber: 'Amber',
}

export function TokenWiringPlayground() {
  const [ramp, setRamp] = useState<RampKey>('blue')
  const [stepIdx, setStepIdx] = useState(5)
  const [onAccent, setOnAccent] = useState<OnAccent>('auto')
  const [focused, setFocused] = useState<ElementId>('button')

  const accent = at(ramp, stepIdx)
  const accentHover = at(ramp, Math.min(stepIdx + 1, 10))
  const accentMuted = at(ramp, 1)
  const fgAccent = at(ramp, 8)
  const autoPick =
    wcagContrast('#000000', accent) > wcagContrast('#ffffff', accent)
      ? 'black'
      : 'white'
  const labelPick = onAccent === 'auto' ? autoPick : onAccent
  const label = labelPick === 'black' ? '#000000' : '#ffffff'
  const step = STEPS[stepIdx] ?? 500

  const wires: Record<ElementId, Wire[]> = {
    page: [
      {
        slot: 'page surface',
        semantic: 'bg',
        primitive: '--gray-50',
        value: GRAY.bg,
      },
    ],
    card: [
      {
        slot: 'card surface',
        semantic: 'card',
        primitive: '--gray-100',
        value: GRAY.card,
      },
      {
        slot: 'card edge',
        semantic: 'border',
        primitive: '--gray-300',
        value: GRAY.border,
      },
    ],
    heading: [
      {
        slot: 'heading text',
        semantic: 'fg',
        primitive: '--gray-950',
        value: GRAY.fg,
      },
    ],
    byline: [
      {
        slot: 'byline text',
        semantic: 'fg-muted',
        primitive: '--gray-600',
        value: GRAY.fgMuted,
      },
    ],
    badge: [
      {
        slot: 'badge surface',
        semantic: 'accent-muted',
        primitive: `--${ramp}-100`,
        value: accentMuted,
      },
      {
        slot: 'badge text',
        semantic: 'fg-accent',
        primitive: `--${ramp}-800`,
        value: fgAccent,
      },
    ],
    button: [
      {
        slot: 'button surface',
        semantic: 'accent',
        primitive: `--${ramp}-${step}`,
        value: accent,
      },
      {
        slot: 'button label',
        semantic: 'fg-on-accent',
        primitive: onAccent === 'auto' ? `auto → ${autoPick}` : labelPick,
        value: label,
      },
    ],
    link: [
      {
        slot: 'link text',
        semantic: 'fg-accent',
        primitive: `--${ramp}-800`,
        value: fgAccent,
      },
    ],
  }

  const promises = [
    { name: 'fg on card', fgc: GRAY.fg, bgc: GRAY.card },
    { name: 'fg-muted on card', fgc: GRAY.fgMuted, bgc: GRAY.card },
    { name: 'fg-accent on card', fgc: fgAccent, bgc: GRAY.card },
    { name: 'fg-accent on accent-muted', fgc: fgAccent, bgc: accentMuted },
    { name: 'fg-on-accent on accent', fgc: label, bgc: accent },
    { name: 'fg-on-accent on accent-hover', fgc: label, bgc: accentHover },
  ].map((p) => {
    const w = wcagContrast(p.fgc, p.bgc)
    const lc = apcaLc(p.fgc, p.bgc)
    return { ...p, w, lc, passW: w >= 4.5, passA: Math.abs(lc) >= 60 }
  })

  const bothPass = promises.filter((p) => p.passW && p.passA).length
  const wcagOnly = promises.filter((p) => p.passW && !p.passA).length
  const broken = promises.filter((p) => !p.passW).length

  const focus = (id: ElementId) => ({
    tabIndex: 0,
    onMouseEnter: () => setFocused(id),
    onFocus: () => setFocused(id),
    onClick: (e: MouseEvent) => {
      e.stopPropagation()
      setFocused(id)
    },
  })
  const ring = (id: ElementId) =>
    focused === id ? 'ring-2 ring-fg/50 ring-offset-1' : ''

  return (
    <Playground
      question="Repoint accent and the whole UI follows — which promises break, and what catches them?"
      onReset={() => {
        setRamp('blue')
        setStepIdx(5)
        setOnAccent('auto')
        setFocused('button')
      }}
    >
      <div className="flex flex-col gap-5">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-fg-muted">accent →</span>
            <ToggleButtonGroup
              selectionMode="single"
              disallowEmptySelection
              selectedKeys={[ramp]}
              onSelectionChange={(keys) => {
                const next = [...keys][0]
                if (typeof next === 'string' && next in RAMPS)
                  setRamp(next as RampKey)
              }}
              size="sm"
              aria-label="Primitive ramp the accent alias points to"
              className="max-w-full overflow-x-auto"
            >
              {(Object.keys(RAMPS) as RampKey[]).map((k) => (
                <ToggleButton key={k} id={k}>
                  {RAMP_LABELS[k]}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-fg-muted">solid step</span>
            <ToggleButtonGroup
              selectionMode="single"
              disallowEmptySelection
              selectedKeys={[String(stepIdx)]}
              onSelectionChange={(keys) => {
                const next = Number([...keys][0])
                if (next >= 4 && next <= 7) setStepIdx(next)
              }}
              size="sm"
              aria-label="Ramp step for the accent solid"
              className="max-w-full overflow-x-auto"
            >
              <ToggleButton id="4">400</ToggleButton>
              <ToggleButton id="5">500</ToggleButton>
              <ToggleButton id="6">600</ToggleButton>
              <ToggleButton id="7">700</ToggleButton>
            </ToggleButtonGroup>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-fg-muted">fg-on-accent</span>
            <ToggleButtonGroup
              selectionMode="single"
              disallowEmptySelection
              selectedKeys={[onAccent]}
              onSelectionChange={(keys) => {
                const next = [...keys][0]
                if (next === 'auto' || next === 'white' || next === 'black')
                  setOnAccent(next)
              }}
              size="sm"
              aria-label="Button label pairing policy"
              className="max-w-full overflow-x-auto"
            >
              <ToggleButton id="auto">Auto</ToggleButton>
              <ToggleButton id="white">White</ToggleButton>
              <ToggleButton id="black">Black</ToggleButton>
            </ToggleButtonGroup>
          </div>
        </div>

        <div className="flex flex-col gap-4 lg:flex-row">
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <span className="text-xs text-fg-muted">
              Hover any part to read its wiring
            </span>
            <div
              className={cn(
                'cursor-default rounded-lg border p-4',
                ring('page'),
              )}
              style={{ backgroundColor: GRAY.bg, borderColor: GRAY.border }}
              {...focus('page')}
            >
              <div
                className={cn(
                  'flex flex-col gap-1.5 rounded-md border p-3',
                  ring('card'),
                )}
                style={{ backgroundColor: GRAY.card, borderColor: GRAY.border }}
                {...focus('card')}
              >
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={cn('text-xs font-medium', ring('heading'))}
                    style={{ color: GRAY.fg }}
                    {...focus('heading')}
                  >
                    Quarterly review
                  </span>
                  <span
                    className={cn(
                      'rounded-full px-2 py-0.5 text-[0.6rem] font-medium',
                      ring('badge'),
                    )}
                    style={{ backgroundColor: accentMuted, color: fgAccent }}
                    {...focus('badge')}
                  >
                    In progress
                  </span>
                </div>
                <span
                  className={cn('text-[0.7rem]', ring('byline'))}
                  style={{ color: GRAY.fgMuted }}
                  {...focus('byline')}
                >
                  Sarah · 2h ago
                </span>
                <div className="mt-1 flex items-center gap-2.5">
                  <span
                    className={cn(
                      'rounded-md px-2.5 py-1 text-[0.7rem] font-medium',
                      ring('button'),
                    )}
                    style={{ backgroundColor: accent, color: label }}
                    {...focus('button')}
                  >
                    Reply
                  </span>
                  <span
                    className={cn('text-[0.7rem] font-medium', ring('link'))}
                    style={{ color: fgAccent }}
                    {...focus('link')}
                  >
                    Open thread
                  </span>
                </div>
              </div>
            </div>
            <div
              aria-live="polite"
              className="flex min-h-16 flex-col gap-1 rounded-md bg-muted/50 p-2.5 font-mono text-[0.65rem] tabular-nums"
            >
              {(wires[focused] ?? []).map((w) => (
                <div
                  key={w.slot}
                  className="flex flex-wrap items-center gap-x-1.5"
                >
                  <span className="text-fg-muted">{w.slot}</span>
                  <span className="text-fg-muted">→</span>
                  <span className="font-medium">{w.semantic}</span>
                  <span className="text-fg-muted">→</span>
                  <span>{w.primitive}</span>
                  <span className="text-fg-muted">→</span>
                  <span
                    className="inline-block size-3 rounded-xs border align-middle"
                    style={{ backgroundColor: w.value }}
                  />
                  <span className="text-fg-muted">{w.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <span className="text-xs text-fg-muted">
              Pairing checker — WCAG ≥ 4.5 floor · |Lc| ≥ 60 target
            </span>
            <div className="overflow-x-auto">
              <table className="w-full min-w-sm text-left font-mono text-[0.65rem] tabular-nums">
                <thead>
                  <tr className="text-fg-muted">
                    <th className="py-1 pr-3 font-normal">promise</th>
                    <th className="py-1 pr-3 font-normal">WCAG</th>
                    <th className="py-1 font-normal">APCA</th>
                  </tr>
                </thead>
                <tbody>
                  {promises.map((p) => (
                    <tr key={p.name} className="border-t">
                      <td className="py-1.5 pr-3">{p.name}</td>
                      <td
                        className={cn(
                          'py-1.5 pr-3',
                          p.passW ? 'text-fg-success' : 'text-fg-danger',
                        )}
                      >
                        {p.w.toFixed(2)}:1 {p.passW ? '✓' : '✕'}
                      </td>
                      <td
                        className={cn(
                          'py-1.5',
                          p.passA ? 'text-fg-success' : 'text-fg-warning',
                        )}
                      >
                        Lc {p.lc.toFixed(1)} {p.passA ? '✓' : '⚠'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <span aria-live="polite" className="text-xs text-fg-muted">
              {bothPass} of {promises.length} promises hold on both meters
              {wcagOnly > 0 && <> · {wcagOnly} pass the WCAG floor only</>}
              {broken > 0 && <> · {broken} below the legal floor</>}
            </span>
          </div>
        </div>
      </div>
    </Playground>
  )
}
