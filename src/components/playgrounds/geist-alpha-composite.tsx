import { useState } from 'react'

import { Demo } from '@/components/demo'
import { ToggleButton } from '@/ui/toggle-button'
import { ToggleButtonGroup } from '@/ui/toggle-button-group'

type Surface = 'white' | 'tint' | 'mid'

// Geist light surfaces, verified from vercel.com/design.md.
const SURFACES: Record<Surface, { label: string; value: string }> = {
  white: { label: 'background-100', value: '#ffffff' },
  tint: { label: 'blue-100', value: '#f0f7ff' },
  mid: { label: 'blue-400', value: '#cae7ff' },
}

// Illustrative construction: black at this alpha composites to gray-400
// #eaeaea over white (255·(1−α)=234), so both dividers match on the common case.
const A = 1 - 234 / 255 // ≈ 0.082
const SOLID_DIVIDER = '#eaeaea' // gray-400
const ALPHA_DIVIDER = `rgba(0,0,0,${A.toFixed(3)})`

const ROWS = ['Production', 'Preview', 'Development']

function Panel({
  divider,
  bg,
  title,
}: {
  divider: string
  bg: string
  title: string
}) {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-2">
      <span className="text-xs text-fg-muted">{title}</span>
      <div
        className="overflow-hidden rounded-lg"
        style={{ backgroundColor: bg }}
      >
        {ROWS.map((r, i) => (
          <div
            key={r}
            className="px-3 py-2 text-[0.7rem]"
            style={{
              color: '#171717',
              borderTop: i === 0 ? undefined : `1px solid ${divider}`,
            }}
          >
            {r}
          </div>
        ))}
      </div>
    </div>
  )
}

export function GeistAlphaComposite() {
  const [surface, setSurface] = useState<Surface>('white')
  const bg = SURFACES[surface].value

  return (
    <Demo
      caption={
        <>
          Both dividers match on white — the alpha is tuned so it lands on solid{' '}
          <span className="font-mono">gray-400</span> there. Switch the surface:
          the solid divider becomes a lighter mismatched band; the alpha divider
          just darkens whatever is under it, staying in family. Alpha is how a
          fixed value survives an unknown background.
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs text-fg-muted">surface</span>
          <ToggleButtonGroup
            selectionMode="single"
            disallowEmptySelection
            selectedKeys={[surface]}
            onSelectionChange={(keys) => {
              const next = [...keys][0]
              if (next === 'white' || next === 'tint' || next === 'mid')
                setSurface(next)
            }}
            size="sm"
            aria-label="Surface the divider sits on"
            className="max-w-full overflow-x-auto"
          >
            <ToggleButton id="white">White</ToggleButton>
            <ToggleButton id="tint">Tint</ToggleButton>
            <ToggleButton id="mid">Mid</ToggleButton>
          </ToggleButtonGroup>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row">
          <Panel divider={SOLID_DIVIDER} bg={bg} title="Solid gray-400" />
          <Panel divider={ALPHA_DIVIDER} bg={bg} title="gray-alpha" />
        </div>

        <span
          aria-live="polite"
          className="font-mono text-[0.65rem] text-fg-muted tabular-nums"
        >
          on {SURFACES[surface].label} — solid {SOLID_DIVIDER} · alpha
          rgba(0,0,0,{A.toFixed(3)})
        </span>
      </div>
    </Demo>
  )
}
