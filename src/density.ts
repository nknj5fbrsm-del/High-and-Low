import type { Axis, Density, FactCard } from './types.ts'

export const DENSITIES: Density[] = ['locker', 'knackig', 'haarscharf']

/** Land und Stadt darin — niemals als Paar. */
const SUBSET_KEYS = new Set([
  pairKey('deutschland', 'berlin'),
  pairKey('k-de', 'berlin'),
  pairKey('k-de', 'hamburg'),
  pairKey('k-de', 'muenchen'),
  pairKey('k-de', 'koeln-stadt'),
  pairKey('oesterreich', 'wien'),
  pairKey('k-it', 'mailand'),
  pairKey('k-fr', 'paris'),
  pairKey('k-es', 'barcelona'),
  pairKey('k-es', 'madrid'),
  pairKey('k-uk', 'london'),
  pairKey('k-pl', 'warschau'),
])

function pairKey(a: string, b: string): string {
  return a < b ? `${a}|${b}` : `${b}|${a}`
}

export function isDensity(value: string | null | undefined): value is Density {
  return value === 'locker' || value === 'knackig' || value === 'haarscharf'
}

export function normalizeDensity(value: string | null | undefined): Density {
  return isDensity(value) ? value : 'knackig'
}

export function usesYearGap(axis: Axis): boolean {
  return axis === 'year'
}

export function valueRatio(a: number, b: number): number {
  const hi = Math.max(Math.abs(a), Math.abs(b))
  const lo = Math.min(Math.abs(a), Math.abs(b))
  if (lo === 0) return Number.POSITIVE_INFINITY
  return hi / lo
}

export function yearGap(a: number, b: number): number {
  return Math.abs(a - b)
}

export function isSubsetPair(a: FactCard, b: FactCard): boolean {
  return SUBSET_KEYS.has(pairKey(a.id, b.id))
}

export function pairFitsDensity(a: FactCard, b: FactCard, density: Density): boolean {
  if (a.id === b.id) return false
  if (a.axis !== b.axis) return false
  if (isSubsetPair(a, b)) return false

  if (usesYearGap(a.axis)) {
    const gap = yearGap(a.value, b.value)
    if (gap === 0) return false
    if (density === 'haarscharf') return gap >= 5 && gap < 25
    if (density === 'knackig') return gap >= 25 && gap < 60
    return gap >= 60 && gap <= 120
  }

  const ratio = valueRatio(a.value, b.value)
  if (!Number.isFinite(ratio) || ratio > 4) return false
  if (density === 'haarscharf') return ratio >= 1.05 && ratio <= 1.3
  if (density === 'knackig') return ratio > 1.3 && ratio <= 2
  return ratio > 2 && ratio <= 4
}

export function listValidPairs(
  cards: FactCard[],
  density: Density,
  excludeAxis: string | null = null,
): [FactCard, FactCard][] {
  const pairs: [FactCard, FactCard][] = []
  for (let i = 0; i < cards.length; i += 1) {
    for (let j = i + 1; j < cards.length; j += 1) {
      const left = cards[i]
      const right = cards[j]
      if (excludeAxis && left.axis === excludeAxis) continue
      if (pairFitsDensity(left, right, density)) {
        pairs.push([left, right])
      }
    }
  }
  return pairs
}

export function axesWithPairs(
  cards: FactCard[],
  density: Density,
): Axis[] {
  const axes = new Set<Axis>()
  for (const [left] of listValidPairs(cards, density)) {
    axes.add(left.axis)
  }
  return [...axes]
}
