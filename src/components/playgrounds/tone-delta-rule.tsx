import { useState } from 'react'

import { Demo } from '@/components/demo'
import { Slider, SliderControl } from '@/ui/slider'

import { ratioOfTones, toneGray } from './material-hct-data'

const RULES = [
  { delta: 40, floor: 3.0 },
  { delta: 50, floor: 4.5 },
]

export function ToneDeltaRule() {
  const [t, setT] = useState(10)

  return (
    <Demo
      caption={
        <>
          The written rule, swept along the tone axis. Δ40 holds everywhere —
          its global worst is 3.17:1 at tones 60/100, past this slider's reach;
          within reach it never dips below 3.25:1. Δ50 bottoms out at 4.48:1, at
          exactly one spot: tone 50 against tone 100. Drag to the right end and
          watch the sentence in the source code miss by 0.016.
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <span className="shrink-0 text-xs text-fg-muted">Lower tone</span>
          <Slider
            aria-label="Lower tone of the pair"
            value={t}
            onChange={(v) => setT(v as number)}
            minValue={0}
            maxValue={50}
            step={1}
            className="flex-1"
          >
            <SliderControl />
          </Slider>
          <span className="w-8 shrink-0 text-right font-mono text-xs text-fg-muted tabular-nums">
            {t}
          </span>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {RULES.map(({ delta, floor }) => {
            const hi = t + delta
            const ratio = ratioOfTones(t, hi)
            const pass = ratio >= floor
            return (
              <div key={delta} className="flex flex-col gap-2">
                <div
                  className="rounded-lg border p-4"
                  style={{ backgroundColor: toneGray(hi) }}
                >
                  <p
                    className="text-sm font-medium"
                    style={{ color: toneGray(t) }}
                  >
                    Tone {t} on tone {hi}
                  </p>
                </div>
                <div
                  aria-live="polite"
                  className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs tabular-nums"
                >
                  <span className="text-fg-muted">
                    Δ{delta} promises ≥ {floor.toFixed(1)}:1
                  </span>
                  <span className="font-mono">{ratio.toFixed(3)}:1</span>
                  <span
                    className={
                      pass
                        ? 'font-medium text-success'
                        : 'font-medium text-danger'
                    }
                  >
                    {pass ? 'holds' : 'misses'}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </Demo>
  )
}
