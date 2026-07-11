import { converter } from 'culori'

import { Demo } from '@/components/demo'

const toOklch = converter('oklch')

// Step 9s from radix-ui/colors light.ts, verified by name.
const GRAYS = [
  {
    name: 'mauve',
    hex: '#8e8c99',
    basis: 'purple',
    accents: [
      { name: 'tomato', hex: '#e54d2e' },
      { name: 'red', hex: '#e5484d' },
      { name: 'ruby', hex: '#e54666' },
      { name: 'crimson', hex: '#e93d82' },
      { name: 'pink', hex: '#d6409f' },
      { name: 'plum', hex: '#ab4aba' },
      { name: 'purple', hex: '#8e4ec6' },
      { name: 'violet', hex: '#6e56cf' },
    ],
  },
  {
    name: 'slate',
    hex: '#8b8d98',
    basis: 'blue',
    accents: [
      { name: 'iris', hex: '#5b5bd6' },
      { name: 'indigo', hex: '#3e63dd' },
      { name: 'blue', hex: '#0090ff' },
      { name: 'sky', hex: '#7ce2fe' },
      { name: 'cyan', hex: '#00a2c7' },
    ],
  },
  {
    name: 'sage',
    hex: '#868e8b',
    basis: 'green',
    accents: [
      { name: 'mint', hex: '#86ead4' },
      { name: 'teal', hex: '#12a594' },
      { name: 'jade', hex: '#29a383' },
      { name: 'green', hex: '#30a46c' },
    ],
  },
  {
    name: 'olive',
    hex: '#898e87',
    basis: 'lime',
    accents: [
      { name: 'grass', hex: '#46a758' },
      { name: 'lime', hex: '#bdee63' },
    ],
  },
  {
    name: 'sand',
    hex: '#8d8d86',
    basis: 'yellow',
    accents: [
      { name: 'yellow', hex: '#ffe629' },
      { name: 'amber', hex: '#ffc53d' },
      { name: 'orange', hex: '#f76b15' },
      { name: 'brown', hex: '#ad7f58' },
    ],
  },
]

function readout(hex: string): string {
  const { c, h } = toOklch(hex) ?? { c: 0, h: 0 }
  return `C ${(c ?? 0).toFixed(3)} · h ${(h ?? 0).toFixed(0)}°`
}

export function RadixGrayPairings() {
  return (
    <Demo
      caption={
        <>
          Radix&rsquo;s five tinted grays at step 9, each with its documented
          &ldquo;natural pairing&rdquo; accents. Every tint sits in the C
          0.010&ndash;0.019 whisper band; the sixth gray &mdash; pure{' '}
          <code>gray</code>, C 0.000 &mdash; is documented as working
          &ldquo;with any hue or palette.&rdquo; All values measured from the
          published hexes.
        </>
      }
    >
      <div className="flex flex-col gap-4">
        {GRAYS.map((g) => (
          <div
            key={g.name}
            className="flex flex-col gap-2 border-b pb-4 last:border-b-0 last:pb-0"
          >
            <div className="flex flex-wrap items-center gap-3">
              <div
                className="h-9 w-9 shrink-0 rounded-md border"
                style={{ backgroundColor: g.hex }}
              />
              <div className="flex flex-col">
                <span className="text-sm font-medium">
                  {g.name}
                  <span className="ml-2 font-normal text-fg-muted">
                    based on a {g.basis} hue
                  </span>
                </span>
                <span className="font-mono text-[0.65rem] text-fg-muted tabular-nums">
                  {g.hex} · {readout(g.hex)}
                </span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 pl-12">
              {g.accents.map((a) => (
                <div key={a.name} className="flex items-center gap-1.5">
                  <div
                    className="h-5 w-5 rounded-sm border"
                    style={{ backgroundColor: a.hex }}
                  />
                  <span className="font-mono text-[0.65rem] text-fg-muted">
                    {a.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Demo>
  )
}
