import { render, screen } from '@testing-library/react'
import { GameScreen } from './GameScreen.tsx'
import type { RoomState } from '../types.ts'
import { DECK } from '../deck.ts'

const room: RoomState = {
  room_code: 'ABCD',
  players: [
    { id: 'p1', name: 'Max' },
    { id: 'p2', name: 'Nils' },
    { id: 'p3', name: 'Anna' },
  ],
  host_id: 'p1',
  current_player_index: 0,
  lives: 3,
  streak: 14,
  current_card: DECK[0],
  next_card: DECK[1],
  remaining_cards: DECK.slice(2),
  used_card_ids: [DECK[0].id, DECK[1].id],
  game_status: 'playing',
  last_result: null,
  turn_nonce: 1,
}

describe('GameScreen', () => {
  it('zeigt eigenen Zug mit großen Buttons', () => {
    render(<GameScreen room={room} playerId="p1" busy={false} error={null} onGuess={() => {}} />)
    expect(screen.getByText('Du bist dran!')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'HÖHER' })).toBeEnabled()
    expect(screen.getByRole('button', { name: 'NIEDRIGER' })).toBeEnabled()
    expect(screen.getByText('🔥 14')).toBeInTheDocument()
    expect(screen.getByText(DECK[0].title)).toBeInTheDocument()
    expect(screen.getByText(DECK[1].title)).toBeInTheDocument()
    expect(screen.getByText('???')).toBeInTheDocument()
    expect(screen.queryByText('1.500 kg')).not.toBeInTheDocument()
  })

  it('zeigt den aufgedeckten Wert nach einem Tipp', () => {
    render(
      <GameScreen
        room={{
          ...room,
          last_result: {
            correct: true,
            guess: 'higher',
            card: DECK[1],
            reference: DECK[0],
          },
          turn_nonce: 2,
        }}
        playerId="p1"
        busy={false}
        error={null}
        onGuess={() => {}}
      />,
    )
    expect(screen.getByText('Richtig!')).toBeInTheDocument()
    expect(screen.getByText('1.500 kg')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'HÖHER' })).not.toBeInTheDocument()
  })

  it('versteckt die Buttons, wenn jemand anderes dran ist', () => {
    render(<GameScreen room={room} playerId="p2" busy={false} error={null} onGuess={() => {}} />)
    expect(screen.getByText('Warten auf Max…')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'HÖHER' })).not.toBeInTheDocument()
  })

  it('zeigt die rote Auflösung beim letzten Fehlversuch', () => {
    render(
      <GameScreen
        room={{
          ...room,
          lives: 0,
          game_status: 'game_over',
          last_result: {
            correct: false,
            guess: 'lower',
            card: DECK[1],
            reference: DECK[0],
          },
          turn_nonce: 3,
        }}
        playerId="p1"
        busy={false}
        error={null}
        onGuess={() => {}}
      />,
    )
    expect(screen.getByText('Falsch!')).toBeInTheDocument()
    expect(screen.getByText('1.500 kg')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'HÖHER' })).not.toBeInTheDocument()
  })
})
