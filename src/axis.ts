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
}

export function guessLabels(axis: Axis): { higher: string; lower: string } {
  return AXIS_LABELS[axis] ?? AXIS_LABELS.height
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
  if (streak < 15) return 'Team im Flow'
  if (streak < 25) return 'Streak-Maschine'
  return 'Unaufhaltsam'
}

export function modeLabel(mode: GameMode): string {
  return mode === 'kids' ? 'Kinder' : 'Erwachsene'
}
