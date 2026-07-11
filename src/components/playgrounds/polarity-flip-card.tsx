import { useState } from 'react'
import { wcagContrast } from 'culori'
import { ArrowLeftRightIcon } from 'lucide-react'

import { apcaLc } from '@/lib/apca'
import { Demo } from '@/components/demo'
import { Button } from '@/ui/button'

const GRAY = '#8a8a8a'
const DARK = '#1e1e1e'

const score = (fg: string, bg: string, name: string) => ({
  fg,
  bg,
  name,
  ratio: wcagContrast(fg, bg),
  lc: apcaLc(fg, bg),
})

const NORMAL = score(GRAY, DARK, 'gray text on near-black')
const SWAPPED = score(DARK, GRAY, 'near-black text on gray')
const ORIENTATIONS = [NORMAL, SWAPPED]

export function PolarityFlipCard() {
  const [flipped, setFlipped] = useState(false)
  const current = flipped ? SWAPPED : NORMAL

  return (
    <Demo
      caption={
        <>
          Swap the roles and the WCAG score cannot move — the formula discarded
          who-is-text before it divided. APCA re-scores the pair: the sign flips
          to record the polarity, and the magnitude shifts, because reading
          light-on-dark and dark-on-light are different jobs for the eye.
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div
          className="rounded-lg border p-4"
          style={{ backgroundColor: current.bg }}
        >
          <span
            className="text-[15px] font-semibold"
            style={{ color: current.fg }}
          >
            Deploy finished
          </span>
          <p className="mt-1 text-sm" style={{ color: current.fg }}>
            main deployed to production in 42s. All 118 checks passed.
          </p>
        </div>

        <div className="flex flex-col gap-1">
          {ORIENTATIONS.map((o) => (
            <div
              key={o.name}
              className={`flex justify-between font-mono text-[0.7rem] tabular-nums ${
                o === current ? 'text-fg' : 'text-fg-muted'
              }`}
            >
              <span>{o.name}</span>
              <span>
                WCAG {o.ratio.toFixed(2)}:1 · APCA Lc {o.lc.toFixed(1)}
              </span>
            </div>
          ))}
        </div>

        <Button size="sm" onPress={() => setFlipped((f) => !f)}>
          <ArrowLeftRightIcon />
          Swap text and background
        </Button>
      </div>
    </Demo>
  )
}
