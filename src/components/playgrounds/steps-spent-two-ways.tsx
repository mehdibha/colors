import { converter } from 'culori'

import { Demo } from '@/components/demo'

const toRgb = converter('rgb')

const STEPS = 16

const valueSteps = Array.from({ length: STEPS }, (_, i) =>
  Math.round((i / (STEPS - 1)) * 255),
)

const lightSteps = Array.from({ length: STEPS }, (_, i) => {
  const linear = i / (STEPS - 1)
  return Math.round(
    toRgb({ mode: 'lrgb', r: linear, g: linear, b: linear }).r * 255,
  )
})

function Ramp({ label, codes }: { label: string; codes: number[] }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="font-mono text-[0.7rem] tracking-wider text-fg-muted uppercase">
        {label}
      </span>
      <div className="flex h-10 overflow-hidden rounded-lg border">
        {codes.map((code, i) => (
          <div
            key={i}
            className="flex-1"
            style={{ backgroundColor: `rgb(${code} ${code} ${code})` }}
          />
        ))}
      </div>
      <div className="hidden font-mono text-[0.6rem] text-fg-muted sm:flex">
        {codes.map((code, i) => (
          <span key={i} className="flex-1 text-center">
            {code}
          </span>
        ))}
      </div>
    </div>
  )
}

export function StepsSpentTwoWays() {
  return (
    <Demo
      caption={
        <>
          Sixteen even steps, spent two ways. Stepping the light evenly blows
          past the darks — the first step out of black already lands on value 73
          — then crawls through near-identical brights. Stepping the value
          evenly spends steps roughly where your eyes can use them. That's the
          job gamma encoding does for all 256 values.
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <Ramp label="Even steps in value" codes={valueSteps} />
        <Ramp label="Even steps in light" codes={lightSteps} />
      </div>
    </Demo>
  )
}
