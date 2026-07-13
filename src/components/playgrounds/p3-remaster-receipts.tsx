import { converter, parse } from 'culori'

import { Demo } from '@/components/demo'

const toOklch = converter('oklch')

// radix-ui/colors light.ts: sRGB value vs the shipped P3 remaster, by name.
const PAIRS = [
  { name: 'yellow 9', srgb: '#ffe629', p3: 'color(display-p3 1 0.92 0.22)' },
  { name: 'amber 9', srgb: '#ffc53d', p3: 'color(display-p3 1 0.77 0.26)' },
  { name: 'blue 11', srgb: '#0d74ce', p3: 'color(display-p3 0.15 0.44 0.84)' },
  { name: 'teal 11', srgb: '#008573', p3: 'color(display-p3 0.08 0.5 0.43)' },
].map((p) => ({
  ...p,
  cSrgb: toOklch(parse(p.srgb))?.c ?? 0,
  cP3: toOklch(parse(p.p3))?.c ?? 0,
}))

export function P3RemasterReceipts() {
  return (
    <Demo
      caption={
        <>
          Left half sRGB, right half the shipped P3 value. On an sRGB screen
          each chip is one flat color &mdash; the browser clips the P3 half back
          onto the same boundary. On a wide-gamut display a seam appears: the
          remaster spent the extra room as chroma, on exactly the steps chapter
          12 found pressing the sRGB tent. Most of the P3 files are straight
          conversions &mdash; only 27 of 372 light values leave sRGB by more
          than conversion rounding.
        </>
      }
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {PAIRS.map((p) => (
          <div key={p.name} className="flex flex-col gap-1.5">
            <div className="flex h-14 overflow-hidden rounded-lg border">
              <div className="flex-1" style={{ backgroundColor: p.srgb }} />
              <div className="flex-1" style={{ backgroundColor: p.p3 }} />
            </div>
            <span className="font-mono text-[0.6rem] text-fg-muted tabular-nums">
              {p.name} · C {p.cSrgb.toFixed(3)} → {p.cP3.toFixed(3)}
            </span>
          </div>
        ))}
      </div>
    </Demo>
  )
}
