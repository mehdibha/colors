import { differenceEuclidean } from 'culori'

import { Demo } from '@/components/demo'

const dEOK = differenceEuclidean('oklab')

// Two distinct categorical series colors — easy apart as fills, closer as thin marks.
const A = '#3b6fc9'
const B = '#1f9e8f'

const W = 260
const H = 96
const lineA = 'M8,74 L48,40 L88,58 L128,24 L168,50 L208,30 L252,44'
const lineB = 'M8,58 L48,66 L88,30 L128,52 L168,28 L208,60 L252,22'
const dotsA = [
  [8, 74],
  [48, 40],
  [88, 58],
  [128, 24],
  [168, 50],
  [208, 30],
  [252, 44],
]
const dotsB = [
  [8, 58],
  [48, 66],
  [88, 30],
  [128, 52],
  [168, 28],
  [208, 60],
  [252, 22],
]

export function SmallMarkArea() {
  const de = dEOK(A, B)
  return (
    <Demo
      caption={
        <>
          The same two colors, ΔEOK {de.toFixed(2)} apart. As large fills they
          separate instantly. As 1.5px lines and small dots the mark carries far
          less area, so each color reads paler and closer to its neighbor
          &mdash; the small-area effect. A separation that clears the
          glance-apart bound for a bar can still fail for a scatter dot; small
          marks need more.
        </>
      }
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <span className="text-[0.7rem] font-medium">Large fills</span>
          <div
            className="flex h-24 overflow-hidden rounded-md border"
            style={{ backgroundColor: '#ffffff' }}
          >
            <div className="flex-1" style={{ backgroundColor: A }} />
            <div className="flex-1" style={{ backgroundColor: B }} />
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[0.7rem] font-medium">1.5px lines & dots</span>
          <div
            className="overflow-hidden rounded-md border"
            style={{ backgroundColor: '#ffffff' }}
          >
            <svg
              viewBox={`0 0 ${W} ${H}`}
              className="h-24 w-full"
              role="img"
              aria-label="Two thin line series in the same two colors"
            >
              <path d={lineA} fill="none" stroke={A} strokeWidth={1.5} />
              <path d={lineB} fill="none" stroke={B} strokeWidth={1.5} />
              {dotsA.map(([x, y], i) => (
                <circle key={`a${i}`} cx={x} cy={y} r={2} fill={A} />
              ))}
              {dotsB.map(([x, y], i) => (
                <circle key={`b${i}`} cx={x} cy={y} r={2} fill={B} />
              ))}
            </svg>
          </div>
        </div>
      </div>
    </Demo>
  )
}
