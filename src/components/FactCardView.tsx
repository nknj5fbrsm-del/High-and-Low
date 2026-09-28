import { categoryLabel } from '../axis.ts'
import type { FactCard } from '../types.ts'
import { formatCardValue } from '../format.ts'
import { AxisIcon } from './AxisIcon.tsx'

type CardTone = 'reference' | 'hidden' | 'correct' | 'wrong'

export function FactCardView({
  card,
  label,
  tone,
  hideValue,
}: {
  card: FactCard
  label: string
  tone: CardTone
  hideValue?: boolean
}) {
  const ink =
    tone === 'correct' ? 'text-olive' : tone === 'wrong' ? 'text-burgundy' : 'text-ink'
  const revealClass =
    tone === 'correct' || tone === 'wrong' ? 'trivia-card-reveal' : ''

  return (
    <article className={`trivia-card trivia-card-${tone} ${revealClass}`}>
      <div className="trivia-card-inner">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="trivia-card-icon">
              <AxisIcon axis={card.axis} />
            </span>
            <span className="trivia-card-badge">{categoryLabel(card.axis)}</span>
          </div>
          <p className="font-number shrink-0 pt-0.5 text-[0.7rem] tracking-wide text-ink/50">{card.unit}</p>
        </div>

        <p className="mt-3 text-[0.68rem] font-medium uppercase tracking-[0.18em] text-ink/40">{label}</p>
        <h2 className="font-serif mt-1.5 text-[1.4rem] font-medium leading-snug text-ink">{card.title}</h2>

        <p
          className={`font-number mt-5 text-[2.05rem] font-semibold tabular-nums tracking-tight ${ink}`}
          aria-live={hideValue ? undefined : 'polite'}
        >
          {hideValue ? '???' : formatCardValue(card)}
        </p>
      </div>
    </article>
  )
}
