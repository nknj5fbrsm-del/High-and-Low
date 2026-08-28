import { fireEvent, render, screen } from '@testing-library/react'
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
        onLeave={() => {}}
      />,
    )
    expect(screen.getByText('Game Over')).toBeInTheDocument()
    expect(screen.getByText('🔥 14')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Neues Spiel starten' })).toBeEnabled()
  })

  it('hat einen sichtbaren Button Raum verlassen', () => {
    const onLeave = vi.fn()
    render(
      <GameOverScreen
        streak={14}
        roomCode="ABCD"
        busy={false}
        error={null}
        onRestart={() => {}}
        onLeave={onLeave}
      />,
    )
    const leave = screen.getByRole('button', { name: 'Raum verlassen' })
    expect(leave).toHaveClass('h-14')
    fireEvent.click(leave)
    expect(onLeave).toHaveBeenCalledOnce()
  })
})
