import { useState } from 'react'
import { wcagContrast } from 'culori'

import { apcaLc } from '@/lib/apca'
import { cn } from '@/lib/utils'
import { Demo } from '@/components/demo'
import { Slider, SliderControl } from '@/ui/slider'

// dotUI accent primitives (registry base/colors.css), oklch → hex via culori.
const STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950]
const BLUE = [
  '#e8faff',
  '#d0edff',
  '#b0dcff',
  '#8fcbff',
  '#69b0fb',
  '#4992dd',
  '#347bc2',
  '#1a5c9b',
  '#0f487b',
  '#0a345b',
  '#05203a',
]

function Candidate({ bg, label }: { bg: string; label: string }) {
  return (
    <span
      className="rounded-md px-3 py-1.5 text-xs font-medium"
      style={{ backgroundColor: bg, color: label }}
    >
      Deploy
    </span>
  )
}

export function PairingFlip() {
  const [idx, setIdx] = useState(5)

  const bg = BLUE[idx] ?? '#4992dd'
  const step = STEPS[idx] ?? 500
  const w = wcagContrast('#ffffff', bg)
  const b = wcagContrast('#000000', bg)
  const lw = Math.abs(apcaLc('#ffffff', bg))
  const lb = Math.abs(apcaLc('#000000', bg))
  const wcagPick = b > w ? 'black' : 'white'
  const apcaPick = lb > lw ? 'black' : 'white'
  const disagree = wcagPick !== apcaPick

  return (
    <Demo
      caption={
        <>
          Two candidate partners for one surface token, judged by both of
          chapter 8&rsquo;s meters. Through most of the ramp they agree; on this
          blue they split at steps 500&ndash;600 &mdash; exactly where solid
          buttons live. A pairing promise that doesn&rsquo;t name its meter is
          undefined right where it matters.
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <span className="w-20 shrink-0 text-xs text-fg-muted">
            Surface step
          </span>
          <Slider
            aria-label="Accent ramp step for the button surface"
            value={idx}
            onChange={(v) => setIdx(v as number)}
            minValue={0}
            maxValue={10}
            step={1}
            className="flex-1"
          >
            <SliderControl />
          </Slider>
          <span className="w-10 shrink-0 text-right font-mono text-xs text-fg-muted tabular-nums">
            {step}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Candidate bg={bg} label="#ffffff" />
          <Candidate bg={bg} label="#000000" />
          <span className="font-mono text-[0.65rem] text-fg-muted tabular-nums">
            {bg}
          </span>
        </div>

        <div
          aria-live="polite"
          className="flex flex-col gap-1 font-mono text-[0.65rem] text-fg-muted tabular-nums"
        >
          <span>
            WCAG picks {wcagPick} — white {w.toFixed(2)}:1 · black{' '}
            {b.toFixed(2)}:1
          </span>
          <span>
            APCA picks {apcaPick} — white |Lc| {lw.toFixed(1)} · black |Lc|{' '}
            {lb.toFixed(1)}
          </span>
          <span
            className={cn(
              'font-sans text-xs',
              disagree ? 'text-fg-warning' : 'text-fg-muted',
            )}
          >
            {disagree
              ? 'The meters disagree here. A generator that picks by WCAG alone ships the black label.'
              : 'Both meters agree here.'}
          </span>
        </div>
      </div>
    </Demo>
  )
}
