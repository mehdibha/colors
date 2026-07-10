import { Demo } from '@/components/demo'

export function SeamRevisited() {
  return (
    <Demo
      caption={
        <>
          Chapter 2's seam, second sighting — same boundary, a greener corner of
          it this time. The left half is{' '}
          <code className="font-mono text-[0.8rem]">#00ff00</code> — the most
          vivid green sRGB has. The right asks for more chroma than sRGB holds.
          On a wide-gamut screen you see a seam: the right half is a Display P3
          green from beyond the boundary. On an sRGB screen you see one flat
          green — your browser pulled the right half back inside, and it landed
          exactly on the left half. Either way, the seam's location isn't
          arbitrary: it is the sRGB gamut boundary, made visible.
        </>
      }
    >
      <div className="flex h-28 overflow-hidden rounded-lg">
        <div
          className="flex flex-1 items-end justify-center pb-2"
          style={{ backgroundColor: '#00ff00' }}
        >
          <code className="font-mono text-[0.7rem] text-black/60">#00ff00</code>
        </div>
        <div
          className="flex flex-1 items-end justify-center pb-2"
          style={{ backgroundColor: 'oklch(0.85 0.35 145)' }}
        >
          <code className="font-mono text-[0.7rem] text-black/60">
            oklch(0.85 0.35 145)
          </code>
        </div>
      </div>
    </Demo>
  )
}
