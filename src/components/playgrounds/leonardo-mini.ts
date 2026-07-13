import {
  converter,
  differenceEuclidean,
  formatHex,
  interpolate,
  wcagContrast,
  wcagLuminance,
} from 'culori'

import { apcaLc } from '@/lib/apca'

// Mini re-implementation of Leonardo's solve: white → keys sorted light-to-dark
// → black, sampled along the sRGB path, each target matched to the closest
// swatch on the text side of the background. Verified against
// @adobe/leonardo-contrast-colors v1.1.0 — worst disagreement ΔEok 0.0034
// across 25 swatches (three backgrounds, both formulas).

const lab65 = converter('lab65')

export const dEok = differenceEuclidean('oklab')

export function labLightness(color: string): number {
  return lab65(color)?.l ?? 0
}

/** Neutral gray at a given CIELAB L* — the mini theme's background dial. */
export function grayAt(lstar: number): string {
  return formatHex({ mode: 'lab65', l: lstar, a: 0, b: 0 })
}

export interface ScaleSample {
  hex: string
  y: number
}

export function makeScale(keyColors: string[], samples = 1024): ScaleSample[] {
  const sorted = [...keyColors].sort(
    (a, b) => labLightness(b) - labLightness(a),
  )
  const path = interpolate(['#ffffff', ...sorted, '#000000'], 'rgb')
  const out: ScaleSample[] = []
  for (let i = 0; i < samples; i++) {
    const hex = formatHex(path(i / (samples - 1)))
    out.push({ hex, y: wcagLuminance(hex) })
  }
  return out
}

export interface Solve {
  hex: string
  index: number
  /** WCAG ratio for solveWcag, signed Lc for solveApca. */
  measured: number
}

export function solveWcag(
  scale: ScaleSample[],
  background: string,
  target: number,
): Solve {
  const bgY = wcagLuminance(background)
  const darkBg = labLightness(background) < 50
  let best: Solve = {
    hex: darkBg ? '#ffffff' : '#000000',
    index: 0,
    measured: 1,
  }
  let bestErr = Infinity
  for (let i = 0; i < scale.length; i++) {
    const sample = scale[i]
    if (!sample) continue
    if (darkBg ? sample.y < bgY : sample.y > bgY) continue
    const ratio =
      (Math.max(sample.y, bgY) + 0.05) / (Math.min(sample.y, bgY) + 0.05)
    const err = Math.abs(ratio - target)
    if (err < bestErr) {
      bestErr = err
      best = { hex: sample.hex, index: i, measured: ratio }
    }
  }
  return best
}

export function solveApca(
  scale: ScaleSample[],
  background: string,
  targetLc: number,
): Solve {
  const darkBg = labLightness(background) < 50
  let best: Solve = {
    hex: darkBg ? '#ffffff' : '#000000',
    index: 0,
    measured: 0,
  }
  let bestErr = Infinity
  for (let i = 0; i < scale.length; i++) {
    const sample = scale[i]
    if (!sample) continue
    const lc = apcaLc(sample.hex, background)
    if (darkBg ? lc >= 0 : lc <= 0) continue
    const err = Math.abs(Math.abs(lc) - targetLc)
    if (err < bestErr) {
      bestErr = err
      best = { hex: sample.hex, index: i, measured: lc }
    }
  }
  return best
}

export function wcagRatio(a: string, b: string): number {
  return wcagContrast(a, b)
}

/** The README's own example color, used by every demo in the chapter. */
export const LEONARDO_BLUE_KEYS = ['#5cdbff', '#0000ff']
export const DEFAULT_RATIOS = [1.4, 2, 3, 4.5, 8]

export interface LeonardoThemeRef {
  lightness: number
  bg: string
  values: string[]
}

// Verbatim output of @adobe/leonardo-contrast-colors v1.1.0 for
// Color({ colorKeys: ['#5CDBFF', '#0000FF'], ratios: [1.4, 2, 3, 4.5, 8] })
// on a black-key gray BackgroundColor at three Theme lightness values.
export const LEONARDO_BLUE_THEMES: LeonardoThemeRef[] = [
  {
    lightness: 98,
    bg: '#f8f8f8',
    values: ['#78e1ff', '#4ebbff', '#3c8fff', '#2a64ff', '#0205ff'],
  },
  {
    lightness: 20,
    bg: '#303030',
    values: ['#0000ee', '#1a3eff', '#2e6eff', '#4098ff', '#5bd8ff'],
  },
  {
    lightness: 11,
    bg: '#1d1d1d',
    values: ['#0000bf', '#040aff', '#2353ff', '#357eff', '#4fbcff'],
  },
]
