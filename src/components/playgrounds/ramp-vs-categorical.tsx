import { useState } from 'react'
import { clampChroma, differenceEuclidean, formatHex } from 'culori'

import { Demo } from '@/components/demo'
import { ToggleButton } from '@/ui/toggle-button'
import { ToggleButtonGroup } from '@/ui/toggle-button-group'

const dEOK = differenceEuclidean('oklab')
const swatch = (l: number, c: number, h: number) =>
  formatHex(clampChroma({ mode: 'oklch', l, c, h }, 'oklch'))

// One blue in four lightnesses — the sequential shape, misused as categorical.
const RAMP = [
  swatch(0.82, 0.06, 250),
  swatch(0.64, 0.14, 250),
  swatch(0.48, 0.15, 250),
  swatch(0.32, 0.11, 250),
]
// Four hues at one lightness — the categorical shape (ch5's equal-lightness palette).
const CAT = [25, 140, 250, 320].map((h) => swatch(0.65, 0.11, h))

const HEIGHTS = [72, 44, 88, 58]
const LABELS = ['Search', 'Direct', 'Social', 'Email']

function minPair(p: string[]): number {
  let m = Infinity
  for (let i = 0; i < p.length; i++) {
    const a = p[i]
    if (!a) continue
    for (let j = i + 1; j < p.length; j++) {
      const b = p[j]
      if (!b) continue
      m = Math.min(m, dEOK(a, b))
    }
  }
  return Number.isFinite(m) ? m : 0
}

export function RampVsCategorical() {
  const [src, setSrc] = useState<'ramp' | 'hues'>('ramp')
  const palette = src === 'ramp' ? RAMP : CAT
  const min = minPair(palette)

  return (
    <Demo
      caption={
        <>
          Same four unordered categories, two palettes. The accent ramp is one
          hue in four lightnesses &mdash; it reads as an order the data
          doesn&rsquo;t have (&ldquo;Email is last&rdquo;), and its steps sit
          close by design. Four hues at one lightness read as peers, several
          times farther apart. The ramp only has one hue to give.
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <ToggleButtonGroup
          selectionMode="single"
          disallowEmptySelection
          selectedKeys={[src]}
          onSelectionChange={(keys) => {
            const next = [...keys][0]
            if (next === 'ramp' || next === 'hues') setSrc(next)
          }}
          size="sm"
          aria-label="Palette source"
          className="max-w-full overflow-x-auto"
        >
          <ToggleButton id="ramp">Accent ramp (3/5/7/9)</ToggleButton>
          <ToggleButton id="hues">Four hues, one lightness</ToggleButton>
        </ToggleButtonGroup>

        <div
          className="overflow-hidden rounded-lg border p-4"
          style={{ backgroundColor: '#ffffff' }}
        >
          <div className="flex h-40 items-end gap-4">
            {palette.map((hex, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-1">
                <div className="flex w-full flex-1 items-end">
                  <div
                    className="w-full rounded-t-sm"
                    style={{
                      height: `${HEIGHTS[i] ?? 0}%`,
                      backgroundColor: hex,
                    }}
                  />
                </div>
                <span className="text-[0.6rem]" style={{ color: '#6b7280' }}>
                  {LABELS[i]}
                </span>
              </div>
            ))}
          </div>
        </div>

        <span
          aria-live="polite"
          className="font-mono text-[0.65rem] text-fg-muted tabular-nums"
        >
          min pairwise ΔEOK {min.toFixed(2)} —{' '}
          {src === 'ramp'
            ? 'one hue, four lightnesses: ordered-looking and close'
            : 'four peers, comfortably apart'}
        </span>
      </div>
    </Demo>
  )
}
