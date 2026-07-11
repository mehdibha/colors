import { converter } from 'culori'

import { Demo } from '@/components/demo'

const toOklch = converter('oklch')

// Radix slate (light) — the shipped whisper this section measures.
const SLATE = [
  '#fcfcfd',
  '#f9f9fb',
  '#f0f0f3',
  '#e8e8ec',
  '#e0e1e6',
  '#d9d9e0',
  '#cdced6',
  '#b9bbc6',
  '#8b8d98',
  '#80838d',
  '#60646c',
  '#1c2024',
]

const STEPS = SLATE.map((hex) => {
  const { c, h } = toOklch(hex) ?? { c: 0, h: 0 }
  return { hex, c: c ?? 0, h: h ?? 0 }
})
const PEAK_C = Math.max(...STEPS.map((s) => s.c))

export function SlateWhisperArc() {
  return (
    <Demo
      caption={
        <>
          Radix slate, chroma per step drawn as bars: chapter 12&rsquo;s arc at
          a twelfth of an accent&rsquo;s height &mdash; thousandths at the
          near-whites, the 0.0165 peak at step 9, easing back through the darks.
          The hue row underneath bends 286&deg; to 248&deg;: chapter 13&rsquo;s
          curve, also in miniature.
        </>
      }
    >
      <div className="flex gap-1">
        {STEPS.map((st, i) => (
          <div
            key={i}
            className="flex min-w-0 flex-1 flex-col items-center gap-1"
          >
            <div
              className="h-9 w-full rounded-md border"
              style={{ backgroundColor: st.hex }}
            />
            <div className="flex h-12 w-full items-end justify-center">
              <div
                className="w-2 rounded-t-sm bg-fg/60"
                style={{ height: `${(st.c / PEAK_C) * 100}%` }}
              />
            </div>
            <span className="font-mono text-[0.55rem] text-fg-muted tabular-nums">
              {st.c.toFixed(3).slice(1)}
            </span>
            <span className="font-mono text-[0.55rem] text-fg-muted tabular-nums">
              {Math.round(st.h)}°
            </span>
          </div>
        ))}
      </div>
    </Demo>
  )
}
