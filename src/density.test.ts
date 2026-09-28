import { ADULT_DECK } from './deck.ts'
import {
  axesWithPairs,
  listValidPairs,
  pairFitsDensity,
  usesYearGap,
  valueRatio,
  yearGap,
} from './density.ts'
import type { Density, FactCard } from './types.ts'

function card(id: string, value: number, axis: FactCard['axis']): FactCard {
  return {
    id,
    title: id,
    value,
    unit: axis === 'year' ? 'Jahr' : 'Mio.',
    axis,
  }
}

describe('pairFitsDensity', () => {
  it('trennt die drei Dichtebänder über Ratio', () => {
    expect(pairFitsDensity(card('a', 100, 'population'), card('b', 120, 'population'), 'haarscharf')).toBe(
      true,
    )
    expect(pairFitsDensity(card('a', 100, 'population'), card('b', 150, 'population'), 'knackig')).toBe(true)
    expect(pairFitsDensity(card('a', 100, 'population'), card('b', 300, 'population'), 'locker')).toBe(true)
    expect(pairFitsDensity(card('a', 100, 'population'), card('b', 101, 'population'), 'haarscharf')).toBe(
      false,
    )
    expect(pairFitsDensity(card('a', 100, 'population'), card('b', 500, 'population'), 'locker')).toBe(false)
  })

  it('nutzt Jahresabstand für Geburtsjahre', () => {
    expect(usesYearGap('year')).toBe(true)
    expect(yearGap(1756, 1770)).toBe(14)
    expect(pairFitsDensity(card('mozart', 1756, 'year'), card('beethoven', 1770, 'year'), 'haarscharf')).toBe(
      true,
    )
    expect(pairFitsDensity(card('picasso', 1881, 'year'), card('vangogh', 1853, 'year'), 'knackig')).toBe(true)
    expect(pairFitsDensity(card('bach', 1685, 'year'), card('mozart', 1756, 'year'), 'locker')).toBe(true)
    expect(pairFitsDensity(card('mozart', 1756, 'year'), card('beethoven', 1770, 'year'), 'locker')).toBe(false)
    expect(pairFitsDensity(card('a', 1756, 'year'), card('b', 1756, 'year'), 'haarscharf')).toBe(false)
  })

  it('hält beide Karten in derselben Kategorie', () => {
    expect(pairFitsDensity(card('a', 10, 'weight'), card('b', 12, 'height'), 'haarscharf')).toBe(false)
  })
})

describe('Stapel-Dichte', () => {
  const densities: Density[] = ['locker', 'knackig', 'haarscharf']

  it('hat in jeder Dichte mindestens zwei Kategorien mit Paar', () => {
    for (const density of densities) {
      expect(axesWithPairs(ADULT_DECK, density).length, `adult ${density}`).toBeGreaterThanOrEqual(2)
    }
  })

  it('liefert nur gültige Paare und nie Ratio über 4', () => {
    for (const density of densities) {
      for (const [left, right] of listValidPairs(ADULT_DECK, density)) {
        expect(left.axis).toBe(right.axis)
        expect(left.id).not.toBe(right.id)
        expect(pairFitsDensity(left, right, density)).toBe(true)
        if (!usesYearGap(left.axis)) {
          expect(valueRatio(left.value, right.value)).toBeLessThanOrEqual(4)
        }
      }
    }
  })
})
