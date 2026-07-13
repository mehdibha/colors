import { useState } from 'react'
import { converter, formatHex, parse, wcagContrast } from 'culori'

import { apcaLc } from '@/lib/apca'
import { cn } from '@/lib/utils'
import { Playground } from '@/components/playground'
import { Button } from '@/ui/button'
import { ToggleButton } from '@/ui/toggle-button'
import { ToggleButtonGroup } from '@/ui/toggle-button-group'

const toRgb = converter('rgb')
const toOklch = converter('oklch')

// radix-ui/colors light.ts / dark.ts, verified by name against the source.
const SCALES = {
  blue: {
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
    lightA: [
      '#0080ff04',
      '#008cff0b',
      '#008ff519',
      '#009eff2a',
      '#0093ff3d',
      '#0088f653',
      '#0083eb71',
      '#0084e6a1',
      '#0090ff',
      '#0086f0fa',
      '#006dcbf2',
      '#002359ee',
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
    darkA: [
      '#004df211',
      '#1166fb18',
      '#0077ff3a',
      '#0075ff57',
      '#0081fd6b',
      '#0f89fd7f',
      '#2a91fe98',
      '#3094feb9',
      '#0090ff',
      '#3b9eff',
      '#70b8ff',
      '#c2e6ff',
    ],
  },
  amber: {
    light: [
      '#fefdfb',
      '#fefbe9',
      '#fff7c2',
      '#ffee9c',
      '#fbe577',
      '#f3d673',
      '#e9c162',
      '#e2a336',
      '#ffc53d',
      '#ffba18',
      '#ab6400',
      '#4f3422',
    ],
    lightA: [
      '#c0800004',
      '#f4d10016',
      '#ffde003d',
      '#ffd40063',
      '#f8cf0088',
      '#eab5008c',
      '#dc9b009d',
      '#da8a00c9',
      '#ffb300c2',
      '#ffb300e7',
      '#ab6400',
      '#341500dd',
    ],
    dark: [
      '#16120c',
      '#1d180f',
      '#302008',
      '#3f2700',
      '#4d3000',
      '#5c3d05',
      '#714f19',
      '#8f6424',
      '#ffc53d',
      '#ffd60a',
      '#ffca16',
      '#ffe7b3',
    ],
    darkA: [
      '#e63c0006',
      '#fd9b000d',
      '#fa820022',
      '#fc820032',
      '#fd8b0041',
      '#fd9b0051',
      '#ffab2567',
      '#ffae3587',
      '#ffc53d',
      '#ffd60a',
      '#ffca16',
      '#ffe7b3',
    ],
  },
  slate: {
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
    lightA: [
      '#00005503',
      '#00005506',
      '#0000330f',
      '#00002d17',
      '#0009321f',
      '#00002f26',
      '#00062e32',
      '#00083046',
      '#00051d74',
      '#00071b7f',
      '#0007149f',
      '#000509e3',
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
    darkA: [
      '#00000000',
      '#d8f4f609',
      '#ddeaf814',
      '#d3edf81d',
      '#d9edfe25',
      '#d6ebfd30',
      '#d9edff40',
      '#d9edff5d',
      '#dfebfd6d',
      '#e5edfd7b',
      '#f1f7feb5',
      '#fcfdffef',
    ],
  },
  red: {
    light: [
      '#fffcfc',
      '#fff7f7',
      '#feebec',
      '#ffdbdc',
      '#ffcdce',
      '#fdbdbe',
      '#f4a9aa',
      '#eb8e90',
      '#e5484d',
      '#dc3e42',
      '#ce2c31',
      '#641723',
    ],
    lightA: [
      '#ff000003',
      '#ff000008',
      '#f3000d14',
      '#ff000824',
      '#ff000632',
      '#f8000442',
      '#df000356',
      '#d2000571',
      '#db0007b7',
      '#d10005c1',
      '#c40006d3',
      '#55000de8',
    ],
    dark: [
      '#191111',
      '#201314',
      '#3b1219',
      '#500f1c',
      '#611623',
      '#72232d',
      '#8c333a',
      '#b54548',
      '#e5484d',
      '#ec5d5e',
      '#ff9592',
      '#ffd1d9',
    ],
    darkA: [
      '#f4121209',
      '#f22f3e11',
      '#ff173f2d',
      '#fe0a3b44',
      '#ff204756',
      '#ff3e5668',
      '#ff536184',
      '#ff5d61b0',
      '#fe4e54e4',
      '#ff6465eb',
      '#ff9592',
      '#ffd1d9',
    ],
  },
} as const

type ScaleName = keyof typeof SCALES
type Mode = 'light' | 'dark'

const SCALE_NAMES: ScaleName[] = ['blue', 'amber', 'slate', 'red']

const JOBS = [
  'App background',
  'Subtle background',
  'UI element background',
  'Hovered UI element background',
  'Active / Selected UI element background',
  'Subtle borders and separators',
  'UI element border and focus rings',
  'Hovered UI element border',
  'Solid backgrounds',
  'Hovered solid backgrounds',
  'Low-contrast text',
  'High-contrast text',
]

// Radix Themes' default dark page is gray dark 1.
const PAGE = { light: '#ffffff', dark: '#111111' }

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

function dEok(a: string, b: string): number {
  const oa = toOklch(parse(a))
  const ob = toOklch(parse(b))
  if (!oa || !ob) return 0
  const rad = Math.PI / 180
  const ax = (oa.c ?? 0) * Math.cos((oa.h ?? 0) * rad)
  const ay = (oa.c ?? 0) * Math.sin((oa.h ?? 0) * rad)
  const bx = (ob.c ?? 0) * Math.cos((ob.h ?? 0) * rad)
  const by = (ob.c ?? 0) * Math.sin((ob.h ?? 0) * rad)
  return Math.hypot(oa.l - ob.l, ax - bx, ay - by)
}

function Badge({ ok, children }: { ok: boolean; children: React.ReactNode }) {
  return (
    <span
      className={cn(
        'rounded-sm px-1.5 py-0.5 font-mono text-[0.6rem] font-medium',
        ok
          ? 'bg-[#e6f7ed] text-[#208368] dark:bg-[#113b29] dark:text-[#1fd8a4]'
          : 'bg-[#feebec] text-[#ce2c31] dark:bg-[#500f1c] dark:text-[#ff9592]',
      )}
    >
      {children}
    </span>
  )
}

export function RadixScaleExplorer() {
  const [scale, setScale] = useState<ScaleName>('blue')
  const [mode, setMode] = useState<Mode>('light')
  const [step, setStep] = useState(11)

  const data = SCALES[scale]
  const solids = mode === 'light' ? data.light : data.dark
  const alphas = mode === 'light' ? data.lightA : data.darkA
  const s = (n: number) => solids[n - 1] ?? '#000000'
  const a = (n: number) => alphas[n - 1] ?? '#00000000'
  const hex = s(step)
  const alphaHex = a(step)
  const ok = toOklch(parse(hex))

  const page = PAGE[mode]
  const overPage = compositeOver(alphaHex, page)
  const overBlack = compositeOver(alphaHex, '#000000')
  const pageExact = overPage === hex.toLowerCase()
  const dPage = dEok(overPage, hex)
  const dBlack = dEok(overBlack, hex)

  const contract = (() => {
    if (step === 2) {
      const r11 = wcagContrast(s(11), s(2))
      const lc11 = Math.abs(apcaLc(s(11), s(2)))
      const r12 = wcagContrast(s(12), s(2))
      const lc12 = Math.abs(apcaLc(s(12), s(2)))
      return (
        <div className="flex flex-col gap-1.5">
          <p className="text-xs text-fg-muted">
            The background the 11/12 guarantee names. Both text steps, measured
            on it right now:
          </p>
          <div className="flex flex-wrap items-center gap-2 font-mono text-[0.65rem] text-fg-muted tabular-nums">
            <span>
              11-on-2 Lc {lc11.toFixed(1)} / {r11.toFixed(2)}:1
            </span>
            <Badge ok={lc11 >= 60}>{lc11 >= 60 ? '≥ Lc 60' : '< Lc 60'}</Badge>
            <span>
              12-on-2 Lc {lc12.toFixed(1)} / {r12.toFixed(2)}:1
            </span>
            <Badge ok={lc12 >= 90}>{lc12 >= 90 ? '≥ Lc 90' : '< Lc 90'}</Badge>
          </div>
        </div>
      )
    }
    if (step >= 3 && step <= 5) {
      const dl = (n: number) =>
        (toOklch(parse(s(n)))?.l ?? 0) - (toOklch(parse(s(n - 1)))?.l ?? 0)
      return (
        <div className="flex flex-col gap-2">
          <p className="text-xs text-fg-muted">
            One component, three states — the contract is relational, not
            numeric: each step must read as the same surface, one notch further
            in.
          </p>
          <div className="flex flex-wrap items-center gap-2">
            {(['rest 3', 'hover 4', 'active 5'] as const).map((label, i) => (
              <span
                key={label}
                className="rounded-md px-3 py-1.5 text-xs font-medium"
                style={{ backgroundColor: s(3 + i), color: s(12) }}
              >
                {label}
              </span>
            ))}
            <span className="font-mono text-[0.65rem] text-fg-muted tabular-nums">
              ΔL {dl(4).toFixed(3)} / {dl(5).toFixed(3)}
            </span>
          </div>
        </div>
      )
    }
    if (step >= 6 && step <= 8) {
      const r1 = wcagContrast(hex, s(1))
      return (
        <div className="flex flex-col gap-2">
          <p className="text-xs text-fg-muted">
            Border duty. Radix promises nothing numeric here — measured against
            the app background it&rsquo;s {r1.toFixed(2)}:1
            {r1 < 3 &&
              ' (under 1.4.11’s 3:1 — legal only while the border isn’t the control’s sole identity)'}
            .
          </p>
          <div
            className="w-40 rounded-md border-2 px-3 py-1.5 text-xs"
            style={{ backgroundColor: s(1), borderColor: hex, color: s(11) }}
          >
            input field
          </div>
        </div>
      )
    }
    if (step === 9 || step === 10) {
      const rw = wcagContrast('#ffffff', hex)
      const rb = wcagContrast('#000000', hex)
      const lcw = Math.abs(apcaLc('#ffffff', hex))
      const lcb = Math.abs(apcaLc('#000000', hex))
      const l9 = toOklch(parse(s(9)))?.l ?? 0
      const l10 = toOklch(parse(s(10)))?.l ?? 0
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
              white {rw.toFixed(2)}:1 / Lc {lcw.toFixed(1)} · black{' '}
              {rb.toFixed(2)}:1 / Lc {lcb.toFixed(1)}
            </span>
          </div>
          <p className="text-xs text-fg-muted">
            {step === 9
              ? 'The solid. The label side is per hue — amber is on Radix’s documented dark-text list, blue isn’t — and no meter agrees for free.'
              : `The hover twin: ΔL ${l10 - l9 >= 0 ? '+' : ''}${(l10 - l9).toFixed(3)} from step 9 — ${l10 < l9 ? 'darker' : 'lighter'} in ${mode} mode. The sign was designed per mode, not computed.`}
          </p>
        </div>
      )
    }
    if (step === 11 || step === 12) {
      const bar = step === 11 ? 60 : 90
      const r = wcagContrast(hex, s(2))
      const lc = Math.abs(apcaLc(hex, s(2)))
      return (
        <div className="flex flex-col gap-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className="rounded-md px-3 py-1.5 text-xs font-medium"
              style={{ backgroundColor: s(2), color: hex }}
            >
              text on step 2
            </span>
            <span className="font-mono text-[0.65rem] text-fg-muted tabular-nums">
              Lc {lc.toFixed(1)} / {r.toFixed(2)}:1
            </span>
            <Badge ok={lc >= bar}>
              {lc >= bar ? `≥ Lc ${bar}` : `< Lc ${bar}`}
            </Badge>
            {step === 11 && (
              <Badge ok={r >= 4.5}>
                {r >= 4.5 ? '≥ 4.5:1' : '< 4.5:1 (unpromised)'}
              </Badge>
            )}
          </div>
          <p className="text-xs text-fg-muted">
            The documented guarantee: Lc {bar} on a step 2 background. The WCAG
            number rides along unpromised — the guarantee named its meter.
          </p>
        </div>
      )
    }
    const r12 = wcagContrast(s(12), s(1))
    return (
      <p className="text-xs text-fg-muted">
        The page itself — every other step&rsquo;s contract is judged against it
        or its neighbors. High-contrast text on it:{' '}
        <span className="font-mono tabular-nums">{r12.toFixed(2)}:1</span>.
      </p>
    )
  })()

  return (
    <Playground
      question="Pick any step of a real Radix scale — what job does it hold, and does the documented contract verify?"
      onReset={() => {
        setScale('blue')
        setMode('light')
        setStep(11)
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
                className="size-3 rounded-full"
                style={{ backgroundColor: SCALES[name].light[8] }}
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
          className="flex gap-1 rounded-lg border p-3"
          style={{ backgroundColor: s(1), borderColor: s(6) }}
        >
          {solids.map((c, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setStep(i + 1)}
              aria-label={`Step ${i + 1}: ${JOBS[i] ?? ''}`}
              aria-pressed={step === i + 1}
              className={cn(
                'h-10 min-w-0 flex-1 rounded-md border transition-transform',
                step === i + 1 && 'scale-y-125 ring-2 ring-fg/60',
              )}
              style={{ backgroundColor: c, borderColor: s(7) }}
            />
          ))}
        </div>

        <div className="flex flex-col gap-3 rounded-lg border p-4">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="text-sm font-medium">
              Step {step} — {JOBS[step - 1] ?? ''}
            </span>
            <span className="font-mono text-[0.65rem] text-fg-muted tabular-nums">
              {hex} · L {(ok?.l ?? 0).toFixed(3)} C {(ok?.c ?? 0).toFixed(3)}
            </span>
          </div>
          <div aria-live="polite">{contract}</div>
        </div>

        <div className="flex flex-col gap-2 rounded-lg border p-4">
          <span className="text-sm font-medium">
            The alpha twin{' '}
            <span className="font-mono text-[0.65rem] font-normal text-fg-muted">
              {alphaHex}
            </span>
          </span>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            <div className="flex flex-col gap-1">
              <div
                className="h-9 rounded-md border"
                style={{ backgroundColor: hex }}
              />
              <span className="text-[0.65rem] text-fg-muted">solid</span>
            </div>
            <div className="flex flex-col gap-1">
              <div
                className="h-9 rounded-md border"
                style={{ backgroundColor: page }}
              >
                <div
                  className="h-full w-full rounded-md"
                  style={{ backgroundColor: alphaHex }}
                />
              </div>
              <span className="text-[0.65rem] text-fg-muted">
                alpha over the {mode} page ({page})
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <div className="h-9 rounded-md border bg-black">
                <div
                  className="h-full w-full rounded-md"
                  style={{ backgroundColor: alphaHex }}
                />
              </div>
              <span className="text-[0.65rem] text-fg-muted">
                alpha over black
              </span>
            </div>
          </div>
          <p
            aria-live="polite"
            className="font-mono text-[0.65rem] text-fg-muted tabular-nums"
          >
            over page → {overPage}{' '}
            {pageExact ? '= solid EXACT' : `ΔEok ${dPage.toFixed(4)}`} · over
            black → {overBlack} ΔEok {dBlack.toFixed(4)}
          </p>
        </div>
      </div>
    </Playground>
  )
}
