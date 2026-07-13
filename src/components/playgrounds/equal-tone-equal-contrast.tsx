import { useState } from 'react'
import { wcagContrast } from 'culori'

import { Demo } from '@/components/demo'
import { Slider, SliderControl } from '@/ui/slider'

import { approxToneHex, ratioOfTones } from './material-hct-data'

const HUES = [0, 60, 120, 180, 240, 300]

export function EqualToneEqualContrast() {
  const [tone, setTone] = useState(60)

  const swatches = HUES.map((h) => {
    const hex = approxToneHex(h, 48, tone)
    return { h, hex, ratio: wcagContrast(hex, '#ffffff') }
  })
  const ratios = swatches.map((s) => s.ratio)
  const min = Math.min(...ratios)
  const max = Math.max(...ratios)
  const predicted = ratioOfTones(tone, 100)

  return (
    <Demo
      caption={
        <>
          Six hues, one tone. Chapter 11 measured OKLCH L breaking this exact
          promise — a fixed L 0.62 slid from 4.00:1 to 3.39:1 as the hue turned.
          Tone can&rsquo;t slide, because tone <em>is</em> L* and L* is a pure
          function of the luminance inside WCAG&rsquo;s formula. The hue and
          chroma knobs are free; the contrast knob is welded shut.
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <span className="shrink-0 text-xs text-fg-muted">Tone</span>
          <Slider
            aria-label="Tone"
            value={tone}
            onChange={(v) => setTone(v as number)}
            minValue={30}
            maxValue={75}
            step={1}
            className="flex-1"
          >
            <SliderControl />
          </Slider>
          <span className="w-8 shrink-0 text-right font-mono text-xs text-fg-muted tabular-nums">
            {tone}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
          {swatches.map((s) => (
            <div key={s.h} className="flex flex-col items-center gap-1">
              <div
                className="h-14 w-full rounded-md border"
                style={{ backgroundColor: s.hex }}
              />
              <span className="font-mono text-[0.6rem] text-fg-muted tabular-nums">
                {s.ratio.toFixed(2)}:1
              </span>
            </div>
          ))}
        </div>

        <p aria-live="polite" className="text-sm text-fg-muted tabular-nums">
          Predicted from the tone alone: {predicted.toFixed(2)}:1 against white.
          Measured across all six hues: {min.toFixed(2)}–{max.toFixed(2)}
          :1 — the spread is hex rounding, nothing else.
        </p>
      </div>
    </Demo>
  )
}
