import type * as React from 'react'
import { useState } from 'react'
import { converter, formatHex, wcagContrast } from 'culori'

import { apcaLc } from '@/lib/apca'
import { Playground } from '@/components/playground'
import { ToggleButton } from '@/ui/toggle-button'
import { ToggleButtonGroup } from '@/ui/toggle-button-group'

const toRgb = converter('rgb')
const toOklch = converter('oklch')

function over(fg: string, bg: string, a: number): string {
  const f = toRgb(fg)
  const b = toRgb(bg)
  if (!f || !b) return bg
  return (
    formatHex({
      mode: 'rgb',
      r: f.r * a + b.r * (1 - a),
      g: f.g * a + b.g * (1 - a),
      b: f.b * a + b.b * (1 - a),
    }) ?? bg
  )
}

const CARD = '#f6f5f1' // neutral-100
const PANEL = '#b0dcff' // accent-200 — a colored callout
const RING = '#4992dd' // border-focus = accent-500

// State-layer opacities: Material 3 hover 0.08, pressed 0.12; disabled content
// 0.38. The overlay color is the role's on-color (black for neutral, the
// family solid for status).
const OP = { hover: 0.08, active: 0.12 } as const
const DISABLED = 0.38

type Role = 'neutral' | 'success' | 'warning' | 'danger' | 'info'
type State = 'rest' | 'hover' | 'active' | 'focus' | 'disabled'
type Mech = 'solid' | 'alpha'

// overlay = state-layer color; text = the role's text partner (family-800).
const ROLES: Record<Role, { label: string; overlay: string; text: string }> = {
  neutral: { label: 'Neutral', overlay: '#000000', text: '#1d1d1a' },
  success: { label: 'Success', overlay: '#00ad47', text: '#005912' },
  warning: { label: 'Warning', overlay: '#b78600', text: '#5e4100' },
  danger: { label: 'Danger', overlay: '#f34847', text: '#880010' },
  info: { label: 'Info', overlay: '#438aff', text: '#0b4092' },
}

const oklch = (hex: string) => {
  const c = toOklch(hex)
  return { l: c?.l ?? 0, c: c?.c ?? 0 }
}

interface Resolved {
  fill: string // the painted surface behind the label
  text: string // label color
  ring: boolean
}

// The whole point: `solid` freezes the state layer against the card, then reuses
// that frozen hex everywhere. `alpha` recomposites the overlay per surface.
function resolve(
  role: Role,
  state: State,
  mech: Mech,
  surface: string,
): Resolved {
  const { overlay, text } = ROLES[role]
  if (state === 'rest' || state === 'focus') {
    return { fill: surface, text, ring: state === 'focus' }
  }
  if (state === 'disabled') {
    return { fill: surface, text: over(text, surface, DISABLED), ring: false }
  }
  const op = OP[state]
  const fill =
    mech === 'alpha' ? over(overlay, surface, op) : over(overlay, CARD, op)
  return { fill, text, ring: false }
}

const REST_TEXT = '#64635e' // neutral-600

function Control({ r, surface }: { r: Resolved; surface: string }) {
  return (
    <div
      className="flex flex-col gap-1.5 rounded-md border p-2.5"
      style={{ backgroundColor: surface }}
    >
      <span
        className="rounded px-2.5 py-1.5 text-xs"
        style={{ color: REST_TEXT }}
      >
        Rename
      </span>
      <span
        className="rounded px-2.5 py-1.5 text-xs font-medium"
        style={{
          backgroundColor: r.fill,
          color: r.text,
          boxShadow: r.ring
            ? `0 0 0 2px ${surface}, 0 0 0 4px ${RING}`
            : 'none',
        }}
      >
        Duplicate
      </span>
    </div>
  )
}

function Readout({ label, r }: { label: string; r: Resolved }) {
  const f = oklch(r.fill)
  const w = wcagContrast(r.text, r.fill)
  const lc = apcaLc(r.text, r.fill)
  return (
    <tr className="border-t">
      <td className="py-1.5 pr-3 text-fg-muted">{label}</td>
      <td className="py-1.5 pr-3">
        <span
          className="mr-1 inline-block size-2.5 rounded-xs border align-middle"
          style={{ backgroundColor: r.fill }}
        />
        {r.fill}
      </td>
      <td className="py-1.5 pr-3">L {f.l.toFixed(3)}</td>
      <td className="py-1.5 pr-3">C {f.c.toFixed(3)}</td>
      <td className="py-1.5">
        {w.toFixed(2)}:1 · Lc {lc.toFixed(0)}
      </td>
    </tr>
  )
}

export function StateStatusLab() {
  const [role, setRole] = useState<Role>('neutral')
  const [state, setState] = useState<State>('hover')
  const [mech, setMech] = useState<Mech>('alpha')

  const isLayer = state === 'hover' || state === 'active'
  const card = resolve(role, state, mech, CARD)
  const panel = resolve(role, state, mech, PANEL)

  // Both mechanisms on the panel, always, so the verdict is stable.
  const layerState = isLayer ? state : 'hover'
  const solidPanel = oklch(resolve(role, layerState, 'solid', PANEL).fill)
  const alphaPanel = oklch(resolve(role, layerState, 'alpha', PANEL).fill)

  let verdict: React.ReactNode
  if (isLayer) {
    verdict = (
      <>
        On the tinted panel the alpha overlay keeps chroma C{' '}
        {alphaPanel.c.toFixed(3)} (stays tinted); the solid step collapses to C{' '}
        {solidPanel.c.toFixed(3)} — a value frozen from the card. The solid hex
        fits one surface; the alpha token composes over both.
      </>
    )
  } else if (state === 'focus') {
    verdict = (
      <>
        Focus is its own token, mechanism-independent: the ring is border-focus
        ({RING}) with a 2px offset. Against the adjacent surface it&rsquo;s{' '}
        {wcagContrast(RING, CARD).toFixed(2)}:1 on the card and{' '}
        {wcagContrast(RING, PANEL).toFixed(2)}:1 on the panel — both under WCAG
        1.4.11&rsquo;s 3:1, so this token needs raising or a two-tone ring; the
        offset gap only helps perceptually.
      </>
    )
  } else if (state === 'disabled') {
    verdict = (
      <>
        Disabled reduces the label to {DISABLED * 100}% opacity — reduced
        contrast on purpose. WCAG exempts it from the 4.5:1 floor, but it must
        still read as a control: {wcagContrast(card.text, card.fill).toFixed(2)}
        :1 here.
      </>
    )
  } else {
    verdict = <>Rest is the surface itself — no state layer, no cost.</>
  }

  return (
    <Playground
      question="One hover, every surface — does the state come from a ramp step or a layer of alpha?"
      onReset={() => {
        setRole('neutral')
        setState('hover')
        setMech('alpha')
      }}
    >
      <div className="flex flex-col gap-5">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-fg-muted">role</span>
            <ToggleButtonGroup
              selectionMode="single"
              disallowEmptySelection
              selectedKeys={[role]}
              onSelectionChange={(keys) => {
                const next = [...keys][0]
                if (typeof next === 'string' && next in ROLES)
                  setRole(next as Role)
              }}
              size="sm"
              aria-label="Role"
              className="max-w-full overflow-x-auto"
            >
              {(Object.keys(ROLES) as Role[]).map((k) => (
                <ToggleButton key={k} id={k}>
                  {ROLES[k].label}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-fg-muted">state</span>
            <ToggleButtonGroup
              selectionMode="single"
              disallowEmptySelection
              selectedKeys={[state]}
              onSelectionChange={(keys) => {
                const next = [...keys][0]
                if (
                  next === 'rest' ||
                  next === 'hover' ||
                  next === 'active' ||
                  next === 'focus' ||
                  next === 'disabled'
                )
                  setState(next)
              }}
              size="sm"
              aria-label="State"
              className="max-w-full overflow-x-auto"
            >
              <ToggleButton id="rest">Rest</ToggleButton>
              <ToggleButton id="hover">Hover</ToggleButton>
              <ToggleButton id="active">Active</ToggleButton>
              <ToggleButton id="focus">Focus</ToggleButton>
              <ToggleButton id="disabled">Disabled</ToggleButton>
            </ToggleButtonGroup>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-fg-muted">mechanism</span>
            <ToggleButtonGroup
              selectionMode="single"
              disallowEmptySelection
              selectedKeys={[mech]}
              onSelectionChange={(keys) => {
                const next = [...keys][0]
                if (next === 'solid' || next === 'alpha') setMech(next)
              }}
              size="sm"
              aria-label="Mechanism"
              isDisabled={!isLayer}
              className="max-w-full overflow-x-auto"
            >
              <ToggleButton id="solid">Solid step</ToggleButton>
              <ToggleButton id="alpha">Alpha overlay</ToggleButton>
            </ToggleButtonGroup>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <span className="text-xs text-fg-muted">Plain card</span>
            <Control r={card} surface={CARD} />
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="text-xs text-fg-muted">Tinted panel</span>
            <Control r={panel} surface={PANEL} />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-md text-left font-mono text-[0.65rem] tabular-nums">
            <thead>
              <tr className="text-fg-muted">
                <th className="py-1 pr-3 font-normal">surface</th>
                <th className="py-1 pr-3 font-normal">fill</th>
                <th className="py-1 pr-3 font-normal">L</th>
                <th className="py-1 pr-3 font-normal">C</th>
                <th className="py-1 font-normal">label</th>
              </tr>
            </thead>
            <tbody>
              <Readout label="card" r={card} />
              <Readout label="tinted panel" r={panel} />
            </tbody>
          </table>
        </div>

        <p
          aria-live="polite"
          className="rounded-md bg-muted/50 p-2.5 text-xs text-fg-muted"
        >
          {verdict}
        </p>
      </div>
    </Playground>
  )
}
