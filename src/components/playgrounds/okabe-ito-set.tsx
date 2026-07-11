import { wcagContrast } from 'culori'

import { cn } from '@/lib/utils'
import { Demo } from '@/components/demo'

// Okabe-Ito Color Universal Design palette — 8 colors, CVD-safe, distinct in
// luminance so it survives grayscale. jfly.uni-koeln.de/color (Bang Wong
// reprised it in Nature Methods, 2011).
const OKABE = [
  { hex: '#E69F00', name: 'Orange' },
  { hex: '#56B4E9', name: 'Sky blue' },
  { hex: '#009E73', name: 'Bluish green' },
  { hex: '#F0E442', name: 'Yellow' },
  { hex: '#0072B2', name: 'Blue' },
  { hex: '#D55E00', name: 'Vermillion' },
  { hex: '#CC79A7', name: 'Reddish purple' },
  { hex: '#000000', name: 'Black' },
]

export function OkabeItoSet() {
  return (
    <Demo
      caption={
        <>
          Eight colors, designed CVD-first &mdash; and the count is the ceiling,
          not a stopping point. Note Yellow&rsquo;s{' '}
          <span className="font-mono">
            {wcagContrast('#F0E442', '#ffffff').toFixed(2)}:1
          </span>{' '}
          against white: even a vetted set has a mark you must never put on a
          pale background. Contrast shown vs white.
        </>
      }
    >
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {OKABE.map((c) => {
          const cr = wcagContrast(c.hex, '#ffffff')
          return (
            <div
              key={c.name}
              className="flex flex-col gap-1 rounded-md border p-2"
            >
              <div
                className="h-8 w-full rounded-sm border"
                style={{ backgroundColor: c.hex }}
              />
              <span className="text-[0.7rem] font-medium">{c.name}</span>
              <span className="font-mono text-[0.6rem] text-fg-muted tabular-nums">
                {c.hex}
              </span>
              <span
                className={cn(
                  'font-mono text-[0.6rem] tabular-nums',
                  cr >= 3 ? 'text-fg-muted' : 'text-fg-warning',
                )}
              >
                {cr.toFixed(2)}:1 {cr >= 3 ? '' : '⚠ pale-bg'}
              </span>
            </div>
          )
        })}
      </div>
    </Demo>
  )
}
