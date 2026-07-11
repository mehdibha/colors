import { useState } from 'react'
import { clampChroma, formatHex, wcagContrast } from 'culori'

import { apcaLc } from '@/lib/apca'
import { cn } from '@/lib/utils'
import { Demo } from '@/components/demo'
import { Slider, SliderControl } from '@/ui/slider'

// dotUI's default accent-500 shape: oklch(0.6478 0.1337 251.06), L free.
const CHROMA = 0.1337
const HUE = 251.06

function solidAt(l: number): string {
  return formatHex(
    clampChroma({ mode: 'oklch' as const, l, c: CHROMA, h: HUE }, 'oklch'),
  )
}

export function TheGeneratorsPick() {
  const [l, setL] = useState(0.648)

  const bg = solidAt(l)
  const wWhite = wcagContrast('#ffffff', bg)
  const wBlack = wcagContrast('#000000', bg)
  const aWhite = apcaLc('#ffffff', bg)
  const aBlack = apcaLc('#000000', bg)
  // The autocontrast rule, verbatim from the plugin: higher WCAG ratio wins.
  const wcagPick = wBlack > wWhite ? 'black' : 'white'
  const apcaPick = Math.abs(aBlack) > Math.abs(aWhite) ? 'black' : 'white'
  const agree = wcagPick === apcaPick

  const candidates = [
    { label: 'white', color: '#ffffff', ratio: wWhite, lc: aWhite },
    { label: 'black', color: '#000000', ratio: wBlack, lc: aBlack },
  ]

  return (
    <Demo
      caption={
        <>
          A solid at dotUI&rsquo;s default accent chroma and hue, lightness on
          the slider. The generator&rsquo;s rule picks whichever of black or
          white wins the WCAG ratio; APCA scores the same two candidates. On
          this hue they disagree for every solid between L 0.565 and 0.711
          &mdash; and the shipped default, L 0.648, sits in the middle of the
          band.
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <span className="w-24 shrink-0 text-xs text-fg-muted">
            Solid lightness
          </span>
          <Slider
            aria-label="Lightness of the accent solid"
            value={l}
            onChange={(v) => setL(v as number)}
            minValue={0.3}
            maxValue={0.9}
            step={0.005}
            className="flex-1"
          >
            <SliderControl />
          </Slider>
          <span className="w-24 shrink-0 text-right font-mono text-xs text-fg-muted tabular-nums">
            L {l.toFixed(3)} · {bg}
          </span>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          {candidates.map((c) => (
            <div key={c.label} className="flex flex-1 flex-col gap-2">
              <span
                className="rounded-md px-3 py-2.5 text-center text-sm font-medium"
                style={{ backgroundColor: bg, color: c.color }}
              >
                Continue
              </span>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <span className="font-mono text-[0.65rem] text-fg-muted tabular-nums">
                  {c.label} · {c.ratio.toFixed(2)}:1 · Lc {c.lc.toFixed(1)}
                </span>
                {wcagPick === c.label && (
                  <span className="rounded bg-muted px-1.5 py-0.5 text-[0.6rem] font-medium">
                    WCAG pick
                  </span>
                )}
                {apcaPick === c.label && (
                  <span className="rounded bg-muted px-1.5 py-0.5 text-[0.6rem] font-medium">
                    APCA pick
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        <p
          aria-live="polite"
          className={cn('text-xs', agree ? 'text-fg-muted' : 'text-fg-warning')}
        >
          {agree
            ? `The meters agree: ${wcagPick} text.`
            : `The meters disagree — the generator ships ${wcagPick}, APCA sides with ${apcaPick}.`}
        </p>
      </div>
    </Demo>
  )
}
