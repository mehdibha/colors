import { Demo } from '@/components/demo'

const ACCENT = '#5a8fd6'

function Surface({ bg, fg, label }: { bg: string; fg: string; label: string }) {
  return (
    <div
      className="flex flex-1 flex-col items-center gap-3 rounded-lg px-4 py-6"
      style={{ backgroundColor: bg }}
    >
      <span
        className="rounded-md px-3 py-1.5 text-sm font-medium"
        style={{ backgroundColor: ACCENT, color: '#fff' }}
      >
        Accent
      </span>
      <span className="text-sm font-medium" style={{ color: ACCENT }}>
        Link text
      </span>
      <span className="font-mono text-[0.7rem]" style={{ color: fg }}>
        {label}
      </span>
    </div>
  )
}

export function SameAccentTwoSurfaces() {
  return (
    <Demo
      caption={
        <>
          Every color here is the identical{' '}
          <code className="font-mono text-[0.8rem]">#5a8fd6</code>. Only the
          surface changed.
        </>
      }
    >
      <div className="flex flex-col gap-3 sm:flex-row">
        <Surface bg="#ffffff" fg="#00000099" label="on white" />
        <Surface bg="#0d0d0d" fg="#ffffff99" label="on near-black" />
      </div>
    </Demo>
  )
}
