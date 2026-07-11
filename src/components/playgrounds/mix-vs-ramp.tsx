import { useState } from 'react'
import { converter, differenceEuclidean, formatHex, interpolate } from 'culori'

import { Demo } from '@/components/demo'
import { ToggleButton } from '@/ui/toggle-button'
import { ToggleButtonGroup } from '@/ui/toggle-button-group'

type Space = 'oklab' | 'oklch' | 'srgb'

const toOklch = converter('oklch')
const toRgb = converter('rgb')
const dEOK = differenceEuclidean('oklab')

// dotUI blue ramp (registry base/colors.css): 500 is the accent, 600 the baked
// hover — placed at a target lightness, then gamut-mapped under chapter 6's tent.
const ACCENT = '#4992dd' // blue 500
const BAKED_HOVER = '#347bc2' // blue 600, the ramp's designed step

// color-mix names its space as srgb/oklab/oklch; culori's sRGB mode is 'rgb'.
const CULORI: Record<Space, 'oklab' | 'oklch' | 'rgb'> = {
  oklab: 'oklab',
  oklch: 'oklch',
  srgb: 'rgb',
}

// Two surfaces the hover has to survive: a near-white card and a tinted panel.
const SURFACES = [
  { label: 'white card', bg: '#f6f6f7' },
  { label: 'tinted panel', bg: '#e6dcc7' },
]

const fmt = (hex: string) => {
  const c = toOklch(hex)
  if (!c) return ''
  return `oklch(${(c.l ?? 0).toFixed(3)} ${(c.c ?? 0).toFixed(3)} ${(c.h ?? 0).toFixed(0)})`
}

// color-mix(in oklab, accent, transparent 12%) — the accent at 88% alpha, which
// composites over whatever surface is behind it.
const alphaOf = (hex: string, a: number) => {
  const c = toRgb(hex)
  if (!c) return hex
  const to255 = (x: number) => Math.round(Math.min(1, Math.max(0, x)) * 255)
  return `rgba(${to255(c.r ?? 0)}, ${to255(c.g ?? 0)}, ${to255(c.b ?? 0)}, ${a})`
}

export function MixVsRamp() {
  const [space, setSpace] = useState<Space>('oklab')
  const mixed =
    formatHex(interpolate([ACCENT, '#000000'], CULORI[space])(0.12)) ?? ACCENT
  const drift = dEOK(mixed, BAKED_HOVER)
  const alphaHover = alphaOf(ACCENT, 0.88)

  const swatches = [
    { tag: 'accent (500)', hex: ACCENT, note: 'the seed' },
    { tag: 'color-mix hover', hex: mixed, note: `in ${space}, black 12%` },
    { tag: 'baked step 600', hex: BAKED_HOVER, note: 'gamut-mapped' },
  ]

  return (
    <Demo
      caption={
        <>
          <span className="font-mono">color-mix</span> is interpolation (chapter
          7): a straight line 12% toward black. The ramp&rsquo;s step 600 was a
          lightness pick then gamut-mapped under chapter 6&rsquo;s tent, so the
          mix and the baked rung land at different colors &mdash; and switching
          the space moves the mix again without ever hitting the baked value.
          The lower row is chapter 18&rsquo;s point: a solid toward-black hover
          is surface-blind (identical on both panels), while a
          toward-transparent alpha hover composites over whatever it sits on.
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs text-fg-muted">mix in</span>
          <ToggleButtonGroup
            selectionMode="single"
            disallowEmptySelection
            selectedKeys={[space]}
            onSelectionChange={(keys) => {
              const next = [...keys][0]
              if (next === 'oklab' || next === 'oklch' || next === 'srgb')
                setSpace(next)
            }}
            size="sm"
            aria-label="Interpolation space"
            className="max-w-full overflow-x-auto"
          >
            <ToggleButton id="oklab">oklab</ToggleButton>
            <ToggleButton id="oklch">oklch</ToggleButton>
            <ToggleButton id="srgb">srgb</ToggleButton>
          </ToggleButtonGroup>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {swatches.map((s) => (
            <div key={s.tag} className="flex flex-col gap-1.5">
              <div
                className="h-14 w-full rounded-md border"
                style={{ backgroundColor: s.hex }}
              />
              <span className="font-mono text-[0.65rem] tabular-nums">
                {s.tag}
              </span>
              <span className="font-mono text-[0.6rem] text-fg-muted tabular-nums">
                {s.hex} · {s.note}
              </span>
              <span className="font-mono text-[0.6rem] text-fg-muted tabular-nums">
                {fmt(s.hex)}
              </span>
            </div>
          ))}
        </div>

        <div className="overflow-x-auto rounded-md bg-muted/50 p-3">
          <pre className="font-mono text-[0.65rem] whitespace-pre">{`--accent:       ${ACCENT};\n--accent-hover: color-mix(in ${space}, var(--accent), black 12%);`}</pre>
        </div>

        <span
          aria-live="polite"
          className="font-mono text-[0.65rem] text-fg-muted tabular-nums"
        >
          mix vs baked step 600: ΔEOK {drift.toFixed(3)}
          {drift > 0.02
            ? ' — past the 0.02 just-noticeable difference; a careful eye sees it.'
            : ' — under the 0.02 just-noticeable difference; close enough here.'}
        </span>

        <div className="flex flex-col gap-2 border-t pt-4">
          <span className="text-xs text-fg-muted">
            same solid hover vs an alpha hover, on two surfaces
          </span>
          <div className="grid gap-3 sm:grid-cols-2">
            {SURFACES.map((surf) => (
              <div
                key={surf.label}
                className="flex flex-col gap-2 rounded-md border p-3"
                style={{ backgroundColor: surf.bg }}
              >
                <span className="font-mono text-[0.6rem] text-black/60 tabular-nums">
                  {surf.label}
                </span>
                <div className="flex gap-2">
                  <div className="flex flex-1 flex-col items-center gap-1">
                    <div
                      className="h-10 w-full rounded"
                      style={{ backgroundColor: mixed }}
                    />
                    <span className="font-mono text-[0.55rem] text-black/60 tabular-nums">
                      solid (black 12%)
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col items-center gap-1">
                    <div
                      className="h-10 w-full rounded"
                      style={{ backgroundColor: alphaHover }}
                    />
                    <span className="font-mono text-[0.55rem] text-black/60 tabular-nums">
                      alpha (transparent 12%)
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <span className="font-mono text-[0.6rem] text-fg-muted tabular-nums">
            solid chip is the same color on both panels; the alpha chip shifts
            with the surface — that is the surface-blind vs surface-correct
            trade.
          </span>
        </div>
      </div>
    </Demo>
  )
}
