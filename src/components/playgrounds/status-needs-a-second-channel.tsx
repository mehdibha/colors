import { useState } from 'react'
import {
  converter,
  differenceEuclidean,
  filterDeficiencyDeuter,
  formatHex,
} from 'culori'
import {
  CheckCircleIcon,
  InfoIcon,
  TriangleAlertIcon,
  XCircleIcon,
} from 'lucide-react'

import { Demo } from '@/components/demo'
import { Switch } from '@/ui/switch'

const toRgb = converter('rgb')
const dEok = differenceEuclidean('oklab')
const deutan = filterDeficiencyDeuter(1)

const shown = (hex: string, on: boolean) => {
  if (!on) return hex
  const rgb = toRgb(hex)
  return rgb ? (formatHex(deutan(rgb)) ?? hex) : hex
}

// dotUI status solids (family-500). Meaning carried by hue alone.
const STATUS = [
  { id: 'success', label: 'Paid', solid: '#00ad47', icon: CheckCircleIcon },
  {
    id: 'warning',
    label: 'Pending',
    solid: '#b78600',
    icon: TriangleAlertIcon,
  },
  { id: 'danger', label: 'Failed', solid: '#f34847', icon: XCircleIcon },
  { id: 'info', label: 'Info', solid: '#438aff', icon: InfoIcon },
]

function worstPair(on: boolean) {
  let worst = Infinity
  let names = ''
  for (const [i, a] of STATUS.entries())
    for (const b of STATUS.slice(i + 1)) {
      const de = dEok(shown(a.solid, on), shown(b.solid, on))
      if (de < worst) {
        worst = de
        names = `${a.label}/${b.label}`
      }
    }
  return { de: worst, names }
}

export function StatusNeedsASecondChannel() {
  const [sim, setSim] = useState(true)
  const w = worstPair(sim)

  return (
    <Demo
      caption={
        <>
          Under deuteranopia — the dichromatic end of red-green color vision
          deficiency, which in some form affects roughly one in twelve men — the
          success green, warning amber, and danger red slide into one band of
          olive: closest pair{' '}
          <span aria-live="polite">
            {w.names} at ΔEok {w.de.toFixed(2)}
          </span>
          . Only blue holds. The top row encodes status in hue alone and
          collapses; the bottom row keeps the same fills but adds an icon and a
          word, so it still reads with the color removed. This is chapter
          9&rsquo;s rule as a hard constraint on the status families: never let
          hue be the only channel.
        </>
      }
    >
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <span className="text-xs text-fg-muted">Hue alone</span>
          <div className="flex flex-wrap gap-2">
            {STATUS.map((s) => (
              <span
                key={s.id}
                className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium"
                style={{ backgroundColor: shown(s.solid, sim), color: '#fff' }}
              >
                <span className="size-2 rounded-full bg-white/90" />—
              </span>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-xs text-fg-muted">Hue + icon + word</span>
          <div className="flex flex-wrap gap-2">
            {STATUS.map((s) => {
              const Icon = s.icon
              return (
                <span
                  key={s.id}
                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium"
                  style={{
                    backgroundColor: shown(s.solid, sim),
                    color: '#fff',
                  }}
                >
                  <Icon size={13} />
                  {s.label}
                </span>
              )
            })}
          </div>
        </div>
        <Switch isSelected={sim} onChange={setSim} size="sm">
          Simulate deuteranopia
        </Switch>
      </div>
    </Demo>
  )
}
