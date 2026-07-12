import { useState } from 'react'
import { converter, parse, wcagContrast } from 'culori'

import { apcaLc } from '@/lib/apca'
import { cn } from '@/lib/utils'
import { Playground } from '@/components/playground'
import { Button } from '@/ui/button'
import { ToggleButton } from '@/ui/toggle-button'
import { ToggleButtonGroup } from '@/ui/toggle-button-group'

import {
  GEIST_BACKGROUNDS,
  GEIST_ROLES,
  GEIST_SCALES,
  type GeistMode,
  type GeistScaleName,
} from './geist-palette'
import { grayAt, makeScale, solveWcag } from './leonardo-mini'

const toOklch = converter('oklch')

type ScaleName = Exclude<GeistScaleName, 'grayAlpha'>
const SCALE_NAMES: ScaleName[] = [
  'gray',
  'blue',
  'red',
  'amber',
  'green',
  'teal',
  'purple',
  'pink',
]

const QUESTION =
  'Ten steps whose numbers are jobs — what did Geist hand-pick, and how does the same card read under all five greats?'

function okL(color: string): number {
  return toOklch(parse(color))?.l ?? 0
}

interface CardColors {
  page: string
  surface: string
  border: string
  heading: string
  body: string
  button: string
  buttonLabel: string
  link: string
}

interface CardTheme {
  id: string
  name: string
  source: string
  light: CardColors
  dark: CardColors
}

// Leonardo column: gray steps solved live by the ch24 mini-solver; blue steps
// are the embedded @adobe/leonardo-contrast-colors v1.1.0 outputs.
const leoGrays = makeScale(['#808080'])
const leoLightBg = grayAt(98)
const leoDarkBg = grayAt(11)
const leo = (bg: string, target: number) => solveWcag(leoGrays, bg, target).hex

const GEIST_THEME: CardTheme = {
  id: 'geist',
  name: 'Geist',
  source: 'vercel.com/design.md export, fetched 2026-07-12',
  light: {
    page: '#fafafa',
    surface: '#ffffff',
    border: '#eaeaea',
    heading: '#171717',
    body: '#4d4d4d',
    button: '#171717',
    buttonLabel: '#ffffff',
    link: '#006bff',
  },
  dark: {
    page: '#000000',
    surface: '#000000',
    border: '#2e2e2e',
    heading: '#ededed',
    body: '#a0a0a0',
    button: '#ededed',
    buttonLabel: '#000000',
    link: '#47a8ff',
  },
}

const CARD_THEMES: CardTheme[] = [
  GEIST_THEME,
  {
    id: 'radix',
    name: 'Radix',
    // slate + blue, verified by name against radix-ui/colors light.ts / dark.ts.
    source: 'radix-ui/colors slate + blue, steps 1/2/6/11/12 + solids',
    light: {
      page: '#fcfcfd',
      surface: '#f9f9fb',
      border: '#d9d9e0',
      heading: '#1c2024',
      body: '#60646c',
      button: '#0090ff',
      buttonLabel: '#ffffff',
      link: '#0d74ce',
    },
    dark: {
      page: '#111113',
      surface: '#18191b',
      border: '#363a3f',
      heading: '#edeef0',
      body: '#b0b4ba',
      button: '#0090ff',
      buttonLabel: '#ffffff',
      link: '#70b8ff',
    },
  },
  {
    id: 'tailwind',
    name: 'Tailwind',
    source:
      'theme.css v4.3.2 literals, the docs’ conventional picks — real wide-gamut oklch (two dark values sit outside sRGB, per ch22), measured unclamped',
    light: {
      page: '#ffffff',
      surface: 'oklch(98.5% 0.002 247.839)',
      border: 'oklch(92.8% 0.006 264.531)',
      heading: 'oklch(21% 0.034 264.665)',
      body: 'oklch(55.1% 0.027 264.364)',
      button: 'oklch(54.6% 0.245 262.881)',
      buttonLabel: '#ffffff',
      link: 'oklch(54.6% 0.245 262.881)',
    },
    dark: {
      page: 'oklch(13% 0.028 261.692)',
      surface: 'oklch(21% 0.034 264.665)',
      border: 'oklch(27.8% 0.033 256.848)',
      heading: '#ffffff',
      body: 'oklch(70.7% 0.022 261.325)',
      button: 'oklch(62.3% 0.214 259.815)',
      buttonLabel: '#ffffff',
      link: 'oklch(70.7% 0.165 254.624)',
    },
  },
  {
    id: 'material',
    name: 'Material',
    source: 'material-color-utilities Scheme for the baseline seed #6750a4',
    light: {
      page: '#fffbff',
      surface: '#fffbff',
      border: '#7a757f',
      heading: '#1c1b1e',
      body: '#49454e',
      button: '#6750a4',
      buttonLabel: '#ffffff',
      link: '#6750a4',
    },
    dark: {
      page: '#1c1b1e',
      surface: '#1c1b1e',
      border: '#948f99',
      heading: '#e6e1e6',
      body: '#cac4cf',
      button: '#cfbcff',
      buttonLabel: '#381e72',
      link: '#cfbcff',
    },
  },
  {
    id: 'leonardo',
    name: 'Leonardo',
    source: 'ch24 mini-solver grays + embedded v1.1.0 blues, bg L* 98 / 11',
    light: {
      page: leoLightBg,
      surface: leoLightBg,
      border: leo(leoLightBg, 2),
      heading: leo(leoLightBg, 12),
      body: leo(leoLightBg, 4.5),
      button: '#2a64ff',
      buttonLabel: '#ffffff',
      link: '#0205ff',
    },
    dark: {
      page: leoDarkBg,
      surface: leoDarkBg,
      border: leo(leoDarkBg, 2),
      heading: leo(leoDarkBg, 12),
      body: leo(leoDarkBg, 4.5),
      button: '#357eff',
      buttonLabel: '#ffffff',
      link: '#4fbcff',
    },
  },
]

function Meter({ fg, bg }: { fg: string; bg: string }) {
  const ratio = wcagContrast(fg, bg)
  const lc = Math.abs(apcaLc(fg, bg))
  return (
    <span className="font-mono text-[0.65rem] text-fg-muted tabular-nums">
      {ratio.toFixed(2)}:1 / Lc {lc.toFixed(1)}
    </span>
  )
}

export function GeistExplorer() {
  const [scale, setScale] = useState<ScaleName>('blue')
  const [mode, setMode] = useState<GeistMode>('light')
  const [step, setStep] = useState(7)
  const [system, setSystem] = useState('geist')

  const steps = GEIST_SCALES[scale][mode]
  const grays = GEIST_SCALES.gray[mode]
  const [bg100, bg200] = GEIST_BACKGROUNDS[mode]
  const s = (n: number) => steps[n - 1] ?? '#000000'
  const g = (n: number) => grays[n - 1] ?? '#000000'
  const hex = s(step)
  const ok = toOklch(parse(hex))

  const contract = (() => {
    if (step <= 3) {
      return (
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            {(['rest 100', 'hover 200', 'active 300'] as const).map(
              (label, i) => (
                <span
                  key={label}
                  className="rounded-md px-3 py-1.5 text-xs font-medium"
                  style={{ backgroundColor: s(1 + i), color: g(10) }}
                >
                  {label}
                </span>
              ),
            )}
            <span className="font-mono text-[0.65rem] text-fg-muted tabular-nums">
              ΔL {(okL(s(2)) - okL(s(1))).toFixed(3)} /{' '}
              {(okL(s(3)) - okL(s(2))).toFixed(3)}
            </span>
          </div>
          <p className="text-xs text-fg-muted">
            The component-background trio — the state walk is baked into the
            first three numbers, exactly chapter 18&rsquo;s walk-the-ramp
            strategy.
          </p>
        </div>
      )
    }
    if (step <= 6) {
      const r = wcagContrast(hex, bg100)
      const wobble = okL(s(4)) > okL(s(3)) && step === 4
      return (
        <div className="flex flex-col gap-2">
          <div
            className="w-44 rounded-md border-2 px-3 py-1.5 text-xs"
            style={{ backgroundColor: bg100, borderColor: hex, color: g(9) }}
          >
            input field
          </div>
          <p className="text-xs text-fg-muted">
            Border duty, measured against Background 1:{' '}
            <span className="font-mono tabular-nums">{r.toFixed(2)}:1</span>
            {r < 3 &&
              ' — under 1.4.11’s 3:1, legal only while the border isn’t the control’s sole identity'}
            .{' '}
            {wobble &&
              'And the wobble: this default border is lighter than the active background one step below it.'}
          </p>
        </div>
      )
    }
    if (step <= 8) {
      const dl = okL(s(8)) - okL(s(7))
      return (
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            {(['#ffffff', '#000000'] as const).map((fg) => (
              <span
                key={fg}
                className="rounded-md px-3 py-1.5 text-xs font-medium"
                style={{ backgroundColor: hex, color: fg }}
              >
                Button
              </span>
            ))}
            <span className="font-mono text-[0.65rem] text-fg-muted tabular-nums">
              white {wcagContrast('#ffffff', hex).toFixed(2)}:1 / Lc{' '}
              {Math.abs(apcaLc('#ffffff', hex)).toFixed(1)} · black{' '}
              {wcagContrast('#000000', hex).toFixed(2)}:1 / Lc{' '}
              {Math.abs(apcaLc('#000000', hex)).toFixed(1)}
            </span>
          </div>
          <p className="text-xs text-fg-muted">
            {step === 7
              ? 'The solid. The winning label side is per hue — amber and the mid-lightness greens want dark text (chapter 10).'
              : `The hover solid: ΔL ${dl >= 0 ? '+' : ''}${dl.toFixed(3)} from step 700 in ${mode} mode — Geist’s hover darkens in both modes; Radix flips the sign per mode (chapter 16).`}
          </p>
        </div>
      )
    }
    const bar = step === 9 ? 'Secondary' : 'Primary'
    const lcOn1 = apcaLc(hex, bg100)
    return (
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-3">
          <span
            className="rounded-md border px-3 py-1.5 text-xs font-medium"
            style={{ backgroundColor: bg100, color: hex, borderColor: g(4) }}
          >
            {bar} text on Background 1
          </span>
          <Meter fg={hex} bg={bg100} />
          <span
            className="rounded-md px-3 py-1.5 text-xs font-medium"
            style={{ backgroundColor: s(3), color: hex }}
          >
            on its own 300
          </span>
          <Meter fg={hex} bg={s(3)} />
        </div>
        <p className="text-xs text-fg-muted">
          {step === 9 && mode === 'dark' && scale === 'gray'
            ? `Chapter 8’s dark-mode wrinkle, shipped: this pair rates ${wcagContrast(hex, bg100).toFixed(2)}:1 under WCAG but only Lc ${Math.abs(lcOn1).toFixed(1)} under APCA — the flare term over-credits dark pairs, and Geist’s guarantee (“Hold WCAG AA”) names one meter.`
            : 'The text pair. Geist writes one contrast sentence for the whole system: “Hold WCAG AA contrast (4.5:1 for body text).”'}
        </p>
      </div>
    )
  })()

  const theme = CARD_THEMES.find((t) => t.id === system) ?? GEIST_THEME
  const card = theme[mode]

  return (
    <Playground
      question={QUESTION}
      onReset={() => {
        setScale('blue')
        setMode('light')
        setStep(7)
        setSystem('geist')
      }}
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {SCALE_NAMES.map((name) => (
            <Button
              key={name}
              size="sm"
              variant={name === scale ? 'primary' : 'default'}
              aria-pressed={name === scale}
              onPress={() => setScale(name)}
            >
              <span
                className="size-3 rounded-full border"
                style={{ backgroundColor: GEIST_SCALES[name].light[6] }}
                aria-hidden
              />
              {name}
            </Button>
          ))}
          <ToggleButtonGroup
            selectionMode="single"
            disallowEmptySelection
            selectedKeys={[mode]}
            onSelectionChange={(keys) => {
              const next = [...keys][0]
              if (next === 'light' || next === 'dark') setMode(next)
            }}
            size="sm"
            aria-label="Mode"
            className="ml-auto max-w-full overflow-x-auto"
          >
            <ToggleButton id="light">Light</ToggleButton>
            <ToggleButton id="dark">Dark</ToggleButton>
          </ToggleButtonGroup>
        </div>

        <div
          className="flex flex-col gap-2 rounded-lg border p-3"
          style={{ backgroundColor: bg100, borderColor: g(4) }}
        >
          <div className="flex items-center gap-2">
            <span className="font-mono text-[0.6rem]" style={{ color: g(9) }}>
              backgrounds
            </span>
            {[bg100, bg200].map((b, i) => (
              <span
                key={i}
                className="h-5 w-10 rounded-sm border"
                style={{ backgroundColor: b, borderColor: g(4) }}
                title={`background-${(i + 1) * 100}: ${b}`}
              />
            ))}
            {mode === 'dark' && (
              <span className="font-mono text-[0.6rem]" style={{ color: g(9) }}>
                both #000000 in dark
              </span>
            )}
          </div>
          <div className="flex gap-1">
            {steps.map((c, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setStep(i + 1)}
                aria-label={`Step ${(i + 1) * 100}: ${GEIST_ROLES[i] ?? ''}`}
                aria-pressed={step === i + 1}
                className={cn(
                  'h-10 min-w-0 flex-1 rounded-md border transition-transform',
                  step === i + 1 && 'scale-y-125 ring-2 ring-fg/60',
                )}
                style={{ backgroundColor: c, borderColor: g(5) }}
              />
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3 rounded-lg border p-4">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="text-sm font-medium">
              {scale}-{step * 100} — {GEIST_ROLES[step - 1] ?? ''}
            </span>
            <span className="font-mono text-[0.65rem] text-fg-muted tabular-nums">
              {hex} · L {(ok?.l ?? 0).toFixed(3)} C {(ok?.c ?? 0).toFixed(3)}
            </span>
          </div>
          <div aria-live="polite">{contract}</div>
        </div>

        <div className="flex flex-col gap-3 rounded-lg border p-4">
          <span className="text-sm font-medium">
            The same card, five systems
          </span>
          <div className="flex flex-wrap items-center gap-2">
            {CARD_THEMES.map((t) => (
              <Button
                key={t.id}
                size="sm"
                variant={t.id === system ? 'primary' : 'default'}
                aria-pressed={t.id === system}
                onPress={() => setSystem(t.id)}
              >
                {t.name}
              </Button>
            ))}
          </div>
          <div
            className="rounded-lg p-5"
            style={{ backgroundColor: card.page }}
          >
            <div
              className="mx-auto flex max-w-sm flex-col gap-2 rounded-lg border p-4"
              style={{
                backgroundColor: card.surface,
                borderColor: card.border,
              }}
            >
              <span
                className="text-sm font-semibold"
                style={{ color: card.heading }}
              >
                Production deployment
              </span>
              <span className="text-xs" style={{ color: card.body }}>
                Built in 42s. 128 static pages, 6 functions —{' '}
                <span style={{ color: card.link }} className="underline">
                  view build logs
                </span>
                .
              </span>
              <span
                className="mt-2 w-fit rounded-md px-3 py-1.5 text-xs font-medium"
                style={{
                  backgroundColor: card.button,
                  color: card.buttonLabel,
                }}
              >
                Promote to Production
              </span>
            </div>
          </div>
          <div
            aria-live="polite"
            className="flex flex-col gap-1 font-mono text-[0.65rem] text-fg-muted tabular-nums"
          >
            <span>
              body on surface <Meter fg={card.body} bg={card.surface} /> ·
              button label <Meter fg={card.buttonLabel} bg={card.button} /> ·
              link on surface <Meter fg={card.link} bg={card.surface} />
            </span>
            <span>{theme.source}</span>
          </div>
        </div>
      </div>
    </Playground>
  )
}
