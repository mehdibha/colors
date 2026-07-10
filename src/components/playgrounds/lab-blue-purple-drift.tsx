import { useState } from 'react'
import { converter, formatHex, interpolate } from 'culori'

import { Demo } from '@/components/demo'
import { Slider, SliderControl } from '@/ui/slider'

const toRgb = converter('rgb')
const toLch = converter('lch')
const toOklch = converter('oklch')

// #0033dd → white: both straight paths stay inside sRGB (verified)
const SEED = '#0033dd'
const N = 72

const labAt = interpolate([SEED, '#ffffff'], 'lab')
const okAt = interpolate([SEED, '#ffffff'], 'oklab')

const LAB_STRIP = Array.from({ length: N }, (_, i) =>
  formatHex(toRgb(labAt(i / (N - 1)))),
)
const OK_STRIP = Array.from({ length: N }, (_, i) =>
  formatHex(toRgb(okAt(i / (N - 1)))),
)

const LAB_HUE = Math.round(toLch(SEED)?.h ?? 0)
const OK_HUE = Math.round(toOklch(SEED)?.h ?? 0)

// hue isolated: same L and C for every chip, only the angle survives
const hueChip = (h: number) =>
  formatHex(toRgb({ mode: 'oklch', l: 0.7, c: 0.1, h }))

const START = 60

function Strip({
  label,
  strip,
  t,
}: {
  label: string
  strip: string[]
  t: number
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className="font-mono text-[0.7rem] tracking-wider text-fg-muted uppercase">
        {label}
      </span>
      <div className="relative flex h-12 overflow-hidden rounded-lg border">
        {strip.map((css, i) => (
          <div key={i} className="flex-1" style={{ backgroundColor: css }} />
        ))}
        <div
          className="absolute inset-y-0 w-0.5 bg-fg outline-1 outline-bg"
          style={{ left: `${t}%` }}
        />
      </div>
    </div>
  )
}

export function LabBluePurpleDrift() {
  const [t, setT] = useState(START)

  const rows = [
    { name: 'CIELAB', color: labAt(t / 100) },
    { name: 'OKLab', color: okAt(t / 100) },
  ].map((row) => ({
    ...row,
    hex: formatHex(toRgb(row.color)),
    seen: Math.round(toOklch(row.color)?.h ?? OK_HUE),
  }))

  return (
    <Demo
      caption={
        <>
          Each space fades the same blue toward white along its own straight
          line — its hue coordinate never moves. The readout is the measured
          hue: CIELAB's "constant hue" slides from {OK_HUE}° into the 290s —
          visibly purple — while OKLab's stays put. This is the spec's own
          diagnosis: "as a saturated blue has its Chroma progressively reduced,
          it becomes noticeably purple."
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <Strip
          label={`CIELAB — hue pinned at ${LAB_HUE}°`}
          strip={LAB_STRIP}
          t={t}
        />
        <Strip
          label={`OKLab — hue pinned at ${OK_HUE}°`}
          strip={OK_STRIP}
          t={t}
        />
      </div>

      <div className="mt-4">
        <Slider
          aria-label="Position along the fade"
          value={t}
          onChange={(v) => setT(v as number)}
          minValue={0}
          maxValue={92}
          step={1}
        >
          <SliderControl />
        </Slider>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {rows.map((row) => (
          <div
            key={row.name}
            className="flex items-center gap-3 rounded-lg border p-3"
          >
            <div
              className="size-12 shrink-0 rounded-md border"
              style={{ backgroundColor: row.hex }}
            />
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <span className="text-sm font-medium">{row.name}</span>
              <span className="flex items-center gap-2 text-xs text-fg-muted">
                measured hue
                <span
                  className="size-3.5 rounded-sm border"
                  style={{ backgroundColor: hueChip(row.seen) }}
                />
                <code className="font-mono tabular-nums">
                  {row.seen}°
                  {row.seen - OK_HUE !== 0 &&
                    ` (${row.seen - OK_HUE > 0 ? '+' : ''}${row.seen - OK_HUE}°)`}
                </code>
              </span>
            </div>
          </div>
        ))}
      </div>
    </Demo>
  )
}
