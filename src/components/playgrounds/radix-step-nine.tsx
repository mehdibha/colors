import { wcagContrast } from 'culori'

import { apcaLc } from '@/lib/apca'
import { cn } from '@/lib/utils'
import { Demo } from '@/components/demo'
// Verified against radix-ui/colors: blue9 is byte-identical in light.ts and
// dark.ts (#0090ff). Grays are not — slate9 differs across the two files.
const BLUE9 = '#0090ff'
const SLATE9_LIGHT = '#8b8d98'
const SLATE9_DARK = '#696e77'
function Meter({ fg, label }: { fg: string; label: string }) {
  const w = wcagContrast(fg, BLUE9)
  const lc = apcaLc(fg, BLUE9)
  const wPass = w >= 4.5
  const aPass = Math.abs(lc) >= 60
  return (
    <div className="flex flex-col gap-1">
      <span
        className="rounded-md px-3 py-2 text-center text-sm font-medium"
        style={{ backgroundColor: BLUE9, color: fg }}
      >
        {label} label
      </span>
      <span className="font-mono text-[0.65rem] tabular-nums">
        <span className={wPass ? 'text-fg-success' : 'text-fg-danger'}>
          WCAG {w.toFixed(2)}:1 {wPass ? '✓' : '✗'}
        </span>{' '}
        ·{' '}
        <span className={aPass ? 'text-fg-success' : 'text-fg-warning'}>
          Lc {lc.toFixed(1)} {aPass ? '✓' : '⚠'}
        </span>
      </span>
    </div>
  )
}
export function RadixStepNine() {
  return (
    <Demo
      caption={
        <>
          Step 9 is the one hex an accent scale carries unchanged into dark mode
          &mdash; a solid sits at mid lightness holding its own background, so
          the room barely touches it (chapter 16). Grays get no such pass:
          slate&rsquo;s solid is re-tuned per room. And its label is chapter
          8&rsquo;s orange-button fight, shipped as a default &mdash;
          WCAG&rsquo;s max-ratio rule votes black, most eyes and APCA vote
          white, and Radix ships white.
        </>
      }
    >
      <div className="flex flex-col gap-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <span className="font-mono text-[0.65rem] tracking-wider text-fg-muted uppercase">
              Accent solid · shared
            </span>
            <div className="flex items-center gap-2">
              {(['Light', 'Dark'] as const).map((room) => (
                <div
                  key={room}
                  className="flex flex-1 flex-col items-center gap-1"
                >
                  <span
                    className="h-10 w-full rounded-md border border-black/10"
                    style={{ backgroundColor: BLUE9 }}
                  />
                  <span className="font-mono text-[0.6rem] text-fg-muted tabular-nums">
                    {room} {BLUE9}
                  </span>
                </div>
              ))}
            </div>
            <span className="text-[0.7rem] text-fg-muted">
              blue 9 — identical in both files.
            </span>
          </div>
          <div className="flex flex-col gap-2">
            <span className="font-mono text-[0.65rem] tracking-wider text-fg-muted uppercase">
              Gray solid · re-tuned
            </span>
            <div className="flex items-center gap-2">
              {(
                [
                  ['Light', SLATE9_LIGHT],
                  ['Dark', SLATE9_DARK],
                ] as const
              ).map(([room, hex]) => (
                <div
                  key={room}
                  className="flex flex-1 flex-col items-center gap-1"
                >
                  <span
                    className="h-10 w-full rounded-md border border-black/10"
                    style={{ backgroundColor: hex }}
                  />
                  <span className="font-mono text-[0.6rem] text-fg-muted tabular-nums">
                    {room} {hex}
                  </span>
                </div>
              ))}
            </div>
            <span className="text-[0.7rem] text-fg-muted">
              slate 9 — different hex per room.
            </span>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <span className="font-mono text-[0.65rem] tracking-wider text-fg-muted uppercase">
            Which label on blue 9?
          </span>
          <div className="grid gap-3 sm:grid-cols-2">
            <Meter fg="#000000" label="Black" />
            <Meter fg="#ffffff" label="White" />
          </div>
          <span
            aria-live="polite"
            className={cn('text-[0.7rem] text-fg-muted')}
          >
            Max-ratio picks black (6.43 &gt; 3.26); APCA picks white (|64.6| ≥
            60, black&rsquo;s 44.9 fails). Radix ships white &mdash; a meter
            choice baked into every solid button.
          </span>
        </div>
      </div>
    </Demo>
  )
}
