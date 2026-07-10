import { useMemo, useState } from 'react'
import {
  clampChroma,
  converter,
  differenceEuclidean,
  filterDeficiencyDeuter,
  filterDeficiencyProt,
  filterDeficiencyTrit,
  formatHex,
} from 'culori'

import { Playground } from '@/components/playground'
import { Slider, SliderControl } from '@/ui/slider'
import { ToggleButton } from '@/ui/toggle-button'
import { ToggleButtonGroup } from '@/ui/toggle-button-group'

const toLab = converter('lab')
const toRgb = converter('rgb')
const dEok = differenceEuclidean('oklab')
const lstar = (hex: string) => toLab(hex)?.l ?? 0

type Def = 'none' | 'deutan' | 'protan' | 'tritan'

const DEFICIENCIES: { id: Def; label: string }[] = [
  { id: 'none', label: 'Normal' },
  { id: 'deutan', label: 'Deutan' },
  { id: 'protan', label: 'Protan' },
  { id: 'tritan', label: 'Tritan' },
]

function makeFilter(def: Def, severity: number): (hex: string) => string {
  if (def === 'none') return (hex) => hex
  const filter =
    def === 'deutan'
      ? filterDeficiencyDeuter(severity)
      : def === 'protan'
        ? filterDeficiencyProt(severity)
        : filterDeficiencyTrit(severity)
  return (hex) => {
    const rgb = toRgb(hex)
    return rgb ? (formatHex(filter(rgb)) ?? hex) : hex
  }
}

// A single-hue brand ramp: ordered by lightness, so its meaning survives CVD.
const BRAND = [
  { l: 0.95, c: 0.03 },
  { l: 0.85, c: 0.07 },
  { l: 0.72, c: 0.13 },
  { l: 0.58, c: 0.16 },
  { l: 0.45, c: 0.15 },
  { l: 0.33, c: 0.11 },
].map(({ l, c }) =>
  formatHex(clampChroma({ mode: 'oklch', l, c, h: 255 }, 'oklch')),
)

// Real design-system status colors (Tailwind 600). Meaning lives in hue.
const STATUS = [
  { id: 'success', label: 'Success', hex: '#16a34a' },
  { id: 'warning', label: 'Warning', hex: '#f59e0b' },
  { id: 'error', label: 'Error', hex: '#dc2626' },
  { id: 'info', label: 'Info', hex: '#2563eb' },
]

// A categorical chart palette: five hues at one lightness — meaning is hue alone.
const SERIES = [
  { label: 'Search', value: 74, h: 25 },
  { label: 'Direct', value: 52, h: 90 },
  { label: 'Social', value: 88, h: 150 },
  { label: 'Referral', value: 61, h: 260 },
  { label: 'Email', value: 37, h: 320 },
].map((s) => ({
  ...s,
  hex: formatHex(
    clampChroma({ mode: 'oklch', l: 0.62, c: 0.16, h: s.h }, 'oklch'),
  ),
}))

// A pair is "merged" below a few JND, "risky" up to a comfortable glance-apart.
const MERGED = 0.06
const RISKY = 0.12

function worstPair<T extends { label: string; hex: string }>(
  items: T[],
  shown: (hex: string) => string,
) {
  let worst: { a: T; b: T; de: number } | undefined
  for (const [i, a] of items.entries()) {
    for (const b of items.slice(i + 1)) {
      const de = dEok(shown(a.hex), shown(b.hex))
      if (!worst || de < worst.de) worst = { a, b, de }
    }
  }
  if (!worst) throw new Error('worstPair needs at least two items')
  return worst
}

export function CvdSimulator() {
  const [def, setDef] = useState<Def>('deutan')
  const [severity, setSeverity] = useState(1)

  const shown = useMemo(() => makeFilter(def, severity), [def, severity])

  const statusWorst = worstPair(STATUS, shown)
  const seriesWorst = worstPair(SERIES, shown)
  const seriesHard = (() => {
    let n = 0
    for (const [i, a] of SERIES.entries())
      for (const b of SERIES.slice(i + 1))
        if (dEok(shown(a.hex), shown(b.hex)) < RISKY) n++
    return n
  })()

  const verdict = (de: number) =>
    de < MERGED
      ? { text: 'merged — indistinguishable', tone: 'bad' as const }
      : de < RISKY
        ? { text: 'risky — hard at a glance', tone: 'warn' as const }
        : { text: 'still distinct', tone: 'ok' as const }

  const statusVerdict = verdict(statusWorst.de)
  const seriesVerdict = verdict(seriesWorst.de)
  const dL = Math.abs(
    lstar(shown(statusWorst.a.hex)) - lstar(shown(statusWorst.b.hex)),
  )

  return (
    <Playground
      question="Do your colors still mean different things to eyes unlike yours?"
      onReset={() => {
        setDef('deutan')
        setSeverity(1)
      }}
    >
      <div className="flex flex-col gap-5">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <div className="flex items-center gap-2">
            <span className="shrink-0 text-xs text-fg-muted">Simulate</span>
            <ToggleButtonGroup
              selectionMode="single"
              disallowEmptySelection
              selectedKeys={[def]}
              onSelectionChange={(keys) => setDef([...keys][0] as Def)}
              size="sm"
              aria-label="Deficiency"
            >
              {DEFICIENCIES.map((d) => (
                <ToggleButton key={d.id} id={d.id}>
                  {d.label}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </div>
          <div className="flex min-w-48 flex-1 items-center gap-3">
            <span className="shrink-0 text-xs text-fg-muted">Severity</span>
            <Slider
              aria-label="Severity"
              value={severity}
              onChange={(v) => setSeverity(v as number)}
              minValue={0}
              maxValue={1}
              step={0.1}
              isDisabled={def === 'none'}
              className="flex-1"
            >
              <SliderControl />
            </Slider>
            <span className="w-8 shrink-0 text-right font-mono text-xs text-fg-muted tabular-nums">
              {def === 'none' ? '—' : severity.toFixed(1)}
            </span>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1fr_16rem]">
          <div className="flex flex-col gap-4 rounded-lg border p-4">
            <div>
              <div className="mb-2 text-xs text-fg-muted">
                Brand ramp — one hue, ordered by lightness
              </div>
              <div className="flex h-10 overflow-hidden rounded-md border">
                {BRAND.map((hex) => (
                  <div
                    key={hex}
                    className="flex-1"
                    style={{ backgroundColor: shown(hex) }}
                  />
                ))}
              </div>
            </div>

            <div>
              <div className="mb-2 text-xs text-fg-muted">
                Status colors — meaning carried by hue
              </div>
              <div className="flex flex-wrap gap-2">
                {STATUS.map((s) => (
                  <span
                    key={s.id}
                    className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm"
                  >
                    <span
                      className="size-3 rounded-full"
                      style={{ backgroundColor: shown(s.hex) }}
                    />
                    {s.label}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <div className="mb-2 text-xs text-fg-muted">
                Traffic by channel — series told apart by hue alone
              </div>
              <div className="flex h-32 items-end gap-3">
                {SERIES.map((s) => (
                  <div
                    key={s.label}
                    className="flex flex-1 flex-col items-center gap-1"
                  >
                    <div className="flex w-full flex-1 items-end">
                      <div
                        className="w-full rounded-t-sm"
                        style={{
                          height: `${s.value}%`,
                          backgroundColor: shown(s.hex),
                        }}
                      />
                    </div>
                    <span className="truncate text-[0.65rem] text-fg-muted">
                      {s.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 rounded-lg border bg-muted p-4 text-sm">
            <div className="font-mono text-[0.7rem] tracking-wider text-fg-muted uppercase">
              L-separation readout
            </div>

            <Readout
              title="Brand ramp"
              body="Single hue, stepped in lightness. CVD dulls the color but never scrambles the order — a lightness-ordered ramp is CVD-safe by construction."
              tone="ok"
            />

            <Readout
              title="Status — closest pair"
              body={`${statusWorst.a.label} vs ${statusWorst.b.label}: ΔEok ${statusWorst.de.toFixed(2)}, ΔL* ${dL.toFixed(0)}. ${statusVerdict.text}.`}
              tone={statusVerdict.tone}
            />

            <Readout
              title="Chart series"
              body={`${seriesHard} of 10 pairs now hard to tell apart. Closest: ${seriesWorst.a.label} vs ${seriesWorst.b.label}, ΔEok ${seriesWorst.de.toFixed(2)} — ${seriesVerdict.text}.`}
              tone={seriesVerdict.tone}
            />
          </div>
        </div>

        <p className="text-sm text-fg-muted">
          The brand ramp shrugs off every deficiency — it never asked hue to
          carry meaning. The status pills and the chart do, and they pay for it:
          switch to <strong className="text-fg">Deutan</strong> and the red,
          amber and green slide into one band of olive-brown while blue holds
          its ground. What survives, survives on the two things CVD can&rsquo;t
          take away — a lightness difference (ΔL*) or the blue&ndash;yellow
          axis. Encode meaning in hue alone and this is what a tenth of your
          male users get.
        </p>
      </div>
    </Playground>
  )
}

function Readout({
  title,
  body,
  tone,
}: {
  title: string
  body: string
  tone: 'ok' | 'warn' | 'bad'
}) {
  const dot =
    tone === 'ok' ? 'bg-success' : tone === 'warn' ? 'bg-warning' : 'bg-danger'
  return (
    <div className="flex flex-col gap-0.5" aria-live="polite">
      <div className="flex items-center gap-2">
        <span className={`size-2 shrink-0 rounded-full ${dot}`} />
        <span className="text-xs font-medium">{title}</span>
      </div>
      <p className="text-xs text-fg-muted">{body}</p>
    </div>
  )
}
