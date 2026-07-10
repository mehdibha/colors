import { clampRgb, converter, formatHex, interpolate, toGamut } from 'culori'

import { Demo } from '@/components/demo'

const toRgb = converter('rgb')
const toOklch = converter('oklch')
const mapToSrgb = toGamut('rgb', 'oklch')

const N = 64
const EPS = 1e-6

// chapter 5's steering instrument
const hueChip = (h: number | undefined) =>
  formatHex(
    toRgb({ mode: 'oklch', l: 0.7, c: h === undefined ? 0 : 0.1, h: h ?? 0 }),
  )

const at = interpolate(['#0000ff', '#ffff00'], 'oklch')
const SAMPLES = Array.from({ length: N }, (_, i) => at(i / (N - 1)))

const OUT_MASK = SAMPLES.map((c) => {
  const rgb = toRgb(c)
  return ![rgb.r, rgb.g, rgb.b].every((v) => v >= -EPS && v <= 1 + EPS)
})
const OUT_PCT = Math.round((OUT_MASK.filter(Boolean).length / N) * 100)

const CLIPPED = SAMPLES.map((c) => clampRgb(toRgb(c)))
const MAPPED = SAMPLES.map((c) => mapToSrgb(c))

function Strip({
  label,
  colors,
  hueChips,
}: {
  label: string
  colors: (string | undefined)[]
  hueChips?: (string | undefined)[]
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="font-mono text-[0.7rem] tracking-wider text-fg-muted uppercase">
        {label}
      </span>
      <div className="flex h-12 overflow-hidden rounded-lg border">
        {colors.map((c, i) => (
          <div key={i} className="flex-1" style={{ backgroundColor: c }} />
        ))}
      </div>
      {hueChips && (
        <div className="flex h-3 overflow-hidden rounded-sm border">
          {hueChips.map((c, i) => (
            <div key={i} className="flex-1" style={{ backgroundColor: c }} />
          ))}
        </div>
      )}
    </div>
  )
}

export function GamutDoorGradient() {
  return (
    <Demo
      caption={
        <>
          Both endpoints are plain sRGB colors — every screen shows them
          exactly. The road between them, taken in OKLCH, spends {OUT_PCT}% of
          its length outside sRGB (the ticks). Chapter 6's door, met per pixel:
          the browser rescues each one with per-channel clip, so on an sRGB
          screen the top row and the clip row match exactly — watch the clip
          row's hue strip wobble off course where the overshoot is worst. The
          gamut-map row is the spec's rescue: hue held straight, chroma quietly
          drained. On a P3 screen the top row stays more vivid through the
          middle — a wider tent, the same door.
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <span className="font-mono text-[0.7rem] tracking-wider text-fg-muted uppercase">
            you wrote in oklch — browser renders
          </span>
          <div
            className="h-12 rounded-lg border"
            style={{
              background:
                'linear-gradient(90deg in oklch, rgb(0 0 255), rgb(255 255 0))',
            }}
          />
          <div className="flex h-1">
            {OUT_MASK.map((out, i) => (
              <div key={i} className={out ? 'flex-1 bg-fg/60' : 'flex-1'} />
            ))}
          </div>
        </div>
        <Strip
          label="per-channel clip"
          colors={CLIPPED.map((c) => formatHex(c))}
          hueChips={CLIPPED.map((c) => hueChip(toOklch(c).h))}
        />
        <Strip
          label="CSS gamut map"
          colors={MAPPED.map((c) => formatHex(c))}
          hueChips={MAPPED.map((c) => hueChip(toOklch(c).h))}
        />
      </div>
    </Demo>
  )
}
