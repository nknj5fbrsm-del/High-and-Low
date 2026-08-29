import { fireEvent, render, screen } from '@testing-library/react'
import { GameOverScreen } from './GameOverScreen.tsx'

describe('GameOverScreen', () => {
  it('zeigt Serie und Neustart am gemeinsamen Tisch', () => {
    render(
      <GameOverScreen
        streak={14}
        best={14}
        solo={false}
        maxLives={3}
        roomCode="ABCD"
        busy={false}
        error={null}
        onRestart={() => {}}
        onLeave={() => {}}
      />,
    )
    expect(screen.getByText('Keine Karten mehr.')).toBeInTheDocument()
    expect(screen.getByText('14')).toBeInTheDocument()
    expect(screen.getByText('Im Fluss')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Neues Spiel' })).toBeEnabled()
  })

  it('zeigt Solo-Rekord und Nochmal', () => {
    render(
      <GameOverScreen
        streak={8}
        best={14}
        solo
        maxLives={3}
        roomCode="ABCD"
        busy={false}
        error={null}
        onRestart={() => {}}
        onLeave={() => {}}
      />,
    )
    expect(screen.getByText('Rekord: 14.')).toBeInTheDocument()
    expect(screen.getByText('Diese Runde: 8. Leben waren nur Puffer.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Nochmal.' })).toBeEnabled()
  })

  it('hat einen sichtbaren Button Tisch verlassen', () => {
    const onLeave = vi.fn()
    render(
      <GameOverScreen
        streak={14}
        best={14}
        solo={false}
        maxLives={3}
        roomCode="ABCD"
        busy={false}
        error={null}
        onRestart={() => {}}
        onLeave={onLeave}
      />,
    )
    const leave = screen.getByRole('button', { name: 'Tisch verlassen' })
    expect(leave).toHaveClass('h-14')
    fireEvent.click(leave)
    expect(onLeave).toHaveBeenCalledOnce()
  })
})
