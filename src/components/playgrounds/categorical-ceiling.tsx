import { useState } from 'react'
import {
  clampChroma,
  converter,
  differenceEuclidean,
  filterDeficiencyDeuter,
  filterDeficiencyProt,
  filterDeficiencyTrit,
  formatHex,
} from 'culori'

import { Demo } from '@/components/demo'
import { Slider, SliderControl } from '@/ui/slider'

const toRgb = converter('rgb')
const dEok = differenceEuclidean('oklab')

const FILTERS = {
  deutan: filterDeficiencyDeuter(1),
  protan: filterDeficiencyProt(1),
  tritan: filterDeficiencyTrit(1),
}

// ch9's judgment thresholds.
const MERGED = 0.06
const RISKY = 0.12

// Naive spread: even hue steps from the accent seed, one L, one C.
function palette(n: number): string[] {
  return Array.from(
    { length: n },
    (_, i) =>
      formatHex(
        clampChroma(
          { mode: 'oklch', l: 0.65, c: 0.15, h: (251 + (360 / n) * i) % 360 },
          'oklch',
        ),
      ) ?? '#000000',
  )
}

function audit(colors: string[]) {
  let normal = Infinity
  let cvd = { de: Infinity, filter: '' }
  for (const [i, a] of colors.entries())
    for (const b of colors.slice(i + 1)) {
      normal = Math.min(normal, dEok(a, b))
      for (const [name, f] of Object.entries(FILTERS)) {
        const ra = toRgb(a)
        const rb = toRgb(b)
        if (!ra || !rb) continue
        const de = dEok(f(ra), f(rb))
        if (de < cvd.de) cvd = { de, filter: name }
      }
    }
  return { normal, cvd }
}

const verdict = (de: number) =>
  de < MERGED
    ? { text: 'merged', className: 'text-danger' }
    : de < RISKY
      ? { text: 'risky', className: 'text-warning' }
      : { text: 'distinct', className: 'text-success' }

export function CategoricalCeiling() {
  const [n, setN] = useState(5)
  const colors = palette(n)
  const { normal, cvd } = audit(colors)
  const vNormal = verdict(normal)
  const vCvd = verdict(cvd.de)

  return (
    <Demo
      caption={
        <>
          Even hue spacing from the accent seed, one lightness, one chroma
          &mdash; the naive generator. Normal vision holds on well past ten
          categories; the gate&rsquo;s other three filters don&rsquo;t. By six
          swatches the worst CVD pair is already merged, and adding categories
          only redistributes the same collapsed hue wheel. Past this ceiling the
          fix isn&rsquo;t more colors &mdash; it&rsquo;s direct labels, shapes,
          or fewer series.
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <span className="shrink-0 text-xs text-fg-muted">Categories</span>
          <Slider
            aria-label="Number of categories"
            value={n}
            onChange={(v) => setN(v as number)}
            minValue={3}
            maxValue={12}
            step={1}
            className="max-w-64 flex-1"
          >
            <SliderControl />
          </Slider>
          <span className="w-6 shrink-0 font-mono text-xs text-fg-muted tabular-nums">
            {n}
          </span>
        </div>

        <div className="flex gap-1.5">
          {colors.map((hex, i) => (
            // oxlint-disable-next-line no-array-index-key -- swatches are positional
            <div
              key={i}
              className="h-12 flex-1 rounded-md border"
              style={{ backgroundColor: hex }}
            />
          ))}
        </div>

        <div
          aria-live="polite"
          className="flex flex-wrap gap-x-6 gap-y-1 font-mono text-[0.7rem] text-fg-muted tabular-nums"
        >
          <span>
            normal vision — closest pair ΔEok {normal.toFixed(3)}{' '}
            <span className={vNormal.className}>{vNormal.text}</span>
          </span>
          <span>
            worst under CVD ({cvd.filter}) — ΔEok {cvd.de.toFixed(3)}{' '}
            <span className={vCvd.className}>{vCvd.text}</span>
          </span>
        </div>
      </div>
    </Demo>
  )
}
