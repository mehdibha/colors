import { useState } from 'react'
import { converter } from 'culori'

import { cn } from '@/lib/utils'
import { Playground } from '@/components/playground'
import { Button } from '@/ui/button'
import { Slider, SliderControl } from '@/ui/slider'

const toLrgb = converter('lrgb')
const toLab = converter('lab')

const gray = (code: number) => ({
  mode: 'rgb' as const,
  r: code / 255,
  g: code / 255,
  b: code / 255,
})

const lightOf = (code: number) => toLrgb(gray(code)).r
const lstarOf = (code: number) => toLab(gray(code)).l

const START = 30

const CANDIDATES = [
  { code: 119, name: 'Halfway to the eye' },
  { code: 128, name: 'Halfway in the values' },
  { code: 188, name: 'Halfway in the light' },
]

export function MidpointGrayHunt() {
  const [guess, setGuess] = useState(START)
  const [revealed, setRevealed] = useState(false)

  const nearest = CANDIDATES.reduce((a, b) =>
    Math.abs(b.code - guess) < Math.abs(a.code - guess) ? b : a,
  )

  const reset = () => {
    setGuess(START)
    setRevealed(false)
  }

  return (
    <Playground
      question="Which gray is halfway between black and white?"
      onReset={reset}
    >
      <div className="flex h-36 overflow-hidden rounded-lg border">
        <div className="flex-1" style={{ backgroundColor: '#000000' }} />
        <div
          className="flex-1"
          style={{ backgroundColor: `rgb(${guess} ${guess} ${guess})` }}
        />
        <div className="flex-1" style={{ backgroundColor: '#ffffff' }} />
      </div>

      <div className="mt-5 flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <span className="text-sm text-fg-muted">
            Drag until the middle panel looks exactly halfway between black and
            white. Trust your eyes — no numbers yet.
          </span>
          <Slider
            aria-label="Your gray"
            value={guess}
            onChange={(v) => setGuess(v as number)}
            minValue={0}
            maxValue={255}
            step={1}
          >
            <SliderControl />
          </Slider>
        </div>

        {revealed ? (
          <div className="flex flex-col gap-2">
            <GrayRow name="Your pick" code={guess} />
            {CANDIDATES.map((candidate) => (
              <GrayRow
                key={candidate.code}
                name={candidate.name}
                code={candidate.code}
                highlight={candidate === nearest}
              />
            ))}
            <p className="mt-1 text-sm text-fg-muted">
              Almost nobody lands near{' '}
              <code className="font-mono text-[0.8rem]">rgb(188 188 188)</code>{' '}
              — the gray that actually emits half the light. Your eye keeps its
              own ladder.
            </p>
          </div>
        ) : (
          <Button
            size="sm"
            className="self-start"
            onPress={() => setRevealed(true)}
          >
            Reveal the three halfways
          </Button>
        )}
      </div>
    </Playground>
  )
}

function GrayRow({
  name,
  code,
  highlight,
}: {
  name: string
  code: number
  highlight?: boolean
}) {
  const css = `rgb(${code} ${code} ${code})`
  const light = Math.round(lightOf(code) * 100)
  const lstar = Math.round(lstarOf(code))
  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-lg border p-3',
        highlight && 'bg-muted',
      )}
    >
      <div
        className="size-12 shrink-0 rounded-md border"
        style={{ backgroundColor: css }}
      />
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-sm font-medium">
            {name}
            {highlight && (
              <span className="ml-2 font-mono text-[0.7rem] font-normal text-fg-muted">
                closest to you
              </span>
            )}
          </span>
          <code className="shrink-0 font-mono text-xs text-fg-muted">
            rgb({code} {code} {code})
          </code>
        </div>
        <Meter
          label="light emitted"
          value={light}
          display={`${light}%`}
          fill={css}
        />
        <Meter
          label="lightness (L*)"
          value={lstar}
          display={`${lstar}`}
          fill={css}
        />
      </div>
    </div>
  )
}

function Meter({
  label,
  value,
  display,
  fill,
}: {
  label: string
  value: number
  display: string
  fill: string
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-26 shrink-0 text-xs text-fg-muted">{label}</span>
      <div className="h-2 flex-1 overflow-hidden rounded-full border">
        <div
          className="h-full"
          style={{ width: `${value}%`, backgroundColor: fill }}
        />
      </div>
      <span className="w-9 shrink-0 text-right font-mono text-xs text-fg-muted tabular-nums">
        {display}
      </span>
    </div>
  )
}
