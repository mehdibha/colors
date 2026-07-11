import {
  converter,
  fixupHueDecreasing,
  fixupHueIncreasing,
  fixupHueLonger,
  fixupHueShorter,
  formatHex,
  interpolate,
} from 'culori'

import { Demo } from '@/components/demo'

const toRgb = converter('rgb')
const toOklch = converter('oklch')

// the spec's own example pair: CSS Color 4 §13.4
const A = 'oklch(0.6 0.24 30)'
const B = 'oklch(0.8 0.15 90)'
const N = 48

const PATHS = [
  { css: 'shorter hue', fixup: fixupHueShorter },
  { css: 'longer hue', fixup: fixupHueLonger },
  { css: 'increasing hue', fixup: fixupHueIncreasing },
  { css: 'decreasing hue', fixup: fixupHueDecreasing },
] as const

const STRIPS = PATHS.map((path) => {
  // empty channel entries appease @types/culori; runtime ignores them
  const at = interpolate([A, B], 'oklch', {
    l: {},
    c: {},
    h: { fixup: path.fixup },
    alpha: {},
  })
  const midHue = toOklch(at(0.5)).h ?? 0
  return {
    css: path.css,
    hexes: Array.from({ length: N }, (_, i) =>
      formatHex(toRgb(at(i / (N - 1)))),
    ),
    midHue: Math.round(((midHue % 360) + 360) % 360),
  }
})

export function FourWaysAroundTheWheel() {
  return (
    <Demo
      caption={
        <>
          The spec's own example pair: a red at hue 30° and a yellow at 90°.{' '}
          <code className="font-mono text-[0.8rem]">shorter</code> takes the 60°
          arc through orange;{' '}
          <code className="font-mono text-[0.8rem]">longer</code> takes the
          other 300°, through blue and green. The last two don't measure arcs at
          all — they impose a direction: the angle may only rise, or only fall.
          Here increasing lands on shorter's road and decreasing on longer's,
          but that's this pair's accident, not a rule — flip the endpoints and
          they trade places, while shorter and longer stay put.
        </>
      }
    >
      <div className="flex flex-col gap-3">
        {STRIPS.map((strip) => (
          <div key={strip.css} className="flex flex-col gap-1.5">
            <div className="flex items-baseline justify-between">
              <span className="font-mono text-[0.7rem] text-fg-muted">
                in oklch {strip.css}
              </span>
              <span className="font-mono text-[0.7rem] text-fg-muted tabular-nums">
                mid hue {strip.midHue}°
              </span>
            </div>
            <div className="flex h-8 overflow-hidden rounded-lg border">
              {strip.hexes.map((hex, i) => (
                <div
                  key={i}
                  className="flex-1"
                  style={{ backgroundColor: hex }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </Demo>
  )
}
