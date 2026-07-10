import { Demo } from '@/components/demo'

export function SameNumbersDifferentRed() {
  return (
    <Demo
      caption={
        <>
          Same numbers — <code className="font-mono text-[0.8rem]">1 0 0</code>{' '}
          — in two spaces. If you see a seam, your screen is wide-gamut and the
          P3 half is a red sRGB cannot name. If you see one flat red, your
          screen clamps P3 to sRGB — the numbers were never the color; the space
          decides.
        </>
      }
    >
      <div className="flex h-28 overflow-hidden rounded-lg">
        <div
          className="flex flex-1 items-end justify-center pb-2"
          style={{ backgroundColor: 'rgb(255 0 0)' }}
        >
          <code className="font-mono text-[0.7rem] text-white/80">
            rgb(255 0 0)
          </code>
        </div>
        <div
          className="flex flex-1 items-end justify-center pb-2"
          style={{ backgroundColor: 'color(display-p3 1 0 0)' }}
        >
          <code className="font-mono text-[0.7rem] text-white/80">
            color(display-p3 1 0 0)
          </code>
        </div>
      </div>
    </Demo>
  )
}
