import type { FactCard } from '../types.ts'
import { formatCardValue } from '../format.ts'

type CardTone = 'reference' | 'hidden' | 'correct' | 'wrong'

const toneClass: Record<CardTone, string> = {
  reference:
    'border-zinc-600 bg-zinc-900/90 shadow-[0_12px_40px_rgba(0,0,0,0.35)]',
  hidden: 'border-zinc-700 bg-zinc-900/70',
  correct: 'border-lime-400 bg-lime-400/10 shadow-[0_0_32px_rgba(163,230,53,0.25)]',
  wrong: 'border-rose-400 bg-rose-500/10 shadow-[0_0_32px_rgba(251,113,133,0.25)]',
}

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
  return (
    <article className={`rounded-3xl border px-5 py-5 ${toneClass[tone]}`}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-zinc-500">{label}</p>
      <h2 className="mt-2 text-[1.35rem] font-semibold leading-snug text-zinc-50">{card.title}</h2>
      <p
        className={`mt-4 font-display text-3xl font-extrabold tabular-nums tracking-tight ${
          tone === 'correct' ? 'text-lime-300' : tone === 'wrong' ? 'text-rose-300' : 'text-white'
        }`}
      >
        {hideValue ? '???' : formatCardValue(card)}
      </p>
    </article>
  )
}
