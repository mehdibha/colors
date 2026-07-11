import { converter } from 'culori'

// APCA-W3 0.0.98G-4g constants, from github.com/Myndex/apca-w3 (src/apca-w3.js).
// Verified against the documented reference values — e.g. #888 on #fff → 63.056469930209424.

const toRgb = converter('rgb')

const mainTRC = 2.4
const coeffs = { r: 0.2126729, g: 0.7151522, b: 0.072175 }
const normBG = 0.56
const normTXT = 0.57
const revBG = 0.65
const revTXT = 0.62
const blkThrs = 0.022
const blkClmp = 1.414
const scale = 1.14
const loOffset = 0.027
const loClip = 0.1
const deltaYmin = 0.0005

const screenY = (color: string) => {
  const rgb = toRgb(color)
  if (!rgb) return 0
  return (
    coeffs.r * rgb.r ** mainTRC +
    coeffs.g * rgb.g ** mainTRC +
    coeffs.b * rgb.b ** mainTRC
  )
}

const softBlack = (y: number) =>
  y < blkThrs ? y + (blkThrs - y) ** blkClmp : y

/** Lc contrast — positive for dark text on light, negative for light text on dark. */
export function apcaLc(text: string, background: string): number {
  const ytx = softBlack(screenY(text))
  const ybg = softBlack(screenY(background))
  if (Math.abs(ybg - ytx) < deltaYmin) return 0
  if (ybg > ytx) {
    const sapc = (ybg ** normBG - ytx ** normTXT) * scale
    return sapc < loClip ? 0 : (sapc - loOffset) * 100
  }
  const sapc = (ybg ** revBG - ytx ** revTXT) * scale
  return sapc > -loClip ? 0 : (sapc + loOffset) * 100
}
