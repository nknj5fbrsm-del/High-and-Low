import { fireEvent, render, screen } from '@testing-library/react'
import { GameHeader } from './GameHeader.tsx'

describe('GameHeader', () => {
  it('zeigt drei Leben', () => {
    render(<GameHeader streak={4} lives={2} maxLives={3} roomCode="ABCD" />)
    expect(screen.getByLabelText('2 von 3 Leben')).toHaveTextContent('♥ ♥ ♡')
  })

  it('blendet die Serie im Versus aus', () => {
    render(<GameHeader streak={9} lives={2} maxLives={3} roomCode="ABCD" versus />)
    expect(screen.queryByLabelText('Serie 9')).not.toBeInTheDocument()
    expect(screen.getByText('Duell · ABCD')).toBeInTheDocument()
  })

  it('schaltet den Ton um', () => {
    const onToggleMute = vi.fn()
    render(
      <GameHeader
        streak={4}
        lives={2}
        maxLives={3}
        roomCode="ABCD"
        muted={false}
        onToggleMute={onToggleMute}
      />,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Ton aus' }))
    expect(onToggleMute).toHaveBeenCalledOnce()
  })
})
