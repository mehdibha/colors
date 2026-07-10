import { useState } from 'react'

import { Demo } from '@/components/demo'

// Radix blue, light mode.
const B = {
  bg2: '#f4faff',
  rest: '#e6f4fe', // 3
  hover: '#d5efff', // 4
  active: '#c2e5ff', // 5
  border: '#8ec8f6', // 7
  borderHover: '#5eb1ef', // 8
  text: '#0d74ce', // 11
}

const STATES = [
  { label: 'Rest', step: '3', bg: B.rest, border: B.border },
  { label: 'Hover', step: '4', bg: B.hover, border: B.border },
  { label: 'Pressed', step: '5', bg: B.active, border: B.borderHover },
]

export function StepsAreStates() {
  const [hover, setHover] = useState(false)
  const [pressed, setPressed] = useState(false)

  const bg = pressed ? B.active : hover ? B.hover : B.rest
  const border = hover || pressed ? B.borderHover : B.border

  return (
    <Demo
      caption={
        <>
          Steps 3, 4 and 5 aren&rsquo;t three colors that happen to look nice
          together — they&rsquo;re one element in three moments. The hop from 3
          to 4 is 2.5 L*, from 4 to 5 another 3.9: small enough to feel like the
          same surface, large enough to register as feedback. That pairing is a
          contract — regenerate step 3 and steps 4 and 5 must move with it, or
          every hover in the product goes numb or jumpy.
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <span className="text-xs text-fg-muted">
            The three states, frozen
          </span>
          <div className="flex gap-3">
            {STATES.map((s) => (
              <div key={s.label} className="flex flex-col items-center gap-1">
                <div
                  className="flex h-10 w-20 items-center justify-center rounded-md border text-sm font-medium"
                  style={{
                    backgroundColor: s.bg,
                    borderColor: s.border,
                    color: B.text,
                  }}
                >
                  {s.step}
                </div>
                <span className="text-[0.65rem] text-fg-muted">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-xs text-fg-muted">Live — hover and press</span>
          <div
            className="flex h-16 items-center justify-center rounded-lg"
            style={{ backgroundColor: B.bg2 }}
          >
            <button
              type="button"
              className="rounded-md border px-4 py-2 text-sm font-medium transition-colors duration-75"
              style={{
                backgroundColor: bg,
                borderColor: border,
                color: B.text,
              }}
              onPointerEnter={() => setHover(true)}
              onPointerLeave={() => {
                setHover(false)
                setPressed(false)
              }}
              onPointerDown={() => setPressed(true)}
              onPointerUp={() => setPressed(false)}
            >
              Assign reviewer
            </button>
          </div>
        </div>
      </div>
    </Demo>
  )
}
