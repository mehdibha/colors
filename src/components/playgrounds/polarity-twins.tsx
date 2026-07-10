import { wcagContrast } from 'culori'

import { apcaLc } from '@/lib/apca'
import { Demo } from '@/components/demo'

// Solved so both pairs land at WCAG ~4.5:1 — only the polarity differs.
const PAIRS = [
  { text: '#777777', bg: '#ffffff', label: 'dark on light' },
  { text: '#7c7c7c', bg: '#111113', label: 'light on dark' },
]

export function PolarityTwins() {
  return (
    <Demo
      caption={
        <>
          Two grays solved to the same WCAG ratio, one on each side of the
          polarity. WCAG scores them as twins; APCA gives the light-on-dark pair
          less than half the magnitude &mdash; and chapter 8&rsquo;s flare-term
          diagnosis says why WCAG over-credits the dark pair.
        </>
      }
    >
      <div className="flex flex-col gap-3 sm:flex-row">
        {PAIRS.map((p) => (
          <div
            key={p.label}
            className="flex flex-1 flex-col items-center gap-2 rounded-lg border px-4 py-6"
            style={{ backgroundColor: p.bg }}
          >
            <span className="text-sm" style={{ color: p.text }}>
              The quick brown fox jumps over the lazy dog.
            </span>
            <span
              className="font-mono text-[0.65rem] tabular-nums"
              style={{ color: p.text }}
            >
              {p.label} · {wcagContrast(p.text, p.bg).toFixed(2)}:1 · Lc{' '}
              {apcaLc(p.text, p.bg).toFixed(1)}
            </span>
          </div>
        ))}
      </div>
    </Demo>
  )
}
