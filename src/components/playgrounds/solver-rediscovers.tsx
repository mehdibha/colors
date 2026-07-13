import { converter } from 'culori'

import { Demo } from '@/components/demo'

import { dEok, LEONARDO_BLUE_KEYS, makeScale, solveWcag } from './leonardo-mini'

const toOklch = converter('oklch')

const LIGHT_BG = '#f8f8f8'
const DARK_BG = '#1d1d1d'
const RADIX_BLUE_DARK_11 = '#70b8ff'

const BLUE_DARK_8 = solveWcag(makeScale([...LEONARDO_BLUE_KEYS]), DARK_BG, 8)
const YELLOW_SCALE = makeScale(['#ffe100'])
const YELLOW_LIGHT_45 = solveWcag(YELLOW_SCALE, LIGHT_BG, 4.5)
const YELLOW_DARK_8 = solveWcag(YELLOW_SCALE, DARK_BG, 8)

function okLabel(hex: string): string {
  const ok = toOklch(hex)
  return `oklch(${(ok?.l ?? 0).toFixed(3)} ${(ok?.c ?? 0).toFixed(3)} ${(ok?.h ?? 0).toFixed(1)})`
}

function SwatchRow({
  title,
  hex,
  label,
}: {
  title: string
  hex: string
  label: string
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="font-mono text-[0.65rem]" style={{ color: label }}>
        {title}
      </span>
      <div className="h-10 rounded-md" style={{ backgroundColor: hex }} />
      <span
        className="font-mono text-[0.6rem] tabular-nums"
        style={{ color: label }}
      >
        {hex} · {okLabel(hex)}
      </span>
    </div>
  )
}

export function SolverRediscovers() {
  return (
    <Demo
      caption={
        <>
          Left: the blue declaration solved at 8:1 on the dark background,
          beside Radix's hand-designed <code>blueDark11</code> — the solver's
          search lands ΔEok{' '}
          {dEok(BLUE_DARK_8.hex, RADIX_BLUE_DARK_11).toFixed(3)} from the hand's
          answer, chapter 16's lift-L-shed-C move rediscovered. Right: the same
          yellow key solved twice — a C{' '}
          {(toOklch(YELLOW_LIGHT_45.hex)?.c ?? 0).toFixed(3)} olive at 4.5:1 on
          near-white, C {(toOklch(YELLOW_DARK_8.hex)?.c ?? 0).toFixed(3)} at 8:1
          on the dark background. Chroma went <em>up</em> in the dark theme,
          because light vivid yellow exists and dark vivid yellow doesn't.
        </>
      }
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div
          className="flex flex-col gap-4 rounded-lg border p-4"
          style={{ backgroundColor: DARK_BG }}
        >
          <SwatchRow
            title="blue solved at 8:1 on this background"
            hex={BLUE_DARK_8.hex}
            label="#a1a1aa"
          />
          <SwatchRow
            title="Radix blueDark11, hand-tuned"
            hex={RADIX_BLUE_DARK_11}
            label="#a1a1aa"
          />
        </div>
        <div className="flex flex-col gap-3">
          <div
            className="rounded-lg border p-4"
            style={{ backgroundColor: LIGHT_BG }}
          >
            <SwatchRow
              title="yellow solved at 4.5:1 on near-white"
              hex={YELLOW_LIGHT_45.hex}
              label="#3f3f46"
            />
          </div>
          <div
            className="rounded-lg border p-4"
            style={{ backgroundColor: DARK_BG }}
          >
            <SwatchRow
              title="yellow solved at 8:1 on dark"
              hex={YELLOW_DARK_8.hex}
              label="#a1a1aa"
            />
          </div>
        </div>
      </div>
    </Demo>
  )
}
