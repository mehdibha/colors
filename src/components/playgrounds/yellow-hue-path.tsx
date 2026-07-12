import { useState } from 'react'
import { clampChroma, clampRgb, converter, formatHex } from 'culori'

import { Demo } from '@/components/demo'
import { ToggleButton } from '@/ui/toggle-button'
import { ToggleButtonGroup } from '@/ui/toggle-button-group'

import { TW_STEPS, twCss, twFamily } from './tailwind-v4-palette'

const FAMILIES = ['yellow', 'amber', 'orange', 'blue'] as const
type FamilyId = (typeof FAMILIES)[number]

const toRgb = converter('rgb')

export function YellowHuePath() {
  const [family, setFamily] = useState<FamilyId>('yellow')
  const f = twFamily(family)
  const anchorH = f.steps[0]?.[2] ?? 0
  const sweep = (f.steps[10]?.[2] ?? 0) - anchorH

  return (
    <Demo
      caption={
        <>
          Top row: the shipped ramp, per-step hue printed. Bottom row: the same
          L and C with hue frozen at the 50 step&rsquo;s angle (chroma clamped
          to sRGB where the frozen hue affords less). Yellow sweeps −48° and
          ends at h&nbsp;53.8 — numerically an orange — because frozen at 102°
          its darks are olive. Blue drifts +13° and barely changes. Chapter
          13&rsquo;s bend, read straight out of the shipped file — and invisible
          in the API: <code>text-yellow-900</code> never says its hue left the
          family.
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <ToggleButtonGroup
          selectionMode="single"
          disallowEmptySelection
          selectedKeys={[family]}
          onSelectionChange={(keys) => {
            const next = [...keys][0]
            if (FAMILIES.includes(next as FamilyId)) setFamily(next as FamilyId)
          }}
          size="sm"
          aria-label="Family"
          className="max-w-full overflow-x-auto"
        >
          {FAMILIES.map((id) => (
            <ToggleButton key={id} id={id}>
              {id}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>

        <div className="flex flex-col gap-1">
          <span className="text-[0.65rem] text-fg-muted">
            shipped — hue bends {sweep > 0 ? '+' : ''}
            {sweep.toFixed(1)}° across the ramp
          </span>
          <div className="grid grid-cols-11 gap-1">
            {f.steps.map((s, i) => (
              <div key={TW_STEPS[i]} className="flex min-w-0 flex-col gap-0.5">
                <div
                  className="h-8 rounded-sm border"
                  style={{ backgroundColor: twCss(s) }}
                />
                <span className="truncate text-center font-mono text-[0.5rem] text-fg-muted tabular-nums">
                  {s[2].toFixed(0)}°
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-[0.65rem] text-fg-muted">
            same L and C, hue frozen at {anchorH.toFixed(0)}°
          </span>
          <div className="grid grid-cols-11 gap-1">
            {f.steps.map((s, i) => {
              const frozen = clampChroma(
                { mode: 'oklch', l: s[0] / 100, c: s[1], h: anchorH },
                'oklch',
              )
              return (
                <div
                  key={TW_STEPS[i]}
                  className="h-8 rounded-sm border"
                  style={{
                    backgroundColor: formatHex(clampRgb(toRgb(frozen))),
                  }}
                  title={`${family}-${TW_STEPS[i]} at h ${anchorH.toFixed(0)}`}
                />
              )
            })}
          </div>
        </div>

        <div className="grid grid-cols-11 gap-1">
          {TW_STEPS.map((s) => (
            <span
              key={s}
              className="text-center font-mono text-[0.55rem] text-fg-muted tabular-nums"
            >
              {s}
            </span>
          ))}
        </div>
      </div>
    </Demo>
  )
}
