import { useState } from 'react'
import { formatHex, wcagLuminance } from 'culori'

import { Demo } from '@/components/demo'
import { Slider, SliderControl } from '@/ui/slider'

const RAIL_MAX = Math.log(21)
const pos = (ratio: number) => (Math.log(ratio) / RAIL_MAX) * 100

const TICKS = [
  { ratio: 3, label: '3:1' },
  { ratio: 4.5, label: '4.5:1' },
  { ratio: 7, label: '7:1' },
]

const START = 118

export function RatioAnatomy() {
  const [value, setValue] = useState(START)

  const hex = formatHex({
    mode: 'rgb',
    r: value / 255,
    g: value / 255,
    b: value / 255,
  })
  const y = wcagLuminance(hex)
  const ratio = 1.05 / (y + 0.05)

  return (
    <Demo
      caption={
        <>
          The whole WCAG 2 pipeline, live: decode the gray to linear light
          (chapter 3's curve), weight the channels (chapter 4's 21/72/7), add
          0.05 to both luminances, divide lighter by darker. At pure black the
          ratio caps at 21:1 — the flare term won't let the denominator reach
          zero. Note the formula's first move: it sorts the pair into lighter
          and darker before dividing. Hold that thought.
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div
            className="rounded-lg border px-4 py-5 text-sm font-medium"
            style={{ backgroundColor: '#ffffff', color: hex }}
          >
            Gray text on a white surface
          </div>
          <div
            className="rounded-lg border px-4 py-5 text-sm font-medium"
            style={{ backgroundColor: hex, color: '#ffffff' }}
          >
            White text on the same gray
          </div>
        </div>

        <div className="text-center font-mono text-[0.75rem] text-fg-muted tabular-nums">
          (1.000 + 0.05) / ({y.toFixed(3)} + 0.05) ={' '}
          <span className="text-fg">{ratio.toFixed(2)}:1</span> — both cards
        </div>

        <div className="flex flex-col gap-1">
          <div className="relative h-2 rounded-full border">
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-fg/70"
              style={{ width: `${pos(ratio)}%` }}
            />
            {TICKS.map((t) => (
              <div
                key={t.label}
                className="absolute inset-y-0 w-px bg-fg/40"
                style={{ left: `${pos(t.ratio)}%` }}
              />
            ))}
          </div>
          <div className="relative h-4 font-mono text-[0.65rem] text-fg-muted">
            {TICKS.map((t) => (
              <span
                key={t.label}
                className="absolute -translate-x-1/2"
                style={{ left: `${pos(t.ratio)}%` }}
              >
                {t.label}
              </span>
            ))}
            <span className="absolute right-0">21:1</span>
          </div>
        </div>

        <Slider
          aria-label="Gray value"
          value={value}
          onChange={(v) => setValue(v as number)}
          minValue={0}
          maxValue={255}
          step={1}
        >
          <SliderControl />
        </Slider>
      </div>
    </Demo>
  )
}
