import { useState } from 'react'

import { Demo } from '@/components/demo'
import { ToggleButton } from '@/ui/toggle-button'
import { ToggleButtonGroup } from '@/ui/toggle-button-group'

import { dEok, HCT_TONES, TONAL_SPOT_SCHEMES } from './material-hct-data'

export function SeedSchemeStrip() {
  const [id, setId] = useState('green')
  const scheme =
    TONAL_SPOT_SCHEMES.find((s) => s.id === id) ?? TONAL_SPOT_SCHEMES[0]
  if (!scheme) return null

  const primary = scheme.palettes[0]
  const primary40 = primary?.tones[4] ?? '#000000'
  const fidelity = dEok(scheme.seed, primary40)

  return (
    <Demo
      caption={
        <>
          The dynamic-color default (TonalSpot), from source: of the
          seed&rsquo;s three HCT numbers, only the <em>hue</em> survives. Chroma
          is policy — 36 for primary, 16 for secondary, 24 at hue +60° for
          tertiary, 6 for neutral — and tone comes from the role table. The
          readout prices what chapter 14 called the seed question: the
          &ldquo;brand color&rdquo; the scheme is built from does not appear in
          the scheme.
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <ToggleButtonGroup
          selectionMode="single"
          disallowEmptySelection
          selectedKeys={[id]}
          onSelectionChange={(keys) => {
            const next = [...keys][0]
            if (typeof next === 'string') setId(next)
          }}
          size="sm"
          aria-label="Seed color"
          className="max-w-full overflow-x-auto"
        >
          {TONAL_SPOT_SCHEMES.map((s) => (
            <ToggleButton key={s.id} id={s.id}>
              <span
                aria-hidden
                className="mr-1.5 inline-block size-3 rounded-full border align-[-1px]"
                style={{ backgroundColor: s.seed }}
              />
              {s.name}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs tabular-nums">
          <span className="flex items-center gap-2">
            <span
              className="inline-block size-5 rounded-md border"
              style={{ backgroundColor: scheme.seed }}
            />
            <span className="font-mono">{scheme.seed}</span>
          </span>
          <span className="text-fg-muted">
            HCT {scheme.seedHct.h.toFixed(1)} / {scheme.seedHct.c.toFixed(1)} /{' '}
            {scheme.seedHct.t.toFixed(1)}
          </span>
        </div>

        <div className="flex flex-col gap-2">
          {scheme.palettes.map((pal) => (
            <div key={pal.label} className="flex flex-col gap-1">
              <span className="font-mono text-[0.65rem] text-fg-muted tabular-nums">
                {pal.label} — H {pal.hue.toFixed(1)} C {pal.chroma}
              </span>
              <div className="flex gap-0.5">
                {pal.tones.map((hex, i) => {
                  const tone = HCT_TONES[i]
                  const isPrimarySlot =
                    pal.label === 'primary' && (tone === 40 || tone === 80)
                  return (
                    <div
                      key={i}
                      className={
                        isPrimarySlot
                          ? 'h-8 min-w-0 flex-1 rounded-sm ring-2 ring-fg ring-offset-1 ring-offset-card'
                          : 'h-8 min-w-0 flex-1 rounded-sm'
                      }
                      style={{ backgroundColor: hex }}
                      title={`tone ${tone}: ${hex}`}
                    />
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        <p aria-live="polite" className="text-sm text-fg-muted tabular-nums">
          Seed {scheme.seed} vs its own light primary (tone 40, ringed):{' '}
          <span className="font-mono">{primary40}</span>, ΔEok{' '}
          {fidelity.toFixed(3)}
          {fidelity > 0.1
            ? ` — ${Math.round(fidelity / 0.02)}× the 0.02 just-noticeable difference. Fidelity was traded for the system, in writing.`
            : ' — close here, because this seed already sits near the policy chroma.'}
        </p>
      </div>
    </Demo>
  )
}
