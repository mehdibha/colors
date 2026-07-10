import { useState } from 'react'
import { clampChroma, formatHex, wcagContrast } from 'culori'

import { apcaLc } from '@/lib/apca'
import { Playground } from '@/components/playground'
import { Slider, SliderControl } from '@/ui/slider'
import { Switch } from '@/ui/switch'
import { ToggleButton } from '@/ui/toggle-button'
import { ToggleButtonGroup } from '@/ui/toggle-button-group'

// L and C curves adapted from Radix blue (light mode); designing curves is ch11–12's subject.
const LCURVE = [
  0.993, 0.981, 0.955, 0.926, 0.891, 0.85, 0.795, 0.71, 0.649, 0.619, 0.544,
  0.322,
]
const CCURVE = [
  0.003, 0.008, 0.019, 0.037, 0.055, 0.072, 0.093, 0.124, 0.181, 0.17, 0.135,
  0.078,
]

const makeScale = (hue: number): string[] =>
  LCURVE.map((l, i) =>
    formatHex(
      clampChroma({ mode: 'oklch', l, c: CCURVE[i] ?? 0, h: hue }, 'oklch'),
    ),
  )

type PartId = 'page' | 'card' | 'border' | 'heading' | 'body' | 'button'

const PARTS: { id: PartId; label: string }[] = [
  { id: 'page', label: 'Page' },
  { id: 'card', label: 'Card' },
  { id: 'border', label: 'Border' },
  { id: 'heading', label: 'Heading' },
  { id: 'body', label: 'Body text' },
  { id: 'button', label: 'Button' },
]

const DEFAULTS: Record<PartId, number> = {
  page: 1,
  card: 2,
  border: 6,
  heading: 12,
  body: 11,
  button: 9,
}

const stepOf = (scale: string[], n: number) => scale[n - 1] ?? '#000000'

type Tone = 'ok' | 'warn' | 'bad'

function textCheck(
  fg: string,
  bg: string,
  wcagMin: number,
  lcMin: number,
): { ratio: number; lc: number; tone: Tone; verdict: string } {
  const ratio = wcagContrast(fg, bg)
  const lc = Math.abs(apcaLc(fg, bg))
  const w = ratio >= wcagMin
  const a = lc >= lcMin
  const tone: Tone = w && a ? 'ok' : !w && !a ? 'bad' : 'warn'
  const verdict =
    w && a
      ? 'passes both meters'
      : !w && !a
        ? 'fails both meters'
        : w
          ? 'WCAG passes, APCA objects — the meters split'
          : 'APCA passes, WCAG fails — the meters split'
  return { ratio, lc, tone, verdict }
}

function borderCheck(
  border: string,
  bg: string,
): {
  ratio: number
  tone: Tone
  verdict: string
} {
  const ratio = wcagContrast(border, bg)
  if (ratio < 1.1)
    return { ratio, tone: 'bad', verdict: 'invisible — the card has no edge' }
  if (ratio < 1.3)
    return { ratio, tone: 'warn', verdict: 'barely there — squint and it goes' }
  return {
    ratio,
    tone: 'ok',
    verdict:
      ratio >= 3
        ? 'clears the 3:1 non-text bar'
        : 'visible hairline — below 3:1, fine while it isn’t the only cue',
  }
}

export function BuildACard() {
  const [hue, setHue] = useState(250)
  const [steps, setSteps] = useState<Record<PartId, number>>(DEFAULTS)
  const [part, setPart] = useState<PartId>('card')
  const [darkLabel, setDarkLabel] = useState(false)

  const scale = makeScale(hue)
  const hex = (id: PartId) => stepOf(scale, steps[id])
  const label = darkLabel ? '#000000' : '#ffffff'

  const heading = textCheck(hex('heading'), hex('card'), 4.5, 75)
  const body = textCheck(hex('body'), hex('card'), 4.5, 60)
  const btn = textCheck(label, hex('button'), 4.5, 60)
  const border = borderCheck(hex('border'), hex('card'))

  const sel = (id: PartId) =>
    part === id ? 'outline-2 outline-offset-2 outline-fg/50 outline-dashed' : ''

  return (
    <Playground
      question="What breaks when a part of this card takes the wrong step?"
      onReset={() => {
        setHue(250)
        setSteps(DEFAULTS)
        setPart('card')
        setDarkLabel(false)
      }}
    >
      <div className="flex flex-col gap-5">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <div className="flex min-w-48 flex-1 items-center gap-3">
            <span className="shrink-0 text-xs text-fg-muted">Scale hue</span>
            <Slider
              aria-label="Scale hue"
              value={hue}
              onChange={(v) => setHue(v as number)}
              minValue={0}
              maxValue={360}
              step={1}
              className="flex-1"
            >
              <SliderControl />
            </Slider>
            <span className="w-8 shrink-0 text-right font-mono text-xs text-fg-muted tabular-nums">
              {hue}°
            </span>
          </div>
          <Switch isSelected={darkLabel} onChange={setDarkLabel} size="sm">
            Dark button label
          </Switch>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="shrink-0 text-xs text-fg-muted">Part</span>
            <ToggleButtonGroup
              selectionMode="single"
              disallowEmptySelection
              selectedKeys={[part]}
              onSelectionChange={(keys) => {
                const id = [...keys][0]
                if (typeof id === 'string') setPart(id as PartId)
              }}
              size="sm"
              aria-label="Card part"
              className="max-w-full overflow-x-auto"
            >
              {PARTS.map((p) => (
                <ToggleButton key={p.id} id={p.id}>
                  {p.label}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="shrink-0 text-xs text-fg-muted">Step</span>
            <ToggleButtonGroup
              selectionMode="single"
              disallowEmptySelection
              selectedKeys={[String(steps[part])]}
              onSelectionChange={(keys) => {
                const id = [...keys][0]
                if (typeof id === 'string')
                  setSteps({ ...steps, [part]: Number(id) })
              }}
              size="sm"
              aria-label={`Step for ${part}`}
              className="max-w-full overflow-x-auto"
            >
              {scale.map((hexValue, i) => (
                <ToggleButton
                  key={i + 1}
                  id={String(i + 1)}
                  aria-label={`Step ${i + 1}`}
                >
                  <span
                    className="size-3.5 rounded-sm border"
                    style={{ backgroundColor: hexValue }}
                  />
                  {i + 1}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1fr_17rem]">
          <div
            className={`rounded-lg border p-6 sm:p-8 ${sel('page')}`}
            style={{ backgroundColor: hex('page') }}
          >
            <div
              className={`mx-auto flex max-w-xs flex-col gap-2 rounded-lg border p-4 ${sel('card')} ${sel('border')}`}
              style={{
                backgroundColor: hex('card'),
                borderColor: hex('border'),
              }}
            >
              <span
                className={`text-[15px] font-semibold ${sel('heading')}`}
                style={{ color: hex('heading') }}
              >
                Storage almost full
              </span>
              <span
                className={`text-[13px] ${sel('body')}`}
                style={{ color: hex('body') }}
              >
                You&rsquo;ve used 14.2 of 15 GB. Uploads pause when the
                workspace runs out of space.
              </span>
              <span
                className={`mt-1 self-start rounded-md px-3 py-1.5 text-[13px] font-medium ${sel('button')}`}
                style={{ backgroundColor: hex('button'), color: label }}
              >
                Upgrade storage
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-3 rounded-lg border bg-muted p-4">
            <div className="font-mono text-[0.7rem] tracking-wider text-fg-muted uppercase">
              Contract checker
            </div>
            <Check
              title={`Heading — ${steps.heading} on ${steps.card}`}
              body={`${heading.ratio.toFixed(2)}:1 · Lc ${heading.lc.toFixed(1)} (needs 4.5 + Lc 75) — ${heading.verdict}.`}
              tone={heading.tone}
            />
            <Check
              title={`Body text — ${steps.body} on ${steps.card}`}
              body={`${body.ratio.toFixed(2)}:1 · Lc ${body.lc.toFixed(1)} (needs 4.5 + Lc 60) — ${body.verdict}.`}
              tone={body.tone}
            />
            <Check
              title={`Button label — ${darkLabel ? 'black' : 'white'} on ${steps.button}`}
              body={`${btn.ratio.toFixed(2)}:1 · Lc ${btn.lc.toFixed(1)} (needs 4.5 + Lc 60) — ${btn.verdict}.`}
              tone={btn.tone}
            />
            <Check
              title={`Card border — ${steps.border} vs ${steps.card}`}
              body={`${border.ratio.toFixed(2)}:1 — ${border.verdict}.`}
              tone={border.tone}
            />
          </div>
        </div>

        <p className="text-sm text-fg-muted">
          The colors are never ugly — what breaks are the relationships.
        </p>
      </div>
    </Playground>
  )
}

function Check({
  title,
  body,
  tone,
}: {
  title: string
  body: string
  tone: Tone
}) {
  const dot =
    tone === 'ok' ? 'bg-success' : tone === 'warn' ? 'bg-warning' : 'bg-danger'
  return (
    <div className="flex flex-col gap-0.5" aria-live="polite">
      <div className="flex items-center gap-2">
        <span className={`size-2 shrink-0 rounded-full ${dot}`} />
        <span className="text-xs font-medium">{title}</span>
      </div>
      <p className="text-xs text-fg-muted tabular-nums">{body}</p>
    </div>
  )
}
