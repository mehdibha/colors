import { useState } from 'react'
import { converter, wcagContrast } from 'culori'

import { apcaLc } from '@/lib/apca'
import { cn } from '@/lib/utils'
import { Playground } from '@/components/playground'
import { ToggleButton } from '@/ui/toggle-button'
import { ToggleButtonGroup } from '@/ui/toggle-button-group'
const toOklch = converter('oklch')
// radix-ui/colors src/light.ts + src/dark.ts (blue / blueDark), verified at HEAD.
const LIGHT = [
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
]
const DARK = [
  '#0d1520',
  '#111927',
  '#0d2847',
  '#003362',
  '#004074',
  '#104d87',
  '#205d9e',
  '#2870bd',
  '#0090ff',
  '#3b9eff',
  '#70b8ff',
  '#c2e6ff',
]
// Alpha twins (RRGGBBAA) — blueA / blueDarkA.
const LIGHT_A = [
  '#0080ff04',
  '#008cff0b',
  '#008ff519',
  '#009eff2a',
  '#0093ff3d',
  '#0088f653',
  '#0083eb71',
  '#0084e6a1',
  '#0090ff',
  '#0086f0fa',
  '#006dcbf2',
  '#002359ee',
]
const DARK_A = [
  '#004df211',
  '#1166fb18',
  '#0077ff3a',
  '#0075ff57',
  '#0081fd6b',
  '#0f89fd7f',
  '#2a91fe98',
  '#3094feb9',
  '#0090ff',
  '#3b9eff',
  '#70b8ff',
  '#c2e6ff',
]
const JOBS = [
  'App background',
  'Subtle background',
  'UI element background',
  'Hovered UI element background',
  'Active / selected UI element',
  'Subtle border & separator',
  'UI element border & focus ring',
  'Hovered UI element border',
  'Solid background',
  'Hovered solid background',
  'Low-contrast text',
  'High-contrast text',
]
type Mode = 'light' | 'dark'
type View = 'solid' | 'alpha'
const at = (a: readonly string[], i: number) => a[i] ?? '#000000'
const labelText = (hex: string) =>
  wcagContrast('#000000', hex) >= wcagContrast('#ffffff', hex)
    ? '#000000'
    : '#ffffff'
const bandLabel = (i: number) =>
  i <= 1
    ? 'Backgrounds'
    : i <= 4
      ? 'Component backgrounds'
      : i <= 7
        ? 'Borders'
        : i <= 9
          ? 'Solids'
          : 'Text'
interface Line {
  text: string
  tone: 'muted' | 'ok' | 'warn'
}
function contract(idx: number, scale: readonly string[]): Line {
  const s2 = at(scale, 1)
  if (idx <= 1)
    return {
      text: 'Carries the room — a background job, spacing not a contrast promise.',
      tone: 'muted',
    }
  if (idx <= 4) {
    const fg = at(scale, 10)
    const r = wcagContrast(fg, at(scale, idx))
    const lc = Math.abs(apcaLc(fg, at(scale, idx)))
    return {
      text: `Component surface. Low-contrast text (step 11) sits here: ${r.toFixed(2)}:1 · Lc ${lc.toFixed(1)}.`,
      tone: 'muted',
    }
  }
  if (idx <= 7) {
    const r = wcagContrast(at(scale, idx), s2)
    return {
      text: `Border. Against step 2: ${r.toFixed(2)}:1 — eye-tuned to read as an edge, below the 3:1 non-text floor.`,
      tone: r >= 3 ? 'ok' : 'warn',
    }
  }
  if (idx <= 9) {
    const wl = wcagContrast('#ffffff', at(scale, idx))
    const bl = wcagContrast('#000000', at(scale, idx))
    const wlc = Math.abs(apcaLc('#ffffff', at(scale, idx)))
    const blc = Math.abs(apcaLc('#000000', at(scale, idx)))
    return {
      text: `Solid label — white ${wl.toFixed(2)}:1 / Lc ${wlc.toFixed(1)}, black ${bl.toFixed(2)}:1 / Lc ${blc.toFixed(1)}. The meters split; Radix ships white.`,
      tone: 'warn',
    }
  }
  const r = wcagContrast(at(scale, idx), s2)
  const lc = Math.abs(apcaLc(at(scale, idx), s2))
  const target = idx === 10 ? 60 : 90
  return {
    text: `Text on step 2: ${r.toFixed(2)}:1 · Lc ${lc.toFixed(1)} — Radix's APCA target here is Lc ${target}.`,
    tone: 'ok',
  }
}
export function RadixScaleReader() {
  const [mode, setMode] = useState<Mode>('light')
  const [view, setView] = useState<View>('solid')
  const [sel, setSel] = useState(8)
  const scale = mode === 'light' ? LIGHT : DARK
  const alpha = mode === 'light' ? LIGHT_A : DARK_A
  const selHex = at(scale, sel)
  const selAlpha = at(alpha, sel)
  const ok = toOklch(selHex)
  const line = contract(sel, scale)
  const lightL = toOklch(at(LIGHT, sel))?.l ?? 0
  const darkL = toOklch(at(DARK, sel))?.l ?? 0
  const flip = 1 - lightL
  const off = darkL - flip
  const toneClass =
    line.tone === 'ok'
      ? 'text-fg-success'
      : line.tone === 'warn'
        ? 'text-fg-warning'
        : 'text-fg-muted'
  const stripStyle =
    view === 'alpha'
      ? {
          backgroundColor: mode === 'dark' ? '#111113' : '#ffffff',
          backgroundImage:
            'linear-gradient(45deg,#80808026 25%,transparent 25%,transparent 75%,#80808026 75%),linear-gradient(45deg,#80808026 25%,transparent 25%,transparent 75%,#80808026 75%)',
          backgroundSize: '14px 14px',
          backgroundPosition: '0 0,7px 7px',
        }
      : undefined
  return (
    <Playground
      question="Radix's 12 steps are already dotUI's job list — so what should the engine steal, and what can Radix's hand-tuning never give it?"
      onReset={() => {
        setMode('light')
        setView('solid')
        setSel(8)
      }}
    >
      <div className="flex flex-col gap-5">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-fg-muted">theme</span>
            <ToggleButtonGroup
              selectionMode="single"
              disallowEmptySelection
              selectedKeys={[mode]}
              onSelectionChange={(keys) => {
                const n = [...keys][0]
                if (n === 'light' || n === 'dark') setMode(n)
              }}
              size="sm"
              aria-label="Theme mode"
              className="max-w-full overflow-x-auto"
            >
              <ToggleButton id="light">Light</ToggleButton>
              <ToggleButton id="dark">Dark</ToggleButton>
            </ToggleButtonGroup>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-fg-muted">variant</span>
            <ToggleButtonGroup
              selectionMode="single"
              disallowEmptySelection
              selectedKeys={[view]}
              onSelectionChange={(keys) => {
                const n = [...keys][0]
                if (n === 'solid' || n === 'alpha') setView(n)
              }}
              size="sm"
              aria-label="Scale variant"
              className="max-w-full overflow-x-auto"
            >
              <ToggleButton id="solid">Solid</ToggleButton>
              <ToggleButton id="alpha">Alpha</ToggleButton>
            </ToggleButtonGroup>
          </div>
        </div>
        <div className="overflow-x-auto">
          <div
            className="flex min-w-md gap-1 rounded-md p-1"
            style={stripStyle}
          >
            {JOBS.map((job, i) => (
              <button
                key={i}
                type="button"
                onMouseEnter={() => setSel(i)}
                onFocus={() => setSel(i)}
                onClick={() => setSel(i)}
                aria-label={`Step ${i + 1}: ${job}`}
                className={cn(
                  'relative flex h-12 flex-1 items-start justify-start rounded-sm border p-1 text-[0.6rem] font-medium outline-none',
                  sel === i && 'outline-2 outline-offset-2 outline-fg/70',
                )}
                style={{
                  backgroundColor:
                    view === 'solid' ? at(scale, i) : at(alpha, i),
                  color: labelText(at(scale, i)),
                }}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
        <div
          aria-live="polite"
          className="flex flex-col gap-3 rounded-md bg-muted/50 p-3"
        >
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="font-mono text-[0.65rem] text-fg-muted">
              step {sel + 1} · {bandLabel(sel)}
            </span>
            <span className="text-sm font-medium">{JOBS[sel] ?? ''}</span>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[0.65rem] tabular-nums">
            <span className="flex items-center gap-1.5">
              <span
                className="inline-block size-3 rounded-xs border"
                style={{ backgroundColor: selHex }}
              />
              {selHex}
            </span>
            <span className="text-fg-muted">
              oklch({(ok?.l ?? 0).toFixed(3)} {(ok?.c ?? 0).toFixed(3)}{' '}
              {(ok?.h ?? 0).toFixed(1)})
            </span>
            {view === 'alpha' && (
              <span className="text-fg-muted">alpha: {selAlpha}</span>
            )}
          </div>
          <p className={cn('text-xs', toneClass)}>{line.text}</p>
          <p className="font-mono text-[0.65rem] text-fg-muted tabular-nums">
            flip check — light L {lightL.toFixed(3)} · dark L {darkL.toFixed(3)}{' '}
            · a mirror would put dark at {flip.toFixed(3)} (off by{' '}
            {off >= 0 ? '+' : ''}
            {off.toFixed(3)})
          </p>
        </div>
      </div>
    </Playground>
  )
}
