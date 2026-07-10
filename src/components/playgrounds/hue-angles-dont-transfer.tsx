import { converter, formatHex } from 'culori'

import { Demo } from '@/components/demo'

const toRgb = converter('rgb')

const ANGLES = [0, 60, 120, 180, 240, 300]

const ROWS = [
  {
    label: 'hsl(H 100% 50%)',
    colors: ANGLES.map((h) =>
      formatHex(toRgb({ mode: 'hsl', h, s: 1, l: 0.5 })),
    ),
  },
  {
    label: 'oklch(0.70 0.10 H)',
    colors: ANGLES.map((h) =>
      formatHex(toRgb({ mode: 'oklch', l: 0.7, c: 0.1, h })),
    ),
  },
]

export function HueAnglesDontTransfer() {
  return (
    <Demo
      caption={
        <>
          Same six angles, two wheels. HSL's 0° is red; OKLCH's 0° is
          pink-magenta, and red sits near 29°. HSL's 240° is pure blue; that
          same blue reads 264° in OKLCH. Neither wheel is wrong — they're
          rotated and unevenly stretched relative to each other. Port a palette
          by converting the colors, never by copying the angles.
        </>
      }
    >
      <div className="flex flex-col gap-4">
        {ROWS.map((row) => (
          <div key={row.label} className="flex flex-col gap-2">
            <span className="font-mono text-[0.7rem] tracking-wider text-fg-muted uppercase">
              {row.label}
            </span>
            <div className="flex h-12 gap-0.5">
              {row.colors.map((css, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-sm border"
                  style={{ backgroundColor: css }}
                />
              ))}
            </div>
          </div>
        ))}
        <div className="flex font-mono text-[0.7rem] text-fg-muted">
          {ANGLES.map((h) => (
            <span key={h} className="flex-1 text-center tabular-nums">
              {h}°
            </span>
          ))}
        </div>
      </div>
    </Demo>
  )
}
