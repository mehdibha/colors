import { useState } from 'react'
import type { Color } from 'culori'
import { converter, formatHex, wcagLuminance } from 'culori'

import { Demo } from '@/components/demo'
import { Switch } from '@/ui/switch'

const toRgb = converter('rgb')

// the gray emitting the same light: sRGB-encode the luminance
const grayOf = (y: number) => {
  const v = y <= 0.0031308 ? y * 12.92 : 1.055 * y ** (1 / 2.4) - 0.055
  return Math.round(v * 255)
}

const N = 72

const slices = (colorAt: (hue: number) => Color) =>
  Array.from({ length: N }, (_, i) => {
    const color = colorAt((i * 360) / N)
    const gray = grayOf(wcagLuminance(color))
    return {
      css: formatHex(toRgb(color)),
      grayCss: `rgb(${gray} ${gray} ${gray})`,
    }
  })

const HSL_STRIP = slices((h) => ({ mode: 'hsl', h, s: 1, l: 0.5 }))
// C=0.10 stays inside sRGB at L=0.70 for every hue
const OK_STRIP = slices((h) => ({ mode: 'oklch', l: 0.7, c: 0.1, h }))

function Strip({
  label,
  strip,
  twins,
}: {
  label: string
  strip: typeof HSL_STRIP
  twins: boolean
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className="font-mono text-[0.7rem] tracking-wider text-fg-muted uppercase">
        {label}
      </span>
      <div className="flex h-10 overflow-hidden rounded-lg border">
        {strip.map((slice, i) => (
          <div
            key={i}
            className="flex-1"
            style={{ backgroundColor: twins ? slice.grayCss : slice.css }}
          />
        ))}
      </div>
    </div>
  )
}

export function HslVsOklchStrips() {
  const [twins, setTwins] = useState(false)

  return (
    <Demo
      caption={
        <>
          Same sweep, two spaces: hue 0–360°, lightness channel held. As gray
          twins, the HSL strip is a mountain range; the OKLCH strip is a nearly
          flat band. Not perfectly flat — perceptual lightness is not a light
          meter, and chapter 5 explains the difference — but it keeps its
          promise.
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <Strip label="hsl(h 100% 50%)" strip={HSL_STRIP} twins={twins} />
        <Strip label="oklch(0.70 0.10 h)" strip={OK_STRIP} twins={twins} />
      </div>
      <div className="mt-3">
        <Switch isSelected={twins} onChange={setTwins} size="sm">
          Show gray twins — each slice as the gray emitting the same light
        </Switch>
      </div>
    </Demo>
  )
}
