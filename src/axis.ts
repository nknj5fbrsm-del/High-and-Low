import type { Axis, Density, PlayStyle } from './types.ts'
import { MAX_LIVES } from './types.ts'

export const AXIS_LABELS: Record<Axis, { higher: string; lower: string }> = {
  weight: { higher: 'SCHWERER', lower: 'LEICHTER' },
  price: { higher: 'TEURER', lower: 'BILLIGER' },
  height: { higher: 'HÖHER', lower: 'NIEDRIGER' },
  distance: { higher: 'WEITER', lower: 'KÜRZER' },
  year: { higher: 'SPÄTER', lower: 'FRÜHER' },
  speed: { higher: 'SCHNELLER', lower: 'LANGSAMER' },
  temp: { higher: 'WÄRMER', lower: 'KÄLTER' },
  count: { higher: 'MEHR', lower: 'WENIGER' },
  population: { higher: 'MEHR', lower: 'WENIGER' },
  area: { higher: 'GRÖSSER', lower: 'KLEINER' },
  duration: { higher: 'LÄNGER', lower: 'KÜRZER' },
  depth: { higher: 'TIEFER', lower: 'FLACHER' },
  power: { higher: 'STÄRKER', lower: 'SCHWÄCHER' },
  calories: { higher: 'MEHR', lower: 'WENIGER' },
}

export const AXIS_CATEGORY: Record<Axis, string> = {
  weight: 'GEWICHT',
  price: 'PREIS',
  height: 'HÖHE',
  distance: 'STRECKE',
  year: 'GEBURTSJAHR',
  speed: 'TEMPO',
  temp: 'TEMPERATUR',
  count: 'ANZAHL',
  population: 'EINWOHNER',
  area: 'FLÄCHE',
  duration: 'DAUER',
  depth: 'TIEFE',
  power: 'LEISTUNG',
  calories: 'KALORIEN',
}

export function guessLabels(axis: Axis): { higher: string; lower: string } {
  return AXIS_LABELS[axis] ?? AXIS_LABELS.height
}

export function categoryLabel(axis: Axis): string {
  return AXIS_CATEGORY[axis] ?? 'FAKT'
}

export function livesForRoom(): number {
  return MAX_LIVES
}

export function playStyleLabel(style: PlayStyle): string {
  return style === 'versus' ? 'Gegeneinander' : 'Team'
}

export function streakTitle(streak: number): string {
  if (streak <= 0) return 'Noch kalt'
  if (streak < 5) return 'Fuß in der Tür'
  if (streak < 10) return 'Kommt in Fahrt'
  if (streak < 15) return 'Im Fluss'
  if (streak < 25) return 'Streak-Maschine'
  return 'Unaufhaltsam'
}

export function densityLabel(density: Density): string {
  if (density === 'locker') return 'Locker'
  if (density === 'haarscharf') return 'Haarscharf'
  return 'Knackig'
}

/** Kurze Dealer-Zeile nach der Auflösung. Kein Fake-Mitspieler. */
export function dealerLine(a: number, b: number, axis?: Axis): string | null {
  if (axis === 'year') {
    const gap = Math.abs(a - b)
    if (gap > 0 && gap < 25) return 'knapp!'
    if (gap < 60) return 'mutig.'
    return null
  }
  const hi = Math.max(Math.abs(a), Math.abs(b))
  const lo = Math.min(Math.abs(a), Math.abs(b))
  if (lo === 0) return null
  const ratio = hi / lo
  if (ratio <= 1.12) return 'knapp!'
  if (ratio <= 1.25) return 'mutig.'
  return null
}

export function isSoloRoom(room: { max_players: number }): boolean {
  return room.max_players === 1
}
