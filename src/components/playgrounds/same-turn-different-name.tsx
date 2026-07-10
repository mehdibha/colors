import { useState } from 'react'
import { differenceEuclidean, displayable, formatHex } from 'culori'

import { Demo } from '@/components/demo'
import { Slider, SliderControl } from '@/ui/slider'

const maxChroma = (l: number, h: number) => {
  let lo = 0
  let hi = 0.45
  for (let k = 0; k < 22; k++) {
    const mid = (lo + hi) / 2
    if (displayable({ mode: 'oklch', l, c: mid, h })) lo = mid
    else hi = mid
  }
  return lo
}

// The largest chroma a patch can carry across the whole ±30° turn without leaving sRGB.
const bandMin = (l: number, h0: number) => {
  let c = 0.45
  for (let h = h0 - 30; h <= h0 + 30; h += 2) c = Math.min(c, maxChroma(l, h))
  return c
}

const YELLOW = { label: 'Yellow', l: 0.9, h: 110 }
const BLUE = { label: 'Blue', l: 0.55, h: 250 }
// One shared chroma so both turns are the same OKLCH move.
const C = Math.min(bandMin(YELLOW.l, YELLOW.h), bandMin(BLUE.l, BLUE.h))

const dEOK = differenceEuclidean('oklab')
const swatch = (l: number, h: number) =>
  formatHex({ mode: 'oklch', l, c: C, h })

export function SameTurnDifferentName() {
  const [turn, setTurn] = useState(-20)

  const pairs = [YELLOW, BLUE].map((p) => ({
    ...p,
    base: swatch(p.l, p.h),
    turned: swatch(p.l, p.h + turn),
    dE: dEOK(
      { mode: 'oklch', l: p.l, c: C, h: p.h },
      { mode: 'oklch', l: p.l, c: C, h: p.h + turn },
    ),
  }))

  return (
    <Demo
      caption={
        <>
          Both patches carry the same chroma (C {C.toFixed(3)}), so an equal
          turn is an equal OKLCH move &mdash; and &Delta;EOK confirms it, degree
          for degree. The space is telling the truth about <em>difference</em>.
          What it doesn&rsquo;t measure is <em>naming</em>: &ldquo;blue&rdquo;
          covers a wide arc of the wheel, and yellow is a sliver with green on
          one side and orange on the other.
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <span className="shrink-0 text-xs text-fg-muted">Turn</span>
          <Slider
            aria-label="Hue turn in degrees"
            value={turn}
            onChange={(v) => setTurn(v as number)}
            minValue={-30}
            maxValue={30}
            step={1}
            className="flex-1"
          >
            <SliderControl />
          </Slider>
          <span className="w-12 shrink-0 text-right font-mono text-xs text-fg-muted tabular-nums">
            {turn > 0 ? '+' : ''}
            {turn}&deg;
          </span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {pairs.map((p, idx) => (
            <div key={p.label} className="flex flex-col gap-2">
              <div className="flex gap-1">
                <div className="flex min-w-0 flex-1 flex-col items-center gap-1">
                  <div
                    className="h-16 w-full rounded-md border"
                    style={{ backgroundColor: p.base }}
                  />
                  <span className="font-mono text-[0.6rem] text-fg-muted tabular-nums">
                    h {p.h}&deg;
                  </span>
                </div>
                <div className="flex min-w-0 flex-1 flex-col items-center gap-1">
                  <div
                    className="h-16 w-full rounded-md border"
                    style={{ backgroundColor: p.turned }}
                  />
                  <span className="font-mono text-[0.6rem] text-fg-muted tabular-nums">
                    h {p.h + turn}&deg;
                  </span>
                </div>
              </div>
              <span
                className="text-center font-mono text-xs text-fg-muted tabular-nums"
                // both ΔEOK values are equal by construction — announce once
                aria-live={idx === 0 ? 'polite' : undefined}
              >
                {p.label}: &Delta;EOK {p.dE.toFixed(3)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </Demo>
  )
}
