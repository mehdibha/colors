import { useMemo, useState } from 'react'
import { clampChroma, converter, formatHex, wcagContrast } from 'culori'

import { apcaLc } from '@/lib/apca'
import { cn } from '@/lib/utils'
import { Playground } from '@/components/playground'
import { Button } from '@/ui/button'
import { Slider, SliderControl } from '@/ui/slider'

const toOklch = converter('oklch')

// Radix slate (light): its L values are the skeleton, its C profile (normalized
// to peak 1) is the tint arc — so the dial scales a shipped shape, not a guess.
const SLATE = [
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
]
const L = SLATE.map((hex) => toOklch(hex)?.l ?? 0)
const RAW_C = SLATE.map((hex) => toOklch(hex)?.c ?? 0)
const PEAK_C = Math.max(...RAW_C)
const ARC = RAW_C.map((c) => c / PEAK_C)

// Radix light accents: steps 3 (badge bg), 9 (solid), 11 (text/link).
const ACCENTS = [
  { id: 'iris', name: 'Iris', s3: '#f0f1fe', s9: '#5b5bd6', s11: '#5753c6' },
  { id: 'blue', name: 'Blue', s3: '#e6f4fe', s9: '#0090ff', s11: '#0d74ce' },
  { id: 'jade', name: 'Jade', s3: '#e6f7ed', s9: '#29a383', s11: '#208368' },
  {
    id: 'orange',
    name: 'Orange',
    s3: '#ffefd6',
    s9: '#f76b15',
    s11: '#cc4e00',
  },
  {
    id: 'crimson',
    name: 'Crimson',
    s3: '#ffe9f0',
    s9: '#e93d82',
    s11: '#cb1d63',
  },
].map((a) => ({ ...a, h: toOklch(a.s9)?.h ?? 0 }))

const DEFAULT_ACCENT = ACCENTS[0]
const DEFAULT_HUE = Math.round(DEFAULT_ACCENT?.h ?? 278)
const DEFAULT_AMOUNT = 0.016

interface Step {
  hex: string
  c: number
  clamped: boolean
}

export function NeutralTintDial() {
  const [accentId, setAccentId] = useState(DEFAULT_ACCENT?.id ?? 'iris')
  const [hue, setHue] = useState(DEFAULT_HUE)
  const [amount, setAmount] = useState(DEFAULT_AMOUNT)

  const accent =
    ACCENTS.find((a) => a.id === accentId) ?? DEFAULT_ACCENT ?? ACCENTS[0]

  const steps: Step[] = useMemo(
    () =>
      L.map((l, i) => {
        const asked = amount * (ARC[i] ?? 0)
        const col = clampChroma(
          { mode: 'oklch' as const, l, c: asked, h: hue },
          'oklch',
        )
        const c = col.c ?? 0
        return { hex: formatHex(col), c, clamped: asked - c > 0.0005 }
      }),
    [hue, amount],
  )

  const s = (n: number) => steps[n - 1]?.hex ?? '#000000'
  const c9 = steps[8]?.c ?? 0
  const anyClamped = steps.some((st) => st.clamped)

  const r12 = wcagContrast(s(12), s(1))
  const lc12 = Math.abs(apcaLc(s(12), s(1)))
  const r11 = wcagContrast(s(11), s(2))
  const lc11 = Math.abs(apcaLc(s(11), s(2)))

  if (!accent) return null

  return (
    <Playground
      question="How much of your accent's hue can the grays carry before they stop being gray?"
      onReset={() => {
        setAccentId(DEFAULT_ACCENT?.id ?? 'iris')
        setHue(DEFAULT_HUE)
        setAmount(DEFAULT_AMOUNT)
      }}
    >
      <div className="flex flex-col gap-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-fg-muted">Accent</span>
          {ACCENTS.map((a) => (
            <Button
              key={a.id}
              variant={a.id === accentId ? 'primary' : 'default'}
              aria-pressed={a.id === accentId}
              size="sm"
              onPress={() => {
                setAccentId(a.id)
                setHue(Math.round(a.h))
              }}
            >
              <span
                className="size-3 rounded-full"
                style={{ backgroundColor: a.s9 }}
                aria-hidden
              />
              {a.name}
            </Button>
          ))}
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <span className="w-24 shrink-0 text-xs text-fg-muted">
              Tint hue
            </span>
            <Slider
              aria-label="Tint hue in degrees"
              value={hue}
              onChange={(v) => setHue(v as number)}
              minValue={0}
              maxValue={360}
              step={1}
              className="flex-1"
            >
              <SliderControl />
            </Slider>
            <span className="w-16 shrink-0 text-right font-mono text-xs text-fg-muted tabular-nums">
              {hue}°{' '}
              {Math.abs(hue - accent.h) < 10 || Math.abs(hue - accent.h) > 350
                ? '≈ accent'
                : ''}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="w-24 shrink-0 text-xs text-fg-muted">
              Tint amount
            </span>
            <Slider
              aria-label="Tint amount: peak chroma of the neutral ramp"
              value={amount}
              onChange={(v) => setAmount(v as number)}
              minValue={0}
              maxValue={0.06}
              step={0.001}
              className="flex-1"
            >
              <SliderControl />
            </Slider>
            <span className="w-16 shrink-0 text-right font-mono text-xs text-fg-muted tabular-nums">
              C {amount.toFixed(3)}
            </span>
          </div>
        </div>

        <div
          className="flex overflow-hidden rounded-lg border"
          style={{ backgroundColor: s(1), borderColor: s(6) }}
        >
          <aside
            className="hidden w-36 shrink-0 flex-col gap-1 border-r p-2 sm:flex"
            style={{ backgroundColor: s(2), borderColor: s(6) }}
          >
            <span
              className="px-2 py-1 text-[0.65rem] font-semibold tracking-wide uppercase"
              style={{ color: s(11) }}
            >
              Mail
            </span>
            <span
              className="rounded-md px-2 py-1 text-xs font-medium"
              style={{ backgroundColor: s(5), color: s(12) }}
            >
              Inbox
            </span>
            {['Drafts', 'Sent', 'Archive'].map((item) => (
              <span
                key={item}
                className="px-2 py-1 text-xs"
                style={{ color: s(11) }}
              >
                {item}
              </span>
            ))}
          </aside>
          <main className="flex flex-1 flex-col gap-3 p-4">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-semibold" style={{ color: s(12) }}>
                Quarterly review
              </span>
              <span
                className="rounded-full px-2 py-0.5 text-[0.65rem] font-medium"
                style={{ backgroundColor: accent.s3, color: accent.s11 }}
              >
                3 new
              </span>
            </div>
            <div
              className="flex flex-col gap-2 rounded-lg border p-3"
              style={{ backgroundColor: s(1), borderColor: s(6) }}
            >
              <span className="text-xs font-medium" style={{ color: s(12) }}>
                Numbers are in — draft attached
              </span>
              <span className="text-xs" style={{ color: s(11) }}>
                Sarah · 2h ago · finance
              </span>
              <div
                className="border-t"
                style={{ borderColor: s(6) }}
                aria-hidden
              />
              <div className="flex items-center gap-3">
                <span
                  className="rounded-md px-3 py-1 text-xs font-medium"
                  style={{ backgroundColor: accent.s9, color: '#ffffff' }}
                >
                  Reply
                </span>
                <span
                  className="text-xs font-medium"
                  style={{ color: accent.s11 }}
                >
                  Open thread
                </span>
              </div>
            </div>
          </main>
        </div>

        <div className="flex gap-1">
          {steps.map((st, i) => (
            <div
              key={i}
              className="flex min-w-0 flex-1 flex-col items-center gap-1"
            >
              <div
                className="h-9 w-full rounded-md border"
                style={{ backgroundColor: st.hex }}
              />
              <span
                className={cn(
                  'font-mono text-[0.55rem] text-fg-muted tabular-nums',
                  st.clamped && 'text-fg',
                )}
              >
                {st.clamped ? '✕' : st.c.toFixed(3).slice(1)}
              </span>
            </div>
          ))}
        </div>

        <div aria-live="polite" className="flex flex-col gap-2">
          <p className="font-mono text-xs text-fg-muted tabular-nums">
            step 9 tint C {c9.toFixed(3)} = ΔEOK {c9.toFixed(3)} from pure gray
            (spec JND 0.02) · text 12-on-1 {r12.toFixed(2)}:1 / Lc{' '}
            {lc12.toFixed(1)} · text 11-on-2 {r11.toFixed(2)}:1 / Lc{' '}
            {lc11.toFixed(1)}
          </p>
          {anyClamped && (
            <p className="text-xs text-fg-muted">
              ⚠ ✕ marks steps where the asked tint hit the sRGB ceiling and was
              clamped — near white, even a whisper meets chapter 12&rsquo;s
              tent.
            </p>
          )}
        </div>
      </div>
    </Playground>
  )
}
