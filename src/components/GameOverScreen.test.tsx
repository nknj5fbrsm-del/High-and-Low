import { render, screen } from '@testing-library/react'
import { GameOverScreen } from './GameOverScreen.tsx'

describe('GameOverScreen', () => {
  it('zeigt Streak und Neustart', () => {
    render(
      <GameOverScreen
        streak={14}
        roomCode="ABCD"
        busy={false}
        error={null}
        onRestart={() => {}}
      />,
    )
    expect(screen.getByText('Game Over')).toBeInTheDocument()
    expect(screen.getByText('🔥 14')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Neues Spiel starten' })).toBeEnabled()
  })
})
