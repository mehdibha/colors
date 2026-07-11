import { useState } from 'react'
import type * as React from 'react'
import { wcagContrast } from 'culori'

import { apcaLc } from '@/lib/apca'
import { cn } from '@/lib/utils'
import { Playground } from '@/components/playground'

// Radix light.ts hexes.
const SCALES = {
  slate: [
    '#fcfcfd',
    '#f9f9fb',
    '#f0f0f3',
    '#e8e8ec',
    '#e0e1e6',
    '#d9d9e0',
    '#cdced6',
    '#b9bbc6',
    '#8b8d98',
    '#80838d',
    '#60646c',
    '#1c2024',
  ],
  blue: [
    '#fbfdff',
    '#f4faff',
    '#e6f4fe',
    '#d5efff',
    '#c2e5ff',
    '#acd8fc',
    '#8ec8f6',
    '#5eb1ef',
    '#0090ff',
    '#0588f0',
    '#0d74ce',
    '#113264',
  ],
  violet: [
    '#fdfcfe',
    '#faf8ff',
    '#f4f0fe',
    '#ebe4ff',
    '#e1d9ff',
    '#d4cafe',
    '#c2b5f5',
    '#aa99ec',
    '#6e56cf',
    '#654dc4',
    '#6550b9',
    '#2f265f',
  ],
  red: [
    '#fffcfc',
    '#fff7f7',
    '#feebec',
    '#ffdbdc',
    '#ffcdce',
    '#fdbdbe',
    '#f4a9aa',
    '#eb8e90',
    '#e5484d',
    '#dc3e42',
    '#ce2c31',
    '#641723',
  ],
} as const

type ScaleName = keyof typeof SCALES

type TokenRef =
  | { kind: 'step'; scale: ScaleName; step: number }
  | { kind: 'fixed'; value: 'white' | 'black' }

const TOKENS = [
  'bg',
  'bg-card',
  'border',
  'fg',
  'fg-muted',
  'fg-accent',
  'accent',
  'fg-on-accent',
] as const

type Token = (typeof TOKENS)[number]

const DEFAULTS: Record<Token, TokenRef> = {
  bg: { kind: 'step', scale: 'slate', step: 1 },
  'bg-card': { kind: 'step', scale: 'slate', step: 2 },
  border: { kind: 'step', scale: 'slate', step: 6 },
  fg: { kind: 'step', scale: 'slate', step: 12 },
  'fg-muted': { kind: 'step', scale: 'slate', step: 11 },
  'fg-accent': { kind: 'step', scale: 'blue', step: 11 },
  accent: { kind: 'step', scale: 'blue', step: 9 },
  'fg-on-accent': { kind: 'fixed', value: 'white' },
}

const resolve = (ref: TokenRef): string =>
  ref.kind === 'fixed'
    ? ref.value === 'white'
      ? '#ffffff'
      : '#000000'
    : (SCALES[ref.scale][ref.step - 1] ?? '#000000')

const refName = (ref: TokenRef): string =>
  ref.kind === 'fixed' ? ref.value : `${ref.scale}-${ref.step}`

const sameRef = (a: TokenRef, b: TokenRef): boolean =>
  a.kind === 'fixed'
    ? b.kind === 'fixed' && a.value === b.value
    : b.kind === 'step' && a.scale === b.scale && a.step === b.step

// The pairing ledger: every promise names fg, bg, and both meters' bars.
const PROMISES: { fg: Token; bg: Token; wcagMin: number; lcMin: number }[] = [
  { fg: 'fg', bg: 'bg', wcagMin: 4.5, lcMin: 90 },
  { fg: 'fg', bg: 'bg-card', wcagMin: 4.5, lcMin: 90 },
  { fg: 'fg-muted', bg: 'bg', wcagMin: 4.5, lcMin: 60 },
  { fg: 'fg-muted', bg: 'bg-card', wcagMin: 4.5, lcMin: 60 },
  { fg: 'fg-accent', bg: 'bg-card', wcagMin: 4.5, lcMin: 60 },
  { fg: 'fg-on-accent', bg: 'accent', wcagMin: 4.5, lcMin: 60 },
]

type Tone = 'ok' | 'warn' | 'bad'

function check(fgHex: string, bgHex: string, wcagMin: number, lcMin: number) {
  const ratio = wcagContrast(fgHex, bgHex)
  const lc = Math.abs(apcaLc(fgHex, bgHex))
  const w = ratio >= wcagMin
  const a = lc >= lcMin
  const tone: Tone = w && a ? 'ok' : !w && !a ? 'bad' : 'warn'
  return { ratio, lc, tone }
}

const toneDot: Record<Tone, string> = {
  ok: 'bg-success',
  warn: 'bg-warning',
  bad: 'bg-danger',
}

export function TokenWiringPlayground() {
  const [map, setMap] = useState<Record<Token, TokenRef>>(DEFAULTS)
  const [selected, setSelected] = useState<Token>('accent')
  const [hovered, setHovered] = useState<Token | null>(null)

  const v = (token: Token) => resolve(map[token])
  const hot = hovered ?? selected
  const chain = `${hot} → ${refName(map[hot])} → ${v(hot)}`

  const remap = (ref: TokenRef) => setMap((m) => ({ ...m, [selected]: ref }))

  const results = PROMISES.map((p) => ({
    ...p,
    ...check(v(p.fg), v(p.bg), p.wcagMin, p.lcMin),
  }))
  const broken = results.filter((r) => r.tone === 'bad').length
  const split = results.filter((r) => r.tone === 'warn').length

  const region = (token: Token) => ({
    onMouseEnter: () => setHovered(token),
    onMouseLeave: () => setHovered(null),
    onClick: (e: React.MouseEvent) => {
      e.stopPropagation()
      setSelected(token)
    },
  })

  const ring = (token: Token) =>
    selected === token && 'ring-2 ring-fg/50 ring-offset-1'

  return (
    <Playground
      question="Repoint one semantic token — what follows it, and which pairing promises break?"
      onReset={() => {
        setMap(DEFAULTS)
        setSelected('accent')
        setHovered(null)
      }}
    >
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-5 lg:flex-row">
          {/* The UI — every region is wired to a semantic token. */}
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <span className="text-xs text-fg-muted">
              The UI — hover to read a chain, click to pick a token
            </span>
            <div
              className={cn('cursor-pointer rounded-lg border p-3', ring('bg'))}
              style={{ backgroundColor: v('bg'), borderColor: v('border') }}
              {...region('bg')}
            >
              <div
                className={cn(
                  'flex cursor-pointer flex-col gap-1.5 rounded-md border p-3',
                  ring('bg-card'),
                )}
                style={{
                  backgroundColor: v('bg-card'),
                  borderColor: v('border'),
                }}
                {...region('bg-card')}
              >
                <span
                  className={cn(
                    'cursor-pointer text-xs font-medium',
                    ring('fg'),
                  )}
                  style={{ color: v('fg') }}
                  {...region('fg')}
                >
                  Quarterly review
                </span>
                <span
                  className={cn(
                    'cursor-pointer text-[0.7rem]',
                    ring('fg-muted'),
                  )}
                  style={{ color: v('fg-muted') }}
                  {...region('fg-muted')}
                >
                  Sarah · 2h ago
                </span>
                <div className="mt-1 flex items-center gap-2.5">
                  <span
                    className={cn(
                      'cursor-pointer rounded-md px-2.5 py-1 text-[0.7rem] font-medium',
                      ring('accent'),
                    )}
                    style={{ backgroundColor: v('accent') }}
                    {...region('accent')}
                  >
                    <span
                      className={cn('cursor-pointer', ring('fg-on-accent'))}
                      style={{ color: v('fg-on-accent') }}
                      {...region('fg-on-accent')}
                    >
                      Reply
                    </span>
                  </span>
                  <span
                    className={cn(
                      'cursor-pointer text-[0.7rem] font-medium',
                      ring('fg-accent'),
                    )}
                    style={{ color: v('fg-accent') }}
                    {...region('fg-accent')}
                  >
                    Open thread
                  </span>
                </div>
              </div>
              <span
                className={cn(
                  'mt-2 block cursor-pointer px-1 text-[0.7rem]',
                  ring('border'),
                )}
                style={{ color: v('fg-muted') }}
                {...region('border')}
              >
                borders · {refName(map.border)}
              </span>
            </div>
            <span
              aria-live="polite"
              className="font-mono text-[0.65rem] text-fg-muted tabular-nums"
            >
              {chain}
            </span>
          </div>

          {/* The remap panel. */}
          <div className="flex min-w-0 flex-1 flex-col gap-3">
            <span className="text-xs text-fg-muted">
              Remap — repoint <span className="font-mono">{selected}</span>
            </span>
            <div className="flex flex-wrap gap-1">
              {TOKENS.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setSelected(t)}
                  className={cn(
                    'rounded-md border px-2 py-1 font-mono text-[0.65rem]',
                    selected === t
                      ? 'border-border-control bg-muted font-medium'
                      : 'text-fg-muted hover:bg-muted',
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
            <div className="flex flex-col gap-1.5">
              {(Object.keys(SCALES) as ScaleName[]).map((s) => (
                <div key={s} className="flex items-center gap-1.5">
                  <span className="w-10 shrink-0 text-[0.6rem] text-fg-muted">
                    {s}
                  </span>
                  <div className="flex gap-1">
                    {SCALES[s].map((hex, i) => {
                      const ref: TokenRef = {
                        kind: 'step',
                        scale: s,
                        step: i + 1,
                      }
                      return (
                        <button
                          key={hex}
                          type="button"
                          aria-label={`Point ${selected} at ${s} step ${i + 1}`}
                          onClick={() => remap(ref)}
                          className={cn(
                            'size-4.5 shrink-0 rounded-sm border sm:size-5',
                            sameRef(map[selected], ref) &&
                              'ring-2 ring-fg/60 ring-offset-1',
                          )}
                          style={{ backgroundColor: hex }}
                        />
                      )
                    })}
                  </div>
                </div>
              ))}
              <div className="flex items-center gap-1.5">
                <span className="w-10 shrink-0 text-[0.6rem] text-fg-muted">
                  fixed
                </span>
                <div className="flex gap-1">
                  {(['white', 'black'] as const).map((value) => {
                    const ref: TokenRef = { kind: 'fixed', value }
                    return (
                      <button
                        key={value}
                        type="button"
                        aria-label={`Point ${selected} at ${value}`}
                        onClick={() => remap(ref)}
                        className={cn(
                          'size-4.5 shrink-0 rounded-sm border sm:size-5',
                          sameRef(map[selected], ref) &&
                            'ring-2 ring-fg/60 ring-offset-1',
                        )}
                        style={{
                          backgroundColor: value === 'white' ? '#fff' : '#000',
                        }}
                      />
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* The pairing checker. */}
        <div className="flex flex-col gap-1.5">
          <span className="text-xs text-fg-muted">
            Pairing checker — every bg token owes its text a partner
          </span>
          <div className="flex flex-col gap-1">
            {results.map((r) => (
              <div
                key={`${r.fg}-${r.bg}`}
                className="flex flex-wrap items-center gap-x-2 gap-y-0.5 font-mono text-[0.65rem] tabular-nums"
              >
                <span
                  className={cn(
                    'size-2 shrink-0 rounded-full',
                    toneDot[r.tone],
                  )}
                  aria-hidden
                />
                <span className="w-44 shrink-0">
                  {r.fg} on {r.bg}
                </span>
                <span
                  className={
                    r.ratio >= r.wcagMin ? 'text-fg-muted' : 'text-fg-danger'
                  }
                >
                  {r.ratio.toFixed(2)}:1 (needs {r.wcagMin})
                </span>
                <span
                  className={
                    r.lc >= r.lcMin ? 'text-fg-muted' : 'text-fg-danger'
                  }
                >
                  Lc {r.lc.toFixed(1)} (needs {r.lcMin})
                </span>
              </div>
            ))}
          </div>
          <p aria-live="polite" className="text-xs text-fg-muted">
            {broken === 0 && split === 0
              ? 'All promises hold on both meters.'
              : `${broken} broken · ${split} split between the meters${split > 0 ? ' — a split pair is the orange button from chapter 8' : ''}.`}
          </p>
        </div>
      </div>
    </Playground>
  )
}
