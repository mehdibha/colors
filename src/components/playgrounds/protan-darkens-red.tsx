import {
  converter,
  filterDeficiencyDeuter,
  filterDeficiencyProt,
  formatHex,
} from 'culori'

import { Demo } from '@/components/demo'

const toLab = converter('lab')
const toRgb = converter('rgb')
const lstar = (hex: string) => Math.round(toLab(hex)?.l ?? 0)

const RED = '#dc2626'
const RED_RGB = toRgb(RED) ?? { mode: 'rgb' as const, r: 0, g: 0, b: 0 }

const NORMAL = { label: 'Normal vision', hex: RED }
const DEUTAN = {
  label: 'Deuteranopia',
  hex: formatHex(filterDeficiencyDeuter(1)(RED_RGB)),
}
const PROTAN = {
  label: 'Protanopia',
  hex: formatHex(filterDeficiencyProt(1)(RED_RGB)),
}
const VIEWS = [NORMAL, DEUTAN, PROTAN]

export function ProtanDarkensRed() {
  return (
    <Demo
      caption={
        <>
          One red, <code className="font-mono text-[0.8rem]">#dc2626</code>,
          through three eyes. Deuteranopia mutes the hue and dims it somewhat
          (L* {lstar(RED)} &rarr; {lstar(DEUTAN.hex)}). Protanopia drops it into
          the shadows (L* {lstar(RED)} &rarr; {lstar(PROTAN.hex)}) — protanopes
          are missing the long-wavelength cones, so red light carries far less
          luminance for them. This is the nuance behind &ldquo;lightness
          survives CVD&rdquo;: roughly true for deutan, but a red you tuned to a
          safe contrast can lose it for a protanope when it darkens against a
          dark surface.
        </>
      }
    >
      <div className="grid gap-3 sm:grid-cols-3">
        {VIEWS.map((v) => (
          <div key={v.label} className="flex flex-col gap-2">
            <div
              className="flex h-20 items-end rounded-lg border p-2"
              style={{ backgroundColor: v.hex }}
            >
              <span className="font-mono text-[0.7rem] text-white/90 tabular-nums mix-blend-difference">
                L* {lstar(v.hex)}
              </span>
            </div>
            <span className="text-xs text-fg-muted">{v.label}</span>
          </div>
        ))}
      </div>
    </Demo>
  )
}
