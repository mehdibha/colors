import type * as React from 'react'
import { useState } from 'react'
import {
  converter,
  differenceEuclidean,
  filterDeficiencyDeuter,
  formatHex,
} from 'culori'
import { CheckIcon, XIcon } from 'lucide-react'

import { Demo } from '@/components/demo'
import { Switch } from '@/ui/switch'

const toLab = converter('lab')
const toRgb = converter('rgb')
const dEok = differenceEuclidean('oklab')
const deutan = filterDeficiencyDeuter(1)
const lstar = (hex: string) => Math.round(toLab(hex)?.l ?? 0)

// Hue alone: a same-lightness red/green — the textbook trap.
const HUE_ONLY = { pass: '#30a46c', fail: '#e5484d' }
// Redesigned: lightness gap + icon + word. Any one of the three would rescue it.
const REDESIGNED = { pass: '#75e0a7', fail: '#b42318' }

const shown = (hex: string, on: boolean) => {
  if (!on) return hex
  const rgb = toRgb(hex)
  return rgb ? (formatHex(deutan(rgb)) ?? hex) : hex
}

export function StatusPairCollapse() {
  const [sim, setSim] = useState(true)

  const pair = (p: { pass: string; fail: string }) =>
    dEok(shown(p.pass, sim), shown(p.fail, sim)).toFixed(2)

  return (
    <Demo
      caption={
        <>
          Both rows say the same thing: green is good, red is bad. The top row
          says it with hue alone, at one lightness — under deutan its two chips
          become the same olive (ΔEok {pair(HUE_ONLY)}), and the traffic-light
          convention evaporates. The bottom row keeps a large lightness gap (L*{' '}
          {lstar(REDESIGNED.fail)} vs {lstar(REDESIGNED.pass)}), an icon, and a
          word — remove the color entirely and it still reads. The rule:{' '}
          <strong className="text-fg">
            never let hue be the only difference.
          </strong>
        </>
      }
    >
      <div className="flex flex-col gap-5">
        <Row
          label="Hue alone"
          pass={shown(HUE_ONLY.pass, sim)}
          fail={shown(HUE_ONLY.fail, sim)}
          decorated={false}
        />
        <Row
          label="Lightness + icon + word"
          pass={shown(REDESIGNED.pass, sim)}
          fail={shown(REDESIGNED.fail, sim)}
          decorated
        />
        <Switch isSelected={sim} onChange={setSim} size="sm">
          Simulate deuteranopia
        </Switch>
      </div>
    </Demo>
  )
}

function Row({
  label,
  pass,
  fail,
  decorated,
}: {
  label: string
  pass: string
  fail: string
  decorated: boolean
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs text-fg-muted">{label}</span>
      <div className="flex gap-3">
        <Chip
          color={pass}
          icon={<CheckIcon size={14} />}
          text="Paid"
          decorated={decorated}
        />
        <Chip
          color={fail}
          icon={<XIcon size={14} />}
          text="Failed"
          decorated={decorated}
        />
      </div>
    </div>
  )
}

function Chip({
  color,
  icon,
  text,
  decorated,
}: {
  color: string
  icon: React.ReactNode
  text: string
  decorated: boolean
}) {
  const fg = lstar(color) > 62 ? '#111' : '#fff'
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium"
      style={{ backgroundColor: color, color: fg }}
    >
      {decorated && icon}
      {decorated ? text : '—'}
    </span>
  )
}
