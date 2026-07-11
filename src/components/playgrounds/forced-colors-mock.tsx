import { useState } from 'react'

import { Demo } from '@/components/demo'
import { SegmentedControl, SegmentedControlItem } from '@/ui/segmented-control'

// A common Windows High Contrast "black" theme, hand-mocked. Real forced-colors
// mode maps the CSS system-color keywords (Canvas, CanvasText, LinkText,
// ButtonText, ButtonFace) to the user's chosen theme — we cannot switch the OS
// setting on for you, so this reproduces one typical palette by hand.
const HCM = {
  canvas: '#000000',
  text: '#ffffff',
  link: '#00ffff',
  buttonFace: '#000000',
  buttonText: '#ffff00',
}

function Card({ forced }: { forced: boolean }) {
  const shell = forced
    ? {
        backgroundColor: HCM.canvas,
        color: HCM.text,
        border: `1px solid ${HCM.text}`,
      }
    : {
        background: 'linear-gradient(135deg, #eef2ff, #ffffff)',
        color: '#1e293b',
        border: '1px solid #e2e8f0',
        boxShadow: '0 8px 24px -12px rgba(30,41,59,0.35)',
      }

  return (
    <div className="rounded-xl p-4" style={shell}>
      <div className="flex items-center gap-2">
        <span
          className="size-6 rounded-md"
          style={
            forced
              ? { border: `1px solid ${HCM.text}` }
              : { background: 'linear-gradient(135deg,#6366f1,#a855f7)' }
          }
        />
        <span className="text-sm font-semibold">Pro plan</span>
      </div>
      <p
        className="mt-2 text-sm"
        style={forced ? { color: HCM.text } : { color: '#475569' }}
      >
        Unlimited projects and priority support.{' '}
        <span style={forced ? { color: HCM.link } : { color: '#4f46e5' }}>
          Compare plans
        </span>
      </p>
      <button
        className="mt-3 rounded-md px-3 py-1.5 text-sm font-medium"
        style={
          forced
            ? {
                backgroundColor: HCM.buttonFace,
                color: HCM.buttonText,
                border: `1px solid ${HCM.buttonText}`,
              }
            : { backgroundColor: '#4f46e5', color: '#ffffff' }
        }
      >
        Upgrade
      </button>
    </div>
  )
}

export function ForcedColorsMock() {
  const [forced, setForced] = useState(false)

  return (
    <Demo
      caption={
        <>
          A mock, and honestly so: forced-colors mode is an operating-system
          setting we can't toggle for you. When it's on, the browser throws away
          your <code className="font-mono text-[0.8rem]">background</code>,{' '}
          <code className="font-mono text-[0.8rem]">color</code>, and{' '}
          <code className="font-mono text-[0.8rem]">border-color</code> at paint
          time and repaints from the user's system palette; gradients and{' '}
          <code className="font-mono text-[0.8rem]">box-shadow</code> are forced
          to <code className="font-mono text-[0.8rem]">none</code>. The purple
          swatch and the shadowed card vanish — which is why a border the design
          treated as decorative is the only thing keeping the card's edge
          visible.
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <SegmentedControl
          selectedKeys={[forced ? 'on' : 'off']}
          onSelectionChange={(k) => setForced([...k][0] === 'on')}
          aria-label="Forced colors"
          className="w-fit"
        >
          <SegmentedControlItem id="off">Author colors</SegmentedControlItem>
          <SegmentedControlItem id="on">
            Forced colors (mock)
          </SegmentedControlItem>
        </SegmentedControl>
        <div className="max-w-xs">
          <Card forced={forced} />
        </div>
      </div>
    </Demo>
  )
}
