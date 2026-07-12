import { clampRgb, converter, displayable, formatHex } from 'culori'

// Reference values computed with @material/material-color-utilities (TonalPalette, SchemeTonalSpot, Scheme).

export const HCT_TONES = [
  0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 95, 99, 100,
] as const

const toRgb = converter('rgb')
const toLch65 = converter('lch65')
const toOklab = converter('oklab')

// CIE inverse f: L* -> relative Y (0..1). Same math WCAG's luminance runs on.
const labInvf = (ft: number) => {
  const e = 216 / 24389
  const kappa = 24389 / 27
  const ft3 = ft ** 3
  return ft3 > e ? ft3 : (116 * ft - 16) / kappa
}

export const yFromTone = (tone: number) => labInvf((tone + 16) / 116)

/** WCAG 2 ratio between two tones — exact, no colors needed. */
export function ratioOfTones(a: number, b: number): number {
  const ya = yFromTone(a)
  const yb = yFromTone(b)
  const hi = Math.max(ya, yb)
  const lo = Math.min(ya, yb)
  return (hi + 0.05) / (lo + 0.05)
}

/** Neutral gray at an exact tone (L* in D65 Lab). */
export function toneGray(tone: number): string {
  return formatHex(clampRgb(toRgb({ mode: 'lab65', l: tone, a: 0, b: 0 })))
}

/**
 * culori approximation of HCT: tone is exact (L* in D65 Lab); hue and chroma
 * come from CIELAB LCh instead of CAM16. Chroma is clamped to the sRGB
 * maximum at that tone and hue, like HCT's own "may be lower than requested".
 */
export function approxToneHex(
  hue: number,
  chroma: number,
  tone: number,
): string {
  if (tone <= 0) return '#000000'
  if (tone >= 100) return '#ffffff'
  let lo = 0
  let hi = 140
  for (let i = 0; i < 26; i++) {
    const mid = (lo + hi) / 2
    if (displayable({ mode: 'lch65', l: tone, c: mid, h: hue })) lo = mid
    else hi = mid
  }
  const c = Math.min(chroma, lo)
  return formatHex(clampRgb(toRgb({ mode: 'lch65', l: tone, c, h: hue })))
}

export function lch65Of(hex: string): { l: number; c: number; h: number } {
  const lch = toLch65(hex)
  return { l: lch?.l ?? 0, c: lch?.c ?? 0, h: lch?.h ?? 0 }
}

export function dEok(a: string, b: string): number {
  const x = toOklab(a)
  const y = toOklab(b)
  if (!x || !y) return 0
  return Math.hypot(x.l - y.l, (x.a ?? 0) - (y.a ?? 0), (x.b ?? 0) - (y.b ?? 0))
}

export interface HctSeed {
  id: string
  name: string
  hex: string
  /** HCT of the seed, from material-color-utilities. */
  hct: { h: number; c: number; t: number }
  /** TonalPalette.fromInt(seed) at the 13 tones. */
  palette: string[]
}

export const HCT_SEEDS: HctSeed[] = [
  {
    id: 'violet',
    name: 'Baseline violet',
    hex: '#6750a4',
    hct: { h: 299.0, c: 47.9, t: 40.1 },
    palette: [
      '#000000',
      '#22005d',
      '#381e72',
      '#4f378a',
      '#6750a4',
      '#8069bf',
      '#9a83db',
      '#b69df7',
      '#cfbcff',
      '#e9ddff',
      '#f6eeff',
      '#fffbff',
      '#ffffff',
    ],
  },
  {
    id: 'blue',
    name: 'Blue',
    hex: '#0061ff',
    hct: { h: 272.4, c: 76.4, t: 46.7 },
    palette: [
      '#000000',
      '#00174b',
      '#002a78',
      '#003ea8',
      '#0052dc',
      '#2a6cff',
      '#618bff',
      '#8ca8ff',
      '#b4c5ff',
      '#dbe1ff',
      '#eef0ff',
      '#fefbff',
      '#ffffff',
    ],
  },
  {
    id: 'green',
    name: 'Green',
    hex: '#1db954',
    hct: { h: 150.3, c: 69.7, t: 66.2 },
    palette: [
      '#000000',
      '#002108',
      '#003914',
      '#005320',
      '#006e2d',
      '#008a3a',
      '#00a748',
      '#2fc45d',
      '#53e076',
      '#72fe8f',
      '#c6ffc7',
      '#f6fff1',
      '#ffffff',
    ],
  },
  {
    id: 'red',
    name: 'Red',
    hex: '#ff0000',
    hct: { h: 27.4, c: 113.4, t: 53.2 },
    palette: [
      '#000000',
      '#410000',
      '#690100',
      '#930100',
      '#c00100',
      '#ef0000',
      '#ff5540',
      '#ff8a78',
      '#ffb4a8',
      '#ffdad4',
      '#ffedea',
      '#fffbff',
      '#ffffff',
    ],
  },
]

export interface TonalSpotPalette {
  label: string
  hue: number
  chroma: number
  tones: string[]
}

export interface TonalSpotScheme {
  id: string
  name: string
  seed: string
  seedHct: { h: number; c: number; t: number }
  palettes: TonalSpotPalette[]
}

// SchemeTonalSpot (the dynamic-color default) for four seeds.
export const TONAL_SPOT_SCHEMES: TonalSpotScheme[] = [
  {
    id: 'violet',
    name: '#6750a4',
    seed: '#6750a4',
    seedHct: { h: 299.0, c: 47.9, t: 40.1 },
    palettes: [
      {
        label: 'primary',
        hue: 299.0,
        chroma: 36,
        tones: [
          '#000000',
          '#201047',
          '#36275d',
          '#4d3d75',
          '#65558f',
          '#7e6ea9',
          '#9887c5',
          '#b3a2e1',
          '#cfbdfe',
          '#e9ddff',
          '#f6eeff',
          '#fffbff',
          '#ffffff',
        ],
      },
      {
        label: 'secondary',
        hue: 299.0,
        chroma: 16,
        tones: [
          '#000000',
          '#1e192b',
          '#332d41',
          '#4a4458',
          '#625b71',
          '#7b748a',
          '#958da4',
          '#b0a7c0',
          '#cbc2db',
          '#e8def8',
          '#f6eeff',
          '#fffbff',
          '#ffffff',
        ],
      },
      {
        label: 'tertiary',
        hue: 359.0,
        chroma: 24,
        tones: [
          '#000000',
          '#31101d',
          '#4a2532',
          '#633b48',
          '#7e5260',
          '#996a79',
          '#b58392',
          '#d29dad',
          '#efb8c8',
          '#ffd9e3',
          '#ffecf0',
          '#fffbff',
          '#ffffff',
        ],
      },
      {
        label: 'neutral',
        hue: 299.0,
        chroma: 6,
        tones: [
          '#000000',
          '#1d1b20',
          '#322f35',
          '#48464c',
          '#605d64',
          '#79767d',
          '#938f96',
          '#aea9b1',
          '#cac5cc',
          '#e6e0e9',
          '#f5eff7',
          '#fffbff',
          '#ffffff',
        ],
      },
    ],
  },
  {
    id: 'blue',
    name: '#0061ff',
    seed: '#0061ff',
    seedHct: { h: 272.4, c: 76.4, t: 46.7 },
    palettes: [
      {
        label: 'primary',
        hue: 272.4,
        chroma: 36,
        tones: [
          '#000000',
          '#00174b',
          '#1a2d60',
          '#334478',
          '#4b5c92',
          '#6475ac',
          '#7d8fc8',
          '#98a9e4',
          '#b4c5ff',
          '#dbe1ff',
          '#eef0ff',
          '#fefbff',
          '#ffffff',
        ],
      },
      {
        label: 'secondary',
        hue: 272.4,
        chroma: 16,
        tones: [
          '#000000',
          '#161b2c',
          '#2b3042',
          '#414659',
          '#595e72',
          '#71768b',
          '#8b90a5',
          '#a6aac1',
          '#c1c5dd',
          '#dde1f9',
          '#eef0ff',
          '#fefbff',
          '#ffffff',
        ],
      },
      {
        label: 'tertiary',
        hue: 332.4,
        chroma: 24,
        tones: [
          '#000000',
          '#2b122b',
          '#422740',
          '#5a3d58',
          '#745470',
          '#8e6c8a',
          '#a986a4',
          '#c5a0bf',
          '#e2bbdb',
          '#ffd6f8',
          '#ffebf9',
          '#fffbff',
          '#ffffff',
        ],
      },
      {
        label: 'neutral',
        hue: 272.4,
        chroma: 6,
        tones: [
          '#000000',
          '#1a1b21',
          '#2f3036',
          '#46464c',
          '#5d5e64',
          '#76767d',
          '#909097',
          '#abaab1',
          '#c6c6cd',
          '#e3e2e9',
          '#f1f0f7',
          '#fefbff',
          '#ffffff',
        ],
      },
    ],
  },
  {
    id: 'green',
    name: '#1db954',
    seed: '#1db954',
    seedHct: { h: 150.3, c: 69.7, t: 66.2 },
    palettes: [
      {
        label: 'primary',
        hue: 150.3,
        chroma: 36,
        tones: [
          '#000000',
          '#002108',
          '#003914',
          '#1d5128',
          '#36693e',
          '#4e8355',
          '#689d6d',
          '#81b885',
          '#9cd49f',
          '#b7f1ba',
          '#c6ffc7',
          '#f6fff1',
          '#ffffff',
        ],
      },
      {
        label: 'secondary',
        hue: 150.3,
        chroma: 16,
        tones: [
          '#000000',
          '#0f1f11',
          '#243425',
          '#3a4b3a',
          '#516351',
          '#697c68',
          '#839681',
          '#9db09b',
          '#b8ccb6',
          '#d4e8d1',
          '#e2f6df',
          '#f6fff1',
          '#ffffff',
        ],
      },
      {
        label: 'tertiary',
        hue: 210.3,
        chroma: 24,
        tones: [
          '#000000',
          '#001f24',
          '#00363d',
          '#1f4d54',
          '#39656c',
          '#527e86',
          '#6c98a0',
          '#86b3bb',
          '#a1ced7',
          '#bdeaf3',
          '#d1f8ff',
          '#f6feff',
          '#ffffff',
        ],
      },
      {
        label: 'neutral',
        hue: 150.3,
        chroma: 6,
        tones: [
          '#000000',
          '#181d18',
          '#2d322c',
          '#434842',
          '#5b6059',
          '#747871',
          '#8d928b',
          '#a8ada5',
          '#c3c8c0',
          '#e0e4db',
          '#eef2e9',
          '#fafef5',
          '#ffffff',
        ],
      },
    ],
  },
  {
    id: 'red',
    name: '#ff0000',
    seed: '#ff0000',
    seedHct: { h: 27.4, c: 113.4, t: 53.2 },
    palettes: [
      {
        label: 'primary',
        hue: 27.4,
        chroma: 36,
        tones: [
          '#000000',
          '#3a0905',
          '#561e16',
          '#73342a',
          '#904b40',
          '#ad6257',
          '#cc7b6f',
          '#ea9587',
          '#ffb4a8',
          '#ffdad4',
          '#ffedea',
          '#fffbff',
          '#ffffff',
        ],
      },
      {
        label: 'secondary',
        hue: 27.4,
        chroma: 16,
        tones: [
          '#000000',
          '#2c1512',
          '#442925',
          '#5d3f3b',
          '#775651',
          '#926f69',
          '#ae8882',
          '#caa29c',
          '#e7bdb6',
          '#ffdad4',
          '#ffedea',
          '#fffbff',
          '#ffffff',
        ],
      },
      {
        label: 'tertiary',
        hue: 87.4,
        chroma: 24,
        tones: [
          '#000000',
          '#251a00',
          '#3e2e04',
          '#564419',
          '#705c2e',
          '#8a7444',
          '#a58e5b',
          '#c1a873',
          '#dec48c',
          '#fbdfa6',
          '#ffefd2',
          '#fffbff',
          '#ffffff',
        ],
      },
      {
        label: 'neutral',
        hue: 27.4,
        chroma: 6,
        tones: [
          '#000000',
          '#231918',
          '#392e2c',
          '#504442',
          '#685b59',
          '#827472',
          '#9d8d8b',
          '#b8a8a5',
          '#d4c3c0',
          '#f1dfdc',
          '#ffedea',
          '#fffbff',
          '#ffffff',
        ],
      },
    ],
  },
]
