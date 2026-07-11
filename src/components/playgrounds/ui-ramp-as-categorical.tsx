import { useState } from 'react'
import { clampChroma, differenceEuclidean, formatHex } from 'culori'

import { Demo } from '@/components/demo'
import { ToggleButton } from '@/ui/toggle-button'
import { ToggleButtonGroup } from '@/ui/toggle-button-group'

const dEok = differenceEuclidean('oklab')

// Radix blue light, steps 5–9.
const RAMP = ['#c2e5ff', '#acd8fc', '#8ec8f6', '#5eb1ef', '#0090ff']

// Engine categorical: hues spread from the accent seed, L staggered per ch19's generator.
const CATEGORICAL = [251, 323, 35, 107, 179].map((h, i) => {
  const offs = [0, 0.11, -0.09]
  return (
    formatHex(
      clampChroma(
        { mode: 'oklch', l: 0.62 + (offs[i % 3] ?? 0), c: 0.15, h },
        'oklch',
      ),
    ) ?? '#000000'
  )
})

const SERIES = ['Search', 'Direct', 'Social', 'Referral', 'Email']

// 5 series × 8 points, crossing lines.
const POINTS = SERIES.map((_, s) =>
  Array.from(
    { length: 8 },
    (_, i) =>
      50 + 30 * Math.sin((i / 7) * Math.PI * 1.4 + s * 1.3) + (s - 2) * 6,
  ),
)

function minPair(colors: string[]) {
  let min = Infinity
  for (const [i, a] of colors.entries())
    for (const b of colors.slice(i + 1)) min = Math.min(min, dEok(a, b))
  return min
}

const RAMP_MIN = minPair(RAMP)
const CAT_MIN = minPair(CATEGORICAL)

type Choice = 'ramp' | 'categorical'

export function UiRampAsCategorical() {
  const [choice, setChoice] = useState<Choice>('ramp')
  const colors = choice === 'ramp' ? RAMP : CATEGORICAL
  const min = choice === 'ramp' ? RAMP_MIN : CAT_MIN

  return (
    <Demo
      caption={
        <>
          Five traffic sources on the accent ramp&rsquo;s steps 5&ndash;9 versus
          five generated series colors. The ramp&rsquo;s closest pair sits at
          &Delta;Eok 0.045 &mdash; two just-noticeable differences &mdash; and
          the shared hue reads as one ordered thing: which line is
          &ldquo;Social&rdquo;? The categorical palette&rsquo;s worst pair is
          0.19, four times farther apart, and no line outranks another.
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-fg-muted">Color the series with</span>
          <ToggleButtonGroup
            selectionMode="single"
            disallowEmptySelection
            selectedKeys={[choice]}
            onSelectionChange={(keys) => {
              const next = [...keys][0]
              if (next === 'ramp' || next === 'categorical') setChoice(next)
            }}
            size="sm"
            aria-label="Series color source"
            className="max-w-full overflow-x-auto"
          >
            <ToggleButton id="ramp">The accent ramp</ToggleButton>
            <ToggleButton id="categorical">A categorical palette</ToggleButton>
          </ToggleButtonGroup>
        </div>

        <svg
          viewBox="0 0 480 150"
          className="w-full rounded-md border bg-white"
          role="img"
          aria-label="Line chart of five series"
        >
          {POINTS.map((pts, s) => (
            <polyline
              key={SERIES[s]}
              fill="none"
              stroke={colors[s]}
              strokeWidth="2.5"
              points={pts
                .map((v, i) => `${16 + (i / 7) * 448},${140 - v * 1.15}`)
                .join(' ')}
            />
          ))}
        </svg>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
          {SERIES.map((name, i) => (
            <span key={name} className="inline-flex items-center gap-1.5">
              <span
                className="size-2.5 rounded-sm"
                style={{ backgroundColor: colors[i] }}
              />
              <span className="text-xs text-fg-muted">{name}</span>
            </span>
          ))}
          <span
            aria-live="polite"
            className="ml-auto font-mono text-[0.65rem] text-fg-muted tabular-nums"
          >
            closest pair ΔEok {min.toFixed(3)}
          </span>
        </div>
      </div>
    </Demo>
  )
}
