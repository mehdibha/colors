import { Demo } from '@/components/demo'

import {
  DEFAULT_RATIOS,
  labLightness,
  LEONARDO_BLUE_THEMES,
  wcagRatio,
} from './leonardo-mini'

// One declaration, three lightness numbers — every value below is verbatim
// @adobe/leonardo-contrast-colors v1.1.0 output; the ratios are re-measured
// live with culori.

export function AdaptiveThemeStrip() {
  return (
    <Demo
      caption={
        <>
          Verbatim output of <code>@adobe/leonardo-contrast-colors</code>{' '}
          v1.1.0: the same blue declaration solved at theme lightness 98, 20,
          and 11. Read blue400 across the rows — three different hexes, the same
          4.5:1, re-measured live under each swatch. And read blue100: lighter
          than the ramp's end on the light background, darker than it on the
          dark ones. The ramp direction flipped; nobody wrote a dark palette.
        </>
      }
    >
      <div className="flex flex-col gap-3">
        {LEONARDO_BLUE_THEMES.map((theme) => (
          <div
            key={theme.lightness}
            className="rounded-lg border p-4"
            style={{ backgroundColor: theme.bg }}
          >
            <div className="mb-3 font-mono text-[0.65rem] tabular-nums">
              <span
                style={{
                  color: labLightness(theme.bg) >= 50 ? '#3f3f46' : '#a1a1aa',
                }}
              >
                lightness: {theme.lightness} → background {theme.bg} (L*{' '}
                {labLightness(theme.bg).toFixed(1)})
              </span>
            </div>
            <div className="flex gap-2">
              {theme.values.map((hex, i) => {
                const measured = wcagRatio(hex, theme.bg)
                const label =
                  labLightness(theme.bg) >= 50 ? '#3f3f46' : '#a1a1aa'
                return (
                  <div
                    key={hex}
                    className="flex min-w-0 flex-1 flex-col items-center gap-1"
                  >
                    <div
                      className="h-10 w-full rounded-md"
                      style={{ backgroundColor: hex }}
                    />
                    <span
                      className="font-mono text-[0.6rem] tabular-nums"
                      style={{ color: label }}
                    >
                      blue{(i + 1) * 100}
                    </span>
                    <span
                      className="font-mono text-[0.6rem] tabular-nums"
                      style={{ color: label }}
                    >
                      {DEFAULT_RATIOS[i]?.toFixed(1)} → {measured.toFixed(2)}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </Demo>
  )
}
