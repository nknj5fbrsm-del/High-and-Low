import { render, screen } from '@testing-library/react'
import { GameHeader } from './GameHeader.tsx'

describe('GameHeader', () => {
  it('zeigt drei Leben im Erwachsenen-Modus', () => {
    render(<GameHeader streak={4} lives={2} maxLives={3} roomCode="ABCD" />)
    expect(screen.getByLabelText('2 von 3 Leben')).toHaveTextContent('❤️ ❤️ 💔')
  })

  it('zeigt fünf Leben im Kinder-Modus', () => {
    render(<GameHeader streak={1} lives={5} maxLives={5} roomCode="ABCD" />)
    expect(screen.getByLabelText('5 von 5 Leben')).toHaveTextContent('❤️ ❤️ ❤️ ❤️ ❤️')
  })
})
