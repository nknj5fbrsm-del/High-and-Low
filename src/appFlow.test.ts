import { isGameOverScreen } from './appFlow.ts'

describe('isGameOverScreen', () => {
  it('hält Game Over zurück, bis die Auflösung durch ist', () => {
    expect(isGameOverScreen('game_over', 4, null)).toBe(false)
    expect(isGameOverScreen('game_over', 4, 3)).toBe(false)
    expect(isGameOverScreen('game_over', 4, 4)).toBe(true)
    expect(isGameOverScreen('playing', 4, 4)).toBe(false)
  })
})
