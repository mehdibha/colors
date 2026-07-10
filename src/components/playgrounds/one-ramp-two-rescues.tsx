import { clampRgb, converter, formatHex, toGamut } from 'culori'

import { Demo } from '@/components/demo'

const toRgb = converter('rgb')
const toOklch = converter('oklch')
const mapToSrgb = toGamut('rgb', 'oklch')

const HUE = 264
const CHROMA = 0.3
const N = 10

// hue re-rendered at one fixed L/C — the steering instrument from chapter 5
const hueChip = (h: number) =>
  formatHex(toRgb({ mode: 'oklch', l: 0.7, c: 0.1, h }))

const STEPS = Array.from({ length: N }, (_, i) => {
  const l = 0.92 - (i * (0.92 - 0.35)) / (N - 1)
  const requested = { mode: 'oklch' as const, l, c: CHROMA, h: HUE }
  const clipped = clampRgb(toRgb(requested))
  const mapped = mapToSrgb(requested)
  return {
    css: `oklch(${l.toFixed(3)} ${CHROMA} ${HUE})`,
    clipHex: formatHex(clipped),
    clipHueChip: hueChip(toOklch(clipped).h ?? HUE),
    mapHex: formatHex(mapped),
    mapHueChip: hueChip(toOklch(mapped).h ?? HUE),
  }
})

function Strip({
  label,
  colors,
  hueChips,
}: {
  label: string
  colors: string[]
  hueChips?: string[]
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

export function OneRampTwoRescues() {
  return (
    <Demo
      caption={
        <>
          One ramp, written as constant chroma: ten steps of{' '}
          <code className="font-mono text-[0.8rem]">oklch(L 0.3 264)</code>, L
          from 0.92 down to 0.35 — every step out of gamut. The thin strips are
          the steering instrument from chapter 5: each step's hue, re-rendered
          at one fixed lightness and chroma. Clip bends the top of the ramp 34°
          toward cyan and darkens it (the L 0.92 step renders at L 0.83); its
          hue strip visibly turns. Chroma reduction holds lightness and hue
          essentially straight — within the mapping's just-noticeable tolerance
          — and quietly pays for it, draining the top step to C 0.042, a
          near-gray. On an sRGB screen the first two rows are identical: that's
          your browser choosing clip. On a P3 screen the top row stays a touch
          more vivid — same clip, wider tent.
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <Strip
          label="you wrote — browser renders"
          colors={STEPS.map((s) => s.css)}
        />
        <Strip
          label="per-channel clip"
          colors={STEPS.map((s) => s.clipHex)}
          hueChips={STEPS.map((s) => s.clipHueChip)}
        />
        <Strip
          label="CSS gamut map"
          colors={STEPS.map((s) => s.mapHex)}
          hueChips={STEPS.map((s) => s.mapHueChip)}
        />
      </div>
    </Demo>
  )
}
