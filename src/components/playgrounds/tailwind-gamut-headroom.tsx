import { useState } from 'react'
import {
  clampChroma,
  converter,
  differenceEuclidean,
  formatHex,
  inGamut,
} from 'culori'

import { Demo } from '@/components/demo'
import { ToggleButton } from '@/ui/toggle-button'
import { ToggleButtonGroup } from '@/ui/toggle-button-group'

const toOklch = converter('oklch')
const dEOK = differenceEuclidean('oklab')
const inSrgb = inGamut('rgb')

// Tailwind v4 default theme, verbatim oklch (theme.css) — three vivid mid steps.
const PICKS = [
  { key: 'amber', label: 'amber-500', str: 'oklch(76.9% 0.188 70.08)' },
  { key: 'blue', label: 'blue-500', str: 'oklch(62.3% 0.214 259.815)' },
  { key: 'red', label: 'red-600', str: 'oklch(57.7% 0.245 27.325)' },
] as const

type Key = (typeof PICKS)[number]['key']

export function TailwindGamutHeadroom() {
  const [key, setKey] = useState<Key>('amber')
  const pick = PICKS.find((p) => p.key === key) ?? PICKS[0]

  const clamped = clampChroma(pick.str, 'oklch') ?? pick.str // maps chroma into sRGB
  const de = inSrgb(pick.str) ? 0 : dEOK(pick.str, clamped)
  const cP3 = toOklch(pick.str)?.c ?? 0
  const cSrgb = toOklch(clamped)?.c ?? 0
  const srgbHex = formatHex(clamped) ?? '#000000'

  return (
    <Demo
      caption={
        <>
          Left is the color as authored, at the P3 chroma ceiling; right is the
          same color gamut-mapped back to sRGB (chapter 6&rsquo;s{' '}
          <span className="font-mono">clampChroma</span>). On a P3 display the
          left is visibly more saturated; on an sRGB display both render the
          same, which is the honest point &mdash; the headroom exists only where
          the hardware can show it. The chroma given up costs ΔEOK{' '}
          {de.toFixed(3)}
          {de >= 0.02
            ? ', past chapter 14’s 0.02 just-noticeable difference'
            : ' — real, but under chapter 14’s 0.02 JND'}
          .
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <ToggleButtonGroup
          selectionMode="single"
          disallowEmptySelection
          selectedKeys={[key]}
          onSelectionChange={(keys) => {
            const next = [...keys][0]
            if (typeof next === 'string') setKey(next as Key)
          }}
          size="sm"
          aria-label="Palette step"
          className="max-w-full overflow-x-auto"
        >
          {PICKS.map((p) => (
            <ToggleButton key={p.key} id={p.key}>
              {p.label}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <span
              className="h-20 w-full rounded-lg border"
              style={{ backgroundColor: pick.str }}
            />
            <span className="font-mono text-[0.65rem] text-fg-muted tabular-nums">
              P3, as authored · C {cP3.toFixed(3)}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <span
              className="h-20 w-full rounded-lg border"
              style={{ backgroundColor: srgbHex }}
            />
            <span className="font-mono text-[0.65rem] text-fg-muted tabular-nums">
              sRGB, clamped · C {cSrgb.toFixed(3)}
            </span>
          </div>
        </div>

        <span
          aria-live="polite"
          className="font-mono text-[0.65rem] text-fg-muted tabular-nums"
        >
          {pick.label}: chroma {cP3.toFixed(3)} → {cSrgb.toFixed(3)} on the way
          to sRGB · ΔEOK {de.toFixed(3)}
        </span>
      </div>
    </Demo>
  )
}
