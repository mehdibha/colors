import { useState } from 'react'
import { clampChroma, converter, formatHex } from 'culori'

import { Demo } from '@/components/demo'
import { ToggleButton } from '@/ui/toggle-button'
import { ToggleButtonGroup } from '@/ui/toggle-button-group'

type HueKey = 'green' | 'red' | 'orange'

const toOklch = converter('oklch')

// P3-space primaries that sit past the sRGB edge (chapter 6's headroom). The P3
// swatch renders a real color(display-p3 …): on a wide-gamut display it pops;
// elsewhere the browser keeps the sRGB fallback.
const TARGETS: Record<HueKey, { label: string; p3: string }> = {
  green: { label: 'Green', p3: 'color(display-p3 0 0.9 0.35)' },
  red: { label: 'Red', p3: 'color(display-p3 1 0 0)' },
  orange: { label: 'Orange', p3: 'color(display-p3 1 0.5 0)' },
}

const chromaOf = (color: string) => toOklch(color)?.c ?? 0

export function P3Fallback() {
  const [hue, setHue] = useState<HueKey>('green')
  const target = TARGETS[hue].p3
  // Pass the string straight into clampChroma so it hits the (color: string)
  // overload — gamut-maps the P3 target back under the sRGB tent for the fallback.
  const fallback = formatHex(clampChroma(target, 'oklch')) ?? '#000000'
  const cP3 = chromaOf(target)
  const cSRGB = chromaOf(fallback)
  const headroom =
    cP3 > 0 && cSRGB > 0 ? (((cP3 - cSRGB) / cSRGB) * 100).toFixed(0) : '0'

  return (
    <Demo
      caption={
        <>
          Declare sRGB first, override for P3 &mdash; the last valid declaration
          wins, so a browser that can&rsquo;t parse the P3 line keeps the
          fallback. The headroom is chapter 6&rsquo;s tent, and it changes with
          hue. Two guards, not one:{' '}
          <span className="font-mono">@media (color-gamut: p3)</span> tests the
          display, <span className="font-mono">@supports</span> tests the
          syntax.
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs text-fg-muted">hue</span>
          <ToggleButtonGroup
            selectionMode="single"
            disallowEmptySelection
            selectedKeys={[hue]}
            onSelectionChange={(keys) => {
              const next = [...keys][0]
              if (typeof next === 'string' && next in TARGETS)
                setHue(next as HueKey)
            }}
            size="sm"
            aria-label="Hue"
            className="max-w-full overflow-x-auto"
          >
            {(Object.keys(TARGETS) as HueKey[]).map((k) => (
              <ToggleButton key={k} id={k}>
                {TARGETS[k].label}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <div
              className="h-16 w-full rounded-md border"
              style={{ backgroundColor: fallback }}
            />
            <span className="font-mono text-[0.65rem] tabular-nums">
              sRGB fallback · {fallback}
            </span>
            <span className="font-mono text-[0.6rem] text-fg-muted tabular-nums">
              C {cSRGB.toFixed(3)}
            </span>
          </div>
          <div className="flex flex-col gap-1.5">
            <div
              className="h-16 w-full rounded-md border"
              style={{ backgroundColor: target }}
            />
            <span className="font-mono text-[0.65rem] tabular-nums">
              P3 upgrade · {target}
            </span>
            <span
              aria-live="polite"
              className="font-mono text-[0.6rem] text-fg-muted tabular-nums"
            >
              C {cP3.toFixed(3)} · +{headroom}% chroma
            </span>
          </div>
        </div>

        <div className="overflow-x-auto rounded-md bg-muted/50 p-3">
          <pre className="font-mono text-[0.65rem] whitespace-pre">{`.brand { background: ${fallback}; }              /* sRGB, always */

@supports (color: color(display-p3 1 0 0)) {   /* syntax test */
  @media (color-gamut: p3) {                    /* display test */
    .brand { background: ${target}; }
  }
}`}</pre>
        </div>

        <p className="text-xs text-fg-danger">
          There is no{' '}
          <span className="font-mono">@supports (color-gamut: p3)</span> &mdash;{' '}
          <span className="font-mono">@supports</span> tests properties and
          values, not media features, so that block never applies.
        </p>
      </div>
    </Demo>
  )
}
