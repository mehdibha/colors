import { useState } from 'react'
import { converter, formatHex } from 'culori'

import { Demo } from '@/components/demo'
import { Slider, SliderControl } from '@/ui/slider'

const toOklch = converter('oklch')
const toRgb = converter('rgb')

// max OKLCH chroma sRGB reaches at any lightness, for the meter's scale
const C_SCALE = 0.32

export function SaturationThatIsnt() {
  const [lig, setLig] = useState(50)

  const color = { mode: 'hsl' as const, h: 250, s: 1, l: lig / 100 }
  const hex = formatHex(toRgb(color))
  const chroma = toOklch(color).c ?? 0

  return (
    <Demo
      caption={
        <>
          Every position on this slider reports S = 100%. Measured vividness
          (OKLCH chroma, chapter 5) collapses from 0.31 to 0.03. S doesn't
          measure how colorful a color looks — it measures how close the color
          sits to the edge of what its lightness allows, and near white that
          edge is almost on the gray axis.
        </>
      }
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div
          className="h-24 shrink-0 rounded-lg border sm:h-auto sm:w-32 sm:self-stretch"
          style={{ backgroundColor: hex }}
        />
        <div className="flex flex-1 flex-col gap-3">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="w-30 shrink-0 text-xs text-fg-muted">
                lightness (the knob)
              </span>
              <Slider
                aria-label="HSL lightness"
                value={lig}
                onChange={(v) => setLig(v as number)}
                minValue={50}
                maxValue={95}
                step={1}
                className="flex-1"
              >
                <SliderControl />
              </Slider>
              <span className="w-9 shrink-0 text-right font-mono text-xs text-fg-muted tabular-nums">
                {lig}%
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-30 shrink-0 text-xs text-fg-muted">
              saturation claims
            </span>
            <div className="h-2 flex-1 overflow-hidden rounded-full border">
              <div className="h-full w-full" style={{ backgroundColor: hex }} />
            </div>
            <span className="w-9 shrink-0 text-right font-mono text-xs text-fg-muted tabular-nums">
              100%
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-30 shrink-0 text-xs text-fg-muted">
              measured chroma
            </span>
            <div className="h-2 flex-1 overflow-hidden rounded-full border">
              <div
                className="h-full"
                style={{
                  width: `${(chroma / C_SCALE) * 100}%`,
                  backgroundColor: hex,
                }}
              />
            </div>
            <span className="w-9 shrink-0 text-right font-mono text-xs text-fg-muted tabular-nums">
              {chroma.toFixed(2)}
            </span>
          </div>
          <code className="font-mono text-xs text-fg-muted">
            hsl(250 100% {lig}%)
          </code>
        </div>
      </div>
    </Demo>
  )
}
