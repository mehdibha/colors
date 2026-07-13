import { useMemo, useState } from 'react'
import { wcagContrast } from 'culori'

import { apcaLc } from '@/lib/apca'
import { Playground } from '@/components/playground'
import { Slider, SliderControl } from '@/ui/slider'
import { ToggleButton } from '@/ui/toggle-button'
import { ToggleButtonGroup } from '@/ui/toggle-button-group'

import {
  approxToneHex,
  dEok,
  HCT_SEEDS,
  HCT_TONES,
  lch65Of,
  ratioOfTones,
} from './material-hct-data'

const QUESTION =
  'Pick a key color and two tones — does the tone gap alone predict the contrast you measure?'

const SEED_LCH = new Map(HCT_SEEDS.map((s) => [s.id, lch65Of(s.hex)]))
const DEFAULT_LCH = lch65Of('#6750a4')

function rulePromise(delta: number): string {
  if (delta >= 50) return 'Δ ≥ 50 → the rule promises ≥ 4.5:1'
  if (delta >= 40) return 'Δ ≥ 40 → the rule promises ≥ 3.0:1'
  return 'Δ < 40 → the rule promises nothing'
}

export function HctToneExplorer() {
  const [seedId, setSeedId] = useState('violet')
  const [hue, setHue] = useState(DEFAULT_LCH.h)
  const [chroma, setChroma] = useState(DEFAULT_LCH.c)
  const [ink, setInk] = useState(100)
  const [paper, setPaper] = useState(40)

  const seed = HCT_SEEDS.find((s) => s.id === seedId)

  const strip = useMemo(
    () => HCT_TONES.map((t) => approxToneHex(hue, chroma, t)),
    [hue, chroma],
  )
  const deltas = useMemo(
    () =>
      seed
        ? strip.map((hex, i) => dEok(hex, seed.palette[i] ?? hex))
        : undefined,
    [seed, strip],
  )
  const maxDelta = deltas ? Math.max(...deltas) : 0

  const inkIdx = HCT_TONES.indexOf(ink as (typeof HCT_TONES)[number])
  const paperIdx = HCT_TONES.indexOf(paper as (typeof HCT_TONES)[number])
  const inkHex = strip[inkIdx] ?? '#000000'
  const paperHex = strip[paperIdx] ?? '#ffffff'
  const refInk = seed?.palette[inkIdx]
  const refPaper = seed?.palette[paperIdx]

  const delta = Math.abs(ink - paper)
  const predicted = ratioOfTones(ink, paper)
  const measured = wcagContrast(inkHex, paperHex)
  const refMeasured =
    refInk && refPaper ? wcagContrast(refInk, refPaper) : undefined
  const lc = apcaLc(inkHex, paperHex)

  const selectSeed = (id: string) => {
    setSeedId(id)
    const lch = SEED_LCH.get(id)
    if (lch) {
      setHue(lch.h)
      setChroma(lch.c)
    }
  }

  const reset = () => {
    selectSeed('violet')
    setInk(100)
    setPaper(40)
  }

  return (
    <Playground question={QUESTION} onReset={reset}>
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-3">
          <ToggleButtonGroup
            selectionMode="single"
            selectedKeys={seedId === 'custom' ? [] : [seedId]}
            onSelectionChange={(keys) => {
              const next = [...keys][0]
              if (typeof next === 'string') selectSeed(next)
            }}
            size="sm"
            aria-label="Key color preset"
            className="max-w-full overflow-x-auto"
          >
            {HCT_SEEDS.map((s) => (
              <ToggleButton key={s.id} id={s.id}>
                <span
                  aria-hidden
                  className="mr-1.5 inline-block size-3 rounded-full border align-[-1px]"
                  style={{ backgroundColor: s.hex }}
                />
                {s.name}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>

          <div className="flex items-center gap-3">
            <span className="w-14 shrink-0 text-xs text-fg-muted">Hue</span>
            <Slider
              aria-label="Key color hue"
              value={hue}
              onChange={(v) => {
                setSeedId('custom')
                setHue(v as number)
              }}
              minValue={0}
              maxValue={359}
              step={1}
              className="flex-1"
            >
              <SliderControl />
            </Slider>
            <span className="w-10 shrink-0 text-right font-mono text-xs text-fg-muted tabular-nums">
              {Math.round(hue)}°
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="w-14 shrink-0 text-xs text-fg-muted">Chroma</span>
            <Slider
              aria-label="Key color chroma"
              value={chroma}
              onChange={(v) => {
                setSeedId('custom')
                setChroma(v as number)
              }}
              minValue={0}
              maxValue={110}
              step={1}
              className="flex-1"
            >
              <SliderControl />
            </Slider>
            <span className="w-10 shrink-0 text-right font-mono text-xs text-fg-muted tabular-nums">
              {Math.round(chroma)}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <span className="font-mono text-[0.65rem] text-fg-muted">
            tonal palette — culori approximation (tone exact, hue/chroma via
            CIELAB LCh)
          </span>
          <div className="flex gap-0.5">
            {HCT_TONES.map((t, i) => (
              <div
                key={t}
                className="flex min-w-0 flex-1 flex-col items-center gap-1"
              >
                <div
                  className="h-9 w-full rounded-sm"
                  style={{ backgroundColor: strip[i] }}
                />
                <span className="font-mono text-[0.55rem] text-fg-muted tabular-nums">
                  {t}
                </span>
              </div>
            ))}
          </div>
          {seed && deltas ? (
            <>
              <div className="mt-1 flex gap-0.5">
                {HCT_TONES.map((t, i) => (
                  <div
                    key={t}
                    className="h-9 min-w-0 flex-1 rounded-sm"
                    style={{ backgroundColor: seed.palette[i] }}
                  />
                ))}
              </div>
              <span className="font-mono text-[0.65rem] text-fg-muted tabular-nums">
                reference — material-color-utilities, seed {seed.hex}, HCT{' '}
                {seed.hct.h.toFixed(1)} / {seed.hct.c.toFixed(1)} /{' '}
                {seed.hct.t.toFixed(1)} — worst row disagreement ΔEok{' '}
                {maxDelta.toFixed(3)}
              </span>
            </>
          ) : (
            <span className="font-mono text-[0.65rem] text-fg-muted">
              custom key color — no embedded reference row for this hue and
              chroma
            </span>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="w-14 shrink-0 text-xs text-fg-muted">Ink</span>
            <ToggleButtonGroup
              selectionMode="single"
              disallowEmptySelection
              selectedKeys={[String(ink)]}
              onSelectionChange={(keys) => {
                const next = Number([...keys][0])
                if (!Number.isNaN(next)) setInk(next)
              }}
              size="sm"
              aria-label="Ink tone"
              className="max-w-full overflow-x-auto"
            >
              {HCT_TONES.map((t) => (
                <ToggleButton key={t} id={String(t)}>
                  {t}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-14 shrink-0 text-xs text-fg-muted">Paper</span>
            <ToggleButtonGroup
              selectionMode="single"
              disallowEmptySelection
              selectedKeys={[String(paper)]}
              onSelectionChange={(keys) => {
                const next = Number([...keys][0])
                if (!Number.isNaN(next)) setPaper(next)
              }}
              size="sm"
              aria-label="Paper tone"
              className="max-w-full overflow-x-auto"
            >
              {HCT_TONES.map((t) => (
                <ToggleButton key={t} id={String(t)}>
                  {t}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </div>
        </div>

        <div
          className="rounded-lg border p-5"
          style={{ backgroundColor: paperHex }}
        >
          <p className="text-sm font-medium" style={{ color: inkHex }}>
            Tone {ink} on tone {paper}
          </p>
          <p className="mt-1 text-sm" style={{ color: inkHex }}>
            The gap between these two numbers decided this contrast before
            either color was rendered.
          </p>
        </div>

        <div
          aria-live="polite"
          className="flex flex-col gap-1 text-xs tabular-nums"
        >
          <span className="text-fg-muted">
            Δtone {delta} — {rulePromise(delta)}
          </span>
          <span>
            Predicted from the two tones alone:{' '}
            <span className="font-mono">{predicted.toFixed(2)}:1</span> ·
            measured on the rendered pair:{' '}
            <span className="font-mono">{measured.toFixed(2)}:1</span>
            {refMeasured !== undefined && (
              <>
                {' '}
                · on the reference pair:{' '}
                <span className="font-mono">{refMeasured.toFixed(2)}:1</span>
              </>
            )}
          </span>
          <span className="text-fg-muted">
            APCA, for the record: Lc {lc.toFixed(1)} — no tone rule exists for
            this meter; the geometry speaks WCAG 2 only.
          </span>
        </div>
      </div>
    </Playground>
  )
}
