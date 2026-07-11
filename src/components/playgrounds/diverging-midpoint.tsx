import { converter, formatHex, interpolate, samples } from 'culori'

import { Demo } from '@/components/demo'

const toOklch = converter('oklch')

// ColorBrewer RdBu 5-class: two sequential arms, a near-white light-neutral mid.
const GOOD = ['#ca0020', '#f4a582', '#f7f7f7', '#92c5de', '#0571b0']

// The chapter-7 trap: red straight to blue in RGB sags through muddy gray at zero.
const badFn = interpolate(['#ca0020', '#0571b0'], 'rgb')
const BAD = samples(5).map((t) => formatHex(badFn(t)))

const lOf = (hex: string) => (toOklch(hex)?.l ?? 0).toFixed(2)
const cOf = (hex: string) => (toOklch(hex)?.c ?? 0).toFixed(3)

function Row({
  title,
  colors,
  verdict,
  tone,
}: {
  title: string
  colors: string[]
  verdict: string
  tone: 'ok' | 'bad'
}) {
  const mid = colors[2] ?? '#000'
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-medium">{title}</span>
      <div className="flex h-9 overflow-hidden rounded-md border">
        {colors.map((hex, i) => (
          <div
            key={i}
            className="relative flex-1"
            style={{ backgroundColor: hex }}
          >
            {i === 2 && (
              <span className="absolute inset-x-0 -bottom-5 text-center text-[0.6rem] text-fg-muted">
                midpoint
              </span>
            )}
          </div>
        ))}
      </div>
      <span
        className={`mt-4 font-mono text-[0.65rem] tabular-nums ${tone === 'ok' ? 'text-fg-success' : 'text-fg-danger'}`}
      >
        mid {mid} · L {lOf(mid)} · C {cOf(mid)} — {verdict}
      </span>
    </div>
  )
}

export function DivergingMidpoint() {
  return (
    <Demo
      caption={
        <>
          A diverging scale is two sequential arms glued at zero. RdBu&rsquo;s
          midpoint is a near-white light neutral, so zero reads as &ldquo;no
          signal.&rdquo; Interpolate red straight to blue and zero becomes the
          gray nobody chose &mdash; chapter 7&rsquo;s gray concrete, muddy and
          dark, sitting on your most important data point.
        </>
      }
    >
      <div className="flex flex-col gap-6">
        <Row
          title="Light-neutral midpoint (ColorBrewer RdBu)"
          colors={GOOD}
          verdict="pale neutral — zero is legible"
          tone="ok"
        />
        <Row
          title="Straight red→blue in RGB"
          colors={BAD}
          verdict="gray concrete — zero is muddy"
          tone="bad"
        />
      </div>
    </Demo>
  )
}
