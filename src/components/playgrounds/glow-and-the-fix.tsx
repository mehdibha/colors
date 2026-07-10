import { useState } from 'react'
import { converter, wcagContrast } from 'culori'

import { apcaLc } from '@/lib/apca'
import { Demo } from '@/components/demo'
import { ToggleButton } from '@/ui/toggle-button'
import { ToggleButtonGroup } from '@/ui/toggle-button-group'

const toOklch = converter('oklch')

// Radix blue/slate, light and dark — the shipped answer this demo measures.
const LIGHT = { bg: '#fcfcfd', solid: '#0090ff', link: '#0d74ce' }
const DARK_BG = '#111113'
const DARK_LINK = { carried: '#0d74ce', redesigned: '#70b8ff' }

function Panel({
  bg,
  solid,
  link,
  fg,
  label,
  live,
}: {
  bg: string
  solid: string
  link: string
  fg: string
  label: string
  live?: boolean
}) {
  const o = toOklch(link)
  const ratio = wcagContrast(link, bg)
  const lc = apcaLc(link, bg)
  return (
    <div
      className="flex flex-1 flex-col items-center gap-3 rounded-lg px-4 py-6"
      style={{ backgroundColor: bg }}
    >
      <span
        className="rounded-md px-3 py-1.5 text-sm font-medium"
        style={{ backgroundColor: solid, color: '#fff' }}
      >
        Button
      </span>
      <span className="text-sm font-medium" style={{ color: link }}>
        Link text →
      </span>
      <span
        aria-live={live ? 'polite' : undefined}
        className="font-mono text-[0.65rem] tabular-nums"
        style={{ color: fg }}
      >
        {label} · link C {(o?.c ?? 0).toFixed(3)} · {ratio.toFixed(2)}:1 / Lc{' '}
        {lc.toFixed(1)}
      </span>
    </div>
  )
}

export function GlowAndTheFix() {
  const [treatment, setTreatment] = useState<'carried' | 'redesigned'>(
    'carried',
  )

  return (
    <Demo
      caption={
        <>
          Chapter 1&rsquo;s two surrounds, now with the fix. The solid button is
          Radix blue 9 on both sides &mdash; the identical hex ships in light
          and dark. The link is the text-grade accent: carried over it sits at
          3.96:1 and vibrates against the dark surround; the shipped dark value
          <code className="font-mono text-[0.8rem]"> #70b8ff</code> lifts L
          0.556 &rarr; 0.764 and cuts C 0.162 &rarr; 0.126.
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <ToggleButtonGroup
          selectionMode="single"
          disallowEmptySelection
          selectedKeys={[treatment]}
          onSelectionChange={(keys) => {
            const next = [...keys][0]
            if (next === 'carried' || next === 'redesigned') setTreatment(next)
          }}
          size="sm"
          aria-label="Dark-side accent treatment"
          className="max-w-full overflow-x-auto"
        >
          <ToggleButton id="carried">Carry light&rsquo;s accent</ToggleButton>
          <ToggleButton id="redesigned">Redesign it for dark</ToggleButton>
        </ToggleButtonGroup>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Panel
            bg={LIGHT.bg}
            solid={LIGHT.solid}
            link={LIGHT.link}
            fg="#00000099"
            label="on white"
          />
          <Panel
            bg={DARK_BG}
            solid={LIGHT.solid}
            link={DARK_LINK[treatment]}
            fg="#ffffff99"
            label="on near-black"
            live
          />
        </div>
      </div>
    </Demo>
  )
}
