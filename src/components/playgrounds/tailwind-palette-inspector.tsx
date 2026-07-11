import { useState } from 'react'
import { converter, formatHex, inGamut, wcagContrast } from 'culori'

import { apcaLc } from '@/lib/apca'
import { cn } from '@/lib/utils'
import { Playground } from '@/components/playground'
import { ToggleButton } from '@/ui/toggle-button'
import { ToggleButtonGroup } from '@/ui/toggle-button-group'

const toOklch = converter('oklch')
const inSrgb = inGamut('rgb')

const STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950]

// Tailwind CSS v4 default theme, verbatim oklch() from packages/tailwindcss/theme.css.
const RAMPS = {
  blue: [
    'oklch(97% 0.014 254.604)',
    'oklch(93.2% 0.032 255.585)',
    'oklch(88.2% 0.059 254.128)',
    'oklch(80.9% 0.105 251.813)',
    'oklch(70.7% 0.165 254.624)',
    'oklch(62.3% 0.214 259.815)',
    'oklch(54.6% 0.245 262.881)',
    'oklch(48.8% 0.243 264.376)',
    'oklch(42.4% 0.199 265.638)',
    'oklch(37.9% 0.146 265.522)',
    'oklch(28.2% 0.091 267.935)',
  ],
  red: [
    'oklch(97.1% 0.013 17.38)',
    'oklch(93.6% 0.032 17.717)',
    'oklch(88.5% 0.062 18.334)',
    'oklch(80.8% 0.114 19.571)',
    'oklch(70.4% 0.191 22.216)',
    'oklch(63.7% 0.237 25.331)',
    'oklch(57.7% 0.245 27.325)',
    'oklch(50.5% 0.213 27.518)',
    'oklch(44.4% 0.177 26.899)',
    'oklch(39.6% 0.141 25.723)',
    'oklch(25.8% 0.092 26.042)',
  ],
  amber: [
    'oklch(98.7% 0.022 95.277)',
    'oklch(96.2% 0.059 95.617)',
    'oklch(92.4% 0.12 95.746)',
    'oklch(87.9% 0.169 91.605)',
    'oklch(82.8% 0.189 84.429)',
    'oklch(76.9% 0.188 70.08)',
    'oklch(66.6% 0.179 58.318)',
    'oklch(55.5% 0.163 48.998)',
    'oklch(47.3% 0.137 46.201)',
    'oklch(41.4% 0.112 45.904)',
    'oklch(27.9% 0.077 45.635)',
  ],
  slate: [
    'oklch(98.4% 0.003 247.858)',
    'oklch(96.8% 0.007 247.896)',
    'oklch(92.9% 0.013 255.508)',
    'oklch(86.9% 0.022 252.894)',
    'oklch(70.4% 0.04 256.788)',
    'oklch(55.4% 0.046 257.417)',
    'oklch(44.6% 0.043 257.281)',
    'oklch(37.2% 0.044 257.287)',
    'oklch(27.9% 0.041 260.031)',
    'oklch(20.8% 0.042 265.755)',
    'oklch(12.9% 0.042 264.695)',
  ],
} as const

type Family = keyof typeof RAMPS
const FAMILY_LABELS: Record<Family, string> = {
  blue: 'Blue',
  red: 'Red',
  amber: 'Amber',
  slate: 'Slate',
}

const hexOf = (s: string) => formatHex(s) ?? '#000000'

export function TailwindPaletteInspector() {
  const [family, setFamily] = useState<Family>('blue')
  const [bgIdx, setBgIdx] = useState(5)
  const [textSel, setTextSel] = useState<string>('white')

  const ramp = RAMPS[family]
  const bgStr = ramp[bgIdx] ?? ramp[5] ?? '#000000'
  const bg = hexOf(bgStr)
  const fg =
    textSel === 'white'
      ? '#ffffff'
      : textSel === 'black'
        ? '#000000'
        : hexOf(ramp[Number(textSel)] ?? bgStr)

  const w = wcagContrast(fg, bg)
  const lc = apcaLc(fg, bg)
  const passW = w >= 4.5
  const passA = Math.abs(lc) >= 60

  const oklch = toOklch(bgStr)
  const bgSrgb = inSrgb(bgStr)

  const bgClass = `bg-${family}-${STEPS[bgIdx]}`
  const textClass =
    textSel === 'white'
      ? 'text-white'
      : textSel === 'black'
        ? 'text-black'
        : `text-${family}-${STEPS[Number(textSel)]}`

  const verdict =
    passW && passA
      ? 'Both meters clear — a safe pair, by luck not by promise.'
      : !passW && !passA
        ? 'Both meters fail — unreadable, and Tailwind shipped it without a word.'
        : `The meters split: WCAG ${passW ? 'passes' : 'fails'} at ${w.toFixed(2)}:1, APCA ${passA ? 'passes' : 'fails'} at Lc ${lc.toFixed(1)}.`

  return (
    <Playground
      question="Pick any two Tailwind steps for text and background — what stops you shipping a pair no one can read?"
      onReset={() => {
        setFamily('blue')
        setBgIdx(5)
        setTextSel('white')
      }}
    >
      <div className="flex flex-col gap-5">
        <div className="flex items-center gap-2">
          <span className="text-xs text-fg-muted">family</span>
          <ToggleButtonGroup
            selectionMode="single"
            disallowEmptySelection
            selectedKeys={[family]}
            onSelectionChange={(keys) => {
              const next = [...keys][0]
              if (typeof next === 'string' && next in RAMPS)
                setFamily(next as Family)
            }}
            size="sm"
            aria-label="Color family"
            className="max-w-full overflow-x-auto"
          >
            {(Object.keys(RAMPS) as Family[]).map((k) => (
              <ToggleButton key={k} id={k}>
                {FAMILY_LABELS[k]}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="text-xs text-fg-muted">background step</span>
          <div className="flex gap-1">
            {ramp.map((s, i) => (
              <button
                key={i}
                type="button"
                aria-label={`background ${family}-${STEPS[i]}`}
                aria-pressed={i === bgIdx}
                onClick={() => setBgIdx(i)}
                className="flex min-w-0 flex-1 flex-col items-center gap-1"
              >
                <span
                  className={cn(
                    'h-8 w-full rounded-md border',
                    i === bgIdx && 'outline-2 outline-offset-2 outline-fg/70',
                  )}
                  style={{ backgroundColor: hexOf(s) }}
                />
                <span className="font-mono text-[0.55rem] text-fg-muted tabular-nums">
                  {STEPS[i]}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="text-xs text-fg-muted">text color</span>
          <div className="flex gap-1">
            {ramp.map((s, i) => (
              <button
                key={i}
                type="button"
                aria-label={`text ${family}-${STEPS[i]}`}
                aria-pressed={textSel === String(i)}
                onClick={() => setTextSel(String(i))}
                className="flex min-w-0 flex-1 flex-col items-center gap-1"
              >
                <span
                  className={cn(
                    'h-8 w-full rounded-md border',
                    textSel === String(i) &&
                      'outline-2 outline-offset-2 outline-fg/70',
                  )}
                  style={{ backgroundColor: hexOf(s) }}
                />
                <span className="font-mono text-[0.55rem] text-fg-muted tabular-nums">
                  {STEPS[i]}
                </span>
              </button>
            ))}
            {(['white', 'black'] as const).map((k) => (
              <button
                key={k}
                type="button"
                aria-label={`text ${k}`}
                aria-pressed={textSel === k}
                onClick={() => setTextSel(k)}
                className="flex min-w-0 flex-1 flex-col items-center gap-1"
              >
                <span
                  className={cn(
                    'h-8 w-full rounded-md border',
                    textSel === k && 'outline-2 outline-offset-2 outline-fg/70',
                  )}
                  style={{ backgroundColor: k }}
                />
                <span className="font-mono text-[0.55rem] text-fg-muted tabular-nums">
                  {k === 'white' ? 'wht' : 'blk'}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-4 lg:flex-row">
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <div
              className="flex flex-col gap-2 rounded-lg border p-5"
              style={{ backgroundColor: bg }}
            >
              <span className="text-sm font-medium" style={{ color: fg }}>
                The quick brown fox
              </span>
              <span className="text-xs" style={{ color: fg }}>
                jumps over the lazy dog — can you read this line?
              </span>
            </div>
            <span className="font-mono text-[0.65rem] text-fg-muted tabular-nums">
              {`<p class="${textClass} ${bgClass}">`}
            </span>
          </div>

          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <span className="text-xs text-fg-muted">
              Pairing meters — WCAG ≥ 4.5 floor · |Lc| ≥ 60 target
            </span>
            <div
              aria-live="polite"
              className="flex flex-col gap-1.5 rounded-md bg-muted/50 p-3 font-mono text-[0.65rem] tabular-nums"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-fg-muted">WCAG</span>
                <span className={passW ? 'text-fg-success' : 'text-fg-danger'}>
                  {w.toFixed(2)}:1 {passW ? '✓' : '✕'}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-fg-muted">APCA</span>
                <span className={passA ? 'text-fg-success' : 'text-fg-warning'}>
                  Lc {lc.toFixed(1)} {passA ? '✓' : '⚠'}
                </span>
              </div>
              <div className="mt-1 flex items-center justify-between gap-3 border-t pt-1.5">
                <span className="text-fg-muted">bg oklch</span>
                <span>
                  {oklch
                    ? `${oklch.l.toFixed(3)} ${(oklch.c ?? 0).toFixed(3)} ${(oklch.h ?? 0).toFixed(0)}`
                    : '—'}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-fg-muted">bg gamut</span>
                <span className={bgSrgb ? 'text-fg-muted' : 'text-fg'}>
                  {bgSrgb ? 'sRGB' : 'P3 headroom'}
                </span>
              </div>
            </div>
            <span aria-live="polite" className="text-xs text-fg-muted">
              {verdict}
            </span>
            <span className="text-xs text-fg-muted">
              Valid Tailwind. Compiles. Ships. No tier here holds a position on
              the pair — that&rsquo;s chapter 17&rsquo;s missing floor.
            </span>
          </div>
        </div>
      </div>
    </Playground>
  )
}
