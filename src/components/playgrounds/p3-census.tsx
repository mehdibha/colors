import { useState } from 'react'
import {
  clampRgb,
  converter,
  differenceEuclidean,
  displayable,
  formatHex,
  inGamut,
} from 'culori'

import { Demo } from '@/components/demo'
import { ToggleButton } from '@/ui/toggle-button'

import {
  TW_FAMILIES,
  TW_STEPS,
  twCss,
  twFamily,
  twOklch,
} from './tailwind-v4-palette'

const toRgb = converter('rgb')
const dEok = differenceEuclidean('oklab')
const inP3 = inGamut('p3')

const CELLS = TW_FAMILIES.map((f) => ({
  name: f.name,
  steps: f.steps.map((s) => {
    const raw = twOklch(s)
    const out = !displayable(raw)
    return {
      css: twCss(s),
      out,
      clip: out ? dEok(raw, clampRgb(toRgb(raw))) : 0,
      p3: inP3(raw),
    }
  }),
}))

const OUT_COUNT = CELLS.flatMap((f) => f.steps).filter((s) => s.out).length
const JND_COUNT = CELLS.flatMap((f) => f.steps).filter(
  (s) => s.clip > 0.02,
).length
const ALL_IN_P3 = CELLS.flatMap((f) => f.steps).every((s) => s.p3)

const Y400 = twFamily('yellow').steps[4] ?? [85.2, 0.199, 91.936]
const Y400_HEX = formatHex(clampRgb(toRgb(twOklch(Y400))))

export function P3Census() {
  const [marked, setMarked] = useState(true)

  return (
    <Demo
      caption={
        <>
          The census: {OUT_COUNT} of 286 values sit outside sRGB — every
          chromatic family, none of the neutrals — and all 286 fit inside P3
          {ALL_IN_P3 ? '' : ' (!)'}. They ship as bare <code>oklch()</code>{' '}
          literals, so an sRGB screen gets chapter 6&rsquo;s browser clip: mild,
          at worst ΔEok 0.026 at yellow-400, with {JND_COUNT} values above the
          0.02 JND. The pair proves it on your hardware: both chips are
          yellow-400 — the left one the shipped literal, the right one pinned to
          the clipped sRGB hex {Y400_HEX}. Identical on an sRGB screen; on a P3
          display the left is visibly more vivid.
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <ToggleButton
          size="sm"
          isSelected={marked}
          onChange={setMarked}
          aria-label="Mark values sRGB cannot paint"
          className="self-start"
        >
          Mark what sRGB can&rsquo;t paint
        </ToggleButton>

        <div className="overflow-x-auto">
          <div className="flex min-w-105 flex-col gap-0.5">
            {CELLS.map((f) => (
              <div key={f.name} className="flex items-center gap-0.5">
                <span className="w-14 shrink-0 truncate text-[0.55rem] text-fg-muted">
                  {f.name}
                </span>
                {f.steps.map((s, i) => (
                  <div
                    key={TW_STEPS[i]}
                    className="flex h-4 flex-1 items-center justify-center rounded-xs"
                    style={{ backgroundColor: s.css }}
                  >
                    {marked && s.out && (
                      <span
                        aria-hidden
                        className="size-1 rounded-full bg-white mix-blend-difference"
                      />
                    )}
                  </div>
                ))}
              </div>
            ))}
            <div className="flex items-center gap-0.5">
              <span className="w-14 shrink-0" />
              {TW_STEPS.map((s) => (
                <span
                  key={s}
                  className="flex-1 text-center font-mono text-[0.5rem] text-fg-muted tabular-nums"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex overflow-hidden rounded-md border">
            <div
              className="h-12 w-20"
              style={{ backgroundColor: twCss(Y400) }}
            />
            <div className="h-12 w-20" style={{ backgroundColor: Y400_HEX }} />
          </div>
          <span className="text-xs text-fg-muted">
            yellow-400: shipped literal vs clipped sRGB hex — a seam here means
            your screen is wide-gamut
          </span>
        </div>
      </div>
    </Demo>
  )
}
