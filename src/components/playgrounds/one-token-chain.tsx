import { Demo } from '@/components/demo'

// Radix blue9, light.ts.
const BLUE9 = '#0090ff'

export function OneTokenChain() {
  return (
    <Demo
      caption={
        <>
          One resolution chain, read right to left: the pixel asks a semantic
          name, the name points at a primitive, the primitive holds the paint.
          The component tier is optional indirection &mdash; most chains skip
          it. Every demo in this chapter is some edit to this chain.
        </>
      }
    >
      <div className="flex flex-wrap items-center gap-x-3 gap-y-4">
        <div className="flex flex-col gap-1.5">
          <span className="font-mono text-[0.6rem] tracking-wider text-fg-muted uppercase">
            Primitive
          </span>
          <span className="flex items-center gap-2 rounded-md border px-3 py-2 font-mono text-xs">
            <span
              className="size-4 rounded-sm border"
              style={{ backgroundColor: BLUE9 }}
              aria-hidden
            />
            blue-9
            <span className="text-fg-muted tabular-nums">{BLUE9}</span>
          </span>
        </div>
        <span className="mt-5 text-fg-muted" aria-hidden>
          &larr;
        </span>
        <div className="flex flex-col gap-1.5">
          <span className="font-mono text-[0.6rem] tracking-wider text-fg-muted uppercase">
            Semantic
          </span>
          <span className="rounded-md border px-3 py-2 font-mono text-xs">
            accent
          </span>
        </div>
        <span className="mt-5 text-fg-muted" aria-hidden>
          &larr;
        </span>
        <div className="flex flex-col gap-1.5">
          <span className="font-mono text-[0.6rem] tracking-wider text-fg-muted uppercase">
            Component (optional)
          </span>
          <span className="rounded-md border border-dashed px-3 py-2 font-mono text-xs text-fg-muted">
            button-bg
          </span>
        </div>
        <span className="mt-5 text-fg-muted" aria-hidden>
          &larr;
        </span>
        <div className="flex flex-col gap-1.5">
          <span className="font-mono text-[0.6rem] tracking-wider text-fg-muted uppercase">
            The pixel
          </span>
          <span
            className="rounded-md px-3.5 py-2 text-xs font-medium"
            style={{ backgroundColor: BLUE9, color: '#ffffff' }}
          >
            Reply
          </span>
        </div>
      </div>
    </Demo>
  )
}
