import { Demo } from '@/components/demo'

const PAIRS = [
  { hues: [220, 250], verdict: 'near twins' },
  { hues: [50, 80], verdict: 'different colors' },
]

export function ThirtyDegreeSteps() {
  return (
    <Demo
      caption={
        <>
          Two pairs, both exactly 30° of hue apart at the same S and L. Around
          blue, 30° barely registers; between yellow and green it crosses a
          category boundary. Equal hue steps are not equal perceptual steps —
          this pair of examples is straight from the CSS Color 4 spec.
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        {PAIRS.map((pair) => (
          <div key={pair.verdict} className="flex flex-col gap-2">
            <span className="font-mono text-[0.7rem] tracking-wider text-fg-muted uppercase">
              Δ30° — {pair.verdict}
            </span>
            <div className="flex h-16 overflow-hidden rounded-lg border">
              {pair.hues.map((h) => (
                <div
                  key={h}
                  className="flex-1"
                  style={{ backgroundColor: `hsl(${h} 100% 50%)` }}
                />
              ))}
            </div>
            <div className="flex font-mono text-[0.7rem] text-fg-muted">
              {pair.hues.map((h) => (
                <span key={h} className="flex-1 text-center">
                  {h}°
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Demo>
  )
}
