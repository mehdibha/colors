import { useState } from 'react'
import { converter, formatHex, wcagLuminance } from 'culori'

import { Demo } from '@/components/demo'
import { Switch } from '@/ui/switch'

const toRgb = converter('rgb')
const toLab = converter('lab')

const HUES = [0, 45, 90, 135, 180, 225, 270, 315]

const SWATCHES = HUES.map((h) => {
  const rgb = toRgb({ mode: 'hsl', h, s: 0.7, l: 0.55 })
  const y = wcagLuminance(rgb)
  return {
    h,
    hex: formatHex(rgb),
    gray: formatHex(toRgb({ mode: 'lrgb', r: y, g: y, b: y })),
    lstar: Math.round(toLab(rgb).l),
  }
})

export function EqualLightnessPalette() {
  const [grayscale, setGrayscale] = useState(false)

  return (
    <Demo
      caption={
        <>
          Eight hues from one recipe —{' '}
          <code className="font-mono text-[0.8rem]">hsl(h 70% 55%)</code>. The
          notation swears they all share a lightness of 55%. The grays are what
          your eye actually receives: they span L* 43 to 81 — from darker than
          chapter 3's halfway gray to lighter than its three-quarters gray.
        </>
      }
    >
      <div className="flex h-20 overflow-hidden rounded-lg border">
        {SWATCHES.map((s) => (
          <div
            key={s.h}
            className="flex-1"
            style={{ backgroundColor: grayscale ? s.gray : s.hex }}
          />
        ))}
      </div>
      <div className="mt-2 flex font-mono text-[0.7rem] text-fg-muted">
        {SWATCHES.map((s) => (
          <span key={s.h} className="flex-1 text-center tabular-nums">
            {grayscale ? `L* ${s.lstar}` : `${s.h}°`}
          </span>
        ))}
      </div>
      <div className="mt-3">
        <Switch isSelected={grayscale} onChange={setGrayscale} size="sm">
          Show the light each swatch emits — luminance-matched grays
        </Switch>
      </div>
    </Demo>
  )
}
