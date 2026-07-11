import { wcagContrast } from 'culori'

import { Demo } from '@/components/demo'

// dotUI light primitives (registry base/colors.css), oklch → hex.
const BG = '#fafafa'
const CARD_BORDER = '#dbdbdb'
const FIELD_BG = '#f7f7f7'
const FIELD_BORDER = '#b7b7b7'
const FG = '#070707'
const FG_MUTED = '#626262'

const cardRatio = wcagContrast(CARD_BORDER, BG)
const fieldRatio = wcagContrast(FIELD_BORDER, FIELD_BG)

export function BorderNullCase() {
  return (
    <Demo
      caption={
        <>
          Two border tokens, two contracts. The card edge at{' '}
          {cardRatio.toFixed(2)}:1 is barely there &mdash; and that&rsquo;s the
          design: <span className="font-mono">border</span> promises nothing.
          The input&rsquo;s <span className="font-mono">border-field</span> is a
          functional boundary, so WCAG 1.4.11&rsquo;s 3:1 non-text minimum
          arguably applies &mdash; and at {fieldRatio.toFixed(2)}:1 it
          doesn&rsquo;t clear the bar.
        </>
      }
    >
      <div
        className="flex flex-col gap-4 rounded-lg p-4 sm:flex-row"
        style={{ backgroundColor: BG }}
      >
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <div
            className="rounded-md border px-3 py-4"
            style={{ backgroundColor: BG, borderColor: CARD_BORDER }}
          >
            <span className="text-xs" style={{ color: FG }}>
              Card &mdash; <span className="font-mono">border</span> on{' '}
              <span className="font-mono">bg</span>
            </span>
          </div>
          <span
            className="font-mono text-[0.65rem] tabular-nums"
            style={{ color: FG_MUTED }}
          >
            {cardRatio.toFixed(2)}:1 &middot; decorative &mdash; no bar
          </span>
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <div
            className="rounded-md border px-3 py-4"
            style={{ backgroundColor: FIELD_BG, borderColor: FIELD_BORDER }}
          >
            <span className="text-xs" style={{ color: FG_MUTED }}>
              Input &mdash; <span className="font-mono">border-field</span> on{' '}
              <span className="font-mono">field</span>
            </span>
          </div>
          <span
            className="font-mono text-[0.65rem] tabular-nums"
            style={{ color: FG_MUTED }}
          >
            {fieldRatio.toFixed(2)}:1 vs the 3:1 bar &#x2715;
          </span>
        </div>
      </div>
    </Demo>
  )
}
