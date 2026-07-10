import { Demo } from '@/components/demo'

const ROWS = [
  {
    code: 'linear-gradient(rgb(0 0 255), rgb(255 255 0))',
    note: 'legacy stops → srgb',
    css: 'linear-gradient(90deg, rgb(0 0 255), rgb(255 255 0))',
  },
  {
    code: 'linear-gradient(color(srgb 0 0 1), rgb(255 255 0))',
    note: 'one modern stop → oklab',
    css: 'linear-gradient(90deg, color(srgb 0 0 1), rgb(255 255 0))',
  },
  {
    code: 'linear-gradient(in oklab, rgb(0 0 255), rgb(255 255 0))',
    note: 'explicit — what an engine should emit',
    css: 'linear-gradient(90deg in oklab, rgb(0 0 255), rgb(255 255 0))',
  },
]

export function SpellingChangesTheMiddle() {
  return (
    <Demo
      caption={
        <>
          Your browser rendering three gradients between the same two colors —{' '}
          <code className="font-mono text-[0.8rem]">color(srgb 0 0 1)</code> is{' '}
          <code className="font-mono text-[0.8rem]">rgb(0 0 255)</code>,
          exactly, in modern spelling. That spelling is the only difference
          between the first two rows, and it moves the whole gradient from sRGB
          to OKLab: the legacy carve-out reads the stops' syntax, not their
          values. The third row says what it means.
        </>
      }
    >
      <div className="flex flex-col gap-4">
        {ROWS.map((row) => (
          <div key={row.code} className="flex flex-col gap-1.5">
            <div className="flex items-baseline justify-between gap-3">
              <span className="font-mono text-[0.7rem] text-fg-muted">
                {row.code}
              </span>
              <span className="shrink-0 font-mono text-[0.7rem] tracking-wider text-fg-muted uppercase">
                {row.note}
              </span>
            </div>
            <div
              className="h-10 rounded-lg border"
              style={{ background: row.css }}
            />
          </div>
        ))}
      </div>
    </Demo>
  )
}
