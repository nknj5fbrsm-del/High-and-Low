import type { GameStatus } from './types.ts'

/** Game Over erst nach der kurzen Auflösung des letzten Tipps. */
export function isGameOverScreen(
  status: GameStatus,
  turnNonce: number,
  finishedNonce: number | null,
): boolean {
  return status === 'game_over' && finishedNonce === turnNonce
}
