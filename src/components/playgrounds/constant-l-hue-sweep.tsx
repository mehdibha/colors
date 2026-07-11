import { useState } from 'react'
import { converter, formatHex, wcagLuminance } from 'culori'

import { Playground } from '@/components/playground'
import { Slider, SliderControl } from '@/ui/slider'

const toRgb = converter('rgb')
const toLab = converter('lab')

const colorAt = (hue: number) => toRgb({ mode: 'hsl', h: hue, s: 1, l: 0.5 })
const grayHexFor = (y: number) =>
  formatHex(toRgb({ mode: 'lrgb', r: y, g: y, b: y }))

const W = 480
const H = 240
const PAD = { left: 44, right: 12, top: 12, bottom: 36 }

const px = (hue: number) => PAD.left + (hue / 360) * (W - PAD.left - PAD.right)
const py = (y: number) => PAD.top + (1 - y) * (H - PAD.top - PAD.bottom)

const curve = Array.from({ length: 121 }, (_, i) => {
  const hue = (i / 120) * 360
  return `${i === 0 ? 'M' : 'L'}${px(hue).toFixed(1)},${py(wcagLuminance(colorAt(hue))).toFixed(1)}`
}).join(' ')

// what L=50% delivers on the gray axis: rgb(128), ~22% of white's light
const GRAY_Y = wcagLuminance({
  mode: 'rgb',
  r: 128 / 255,
  g: 128 / 255,
  b: 128 / 255,
})

const START = 60

export function ConstantLHueSweep() {
  const [hue, setHue] = useState(START)

  const rgb = colorAt(hue)
  const hex = formatHex(rgb)
  const y = wcagLuminance(rgb)
  const lstar = toLab(rgb).l
  const grayHex = grayHexFor(y)

  return (
    <Playground
      question="hsl() holds L at 50%. Does the lightness hold?"
      onReset={() => setHue(START)}
    >
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-auto w-full text-fg"
        role="img"
        aria-label="Light emitted as a function of HSL hue at saturation 100% and lightness 50%"
      >
        <line
          x1={PAD.left}
          y1={py(0)}
          x2={px(360)}
          y2={py(0)}
          stroke="currentColor"
          strokeOpacity={0.25}
        />
        <line
          x1={PAD.left}
          y1={py(0)}
          x2={PAD.left}
          y2={py(1)}
          stroke="currentColor"
          strokeOpacity={0.25}
        />
        <line
          x1={PAD.left}
          y1={py(GRAY_Y)}
          x2={px(360)}
          y2={py(GRAY_Y)}
          stroke="currentColor"
          strokeOpacity={0.35}
          strokeDasharray="4 4"
        />
        <path d={curve} fill="none" stroke="currentColor" strokeWidth={2} />
        <line
          x1={px(hue)}
          y1={py(0)}
          x2={px(hue)}
          y2={py(y)}
          stroke="currentColor"
          strokeOpacity={0.4}
          strokeDasharray="3 3"
        />
        <circle
          cx={px(hue)}
          cy={py(y)}
          r={6}
          fill={hex}
          stroke="currentColor"
        />
        <g
          className="font-mono text-[0.65rem]"
          fill="currentColor"
          fillOpacity={0.55}
        >
          <text x={px(250)} y={py(GRAY_Y) + 14} textAnchor="middle">
            gray at L=50% (22%)
          </text>
          <text x={px(0)} y={H - 16} textAnchor="middle">
            0°
          </text>
          <text x={px(180)} y={H - 16} textAnchor="middle">
            180°
          </text>
          <text x={px(360)} y={H - 16} textAnchor="middle">
            360°
          </text>
          <text x={PAD.left - 8} y={py(0) + 4} textAnchor="end">
            0%
          </text>
          <text x={PAD.left - 8} y={py(0.5) + 4} textAnchor="end">
            50%
          </text>
          <text x={PAD.left - 8} y={py(1) + 4} textAnchor="end">
            100%
          </text>
          <text x={(PAD.left + px(360)) / 2} y={H - 2} textAnchor="middle">
            hue — S and L pinned at 100% / 50%
          </text>
          <text
            x={12}
            y={(py(0) + py(1)) / 2}
            textAnchor="middle"
            transform={`rotate(-90 12 ${(py(0) + py(1)) / 2})`}
          >
            light emitted
          </text>
        </g>
      </svg>

      <div className="mt-4 flex h-20 overflow-hidden rounded-lg border">
        <div className="flex-1" style={{ backgroundColor: hex }} />
        <div className="flex-1" style={{ backgroundColor: grayHex }} />
      </div>
      <div className="mt-2 flex font-mono text-[0.7rem] text-fg-muted">
        <span className="flex-1 text-center tabular-nums">
          hsl({Math.round(hue)} 100% 50%)
        </span>
        <span className="flex-1 text-center">its light, as gray</span>
      </div>

      <div className="mt-4 flex flex-col gap-3">
        <Slider
          aria-label="Hue"
          value={hue}
          onChange={(v) => setHue(v as number)}
          minValue={0}
          maxValue={360}
          step={1}
        >
          <SliderControl />
        </Slider>
        <Meter
          label="light emitted"
          value={y * 100}
          display={`${(y * 100).toFixed(1)}%`}
          fill={hex}
        />
        <Meter
          label="lightness (L*)"
          value={lstar}
          display={lstar.toFixed(0)}
          fill={hex}
        />
        <p className="text-sm text-fg-muted">
          The dashed line is the light a 50%-lightness <em>gray</em> emits. The
          curve is what "constant 50% lightness" actually delivers as the hue
          turns: 7% of white's light at blue, 93% at yellow.
        </p>
      </div>
    </Playground>
  )
}

function Meter({
  label,
  value,
  display,
  fill,
}: {
  label: string
  value: number
  display: string
  fill: string
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-26 shrink-0 text-xs text-fg-muted">{label}</span>
      <div className="h-2 flex-1 overflow-hidden rounded-full border">
        <div
          className="h-full"
          style={{ width: `${value}%`, backgroundColor: fill }}
        />
      </div>
      <span className="w-12 shrink-0 text-right font-mono text-xs text-fg-muted tabular-nums">
        {display}
      </span>
    </div>
  )
}
