import { converter, formatHex, toGamut } from 'culori'

import { Demo } from '@/components/demo'

const toOklch = converter('oklch')
// display-only: some Tailwind steps sit outside sRGB, so the dot fill is gamut-mapped (plotted c stays exact)
const fillFor = (l: number, c: number, h: number) =>
  formatHex(toGamut('rgb', 'oklch')({ mode: 'oklch', l, c, h }))

// Radix blue, light mode (radix-ui/colors src/light.ts).
const RADIX_BLUE = [
  '#fbfdff',
  '#f4faff',
  '#e6f4fe',
  '#d5efff',
  '#c2e5ff',
  '#acd8fc',
  '#8ec8f6',
  '#5eb1ef',
  '#0090ff',
  '#0588f0',
  '#0d74ce',
  '#113264',
].map((hex, i) => ({
  label: `${i + 1}`,
  c: toOklch(hex)?.c ?? 0,
  fill: hex,
}))

// Tailwind v4 blue (tailwindcss theme.css, verbatim oklch values).
const TW_BLUE = [
  { label: '50', l: 0.97, c: 0.014, h: 254.604 },
  { label: '100', l: 0.932, c: 0.032, h: 255.585 },
  { label: '200', l: 0.882, c: 0.059, h: 254.128 },
  { label: '300', l: 0.809, c: 0.105, h: 251.813 },
  { label: '400', l: 0.707, c: 0.165, h: 254.624 },
  { label: '500', l: 0.623, c: 0.214, h: 259.815 },
  { label: '600', l: 0.546, c: 0.245, h: 262.881 },
  { label: '700', l: 0.488, c: 0.243, h: 264.376 },
  { label: '800', l: 0.424, c: 0.199, h: 265.638 },
  { label: '900', l: 0.379, c: 0.146, h: 265.522 },
  { label: '950', l: 0.282, c: 0.091, h: 267.935 },
].map((s) => ({
  label: s.label,
  c: s.c,
  fill: fillFor(s.l, s.c, s.h),
}))

const W = 260
const H = 150
const PAD = { left: 32, right: 10, top: 16, bottom: 22 }
const C_TOP = 0.26

function Arc({
  title,
  steps,
  peakNote,
}: {
  title: string
  steps: { label: string; c: number; fill: string }[]
  peakNote: string
}) {
  const px = (i: number) =>
    PAD.left + (i / (steps.length - 1)) * (W - PAD.left - PAD.right)
  const py = (c: number) =>
    PAD.top + (1 - c / C_TOP) * (H - PAD.top - PAD.bottom)
  const peak = steps.reduce(
    (bi, s, i, a) => (s.c > (a[bi]?.c ?? 0) ? i : bi),
    0,
  )
  const path = steps
    .map(
      (s, i) =>
        `${i === 0 ? 'M' : 'L'}${px(i).toFixed(1)},${py(s.c).toFixed(1)}`,
    )
    .join(' ')
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-medium">{title}</span>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-auto w-full text-fg"
        role="img"
        aria-label={`Chroma per step for ${title}`}
      >
        <line
          x1={PAD.left}
          y1={py(0)}
          x2={px(steps.length - 1)}
          y2={py(0)}
          stroke="currentColor"
          strokeOpacity={0.25}
        />
        <line
          x1={PAD.left}
          y1={py(0)}
          x2={PAD.left}
          y2={py(C_TOP)}
          stroke="currentColor"
          strokeOpacity={0.25}
        />
        <path d={path} fill="none" stroke="currentColor" strokeOpacity={0.4} />
        {steps.map((s, i) => (
          <circle
            key={s.label}
            cx={px(i)}
            cy={py(s.c)}
            r={i === peak ? 5 : 3.5}
            fill={s.fill}
            stroke="currentColor"
            strokeOpacity={i === peak ? 0.9 : 0.35}
          />
        ))}
        <g
          className="font-mono text-[0.6rem]"
          fill="currentColor"
          fillOpacity={0.55}
        >
          <text x={px(0)} y={H - 6} textAnchor="middle">
            {steps[0]?.label}
          </text>
          <text x={px(steps.length - 1)} y={H - 6} textAnchor="middle">
            {steps[steps.length - 1]?.label}
          </text>
          <text x={PAD.left - 5} y={py(C_TOP) + 4} textAnchor="end">
            {C_TOP}
          </text>
          <text x={PAD.left - 5} y={py(0) + 4} textAnchor="end">
            0
          </text>
          <text
            x={px(peak)}
            y={py(steps[peak]?.c ?? 0) - 9}
            textAnchor="middle"
          >
            {(steps[peak]?.c ?? 0).toFixed(3)}
          </text>
        </g>
      </svg>
      <span className="font-mono text-[0.65rem] text-fg-muted tabular-nums">
        {peakNote}
      </span>
    </div>
  )
}

export function RealChromaArcs() {
  return (
    <Demo
      caption={
        <>
          Chroma per step, measured off two shipped blues. Same arc in both
          dialects: near-zero on the paper steps, a peak at the solid, a taper
          into the text steps that never reaches zero &mdash; Radix step 12
          keeps C 0.096, a <em>blue</em> near-black, not a gray one.
        </>
      }
    >
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Arc
          title="Radix blue"
          steps={RADIX_BLUE}
          peakNote={`rises 0.003 → peaks 0.193 at step 9 → tapers to 0.096`}
        />
        <Arc
          title="Tailwind blue"
          steps={TW_BLUE}
          peakNote={`rises 0.014 → peaks 0.245 at 600 → tapers to 0.091`}
        />
      </div>
    </Demo>
  )
}
