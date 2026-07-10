import { clampChroma, formatHex, wcagContrast, wcagLuminance } from 'culori'

import { Demo } from '@/components/demo'

// Six hues pinned to the same D65 CIELAB lightness; chroma clamped to sRGB.
const LSTAR = 49.8
const HUES = [25, 110, 145, 200, 260, 310]

const SWATCHES = HUES.map((h) => {
  const hex = formatHex(
    clampChroma({ mode: 'lch65', l: LSTAR, c: 60, h }, 'lch65'),
  )
  return {
    hex,
    y: wcagLuminance(hex),
    ratio: wcagContrast('#ffffff', hex),
  }
})

export function LstarLocksContrast() {
  return (
    <Demo
      caption={
        <>
          Six hues, one CIELAB lightness: L* 49.8. L* is a pure function of the
          Y in WCAG&rsquo;s formula, so pinning it pins the ratio — every swatch
          reads within a few hundredths of the analytic 4.52:1 against white,
          and the leftover wiggle is hex rounding. This is Accessible
          Palette&rsquo;s move: anchor in a lightness that <em>is</em>{' '}
          luminance, and the skeleton and the guarantee become the same
          decision.
        </>
      }
    >
      <div className="flex gap-1.5">
        {SWATCHES.map((s, i) => (
          <div
            key={i}
            className="flex min-w-0 flex-1 flex-col items-center gap-1"
          >
            <div
              className="flex h-14 w-full items-center justify-center rounded-md border text-sm font-medium text-white"
              style={{ backgroundColor: s.hex }}
            >
              Aa
            </div>
            <span className="font-mono text-[0.6rem] text-fg-muted tabular-nums">
              Y {s.y.toFixed(3)}
            </span>
            <span className="font-mono text-[0.6rem] text-fg tabular-nums">
              {s.ratio.toFixed(2)}:1
            </span>
          </div>
        ))}
      </div>
    </Demo>
  )
}
