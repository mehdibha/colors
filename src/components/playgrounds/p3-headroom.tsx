import { displayable, inGamut } from 'culori'

import { Demo } from '@/components/demo'

const inP3 = inGamut('p3')

const maxChroma = (
  l: number,
  h: number,
  test: (color: { mode: 'oklch'; l: number; c: number; h: number }) => boolean,
) => {
  let lo = 0
  let hi = 0.45
  for (let k = 0; k < 22; k++) {
    const mid = (lo + hi) / 2
    if (test({ mode: 'oklch', l, c: mid, h })) lo = mid
    else hi = mid
  }
  return lo
}

// solid-step territory at three hues
const SPOTS = [
  { name: 'a blue solid', l: 0.649, h: 252 },
  { name: 'a green solid', l: 0.55, h: 152 },
  { name: 'a red solid', l: 0.63, h: 25 },
].map((spot) => {
  const srgb = maxChroma(spot.l, spot.h, displayable)
  const p3 = maxChroma(spot.l, spot.h, inP3)
  return { ...spot, srgb, p3, gain: Math.round((p3 / srgb - 1) * 100) }
})

export function P3Headroom() {
  return (
    <Demo
      caption={
        <>
          Each row: the same lightness and hue at its sRGB ceiling (left) and
          its Display P3 ceiling (right). On a P3 screen the right column is
          visibly more vivid, and the green row most of all: P3&rsquo;s extra
          volume lives mostly in the greens and reds. On an sRGB screen your
          browser clips the right swatch back to the boundary &mdash; near the
          left one, but not exactly on it: clip trades the extra chroma for a
          small shift in lightness and hue, chapter 6&rsquo;s lesson running
          live in this demo.
        </>
      }
    >
      <div className="flex flex-col gap-3">
        {SPOTS.map((spot) => (
          <div key={spot.name} className="flex items-center gap-3">
            <span className="w-24 shrink-0 text-xs text-fg-muted">
              {spot.name}
            </span>
            <div className="flex flex-1 gap-1.5">
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <div
                  className="h-12 rounded-md border"
                  style={{
                    backgroundColor: `oklch(${spot.l} ${spot.srgb.toFixed(3)} ${spot.h})`,
                  }}
                />
                <span className="font-mono text-[0.65rem] text-fg-muted tabular-nums">
                  sRGB max — C {spot.srgb.toFixed(3)}
                </span>
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <div
                  className="h-12 rounded-md border"
                  style={{
                    backgroundColor: `oklch(${spot.l} ${spot.p3.toFixed(3)} ${spot.h})`,
                  }}
                />
                <span className="font-mono text-[0.65rem] text-fg-muted tabular-nums">
                  P3 max — C {spot.p3.toFixed(3)} (+{spot.gain}%)
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Demo>
  )
}
