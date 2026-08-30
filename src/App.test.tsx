import { useState } from 'react'
import { act, fireEvent, render, screen } from '@testing-library/react'
import { AppView } from './App.tsx'
import { DECK } from './deck.ts'
import { REVEAL_MS } from './types.ts'
import type { RoomState } from './types.ts'

const playingRoom: RoomState = {
  room_code: 'ABCD',
  players: [
    { id: 'p1', name: 'Nils' },
    { id: 'p2', name: 'Max' },
    { id: 'p3', name: 'Anna' },
  ],
  host_id: 'p1',
  current_player_index: 0,
  lives: 2,
  streak: 5,
  current_card: DECK[0],
  next_card: DECK[1],
  remaining_cards: DECK.slice(2),
  used_card_ids: [DECK[0].id, DECK[1].id],
  game_status: 'playing',
  last_result: null,
  turn_nonce: 2,
  max_players: 3,
  votes: {},
  selected_mode: 'adult',
  selected_density: 'knackig',
}

const gameOverRoom: RoomState = {
  ...playingRoom,
  lives: 0,
  game_status: 'game_over',
  last_result: {
    correct: false,
    guess: 'lower',
    card: DECK[1],
    reference: DECK[0],
  },
  turn_nonce: 8,
}

function LeaveHarness({
  room,
  roomCode,
  error = null,
  restoring = false,
}: {
  room: RoomState | null
  roomCode: string | null
  error?: string | null
  restoring?: boolean
}) {
  const [state, setState] = useState({
    room,
    roomCode,
    error,
    restoring,
  })

  const game = {
    identity: { playerId: 'p1', name: 'Nils', roomCode: state.roomCode },
    playerId: 'p1',
    room: state.room,
    error: state.error,
    busy: false,
    restoring: state.restoring,
    createRoom: async () => undefined,
    joinRoom: async () => undefined,
    startGame: async () => undefined,
    startSolo: async () => undefined,
    setDensity: async () => undefined,
    voteMode: async () => undefined,
    submitGuess: async () => undefined,
    restartGame: async () => undefined,
    leaveRoom: () => {
      setState({
        room: null,
        roomCode: null,
        error: null,
        restoring: false,
      })
    },
  }

  return <AppView game={game} />
}

describe('AppView leaveRoom', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('führt aus dem Spiel zurück zur Name/Erstellen-UI', () => {
    render(<LeaveHarness room={playingRoom} roomCode="ABCD" />)
    expect(screen.getByText('Dein Blatt.')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Tisch verlassen' }))
    expect(screen.getByRole('button', { name: 'Raum erstellen' })).toBeInTheDocument()
    expect(screen.getByLabelText('Dein Name')).toBeInTheDocument()
    expect(screen.queryByText('Dein Blatt.')).not.toBeInTheDocument()
  })

  it('führt aus Game Over zurück zur Name/Erstellen-UI', () => {
    vi.useFakeTimers()
    render(<LeaveHarness room={gameOverRoom} roomCode="ABCD" />)
    expect(screen.getByText('Falsch.')).toBeInTheDocument()
    act(() => {
      vi.advanceTimersByTime(REVEAL_MS)
    })
    expect(screen.getByText('Keine Karten mehr.')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Tisch verlassen' }))
    expect(screen.getByRole('button', { name: 'Raum erstellen' })).toBeInTheDocument()
    expect(screen.queryByText('Keine Karten mehr.')).not.toBeInTheDocument()
  })
})
