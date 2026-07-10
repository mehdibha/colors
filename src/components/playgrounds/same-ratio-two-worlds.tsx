import { wcagContrast } from 'culori'

import { apcaLc } from '@/lib/apca'
import { Demo } from '@/components/demo'

const WORLDS = [
  { name: 'light mode', fg: '#767676', bg: '#ffffff' },
  { name: 'dark mode', fg: '#858585', bg: '#1e1e1e' },
].map((w) => ({
  ...w,
  ratio: wcagContrast(w.fg, w.bg),
  lc: apcaLc(w.fg, w.bg),
}))

export function SameRatioTwoWorlds() {
  return (
    <Demo
      caption={
        <>
          To WCAG 2 these are twins — 4.54:1 and 4.52:1, both comfortably
          "passes AA body text." Read the two paragraphs. APCA scores much
          closer to what your eye just reported: Lc 71.6 against Lc −35.3 — the
          dark-mode pair delivers half the contrast, and by APCA's guidance
          shouldn't carry body text at all.
        </>
      }
    >
      <div className="grid gap-3 sm:grid-cols-2">
        {WORLDS.map((w) => (
          <div key={w.name} className="flex flex-col gap-2">
            <div
              className="flex-1 rounded-lg border px-4 py-4"
              style={{ backgroundColor: w.bg }}
            >
              <p className="text-sm" style={{ color: w.fg }}>
                Your trial ends in 14 days. Invite your team and connect a
                repository to keep your project history when the trial ends.
              </p>
            </div>
            <div className="flex justify-between font-mono text-[0.7rem] text-fg-muted tabular-nums">
              <span>{w.name}</span>
              <span>
                {w.ratio.toFixed(2)}:1 · Lc {w.lc.toFixed(1)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </Demo>
  )
}
