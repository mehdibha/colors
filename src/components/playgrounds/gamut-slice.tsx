import type * as React from 'react'
import { useEffect, useMemo, useRef, useState } from 'react'
import {
  clampRgb,
  converter,
  displayable,
  formatHex,
  inGamut,
  toGamut,
} from 'culori'

import { Playground } from '@/components/playground'
import { Slider, SliderControl } from '@/ui/slider'

const toOklch = converter('oklch')
const toRgb = converter('rgb')
const inP3 = inGamut('p3')
const gamutMap = toGamut('rgb', 'oklch')

const C_MAX = 0.42
const ROWS = 120
const COLS = 168

const W = 480
const H = 300
const PAD = { left: 40, right: 12, top: 12, bottom: 30 }
const PLOT_W = W - PAD.left - PAD.right
const PLOT_H = H - PAD.top - PAD.bottom

const px = (c: number) => PAD.left + (c / C_MAX) * PLOT_W
const py = (l: number) => PAD.top + (1 - l) * PLOT_H

// row i covers the pixel-center lightness, top row = lightest
const lAt = (i: number) => 1 - (i + 0.5) / ROWS

const maxChroma = (
  l: number,
  h: number,
  test: (color: { mode: 'oklch'; l: number; c: number; h: number }) => boolean,
) => {
  let lo = 0
  let hi = C_MAX
  for (let k = 0; k < 16; k++) {
    const mid = (lo + hi) / 2
    if (test({ mode: 'oklch', l, c: mid, h })) lo = mid
    else hi = mid
  }
  return lo
}

const boundaries = (h: number) => {
  const srgb: number[] = []
  const p3: number[] = []
  for (let i = 0; i < ROWS; i++) {
    const l = lAt(i)
    srgb.push(maxChroma(l, h, displayable))
    p3.push(maxChroma(l, h, inP3))
  }
  return { srgb, p3 }
}

const pathFor = (edge: number[]) =>
  edge
    .map(
      (c, i) =>
        `${i === 0 ? 'M' : 'L'}${px(c).toFixed(1)},${py(lAt(i)).toFixed(1)}`,
    )
    .join(' ')

const hueDelta = (a: number, b: number) => ((a - b + 540) % 360) - 180

const START = { h: 264, l: 0.75, c: 0.32 }

export function GamutSlice() {
  const [h, setH] = useState(START.h)
  const [l, setL] = useState(START.l)
  const [c, setC] = useState(START.c)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const dragging = useRef(false)

  const hq = Math.round(h)
  const edges = useMemo(() => boundaries(hq), [hq])

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    const img = ctx.createImageData(COLS, ROWS)
    for (let i = 0; i < ROWS; i++) {
      const rowL = lAt(i)
      const srgbEdge = edges.srgb[i] ?? 0
      const p3Edge = edges.p3[i] ?? 0
      for (let j = 0; j < COLS; j++) {
        const rowC = ((j + 0.5) / COLS) * C_MAX
        const idx = (i * COLS + j) * 4
        if (rowC <= srgbEdge) {
          const rgb = toRgb({ mode: 'oklch', l: rowL, c: rowC, h: hq })
          img.data[idx] = Math.round(255 * Math.min(Math.max(rgb.r, 0), 1))
          img.data[idx + 1] = Math.round(255 * Math.min(Math.max(rgb.g, 0), 1))
          img.data[idx + 2] = Math.round(255 * Math.min(Math.max(rgb.b, 0), 1))
          img.data[idx + 3] = 255
        } else if (rowC <= p3Edge) {
          img.data[idx] = 140
          img.data[idx + 1] = 140
          img.data[idx + 2] = 140
          img.data[idx + 3] = 56
        }
      }
    }
    ctx.putImageData(img, 0, 0)
  }, [edges, hq])

  const asked = { mode: 'oklch' as const, l, c, h }
  const inSrgb = displayable(asked)
  const inWide = inP3(asked)

  const clipped = toOklch(clampRgb(asked))
  const clipHex = formatHex(clampRgb(asked))
  const mapped = gamutMap(asked)
  const mapHex = formatHex(mapped)
  const mappedLch = toOklch(mapped)

  const cuspIndex = edges.srgb.indexOf(Math.max(...edges.srgb))
  const cuspC = edges.srgb[cuspIndex] ?? 0
  const cuspL = lAt(cuspIndex)

  const pointFrom = (event: React.PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const sx = ((event.clientX - rect.left) / rect.width) * W
    const sy = ((event.clientY - rect.top) / rect.height) * H
    setC(Math.min(Math.max(((sx - PAD.left) / PLOT_W) * C_MAX, 0), C_MAX))
    setL(Math.min(Math.max(1 - (sy - PAD.top) / PLOT_H, 0.05), 0.98))
  }

  const reset = () => {
    setH(START.h)
    setL(START.l)
    setC(START.c)
  }

  return (
    <Playground
      question="You named a color your screen can't show — what shows up instead?"
      onReset={reset}
    >
      <p className="mb-3 text-sm text-fg-muted">
        One vertical slice of the OKLCH solid, at one hue: lightness up, chroma
        right. The colored region is everything sRGB can show at this hue; the
        gray band exists only on Display P3 screens; past the dashed line, no
        screen you own. Drag the ring anywhere — or off the map.
      </p>

      <div
        className="relative cursor-crosshair touch-none select-none"
        onPointerDown={(event) => {
          dragging.current = true
          event.currentTarget.setPointerCapture(event.pointerId)
          pointFrom(event)
        }}
        onPointerMove={(event) => {
          if (dragging.current) pointFrom(event)
        }}
        onPointerUp={() => {
          dragging.current = false
        }}
      >
        <canvas
          ref={canvasRef}
          width={COLS}
          height={ROWS}
          className="absolute rounded-sm"
          style={{
            left: `${(PAD.left / W) * 100}%`,
            top: `${(PAD.top / H) * 100}%`,
            width: `${(PLOT_W / W) * 100}%`,
            height: `${(PLOT_H / H) * 100}%`,
          }}
        />
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="relative h-auto w-full text-fg"
          role="img"
          aria-label="Lightness by chroma slice of OKLCH with sRGB and Display P3 gamut boundaries"
        >
          <line
            x1={PAD.left}
            y1={py(0)}
            x2={px(C_MAX)}
            y2={py(0)}
            stroke="currentColor"
            strokeOpacity={0.25}
          />
          <line
            x1={PAD.left}
            y1={py(0)}
            x2={PAD.left}
            y2={py(1)}
            stroke="currentColor"
            strokeOpacity={0.25}
          />
          <path
            d={pathFor(edges.srgb)}
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
          />
          <path
            d={pathFor(edges.p3)}
            fill="none"
            stroke="currentColor"
            strokeWidth={1}
            strokeOpacity={0.5}
            strokeDasharray="4 3"
          />
          <circle cx={px(cuspC)} cy={py(cuspL)} r={2.5} fill="currentColor" />
          <text
            x={px(cuspC) + 6}
            y={py(cuspL) + 3}
            className="font-mono text-[0.6rem]"
            fill="currentColor"
            fillOpacity={0.55}
          >
            cusp
          </text>

          {!inSrgb && (
            <>
              <line
                x1={px(c)}
                y1={py(l)}
                x2={px(mappedLch.c)}
                y2={py(mappedLch.l)}
                stroke="currentColor"
                strokeOpacity={0.4}
                strokeDasharray="3 3"
              />
              <line
                x1={px(c)}
                y1={py(l)}
                x2={px(clipped.c)}
                y2={py(clipped.l)}
                stroke="currentColor"
                strokeOpacity={0.4}
                strokeDasharray="3 3"
              />
              <circle
                cx={px(mappedLch.c)}
                cy={py(mappedLch.l)}
                r={4}
                fill={mapHex}
                stroke="currentColor"
              />
              <circle
                cx={px(clipped.c)}
                cy={py(clipped.l)}
                r={4}
                fill={clipHex}
                stroke="currentColor"
              />
              <text
                x={px(clipped.c) + 7}
                y={py(clipped.l) + 3}
                className="font-mono text-[0.6rem]"
                fill="currentColor"
                fillOpacity={0.55}
              >
                clip
              </text>
              <text
                x={px(mappedLch.c) + 7}
                y={py(mappedLch.l) - 4}
                className="font-mono text-[0.6rem]"
                fill="currentColor"
                fillOpacity={0.55}
              >
                map
              </text>
            </>
          )}

          <circle
            cx={px(c)}
            cy={py(l)}
            r={6}
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          />

          <g
            className="font-mono text-[0.65rem]"
            fill="currentColor"
            fillOpacity={0.55}
          >
            <text x={PAD.left - 6} y={py(1) + 4} textAnchor="end">
              1
            </text>
            <text x={PAD.left - 6} y={py(0) + 4} textAnchor="end">
              0
            </text>
            <text x={PAD.left - 14} y={(py(0) + py(1)) / 2} textAnchor="middle">
              L
            </text>
            <text x={px(0)} y={H - 8} textAnchor="middle">
              0
            </text>
            <text x={px(C_MAX)} y={H - 8} textAnchor="middle">
              {C_MAX}
            </text>
            <text x={(px(0) + px(C_MAX)) / 2} y={H - 8} textAnchor="middle">
              C
            </text>
          </g>
        </svg>
      </div>

      <p className="mt-1 font-mono text-[0.7rem] text-fg-muted">
        — sRGB edge&ensp;· - - P3 edge&ensp;·{' '}
        {inSrgb
          ? 'inside sRGB: every screen shows this color as-is'
          : inWide
            ? 'outside sRGB, inside P3: only wide-gamut screens show it'
            : 'outside P3 too: no consumer screen shows it'}
      </p>

      <div className="mt-4 flex flex-col gap-3">
        <Knob
          label="H — hue (rotates the slice)"
          display={`${Math.round(h)}°`}
          value={h}
          onChange={setH}
          min={0}
          max={360}
          step={1}
        />
        <Knob
          label="L — lightness"
          display={l.toFixed(3)}
          value={l}
          onChange={setL}
          min={0.05}
          max={0.98}
          step={0.005}
        />
        <Knob
          label="C — chroma"
          display={c.toFixed(3)}
          value={c}
          onChange={setC}
          min={0}
          max={C_MAX}
          step={0.002}
        />
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3">
        <Swatch
          label="your browser paints"
          background={`oklch(${l.toFixed(3)} ${c.toFixed(3)} ${Math.round(h)})`}
          line1={`oklch(${l.toFixed(2)} ${c.toFixed(3)} ${Math.round(h)})`}
          line2={
            inSrgb ? 'in gamut — nothing to fix' : 'the literal, as rendered'
          }
        />
        <Swatch
          label="per-channel clip"
          background={clipHex}
          line1={`L ${clipped.l.toFixed(3)} · C ${clipped.c.toFixed(3)} · H ${Math.round(clipped.h ?? 0)}°`}
          line2={
            inSrgb
              ? 'same color'
              : `ΔL ${(clipped.l - l).toFixed(3)} · ΔH ${hueDelta(clipped.h ?? 0, h).toFixed(1)}°`
          }
        />
        <Swatch
          label="CSS gamut map"
          background={mapHex}
          line1={`L ${mappedLch.l.toFixed(3)} · C ${mappedLch.c.toFixed(3)} · H ${Math.round(mappedLch.h ?? 0)}°`}
          line2={
            inSrgb
              ? 'same color'
              : `ΔL ${(mappedLch.l - l).toFixed(3)} · ΔH ${hueDelta(mappedLch.h ?? 0, h).toFixed(1)}°`
          }
        />
      </div>

      <p className="mt-4 text-sm text-fg-muted">
        When the ring is off the map, the two strategies land in different
        places. The map dot walks straight left — hue and lightness held, chroma
        spent — and stops at the boundary. The clip dot lands wherever chopped
        channels happen to fall: lower, and (watch ΔH) off this slice entirely,
        since its hue changed. On an sRGB screen the first square matches the
        clip square — that's your browser telling you which strategy it ships.
        On a P3 screen the first square stays more vivid than either as long as
        the ring is inside the dashed line.
      </p>
    </Playground>
  )
}

function Knob({
  label,
  display,
  value,
  onChange,
  min,
  max,
  step,
}: {
  label: string
  display: string
  value: number
  onChange: (value: number) => void
  min: number
  max: number
  step: number
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-baseline justify-between">
        <span className="text-xs text-fg-muted">{label}</span>
        <span className="font-mono text-xs text-fg-muted tabular-nums">
          {display}
        </span>
      </div>
      <Slider
        aria-label={label}
        value={value}
        onChange={(v) => onChange(v as number)}
        minValue={min}
        maxValue={max}
        step={step}
      >
        <SliderControl />
      </Slider>
    </div>
  )
}

function Swatch({
  label,
  background,
  line1,
  line2,
}: {
  label: string
  background: string
  line1: string
  line2: string
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs text-fg-muted">{label}</span>
      <div
        className="h-14 rounded-lg border"
        style={{ backgroundColor: background }}
      />
      <span className="font-mono text-[0.65rem] text-fg-muted tabular-nums">
        {line1}
      </span>
      <span className="font-mono text-[0.65rem] text-fg-muted tabular-nums">
        {line2}
      </span>
    </div>
  )
}
