import { displayable } from 'culori'

import { Demo } from '@/components/demo'

const maxChroma = (l: number, h: number) => {
  let lo = 0
  let hi = 0.45
  for (let k = 0; k < 22; k++) {
    const mid = (lo + hi) / 2
    if (displayable({ mode: 'oklch', l, c: mid, h })) lo = mid
    else hi = mid
  }
  return lo
}

const SAMPLES = 72
const lAt = (k: number) => 0.02 + (0.96 * k) / (SAMPLES - 1)

function ceiling(h: number) {
  const pts = Array.from({ length: SAMPLES }, (_, k) => ({
    l: lAt(k),
    c: maxChroma(lAt(k), h),
  }))
  const crest = pts.reduce(
    (best, p) => (p.c > best.c ? p : best),
    pts[0] ?? { l: 0, c: 0 },
  )
  return { pts, crest }
}

const YELLOW = ceiling(110)
const BLUE = ceiling(264)

const W = 520
const H = 210
const PAD = { left: 40, right: 12, top: 14, bottom: 26 }
// white on the left, black on the right — same direction as the ramps
const px = (l: number) => PAD.left + (1 - l) * (W - PAD.left - PAD.right)
const py = (c: number) => PAD.top + (1 - c / 0.34) * (H - PAD.top - PAD.bottom)

const pathFor = (pts: { l: number; c: number }[]) =>
  pts
    .map(
      (p, i) =>
        `${i === 0 ? 'M' : 'L'}${px(p.l).toFixed(1)},${py(p.c).toFixed(1)}`,
    )
    .join(' ')

export function TwoCeilings() {
  return (
    <Demo
      caption={
        <>
          The sRGB ceiling at two hues, chroma up, white on the left. Yellow
          crests at L {YELLOW.crest.l.toFixed(2)} (C {YELLOW.crest.c.toFixed(2)}
          ) &mdash; nearly white; blue crests at L {BLUE.crest.l.toFixed(2)} (C{' '}
          {BLUE.crest.c.toFixed(2)}) &mdash; well into the dark half, just shy
          of <code>#0000ff</code>&rsquo;s needle-thin corner (L 0.45, C 0.31), a
          point too sharp for the sampled boundary to catch. At yellow&rsquo;s
          crest lightness, blue affords C 0.015 &mdash; seven percent of what
          yellow gets there. Same tent, different shape: a curve that hugs one
          is homeless under the other.
        </>
      }
    >
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-auto w-full text-fg"
        role="img"
        aria-label="Maximum sRGB chroma by lightness for hue 110 and hue 264"
      >
        <line
          x1={PAD.left}
          y1={py(0)}
          x2={px(0.02)}
          y2={py(0)}
          stroke="currentColor"
          strokeOpacity={0.25}
        />
        <line
          x1={PAD.left}
          y1={py(0)}
          x2={PAD.left}
          y2={py(0.34)}
          stroke="currentColor"
          strokeOpacity={0.25}
        />
        <path
          d={pathFor(YELLOW.pts)}
          fill="none"
          stroke="oklch(0.8 0.16 110)"
          strokeWidth={2}
        />
        <path
          d={pathFor(BLUE.pts)}
          fill="none"
          stroke="oklch(0.55 0.2 264)"
          strokeWidth={2}
        />
        <circle
          cx={px(YELLOW.crest.l)}
          cy={py(YELLOW.crest.c)}
          r={3.5}
          fill="oklch(0.8 0.16 110)"
          stroke="currentColor"
          strokeOpacity={0.5}
        />
        <circle
          cx={px(BLUE.crest.l)}
          cy={py(BLUE.crest.c)}
          r={3.5}
          fill="oklch(0.55 0.2 264)"
          stroke="currentColor"
          strokeOpacity={0.5}
        />
        <g
          className="font-mono text-[0.6rem]"
          fill="currentColor"
          fillOpacity={0.7}
        >
          <text x={px(YELLOW.crest.l) + 8} y={py(YELLOW.crest.c) - 4}>
            hue 110 — crest L {YELLOW.crest.l.toFixed(2)}
          </text>
          <text
            x={px(BLUE.crest.l)}
            y={py(BLUE.crest.c) - 10}
            textAnchor="middle"
          >
            hue 264 — crest L {BLUE.crest.l.toFixed(2)}
          </text>
        </g>
        <g
          className="font-mono text-[0.6rem]"
          fill="currentColor"
          fillOpacity={0.55}
        >
          <text x={px(0.98)} y={H - 8} textAnchor="middle">
            L 1
          </text>
          <text x={px(0.02)} y={H - 8} textAnchor="middle">
            L 0
          </text>
          <text x={PAD.left - 6} y={py(0.34) + 4} textAnchor="end">
            0.34
          </text>
          <text x={PAD.left - 6} y={py(0) + 4} textAnchor="end">
            0
          </text>
          <text
            x={12}
            y={(py(0) + py(0.34)) / 2}
            textAnchor="middle"
            transform={`rotate(-90 12 ${(py(0) + py(0.34)) / 2})`}
          >
            C
          </text>
        </g>
      </svg>
    </Demo>
  )
}
