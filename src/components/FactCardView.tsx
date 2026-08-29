import { categoryLabel } from '../axis.ts'
import type { FactCard } from '../types.ts'
import { formatCardValue } from '../format.ts'

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

  return (
    <article className={`trivia-card trivia-card-${tone}`}>
      <div className="flex items-start justify-between gap-3">
        <p className="text-[0.68rem] font-semibold tracking-[0.22em] text-burgundy">{categoryLabel(card.axis)}</p>
        <p className="font-number text-[0.7rem] tracking-wide text-ink/55">{card.unit}</p>
      </div>
      <p className="mt-2 text-[0.7rem] font-medium uppercase tracking-[0.16em] text-ink/45">{label}</p>
      <h2 className="font-serif mt-2 text-[1.35rem] font-medium leading-snug text-ink">{card.title}</h2>
      <p className={`font-number mt-4 text-3xl font-semibold tabular-nums tracking-tight ${ink}`}>
        {hideValue ? '???' : formatCardValue(card)}
      </p>
    </article>
  )
}
