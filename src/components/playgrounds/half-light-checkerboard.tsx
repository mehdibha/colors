import { useEffect, useRef, useState } from 'react'

import { Demo } from '@/components/demo'
import { Switch } from '@/ui/switch'

export function HalfLightCheckerboard() {
  const ref = useRef<HTMLCanvasElement>(null)
  const [blur, setBlur] = useState(false)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return

    const draw = () => {
      // one check per device pixel, so the averaging happens in your eye
      const dpr = window.devicePixelRatio || 1
      const w = Math.round(canvas.clientWidth * dpr)
      const h = Math.round(canvas.clientHeight * dpr)
      if (!w || !h) return
      canvas.width = w
      canvas.height = h
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      const img = ctx.createImageData(w, h)
      for (let py = 0; py < h; py++) {
        for (let px = 0; px < w; px++) {
          const v = (px + py) & 1 ? 255 : 0
          const i = (py * w + px) * 4
          img.data[i] = v
          img.data[i + 1] = v
          img.data[i + 2] = v
          img.data[i + 3] = 255
        }
      }
      ctx.putImageData(img, 0, 0)
    }

    draw()
    const observer = new ResizeObserver(draw)
    observer.observe(canvas)
    return () => observer.disconnect()
  }, [])

  return (
    <Demo
      caption={
        <>
          The middle panel is pure black and pure white device pixels — it emits
          exactly half of white's light. Step back or squint until it fuses: it
          matches{' '}
          <code className="font-mono text-[0.8rem]">rgb(188 188 188)</code>, not{' '}
          <code className="font-mono text-[0.8rem]">rgb(128 128 128)</code>.
          (View at 100% zoom on a display without fractional scaling — any
          resampling smears the pattern.)
        </>
      }
    >
      <div className="flex h-28 overflow-hidden rounded-lg border">
        <div
          className="flex-1"
          style={{ backgroundColor: 'rgb(128 128 128)' }}
        />
        <div className="relative flex-1 overflow-hidden">
          <canvas
            ref={ref}
            aria-hidden
            className="absolute inset-0 size-full"
            style={{
              // nearest-neighbor on any resample keeps checks hard-edged on fractional-scaled displays
              imageRendering: 'pixelated',
              filter: blur ? 'blur(3px)' : undefined,
            }}
          />
        </div>
        <div
          className="flex-1"
          style={{ backgroundColor: 'rgb(188 188 188)' }}
        />
      </div>
      <div className="mt-2 flex font-mono text-[0.7rem] text-fg-muted">
        <span className="flex-1 text-center">rgb(128)</span>
        <span className="flex-1 text-center">black/white pixels</span>
        <span className="flex-1 text-center">rgb(188)</span>
      </div>
      <div className="mt-3">
        <Switch isSelected={blur} onChange={setBlur} size="sm">
          Blur the checkerboard — let software average it instead
        </Switch>
      </div>
    </Demo>
  )
}
