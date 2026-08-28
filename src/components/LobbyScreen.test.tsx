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
}

const fullRoom: RoomState = {
  ...twoPlayers,
  players: [...twoPlayers.players, { id: 'p3', name: 'Anna' }],
}

const noop = () => {}

describe('LobbyScreen', () => {
  it('zeigt 2/3 Spieler ohne Start-Button', () => {
    render(
      <LobbyScreen
        name="Max"
        onNameChange={noop}
        joinCode=""
        onJoinCodeChange={noop}
        room={twoPlayers}
        playerId="p1"
        error={null}
        busy={false}
        onCreate={noop}
        onJoin={noop}
        onStart={noop}
        onLeave={noop}
      />,
    )
    expect(screen.getByText('Spieler 2/3')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Spiel starten' })).not.toBeInTheDocument()
  })

  it('gibt dem Host den Start-Button bei 3/3', () => {
    render(
      <LobbyScreen
        name="Max"
        onNameChange={noop}
        joinCode=""
        onJoinCodeChange={noop}
        room={fullRoom}
        playerId="p1"
        error={null}
        busy={false}
        onCreate={noop}
        onJoin={noop}
        onStart={noop}
        onLeave={noop}
      />,
    )
    expect(screen.getByText('Spieler 3/3')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Spiel starten' })).toBeEnabled()
  })

  it('zeigt dem Nicht-Host keinen Start-Button', () => {
    render(
      <LobbyScreen
        name="Nils"
        onNameChange={noop}
        joinCode=""
        onJoinCodeChange={noop}
        room={fullRoom}
        playerId="p2"
        error={null}
        busy={false}
        onCreate={noop}
        onJoin={noop}
        onStart={noop}
        onLeave={noop}
      />,
    )
    expect(screen.queryByRole('button', { name: 'Spiel starten' })).not.toBeInTheDocument()
    expect(screen.getByText('Warte, bis der Host startet …')).toBeInTheDocument()
  })

  it('lehnt einen vollen Raum über die Fehlermeldung ab', () => {
    render(
      <LobbyScreen
        name="Gast"
        onNameChange={noop}
        joinCode="WXYZ"
        onJoinCodeChange={noop}
        room={null}
        playerId="p4"
        error="Dieser Raum ist voll (max. 3 Spieler)."
        busy={false}
        onCreate={noop}
        onJoin={noop}
        onStart={noop}
        onLeave={noop}
      />,
    )
    expect(screen.getByText('Dieser Raum ist voll (max. 3 Spieler).')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Raum verlassen' })).not.toBeInTheDocument()
  })

  it('lässt den Raum aus der Lobby mit sichtbarem Button verlassen', () => {
    const onLeave = vi.fn()
    render(
      <LobbyScreen
        name="Max"
        onNameChange={noop}
        joinCode=""
        onJoinCodeChange={noop}
        room={twoPlayers}
        storedRoomCode="WXYZ"
        playerId="p1"
        error={null}
        busy={false}
        onCreate={noop}
        onJoin={noop}
        onStart={noop}
        onLeave={onLeave}
      />,
    )
    const leave = screen.getByRole('button', { name: 'Raum verlassen' })
    expect(leave).toHaveClass('h-14')
    fireEvent.click(leave)
    expect(onLeave).toHaveBeenCalledOnce()
  })

  it('zeigt Raum verlassen wenn Restore fehlschlug (room null, roomCode gesetzt)', () => {
    const onLeave = vi.fn()
    render(
      <LobbyScreen
        name="Nils"
        onNameChange={noop}
        joinCode=""
        onJoinCodeChange={noop}
        room={null}
        storedRoomCode="ABCD"
        playerId="p1"
        error="Keine Verbindung. Prüfe Netz und Supabase-URL."
        busy={false}
        onCreate={noop}
        onJoin={noop}
        onStart={noop}
        onLeave={onLeave}
      />,
    )
    expect(screen.getByText('Keine Verbindung. Prüfe Netz und Supabase-URL.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Raum erstellen' })).toBeInTheDocument()
    const leave = screen.getByRole('button', { name: 'Raum verlassen' })
    expect(leave).toHaveClass('h-14')
    fireEvent.click(leave)
    expect(onLeave).toHaveBeenCalledOnce()
  })
})
