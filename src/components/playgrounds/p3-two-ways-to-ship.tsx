import { useEffect, useState } from 'react'
import { clampRgb, converter, differenceEuclidean, formatHex } from 'culori'

import { Demo } from '@/components/demo'

const toRgb = converter('rgb')
const dEok = differenceEuclidean('oklab')

// Base: 98% of the sRGB chroma ceiling at accent-500's L/h. Upgrade: 98% of P3's.
const BASE = { mode: 'oklch' as const, l: 0.6478, c: 0.1849, h: 251.06 }
const UPGRADE_LITERAL = 'oklch(0.6478 0.2055 251.06)'
const UPGRADE = { mode: 'oklch' as const, l: 0.6478, c: 0.2055, h: 251.06 }

const baseHex = formatHex(BASE) ?? '#000000'
const clipHex = formatHex(clampRgb(toRgb(UPGRADE))) ?? '#000000'
const clipCost = dEok(clampRgb(toRgb(UPGRADE)), UPGRADE)

export function P3TwoWaysToShip() {
  const [p3Screen, setP3Screen] = useState<boolean | null>(null)

  useEffect(() => {
    const mq = window.matchMedia('(color-gamut: p3)')
    setP3Screen(mq.matches)
    const onChange = (e: MediaQueryListEvent) => setP3Screen(e.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  return (
    <Demo
      caption={
        <>
          Two ways to ship the same wide color. The bare literal reaches P3
          screens with no extra CSS &mdash; and hands every sRGB screen the
          channel clip (here mild: &Delta;Eok {clipCost.toFixed(3)}, but chapter
          6&rsquo;s salmon showed the damage scales with the overshoot). The
          guarded block ships an sRGB value you designed, and only screens
          matching <code>@media (color-gamut: p3)</code> ever see the upgrade
          &mdash; both renderings are yours. If the top two swatches look
          identical, your screen is sRGB and the seam is invisible by
          definition.
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <pre
              className="overflow-x-auto rounded-lg p-3 font-mono text-[0.65rem] leading-relaxed"
              style={{ backgroundColor: '#0d1117' }}
            >
              <div style={{ color: '#8b949e' }}>
                {'/* route 1 — bare wide literal */'}
              </div>
              <div style={{ color: '#e6edf3' }}>
                {`--accent: ${UPGRADE_LITERAL};`}
              </div>
            </pre>
            <div className="flex h-12 overflow-hidden rounded-lg border">
              <div
                className="flex-1"
                style={{ backgroundColor: UPGRADE_LITERAL }}
              />
              <div className="flex-1" style={{ backgroundColor: clipHex }} />
            </div>
            <span className="font-mono text-[0.65rem] text-fg-muted tabular-nums">
              left: what your browser paints · right: the sRGB clip ({clipHex})
            </span>
          </div>

          <div className="flex flex-col gap-2">
            <pre
              className="overflow-x-auto rounded-lg p-3 font-mono text-[0.65rem] leading-relaxed"
              style={{ backgroundColor: '#0d1117' }}
            >
              <div style={{ color: '#8b949e' }}>
                {'/* route 2 — guarded upgrade */'}
              </div>
              <div style={{ color: '#e6edf3' }}>
                {`--accent: oklch(0.6478 0.1849 251.06);`}
              </div>
              <div style={{ color: '#d2a8ff' }}>
                {'@media (color-gamut: p3) {'}
              </div>
              <div style={{ color: '#d2a8ff' }}>
                {`  :root { --accent: ${UPGRADE_LITERAL}; }`}
              </div>
              <div style={{ color: '#d2a8ff' }}>{'}'}</div>
            </pre>
            <div className="flex h-12 overflow-hidden rounded-lg border">
              <div
                className="flex-1"
                style={{
                  backgroundColor: p3Screen ? UPGRADE_LITERAL : baseHex,
                }}
              />
              <div className="flex-1" style={{ backgroundColor: baseHex }} />
            </div>
            <span
              aria-live="polite"
              className="font-mono text-[0.65rem] text-fg-muted tabular-nums"
            >
              left: what this route serves you · right: the designed sRGB base (
              {baseHex})
            </span>
          </div>
        </div>

        <p
          aria-live="polite"
          className="font-mono text-[0.7rem] text-fg-muted tabular-nums"
        >
          your screen matches (color-gamut: p3):{' '}
          {p3Screen === null ? 'checking…' : p3Screen ? 'yes' : 'no'}
        </p>
      </div>
    </Demo>
  )
}
