import { Demo } from '@/components/demo'

const SYSTEMS = [
  {
    name: 'Radix custom palette',
    keeps:
      'Everything, re-aimed: every step takes the seed’s hue, chroma is rescaled to it (capped at 1.5× the seed’s C), lightness comes from the blended masters.',
    ships:
      'Yes — the seed is written verbatim into step 9, unless it sits within ΔEOK 0.25 of the scale’s background step.',
    verdict: 'verbatim',
  },
  {
    name: 'Material dynamic color (default scheme)',
    keeps:
      'The hue, and nothing else. Chroma is fixed by policy (36 for the primary palette), lightness by role — tone 40 in light mode, 80 in dark.',
    ships:
      'No — “the seedColor may not wind up as one of the ColorScheme colors.” A separate fidelity variant exists to put it (almost) back.',
    verdict: 'snapped',
  },
  {
    name: 'Leonardo',
    keeps:
      'The path: key colors define hue and chroma along the lightness axis, and swatches are sampled from that path at target contrast ratios.',
    ships:
      'Only by accident — the exact key color appears when a contrast target happens to land on its lightness.',
    verdict: 'snapped',
  },
  {
    name: 'dotUI today',
    keeps:
      'Chroma (envelope-shaped, floored at 0.11) and hue. The seed’s lightness is discarded — the skeleton is a fixed array.',
    ships:
      'No — even the opt-in “preserve seed” pins only its lightness; the step’s chroma still comes from the envelope.',
    verdict: 'snapped',
  },
]

export function WhoKeepsYourHex() {
  return (
    <Demo
      caption={
        <>
          Same question to four shipped generators: you pasted one exact color
          &mdash; does it come back out? Three of the four quietly answer no.
        </>
      }
    >
      <div className="flex flex-col gap-4">
        {SYSTEMS.map((s) => (
          <div
            key={s.name}
            className="flex flex-col gap-1 border-b pb-4 last:border-b-0 last:pb-0"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-medium">{s.name}</span>
              <span className="shrink-0 rounded-md border px-2 py-0.5 font-mono text-[0.65rem] text-fg-muted uppercase">
                {s.verdict}
              </span>
            </div>
            <p className="text-xs text-fg-muted">
              <span className="font-medium text-fg">Keeps of the seed:</span>{' '}
              {s.keeps}
            </p>
            <p className="text-xs text-fg-muted">
              <span className="font-medium text-fg">Exact seed ships:</span>{' '}
              {s.ships}
            </p>
          </div>
        ))}
      </div>
    </Demo>
  )
}
