import { Demo } from '@/components/demo'

// Verified example from the Tailwind v4 theme docs: one @theme definition emits
// both the :root custom property AND a family of utilities.
const MINT = 'oklch(0.72 0.11 178)'

export function TailwindThemeOutput() {
  return (
    <Demo
      caption={
        <>
          One <span className="font-mono">@theme</span> definition, two outputs:
          a <span className="font-mono">:root</span> custom property{' '}
          <em>and</em> a family of utilities. That is why the token table is an{' '}
          <span className="font-mono">@theme</span> block, not a plain{' '}
          <span className="font-mono">:root</span> one &mdash; chapter
          17&rsquo;s <span className="font-mono">bg-accent</span> falls out of{' '}
          <span className="font-mono">--color-accent</span> for free.
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <span className="text-xs text-fg-muted">you write</span>
            <div className="overflow-x-auto rounded-md bg-muted/50 p-3">
              <pre className="font-mono text-[0.65rem] leading-relaxed whitespace-pre">{`@theme {
  --color-mint-500: oklch(0.72 0.11 178);
}`}</pre>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="text-xs text-fg-muted">Tailwind emits</span>
            <div className="overflow-x-auto rounded-md bg-muted/50 p-3">
              <pre className="font-mono text-[0.65rem] leading-relaxed whitespace-pre">{`:root {
  --color-mint-500: oklch(0.72 0.11 178);
}
.bg-mint-500   { background-color: var(--color-mint-500) }
.text-mint-500 { color: var(--color-mint-500) }
.fill-mint-500 { fill: var(--color-mint-500) }`}</pre>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span
            className="inline-flex items-center rounded-md px-3 py-1.5 text-xs font-medium text-white"
            style={{ backgroundColor: MINT }}
          >
            .bg-mint-500
          </span>
          <span className="font-mono text-[0.65rem] text-fg-muted">
            rendered live through the custom property
          </span>
        </div>
      </div>
    </Demo>
  )
}
