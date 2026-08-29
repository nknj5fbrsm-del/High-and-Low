import { fireEvent, render, screen } from '@testing-library/react'
import { GameScreen } from './GameScreen.tsx'
import type { RoomState } from '../types.ts'
import { ADULT_DECK } from '../deck.ts'
import { formatCardValue } from '../format.ts'

const weightRef = ADULT_DECK.find((card) => card.id === 'mensch')!
const weightNext = ADULT_DECK.find((card) => card.id === 'nilpferd')!
const yearRef = ADULT_DECK.find((card) => card.id === 'mauerfall')!
const yearNext = ADULT_DECK.find((card) => card.id === 'chatgpt')!

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
  current_card: weightRef,
  next_card: weightNext,
  remaining_cards: [],
  used_card_ids: [weightRef.id, weightNext.id],
  game_status: 'playing',
  last_result: null,
  turn_nonce: 1,
  max_players: 3,
  votes: {},
  selected_mode: 'adult',
}

describe('GameScreen', () => {
  it('zeigt eigenen Zug mit Labels aus der Achse', () => {
    render(<GameScreen room={room} playerId="p1" busy={false} error={null} onGuess={() => {}} onLeave={() => {}} />)
    expect(screen.getByText('Du bist dran!')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'SCHWERER' })).toBeEnabled()
    expect(screen.getByRole('button', { name: 'LEICHTER' })).toBeEnabled()
    expect(screen.getByText('🔥 14')).toBeInTheDocument()
    expect(screen.getByText(weightRef.title)).toBeInTheDocument()
    expect(screen.getByText(weightNext.title)).toBeInTheDocument()
    expect(screen.getByText('???')).toBeInTheDocument()
    expect(screen.queryByText(formatCardValue(weightNext))).not.toBeInTheDocument()
  })

  it('nutzt Jahres-Labels für den aktuellen Vergleich', () => {
    render(
      <GameScreen
        room={{ ...room, current_card: yearRef, next_card: yearNext }}
        playerId="p1"
        busy={false}
        error={null}
        onGuess={() => {}}
        onLeave={() => {}}
      />,
    )
    expect(screen.getByRole('button', { name: 'SPÄTER' })).toBeEnabled()
    expect(screen.getByRole('button', { name: 'FRÜHER' })).toBeEnabled()
  })

  it('zeigt den aufgedeckten Wert und die Belohnung nach einem richtigen Tipp', () => {
    render(
      <GameScreen
        room={{
          ...room,
          streak: 5,
          last_result: {
            correct: true,
            guess: 'higher',
            card: weightNext,
            reference: weightRef,
          },
          turn_nonce: 2,
        }}
        playerId="p1"
        busy={false}
        error={null}
        onGuess={() => {}}
        onLeave={() => {}}
      />,
    )
    expect(screen.getByText('Richtig!')).toBeInTheDocument()
    expect(screen.getByText('+1')).toBeInTheDocument()
    expect(screen.getByText('Combo ×5')).toBeInTheDocument()
    expect(screen.getByText(formatCardValue(weightNext))).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'SCHWERER' })).not.toBeInTheDocument()
  })

  it('zeigt keine Belohnung bei einem Fehlversuch', () => {
    render(
      <GameScreen
        room={{
          ...room,
          last_result: {
            correct: false,
            guess: 'lower',
            card: weightNext,
            reference: weightRef,
          },
          turn_nonce: 2,
        }}
        playerId="p1"
        busy={false}
        error={null}
        onGuess={() => {}}
        onLeave={() => {}}
      />,
    )
    expect(screen.getByText('Falsch!')).toBeInTheDocument()
    expect(screen.queryByText('+1')).not.toBeInTheDocument()
    expect(screen.queryByText(/Combo/)).not.toBeInTheDocument()
  })

  it('versteckt die Buttons, wenn jemand anderes dran ist', () => {
    render(<GameScreen room={room} playerId="p2" busy={false} error={null} onGuess={() => {}} onLeave={() => {}} />)
    expect(screen.getByText('Warten auf Max…')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'SCHWERER' })).not.toBeInTheDocument()
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
            card: weightNext,
            reference: weightRef,
          },
          turn_nonce: 3,
        }}
        playerId="p1"
        busy={false}
        error={null}
        onGuess={() => {}}
        onLeave={() => {}}
      />,
    )
    expect(screen.getByText('Falsch!')).toBeInTheDocument()
    expect(screen.getByText(formatCardValue(weightNext))).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'SCHWERER' })).not.toBeInTheDocument()
  })

  it('hat einen sichtbaren Button Raum verlassen', () => {
    const onLeave = vi.fn()
    render(
      <GameScreen
        room={room}
        playerId="p1"
        busy={false}
        error={null}
        onGuess={() => {}}
        onLeave={onLeave}
      />,
    )
    const leave = screen.getByRole('button', { name: 'Raum verlassen' })
    expect(leave).toHaveClass('h-14')
    fireEvent.click(leave)
    expect(onLeave).toHaveBeenCalledOnce()
  })
})
