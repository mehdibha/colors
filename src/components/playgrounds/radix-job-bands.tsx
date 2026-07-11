import { Demo } from '@/components/demo'
// Radix blue (light), verified against radix-ui/colors src/light.ts.
// Roles are Radix's own, verbatim from "Understanding the scale".
const BLUE = [
  '#fbfdff',
  '#f4faff',
  '#e6f4fe',
  '#d5efff',
  '#c2e5ff',
  '#acd8fc',
  '#8ec8f6',
  '#5eb1ef',
  '#0090ff',
  '#0588f0',
  '#0d74ce',
  '#113264',
]
const BANDS: { title: string; steps: number[]; roles: string[] }[] = [
  {
    title: 'Backgrounds',
    steps: [1, 2],
    roles: ['App background', 'Subtle background'],
  },
  {
    title: 'Component backgrounds',
    steps: [3, 4, 5],
    roles: [
      'UI element background',
      'Hovered UI element background',
      'Active / selected UI element background',
    ],
  },
  {
    title: 'Borders',
    steps: [6, 7, 8],
    roles: [
      'Subtle borders and separators',
      'UI element border and focus ring',
      'Hovered UI element border',
    ],
  },
  {
    title: 'Solids',
    steps: [9, 10],
    roles: ['Solid background', 'Hovered solid background'],
  },
  {
    title: 'Text',
    steps: [11, 12],
    roles: ['Low-contrast text', 'High-contrast text'],
  },
]
export function RadixJobBands() {
  return (
    <Demo
      caption={
        <>
          One scale, twelve jobs &mdash; chapter 10&rsquo;s &ldquo;steps are
          jobs&rdquo; is not a metaphor here, it is Radix&rsquo;s literal
          documentation, and dotUI&rsquo;s job list is a rename of this column.
          A step number never means &ldquo;how blue&rdquo;; it means{' '}
          <em>which contract</em>.
        </>
      }
    >
      <div className="flex flex-col gap-4">
        {BANDS.map((band) => (
          <div key={band.title} className="flex flex-col gap-1.5">
            <span className="font-mono text-[0.65rem] tracking-wider text-fg-muted uppercase">
              {band.title}
            </span>
            <div className="flex flex-col divide-y rounded-md border">
              {band.steps.map((step, j) => (
                <div key={step} className="flex items-center gap-3 p-2">
                  <span
                    className="size-7 shrink-0 rounded-sm border border-black/10"
                    style={{ backgroundColor: BLUE[step - 1] }}
                  />
                  <span className="w-6 shrink-0 font-mono text-[0.7rem] text-fg-muted tabular-nums">
                    {step}
                  </span>
                  <span className="min-w-0 flex-1 text-[0.8rem]">
                    {band.roles[j]}
                  </span>
                  <span className="shrink-0 font-mono text-[0.65rem] text-fg-muted tabular-nums">
                    {BLUE[step - 1]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Demo>
  )
}
