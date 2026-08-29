import type { Axis, GameMode, ModeVotes } from './types.ts'
import { KIDS_LIVES, MAX_LIVES } from './types.ts'

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
}

export const AXIS_CATEGORY: Record<Axis, string> = {
  weight: 'GEWICHT',
  price: 'PREIS',
  height: 'HÖHE',
  distance: 'STRECKE',
  year: 'JAHR',
  speed: 'TEMPO',
  temp: 'TEMPERATUR',
  count: 'ANZAHL',
  population: 'EINWOHNER',
  area: 'FLÄCHE',
}

export function guessLabels(axis: Axis): { higher: string; lower: string } {
  return AXIS_LABELS[axis] ?? AXIS_LABELS.height
}

export function categoryLabel(axis: Axis): string {
  return AXIS_CATEGORY[axis] ?? 'FAKT'
}

export function livesForMode(mode: GameMode): number {
  return mode === 'kids' ? KIDS_LIVES : MAX_LIVES
}

export function voteCounts(votes: ModeVotes): { adult: number; kids: number } {
  let adult = 0
  let kids = 0
  for (const mode of Object.values(votes)) {
    if (mode === 'kids') kids += 1
    else if (mode === 'adult') adult += 1
  }
  return { adult, kids }
}

export function winningMode(votes: ModeVotes, hostId: string): GameMode {
  const { adult, kids } = voteCounts(votes)
  if (kids > adult) return 'kids'
  if (adult > kids) return 'adult'
  return votes[hostId] ?? 'adult'
}

export function streakTitle(streak: number): string {
  if (streak <= 0) return 'Noch kalt'
  if (streak < 5) return 'Fuß in der Tür'
  if (streak < 10) return 'Kommt in Fahrt'
  if (streak < 15) return 'Im Fluss'
  if (streak < 25) return 'Streak-Maschine'
  return 'Unaufhaltsam'
}

export function modeLabel(mode: GameMode): string {
  return mode === 'kids' ? 'Kinder' : 'Erwachsene'
}

/** Kurze Dealer-Zeile nach der Auflösung. Kein Fake-Mitspieler. */
export function dealerLine(a: number, b: number): string | null {
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
