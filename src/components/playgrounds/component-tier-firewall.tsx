import { useState } from 'react'

import { Demo } from '@/components/demo'
import { ToggleButton } from '@/ui/toggle-button'
import { ToggleButtonGroup } from '@/ui/toggle-button-group'

// dotUI neutral/accent primitives (registry base/colors.css), oklch → hex.
const CARD_VALUES = {
  neutral: '#f7f7f7',
  tinted: '#d0edff',
  dark: '#1d1d1d',
} as const

type CardChoice = keyof typeof CARD_VALUES

const FG = '#070707'
const FG_MUTED = '#626262'
const BORDER = '#dbdbdb'
// neutral-800, not tooltip's actual neutral-950, so the surface stays distinct from FG.
const INVERSE_BG = '#1d1d1d'
const INVERSE_FG = '#fafafa'
const INVERSE_FG_MUTED = '#a3a3a3'

function Surface({
  name,
  token,
  bg,
}: {
  name: string
  token: string
  bg: string
}) {
  return (
    <div
      className="flex items-center justify-between gap-2 rounded-md border px-3 py-2"
      style={{ backgroundColor: bg, borderColor: BORDER }}
    >
      <span
        className="text-xs"
        style={{ color: bg === INVERSE_BG ? INVERSE_FG : FG }}
      >
        {name}
      </span>
      <span
        className="font-mono text-[0.6rem]"
        style={{ color: bg === INVERSE_BG ? INVERSE_FG_MUTED : FG_MUTED }}
      >
        {token}
      </span>
    </div>
  )
}

export function ComponentTierFirewall() {
  const [card, setCard] = useState<CardChoice>('neutral')
  const cardValue = CARD_VALUES[card]

  return (
    <Demo
      caption={
        <>
          One product decision &mdash; restyle the card surface &mdash; and two
          blast radii. On the left, popover and tooltip merely reuse{' '}
          <span className="font-mono">card</span>&rsquo;s value, so they follow
          it everywhere it goes. On the right they own component-tier names,
          pinned to their own values: the tooltip can stay inverse &mdash; a
          choice no shared surface token could express. The firewall costs a
          name per component, times every mode.
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs text-fg-muted">Card surface</span>
          <ToggleButtonGroup
            selectionMode="single"
            disallowEmptySelection
            selectedKeys={[card]}
            onSelectionChange={(keys) => {
              const next = [...keys][0]
              if (next === 'neutral' || next === 'tinted' || next === 'dark')
                setCard(next)
            }}
            size="sm"
            aria-label="Card surface value"
            className="max-w-full overflow-x-auto"
          >
            <ToggleButton id="neutral">Neutral</ToggleButton>
            <ToggleButton id="tinted">Tinted</ToggleButton>
            <ToggleButton id="dark">Charcoal</ToggleButton>
          </ToggleButtonGroup>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <span className="text-xs text-fg-muted">
              Two tiers — everything aliases{' '}
              <span className="font-mono">card</span>
            </span>
            <div className="flex flex-col gap-2">
              <Surface name="Card" token="card" bg={cardValue} />
              <Surface name="Popover" token="card" bg={cardValue} />
              <Surface name="Tooltip" token="card" bg={cardValue} />
            </div>
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <span className="text-xs text-fg-muted">
              Three tiers — component tokens on top
            </span>
            <div className="flex flex-col gap-2">
              <Surface name="Card" token="card" bg={cardValue} />
              <Surface
                name="Popover"
                token="popover"
                bg={CARD_VALUES.neutral}
              />
              <Surface name="Tooltip" token="tooltip" bg={INVERSE_BG} />
            </div>
          </div>
        </div>
      </div>
    </Demo>
  )
}
