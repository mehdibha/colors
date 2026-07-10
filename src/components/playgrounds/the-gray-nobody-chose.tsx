import { converter, formatHex, interpolate } from 'culori'

import { Demo } from '@/components/demo'

const toRgb = converter('rgb')

const SRGB_MID = formatHex(
  toRgb(interpolate(['#0000ff', '#ffff00'], 'rgb')(0.5)),
)
const OKLAB_MID = formatHex(
  toRgb(interpolate(['#0000ff', '#ffff00'], 'oklab')(0.5)),
)

function Row({ label, css }: { label: string; css: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="font-mono text-[0.7rem] text-fg-muted">{label}</span>
      <div className="h-12 rounded-lg border" style={{ background: css }} />
    </div>
  )
}

export function TheGrayNobodyChose() {
  return (
    <Demo
      caption={
        <>
          Both rows are rendered by your browser, live — same two stops. The top
          row is the web's default; its center pixel is{' '}
          <code className="font-mono text-[0.8rem]">{SRGB_MID}</code>, chapter
          3's value-ladder halfway gray. Add two words and the center becomes{' '}
          <code className="font-mono text-[0.8rem]">{OKLAB_MID}</code>, an
          actual color. Neither middle appears anywhere in the CSS. Something
          chose it.
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <Row
          label="linear-gradient(rgb(0 0 255), rgb(255 255 0))"
          css="linear-gradient(90deg, rgb(0 0 255), rgb(255 255 0))"
        />
        <Row
          label="linear-gradient(in oklab, rgb(0 0 255), rgb(255 255 0))"
          css="linear-gradient(90deg in oklab, rgb(0 0 255), rgb(255 255 0))"
        />
      </div>
    </Demo>
  )
}
