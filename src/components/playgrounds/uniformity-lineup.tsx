import { useState } from 'react'
import { converter, formatHex, interpolate, wcagLuminance } from 'culori'

import { cn } from '@/lib/utils'
import { Playground } from '@/components/playground'
import { ToggleButton } from '@/ui/toggle-button'
import { ToggleButtonGroup } from '@/ui/toggle-button-group'

const toRgb = converter('rgb')
const toLab = converter('lab')
const toOklch = converter('oklch')

type Space = 'rgb' | 'lab' | 'oklab'

const SPACE_NAME: Record<Space, string> = {
  rgb: 'sRGB',
  lab: 'CIELAB',
  oklab: 'OKLab',
}

const N = 9
const HUE_SAMPLES = 36

const grayHexFor = (y: number) =>
  formatHex(toRgb({ mode: 'lrgb', r: y, g: y, b: y }))

// hue isolated at fixed L/C — in sRGB for every hue (verified)
const hueChip = (h: number) =>
  formatHex(toRgb({ mode: 'oklch', l: 0.7, c: 0.1, h }))

function buildRamp(seed: string, space: Space) {
  const at = interpolate([seed, '#ffffff'], space)
  const steps = Array.from({ length: N }, (_, i) => toRgb(at(i / (N - 1))))
  const lstars = steps.map((c) => toLab(c).l)
  const dl = lstars.slice(1).map((l, i) => l - (lstars[i] ?? l))
  // hue path sampled up to 90% of the way — white itself has no hue
  const hues = Array.from(
    { length: HUE_SAMPLES + 1 },
    (_, i) => toOklch(at((i / HUE_SAMPLES) * 0.9))?.h ?? 0,
  )
  return {
    space,
    swatches: steps.map((c) => formatHex(c)),
    twins: steps.map((c) => grayHexFor(wcagLuminance(c))),
    hueStrip: hues.map(hueChip),
    drift: Math.round((hues[HUE_SAMPLES] ?? 0) - (hues[0] ?? 0)),
    stepMin: Math.min(...dl),
    stepMax: Math.max(...dl),
  }
}

// fixed per-seed row order, so no space always sits in the same slot
const SEEDS = [
  {
    id: 'blue',
    label: 'Blue',
    hex: '#0033dd',
    order: ['lab', 'rgb', 'oklab'] as Space[],
  },
  {
    id: 'red',
    label: 'Red',
    hex: '#c81e1e',
    order: ['rgb', 'oklab', 'lab'] as Space[],
  },
  {
    id: 'green',
    label: 'Green',
    hex: '#0a7d33',
    order: ['oklab', 'lab', 'rgb'] as Space[],
  },
]

const LINEUPS = new Map(
  SEEDS.map((seed) => [
    seed.id,
    seed.order.map((space) => buildRamp(seed.hex, space)),
  ]),
)

export function UniformityLineup() {
  const [seedId, setSeedId] = useState('blue')
  const [picked, setPicked] = useState<number | null>(null)

  const ramps = LINEUPS.get(seedId) ?? []
  const revealed = picked !== null

  const selectSeed = (id: string) => {
    setSeedId(id)
    setPicked(null)
  }

  const reset = () => {
    setSeedId('blue')
    setPicked(null)
  }

  return (
    <Playground
      question="Three ramps, equal numeric steps each — which one does your eye believe?"
      onReset={reset}
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-sm text-fg-muted">
            Eight equal steps from one seed to white, taken in three different
            spaces. Click the ramp whose steps look even <em>and</em> whose
            color stays itself.
          </span>
          <ToggleButtonGroup
            selectionMode="single"
            disallowEmptySelection
            selectedKeys={[seedId]}
            onSelectionChange={(keys) => selectSeed([...keys][0] as string)}
            size="sm"
            aria-label="Seed color"
          >
            {SEEDS.map((seed) => (
              <ToggleButton key={seed.id} id={seed.id}>
                {seed.label}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </div>

        <div className="flex flex-col gap-3">
          {ramps.map((ramp, index) => (
            <button
              key={`${seedId}-${index}`}
              type="button"
              onClick={() => !revealed && setPicked(index)}
              className={cn(
                'flex flex-col gap-1.5 rounded-lg text-left focus-reset focus-visible:focus-ring',
                revealed ? 'cursor-default' : 'cursor-pointer',
              )}
            >
              <div className="flex items-baseline justify-between">
                <span className="font-mono text-[0.7rem] tracking-wider text-fg-muted uppercase">
                  {revealed
                    ? `Ramp ${'ABC'[index]} — ${SPACE_NAME[ramp.space]}`
                    : `Ramp ${'ABC'[index]}`}
                </span>
                {revealed && (
                  <span className="font-mono text-[0.7rem] text-fg-muted tabular-nums">
                    L* steps {ramp.stepMin.toFixed(1)}–{ramp.stepMax.toFixed(1)}
                    {' · '}hue drift {ramp.drift >= 0 ? '+' : ''}
                    {ramp.drift}°{picked === index && ' · your pick'}
                  </span>
                )}
              </div>
              <div
                className={cn(
                  'flex h-12 overflow-hidden rounded-lg border',
                  revealed && picked === index && 'outline-2 outline-fg',
                )}
              >
                {ramp.swatches.map((hex, i) => (
                  <div
                    key={i}
                    className="flex-1"
                    style={{ backgroundColor: hex }}
                  />
                ))}
              </div>
              {revealed && (
                <>
                  <div className="flex h-3 overflow-hidden rounded-sm border">
                    {ramp.twins.map((hex, i) => (
                      <div
                        key={i}
                        className="flex-1"
                        style={{ backgroundColor: hex }}
                      />
                    ))}
                  </div>
                  <div className="flex h-3 overflow-hidden rounded-sm border">
                    {ramp.hueStrip.map((hex, i) => (
                      <div
                        key={i}
                        className="flex-1"
                        style={{ backgroundColor: hex }}
                      />
                    ))}
                  </div>
                </>
              )}
            </button>
          ))}
        </div>

        {revealed ? (
          <p className="text-sm text-fg-muted">
            Two instruments under each ramp: its light as luminance-matched
            grays (are the steps even?), and its hue path re-rendered at one
            fixed lightness and chroma (does the color stay itself?). The OKLab
            row is the only one that passes both, on every seed — CIELAB's L*
            spacing is even by construction but its blue bends purple, and
            sRGB's steps drift and bunch. Switch seeds: red and green are kinder
            to CIELAB. Blue is where it famously breaks.
          </p>
        ) : (
          <p className="text-sm text-fg-muted">
            No labels until you commit — your eye is the instrument here.
          </p>
        )}
      </div>
    </Playground>
  )
}
