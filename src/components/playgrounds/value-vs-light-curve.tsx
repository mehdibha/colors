import { useState } from 'react'
import { converter } from 'culori'

import { Demo } from '@/components/demo'
import { Slider, SliderControl } from '@/ui/slider'

const toLrgb = converter('lrgb')

const lightOf = (code: number) =>
  toLrgb({ mode: 'rgb', r: code / 255, g: code / 255, b: code / 255 }).r

const W = 480
const H = 280
const PAD = { left: 44, right: 12, top: 12, bottom: 36 }

const px = (code: number) =>
  PAD.left + (code / 255) * (W - PAD.left - PAD.right)
const py = (light: number) => PAD.top + (1 - light) * (H - PAD.top - PAD.bottom)

const curve = Array.from({ length: 65 }, (_, i) => {
  const code = (i / 64) * 255
  return `${i === 0 ? 'M' : 'L'}${px(code).toFixed(1)},${py(lightOf(code)).toFixed(1)}`
}).join(' ')

export function ValueVsLightCurve() {
  const [code, setCode] = useState(128)

  const light = lightOf(code)
  const css = `rgb(${code} ${code} ${code})`

  return (
    <Demo
      caption={
        <>
          The sRGB decode curve: value in, light out. The dashed diagonal is the
          assumption — that the value <em>is</em> the light. Halfway up the
          values buys 22% of the light; half the light costs 188 of the 255.
        </>
      }
    >
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-auto w-full text-fg"
        role="img"
        aria-label="sRGB decode curve: light emitted as a function of the value"
      >
        <line
          x1={PAD.left}
          y1={py(0)}
          x2={px(255)}
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
          y1={py(0.5)}
          x2={px(255)}
          y2={py(0.5)}
          stroke="currentColor"
          strokeOpacity={0.1}
        />
        <line
          x1={px(0)}
          y1={py(0)}
          x2={px(255)}
          y2={py(1)}
          stroke="currentColor"
          strokeOpacity={0.25}
          strokeDasharray="4 4"
        />
        <path d={curve} fill="none" stroke="currentColor" strokeWidth={2} />
        <line
          x1={px(code)}
          y1={py(0)}
          x2={px(code)}
          y2={py(light)}
          stroke="currentColor"
          strokeOpacity={0.4}
          strokeDasharray="3 3"
        />
        <line
          x1={PAD.left}
          y1={py(light)}
          x2={px(code)}
          y2={py(light)}
          stroke="currentColor"
          strokeOpacity={0.4}
          strokeDasharray="3 3"
        />
        <circle
          cx={px(code)}
          cy={py(light)}
          r={5}
          fill={css}
          stroke="currentColor"
        />
        <g
          className="font-mono text-[0.65rem]"
          fill="currentColor"
          fillOpacity={0.55}
        >
          <text x={px(0)} y={H - 16} textAnchor="middle">
            0
          </text>
          <text x={px(128)} y={H - 16} textAnchor="middle">
            128
          </text>
          <text x={px(255)} y={H - 16} textAnchor="middle">
            255
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
          <text x={(PAD.left + px(255)) / 2} y={H - 2} textAnchor="middle">
            value
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

      <div className="mt-4 flex flex-col gap-2">
        <Slider
          aria-label="Value"
          value={code}
          onChange={(v) => setCode(v as number)}
          minValue={0}
          maxValue={255}
          step={1}
        >
          <SliderControl />
        </Slider>
        <p className="text-sm text-fg-muted">
          <code className="font-mono text-[0.8rem]">
            rgb({code} {code} {code})
          </code>{' '}
          —{' '}
          <span className="font-mono tabular-nums">
            {Math.round((code / 255) * 100)}%
          </span>{' '}
          of the value scale, emits{' '}
          <span className="font-mono tabular-nums">
            {(light * 100).toFixed(1)}%
          </span>{' '}
          of white's light.
        </p>
      </div>
    </Demo>
  )
}
