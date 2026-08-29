import { fireEvent, render, screen } from '@testing-library/react'
import { LobbyScreen } from './LobbyScreen.tsx'
import type { RoomState } from '../types.ts'

const twoPlayers: RoomState = {
  room_code: 'WXYZ',
  players: [
    { id: 'p1', name: 'Max' },
    { id: 'p2', name: 'Nils' },
  ],
  host_id: 'p1',
  current_player_index: 0,
  lives: 3,
  streak: 0,
  current_card: null,
  next_card: null,
  remaining_cards: [],
  used_card_ids: [],
  game_status: 'lobby',
  last_result: null,
  turn_nonce: 0,
  max_players: 3,
  votes: {},
  selected_mode: 'adult',
}

const fullRoom: RoomState = {
  ...twoPlayers,
  players: [...twoPlayers.players, { id: 'p3', name: 'Anna' }],
}

const noop = () => {}

const lobbyProps = {
  onNameChange: noop,
  joinCode: '',
  onJoinCodeChange: noop,
  error: null as string | null,
  busy: false,
  onCreate: noop,
  onJoin: noop,
  onStart: noop,
    onVote: noop,
    onSolo: noop,
    onStartMode: noop,
    onLeave: noop,
}

describe('LobbyScreen', () => {
  it('zeigt 2/3 Spieler ohne Start-Button', () => {
    render(
      <LobbyScreen
        {...lobbyProps}
        name="Max"
        room={twoPlayers}
        playerId="p1"
      />,
    )
    expect(screen.getByText('Spieler 2/3')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Spiel starten' })).not.toBeInTheDocument()
    expect(screen.getByText('Noch 1 Platz frei.')).toBeInTheDocument()
  })

  it('gibt dem Host den Start-Button bei voller Spielerzahl', () => {
    render(
      <LobbyScreen
        {...lobbyProps}
        name="Max"
        room={fullRoom}
        playerId="p1"
      />,
    )
    expect(screen.getByText('Spieler 3/3')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Spiel starten' })).toBeEnabled()
  })

  it('startet bei 2/2, wenn der Host zwei Spieler gewählt hat', () => {
    render(
      <LobbyScreen
        {...lobbyProps}
        name="Max"
        room={{ ...twoPlayers, max_players: 2 }}
        playerId="p1"
      />,
    )
    expect(screen.getByText('Spieler 2/2')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Spiel starten' })).toBeEnabled()
  })

  it('zeigt dem Nicht-Host keinen Start-Button', () => {
    render(
      <LobbyScreen
        {...lobbyProps}
        name="Nils"
        room={fullRoom}
        playerId="p2"
      />,
    )
    expect(screen.queryByRole('button', { name: 'Spiel starten' })).not.toBeInTheDocument()
    expect(screen.getByText('Warte, bis der Host startet …')).toBeInTheDocument()
  })

  it('lehnt einen vollen Raum über die Fehlermeldung ab', () => {
    render(
      <LobbyScreen
        {...lobbyProps}
        name="Gast"
        joinCode="WXYZ"
        room={null}
        playerId="p4"
        error="Dieser Raum ist voll (max. 4 Spieler)."
      />,
    )
    expect(screen.getByText('Dieser Raum ist voll (max. 4 Spieler).')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Tisch verlassen' })).not.toBeInTheDocument()
  })

  it('lässt den Raum aus der Lobby mit sichtbarem Button verlassen', () => {
    const onLeave = vi.fn()
    render(
      <LobbyScreen
        {...lobbyProps}
        name="Max"
        room={twoPlayers}
        storedRoomCode="WXYZ"
        playerId="p1"
        onLeave={onLeave}
      />,
    )
    const leave = screen.getByRole('button', { name: 'Tisch verlassen' })
    expect(leave).toHaveClass('h-14')
    fireEvent.click(leave)
    expect(onLeave).toHaveBeenCalledOnce()
  })

  it('zeigt Tisch verlassen wenn Restore fehlschlug (room null, roomCode gesetzt)', () => {
    const onLeave = vi.fn()
    render(
      <LobbyScreen
        {...lobbyProps}
        name="Nils"
        room={null}
        storedRoomCode="ABCD"
        playerId="p1"
        error="Keine Verbindung. Prüfe Netz und Supabase-URL."
        onLeave={onLeave}
      />,
    )
    expect(screen.getByText('Keine Verbindung. Prüfe Netz und Supabase-URL.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Raum erstellen' })).toBeInTheDocument()
    const leave = screen.getByRole('button', { name: 'Tisch verlassen' })
    expect(leave).toHaveClass('h-14')
    fireEvent.click(leave)
    expect(onLeave).toHaveBeenCalledOnce()
  })

  it('startet Solo ohne Lobby direkt über Erwachsene/Kinder', () => {
    const onSolo = vi.fn()
    render(
      <LobbyScreen
        {...lobbyProps}
        name="Nils"
        room={null}
        playerId="p1"
        onSolo={onSolo}
      />,
    )
    expect(screen.getByText('Allein spielen')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '1' })).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Erwachsene' }))
    expect(onSolo).toHaveBeenCalledWith('adult')
  })

  it('übergibt die gewählte Spielerzahl beim Erstellen', () => {
    const onCreate = vi.fn()
    render(
      <LobbyScreen
        {...lobbyProps}
        name="Max"
        room={null}
        playerId="p1"
        onCreate={onCreate}
      />,
    )
    fireEvent.click(screen.getByRole('button', { name: '5' }))
    fireEvent.click(screen.getByRole('button', { name: 'Raum erstellen' }))
    expect(onCreate).toHaveBeenCalledWith(5)
  })

  it('zeigt Stimmen und markiert die eigene Wahl', () => {
    const onVote = vi.fn()
    render(
      <LobbyScreen
        {...lobbyProps}
        name="Max"
        room={{
          ...fullRoom,
          votes: { p1: 'kids', p2: 'adult', p3: 'kids' },
        }}
        playerId="p1"
        onVote={onVote}
      />,
    )
    expect(screen.getByText('1 Stimme')).toBeInTheDocument()
    expect(screen.getByText('2 Stimmen')).toBeInTheDocument()
    const kids = screen.getByRole('button', { name: /Kinder/ })
    expect(kids).toHaveAttribute('aria-pressed', 'true')
    fireEvent.click(screen.getByRole('button', { name: /Erwachsene/ }))
    expect(onVote).toHaveBeenCalledWith('adult')
  })
})
