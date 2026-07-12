import { useEffect, useState } from 'react'
import {
  differenceEuclidean,
  formatCss,
  formatHex,
  interpolate,
  wcagContrast,
} from 'culori'

import { apcaLc } from '@/lib/apca'
import { Playground } from '@/components/playground'
import { ToggleButton } from '@/ui/toggle-button'
import { ToggleButtonGroup } from '@/ui/toggle-button-group'

const dEok = differenceEuclidean('oklab')

type States = 'steps' | 'mix'
type Modes = 'class' | 'lightdark'
type Mode = 'light' | 'dark'
type Src = 'base' | 'states' | 'mode' | 'p3' | 'comment'

interface Line {
  text: string
  src: Src
}

const ok = (l: number, c: number, h: number) => ({
  mode: 'oklch' as const,
  l,
  c,
  h,
})

// dotUI's shipped primitives (registry base/colors.css), light and dark blocks.
const A500 = ok(0.6478, 0.1337, 251.06)
const A500_P3 = 'oklch(0.6478 0.2055 251.06)'
const STEPS = {
  light: {
    hover: ok(0.5733, 0.1301, 251.06),
    active: ok(0.4689, 0.1197, 251.06),
  },
  dark: {
    hover: ok(0.7422, 0.1301, 251.06),
    active: ok(0.8209, 0.0962, 245.01),
  },
}
const MIX = {
  light: {
    hover: interpolate([A500, '#000000'], 'oklab')(0.08),
    active: interpolate([A500, '#000000'], 'oklab')(0.16),
  },
  dark: {
    hover: interpolate([A500, '#ffffff'], 'oklab')(0.08),
    active: interpolate([A500, '#ffffff'], 'oklab')(0.16),
  },
}
const NEUTRALS = {
  light: {
    bg: '#fafafa',
    border: '#dbdbdb',
    fgMuted: '#626262',
    fg: '#070707',
  },
  dark: { bg: '#070707', border: '#353535', fgMuted: '#b7b7b7', fg: '#fafafa' },
}

const SRC_COLOR: Record<Src, string> = {
  base: '#e6edf3',
  states: '#7ee787',
  mode: '#79c0ff',
  p3: '#d2a8ff',
  comment: '#8b949e',
}

function buildLines(states: States, modes: Modes, p3: boolean): Line[] {
  const lines: Line[] = []
  const push = (text: string, src: Src = 'base') => lines.push({ text, src })

  push('/* colors.css — the primitives */', 'comment')
  if (modes === 'class') {
    push(':root {')
    push('  --neutral-50: oklch(0.985 0 0);')
    push('  --neutral-300: oklch(0.8926 0 0);')
    push('  --neutral-600: oklch(0.4979 0 0);')
    push('  --neutral-950: oklch(0.13 0 0);')
    push('  --accent-500: oklch(0.6478 0.1337 251.06);')
    if (states === 'steps') {
      push('  --accent-600: oklch(0.5733 0.1301 251.06);', 'states')
      push('  --accent-700: oklch(0.4689 0.1197 251.06);', 'states')
    }
    push('}')
    push('.dark {', 'mode')
    push('  /* no --accent-500 line: the solid survives the room */', 'comment')
    push('  --neutral-50: oklch(0.13 0 0);', 'mode')
    push('  --neutral-300: oklch(0.3281 0 0);', 'mode')
    push('  --neutral-600: oklch(0.7802 0 0);', 'mode')
    push('  --neutral-950: oklch(0.985 0 0);', 'mode')
    if (states === 'steps') {
      push('  --accent-600: oklch(0.7422 0.1301 251.06);', 'states')
      push('  --accent-700: oklch(0.8209 0.0962 245.01);', 'states')
    }
    push('}', 'mode')
  } else {
    push(':root {')
    push('  color-scheme: light dark;', 'mode')
    push(
      '  --neutral-50: light-dark(oklch(0.985 0 0), oklch(0.13 0 0));',
      'mode',
    )
    push(
      '  --neutral-300: light-dark(oklch(0.8926 0 0), oklch(0.3281 0 0));',
      'mode',
    )
    push(
      '  --neutral-600: light-dark(oklch(0.4979 0 0), oklch(0.7802 0 0));',
      'mode',
    )
    push(
      '  --neutral-950: light-dark(oklch(0.13 0 0), oklch(0.985 0 0));',
      'mode',
    )
    push(
      '  --accent-500: oklch(0.6478 0.1337 251.06); /* same in both modes */',
    )
    if (states === 'steps') {
      push(
        '  --accent-600: light-dark(oklch(0.5733 0.1301 251.06), oklch(0.7422 0.1301 251.06));',
        'states',
      )
      push(
        '  --accent-700: light-dark(oklch(0.4689 0.1197 251.06), oklch(0.8209 0.0962 245.01));',
        'states',
      )
    }
    push('}')
    push(
      '.dark { color-scheme: dark; } /* class switchers still work */',
      'mode',
    )
  }
  if (p3) {
    push('@media (color-gamut: p3) {', 'p3')
    push(`  :root { --accent-500: ${A500_P3}; }`, 'p3')
    if (states === 'steps') {
      push(
        '  /* hover/active still point at sRGB steps — upgrades not included */',
        'comment',
      )
    } else {
      push(
        '  /* computed hover/active follow the upgrade for free */',
        'comment',
      )
    }
    push('}', 'p3')
  }
  push('')
  push('/* theme.css — the names (Tailwind @theme) */', 'comment')
  push('@theme {')
  push('  --color-bg: var(--neutral-50);')
  push('  --color-fg: var(--neutral-950);')
  push('  --color-fg-muted: var(--neutral-600);')
  push('  --color-border: var(--neutral-300);')
  push('  --color-accent: var(--accent-500);')
  push('  --color-fg-on-accent: #ffffff;')
  if (states === 'steps') {
    push('  --color-accent-hover: var(--accent-600);', 'states')
    push('  --color-accent-active: var(--accent-700);', 'states')
  } else if (modes === 'class') {
    push(
      '  --color-accent-hover: color-mix(in oklab, var(--accent-500), black 8%);',
      'states',
    )
    push(
      '  --color-accent-active: color-mix(in oklab, var(--accent-500), black 16%);',
      'states',
    )
  } else {
    push(
      '  --color-accent-hover: color-mix(in oklab, var(--accent-500), light-dark(black, white) 8%);',
      'states',
    )
    push(
      '  --color-accent-active: color-mix(in oklab, var(--accent-500), light-dark(black, white) 16%);',
      'states',
    )
  }
  push('}')
  if (states === 'mix' && modes === 'class') {
    push('.dark {', 'mode')
    push('  /* the sign flips per mode — chapter 18 */', 'comment')
    push(
      '  --color-accent-hover: color-mix(in oklab, var(--accent-500), white 8%);',
      'states',
    )
    push(
      '  --color-accent-active: color-mix(in oklab, var(--accent-500), white 16%);',
      'states',
    )
    push('}', 'mode')
  }
  return lines
}

export function EmittedCssInspector() {
  const [states, setStates] = useState<States>('steps')
  const [modes, setModes] = useState<Modes>('class')
  const [p3, setP3] = useState(false)
  const [preview, setPreview] = useState<Mode>('light')
  const [p3Screen, setP3Screen] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(color-gamut: p3)')
    setP3Screen(mq.matches)
    const onChange = (e: MediaQueryListEvent) => setP3Screen(e.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  const lines = buildLines(states, modes, p3)
  const declarationCount = lines.filter((l) =>
    l.text.trimStart().startsWith('--'),
  ).length

  const n = NEUTRALS[preview]
  const restHex = formatHex(A500) ?? '#000000'
  const stateColors = states === 'steps' ? STEPS[preview] : MIX[preview]
  const hoverHex = formatHex(stateColors.hover) ?? '#000000'
  const activeHex = formatHex(stateColors.active) ?? '#000000'

  // On a P3 screen with the upgrade block on, the browser paints the wide literal.
  const upgraded = p3 && p3Screen
  const restPaint = upgraded ? A500_P3 : restHex
  const hoverPaint =
    upgraded && states === 'mix'
      ? formatCss(
          interpolate(
            [A500_P3, preview === 'light' ? '#000000' : '#ffffff'],
            'oklab',
          )(0.08),
        )
      : hoverHex
  const activePaint =
    upgraded && states === 'mix'
      ? formatCss(
          interpolate(
            [A500_P3, preview === 'light' ? '#000000' : '#ffffff'],
            'oklab',
          )(0.16),
        )
      : activeHex

  const restRatio = wcagContrast('#ffffff', restHex)
  const restLc = apcaLc('#ffffff', restHex)
  const hoverRatio = wcagContrast('#ffffff', hoverHex)
  const hoverShift = dEok(stateColors.hover, A500)

  const reset = () => {
    setStates('steps')
    setModes('class')
    setP3(false)
    setPreview('light')
  }

  return (
    <Playground
      question="Same theme, different shipping techniques — what CSS does the engine actually emit?"
      onReset={reset}
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs text-fg-muted">States</span>
            <ToggleButtonGroup
              selectionMode="single"
              disallowEmptySelection
              selectedKeys={[states]}
              onSelectionChange={(keys) => {
                const next = [...keys][0]
                if (next === 'steps' || next === 'mix') setStates(next)
              }}
              size="sm"
              aria-label="State strategy"
              className="max-w-full overflow-x-auto"
            >
              <ToggleButton id="steps">Pre-baked steps</ToggleButton>
              <ToggleButton id="mix">color-mix()</ToggleButton>
            </ToggleButtonGroup>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-fg-muted">Modes</span>
            <ToggleButtonGroup
              selectionMode="single"
              disallowEmptySelection
              selectedKeys={[modes]}
              onSelectionChange={(keys) => {
                const next = [...keys][0]
                if (next === 'class' || next === 'lightdark') setModes(next)
              }}
              size="sm"
              aria-label="Mode strategy"
              className="max-w-full overflow-x-auto"
            >
              <ToggleButton id="class">.dark block</ToggleButton>
              <ToggleButton id="lightdark">light-dark()</ToggleButton>
            </ToggleButtonGroup>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-fg-muted">P3 upgrade</span>
            <ToggleButtonGroup
              selectionMode="single"
              disallowEmptySelection
              selectedKeys={[p3 ? 'on' : 'off']}
              onSelectionChange={(keys) => {
                const next = [...keys][0]
                if (next === 'on' || next === 'off') setP3(next === 'on')
              }}
              size="sm"
              aria-label="P3 upgrade block"
              className="max-w-full overflow-x-auto"
            >
              <ToggleButton id="off">Off</ToggleButton>
              <ToggleButton id="on">On</ToggleButton>
            </ToggleButtonGroup>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-fg-muted">Preview</span>
            <ToggleButtonGroup
              selectionMode="single"
              disallowEmptySelection
              selectedKeys={[preview]}
              onSelectionChange={(keys) => {
                const next = [...keys][0]
                if (next === 'light' || next === 'dark') setPreview(next)
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

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,5fr)_minmax(0,4fr)]">
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap gap-x-3 gap-y-1">
              {(
                [
                  ['base', 'theme'],
                  ['states', 'states'],
                  ['mode', 'modes'],
                  ['p3', 'P3'],
                ] as const
              ).map(([src, label]) => (
                <span
                  key={src}
                  className="flex items-center gap-1.5 font-mono text-[0.6rem] text-fg-muted"
                >
                  <span
                    className="size-2 rounded-full"
                    style={{ backgroundColor: SRC_COLOR[src] }}
                  />
                  {label}
                </span>
              ))}
            </div>
            <pre
              className="max-h-96 overflow-auto rounded-lg p-4 font-mono text-[0.65rem] leading-relaxed"
              style={{ backgroundColor: '#0d1117' }}
            >
              {lines.map((line, i) => (
                // oxlint-disable-next-line no-array-index-key -- ordered CSS lines
                <div key={i} style={{ color: SRC_COLOR[line.src] }}>
                  {line.text || ' '}
                </div>
              ))}
            </pre>
          </div>

          <div className="flex flex-col gap-3">
            <div
              className="flex flex-col gap-3 rounded-lg border p-4"
              style={{ backgroundColor: n.bg, borderColor: n.border }}
            >
              <span className="text-sm font-medium" style={{ color: n.fg }}>
                The theme, resolved
              </span>
              <span className="text-xs" style={{ color: n.fgMuted }}>
                Every value below is read off the CSS at the left.
              </span>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: 'rest', paint: restPaint, hex: restHex },
                  { label: 'hover', paint: hoverPaint, hex: hoverHex },
                  { label: 'active', paint: activePaint, hex: activeHex },
                ].map((chip) => (
                  <div key={chip.label} className="flex flex-col gap-1">
                    <span
                      className="rounded-md px-4 py-2.5 text-center text-xs font-medium text-white"
                      style={{ backgroundColor: chip.paint }}
                    >
                      Button
                    </span>
                    <span
                      className="text-center font-mono text-[0.6rem] tabular-nums"
                      style={{ color: n.fgMuted }}
                    >
                      {chip.label} · {chip.hex}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div
              aria-live="polite"
              className="flex flex-col gap-1 font-mono text-[0.7rem] text-fg-muted tabular-nums"
            >
              <span>
                custom-property declarations emitted: {declarationCount}
              </span>
              <span>
                fg-on-accent on rest — {restRatio.toFixed(2)}:1 · Lc{' '}
                {restLc.toFixed(1)}
              </span>
              <span>
                fg-on-accent on hover — {hoverRatio.toFixed(2)}:1 · hover shift
                ΔEok {hoverShift.toFixed(3)} (JND 0.02)
              </span>
              <span>
                your screen: {p3Screen ? 'P3' : 'sRGB'}
                {p3 &&
                  (p3Screen
                    ? ' — the media block upgraded the rest chip'
                    : ' — the media block never fires here; you keep the sRGB base')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Playground>
  )
}
