import type { FactCard } from './types.ts'

const numberDe = new Intl.NumberFormat('de-DE', { maximumFractionDigits: 0 })

export function formatValue(value: number, unit: string): string {
  if (unit === 'Jahr') return String(value)
  return `${numberDe.format(value)} ${unit}`
}

export function formatCardValue(card: FactCard): string {
  return formatValue(card.value, card.unit)
}

export function normalizeRoomCode(input: string): string {
  return input.replace(/[^a-zA-Z]/g, '').slice(0, 4).toUpperCase()
}

export function trimName(input: string): string {
  return input.trim().slice(0, 20)
}
