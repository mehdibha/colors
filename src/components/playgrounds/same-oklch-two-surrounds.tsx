import { converter, formatHex } from 'culori'

import { Demo } from '@/components/demo'

const CHIP = formatHex(
  converter('rgb')({ mode: 'oklch', l: 0.65, c: 0.1, h: 250 }),
)

const SURROUNDS = ['#101010', '#f3f3f3']

export function SameOklchTwoSurrounds() {
  return (
    <Demo
      caption={
        <>
          Both chips are{' '}
          <code className="font-mono text-[0.8rem]">oklch(0.65 0.1 250)</code> —
          identical to the last bit. Chapter 1's effect passes straight through:
          OKLab's coordinates describe the color, not the company it keeps. No
          surround, no adaptation, no viewing conditions — by design.
        </>
      }
    >
      <div className="flex overflow-hidden rounded-lg border">
        {SURROUNDS.map((surround) => (
          <div
            key={surround}
            className="flex flex-1 items-center justify-center py-10"
            style={{ backgroundColor: surround }}
          >
            <div
              className="size-16 rounded-md"
              style={{ backgroundColor: CHIP }}
            />
          </div>
        ))}
      </div>
    </Demo>
  )
}
