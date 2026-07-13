import { useState } from 'react'
import { wcagContrast } from 'culori'
import {
  CircleCheckIcon,
  CircleXIcon,
  InfoIcon,
  TriangleAlertIcon,
} from 'lucide-react'

import { apcaLc } from '@/lib/apca'
import { Demo } from '@/components/demo'
import { ToggleButton } from '@/ui/toggle-button'
import { ToggleButtonGroup } from '@/ui/toggle-button-group'

// Radix light.ts by name: steps 2 / 7 / 9 / 11 of green, amber, red, blue.
const STATUSES = [
  {
    name: 'Success',
    Icon: CircleCheckIcon,
    message: 'Deploy finished',
    bg: '#f4fbf6',
    border: '#8eceaa',
    solid: '#30a46c',
    text: '#218358',
  },
  {
    name: 'Warning',
    Icon: TriangleAlertIcon,
    message: 'Certificate expires in 3 days',
    bg: '#fefbe9',
    border: '#e9c162',
    solid: '#ffc53d',
    text: '#ab6400',
  },
  {
    name: 'Danger',
    Icon: CircleXIcon,
    message: 'Payment failed',
    bg: '#fff7f7',
    border: '#f4a9aa',
    solid: '#e5484d',
    text: '#ce2c31',
  },
  {
    name: 'Info',
    Icon: InfoIcon,
    message: 'A new version is available',
    bg: '#f4faff',
    border: '#8ec8f6',
    solid: '#0090ff',
    text: '#0d74ce',
  },
]

type Variant = 'ramp' | 'one-hex'

export function StatusFourPack() {
  const [variant, setVariant] = useState<Variant>('ramp')

  return (
    <Demo
      caption={
        <>
          Four statuses as real alerts. The mini-ramp spends four slots per hue:
          subtle background (step 2), border (7), icon (9), text (11). Switch to
          one hex and every alert becomes its solid with white text: red clears
          only the 3:1 large-text bar (3.91:1, short of AA&rsquo;s 4.5), amber
          dies at 1.58:1 &mdash; and the page shouts. The icons aren&rsquo;t
          decoration; they&rsquo;re chapter 9&rsquo;s second channel.
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs text-fg-muted">Each status gets</span>
          <ToggleButtonGroup
            selectionMode="single"
            disallowEmptySelection
            selectedKeys={[variant]}
            onSelectionChange={(keys) => {
              const next = [...keys][0]
              if (next === 'ramp' || next === 'one-hex') setVariant(next)
            }}
            size="sm"
            aria-label="Status color treatment"
            className="max-w-full overflow-x-auto"
          >
            <ToggleButton id="ramp">A mini-ramp</ToggleButton>
            <ToggleButton id="one-hex">One hex</ToggleButton>
          </ToggleButtonGroup>
        </div>

        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {STATUSES.map((s) => {
            const bg = variant === 'ramp' ? s.bg : s.solid
            const fg = variant === 'ramp' ? s.text : '#ffffff'
            const icon = variant === 'ramp' ? s.solid : '#ffffff'
            const ratio = wcagContrast(fg, bg)
            const lc = Math.abs(apcaLc(fg, bg))
            return (
              <div key={s.name} className="flex flex-col gap-1">
                <div
                  className="flex items-start gap-2 rounded-lg border px-3 py-2.5"
                  style={{
                    backgroundColor: bg,
                    borderColor: variant === 'ramp' ? s.border : s.solid,
                  }}
                >
                  <s.Icon
                    className="mt-0.5 size-3.5 shrink-0"
                    style={{ color: icon }}
                  />
                  <div className="flex flex-col">
                    <span className="text-xs font-medium" style={{ color: fg }}>
                      {s.name}
                    </span>
                    <span className="text-[0.7rem]" style={{ color: fg }}>
                      {s.message}
                    </span>
                  </div>
                </div>
                <span
                  aria-live="polite"
                  className="font-mono text-[0.6rem] text-fg-muted tabular-nums"
                >
                  text {ratio.toFixed(2)}:1 · Lc {lc.toFixed(1)}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </Demo>
  )
}
