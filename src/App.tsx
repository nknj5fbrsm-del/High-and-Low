import { useEffect, useState } from 'react'
import { isSoloRoom, livesForMode } from './axis.ts'
import { isGameOverScreen } from './appFlow.ts'
import { GameOverScreen } from './components/GameOverScreen.tsx'
import { GameScreen } from './components/GameScreen.tsx'
import { LeaveRoomButton } from './components/LeaveRoomButton.tsx'
import { LobbyScreen } from './components/LobbyScreen.tsx'
import { SetupScreen } from './components/SetupScreen.tsx'
import { useRoom } from './hooks/useRoom.ts'
import { noteSoloStreak } from './lib/identity.ts'
import { isSupabaseConfigured } from './lib/supabase.ts'
import { REVEAL_MS } from './types.ts'

type GameSession = ReturnType<typeof useRoom>

export function AppView({ game }: { game: GameSession }) {
  const [name, setName] = useState(game.identity.name)
  const [joinCode, setJoinCode] = useState('')
  const [finishedNonce, setFinishedNonce] = useState<number | null>(null)
  const [soloBest, setSoloBest] = useState(0)

  useEffect(() => {
    if (game.room?.game_status !== 'game_over') return
    const nonce = game.room.turn_nonce
    const timer = window.setTimeout(() => setFinishedNonce(nonce), REVEAL_MS)
    return () => window.clearTimeout(timer)
  }, [game.room?.game_status, game.room?.turn_nonce])

  useEffect(() => {
    if (!game.room || game.room.game_status !== 'game_over') return
    if (!isSoloRoom(game.room)) return
    setSoloBest(noteSoloStreak(game.room.streak))
  }, [game.room])

  if (game.restoring) {
    return (
      <div className="page-table flex min-h-dvh flex-col items-center justify-center gap-6 px-5">
        <p className="text-sm font-medium text-khaki">Verbinde mit dem Tisch …</p>
        <LeaveRoomButton onLeave={game.leaveRoom} />
      </div>
    )
  }

  const status = game.room?.game_status ?? 'lobby'

  if (!game.room || status === 'lobby') {
    return (
      <LobbyScreen
        name={name}
        onNameChange={setName}
        joinCode={joinCode}
        onJoinCodeChange={setJoinCode}
        room={game.room}
        storedRoomCode={game.identity.roomCode}
        playerId={game.playerId}
        error={game.error}
        busy={game.busy}
        onCreate={(maxPlayers) => void game.createRoom(name, maxPlayers)}
        onJoin={() => void game.joinRoom(joinCode, name)}
        onStart={() => void game.startGame()}
        onVote={(mode) => void game.voteMode(mode)}
        onSolo={(mode, density) => void game.startSolo(name, mode, density)}
        onStartMode={(mode) => void game.startGame(mode)}
        onSetDensity={(density) => void game.setDensity(density)}
        onLeave={game.leaveRoom}
      />
    )
  }

  if (isGameOverScreen(status, game.room.turn_nonce, finishedNonce)) {
    const solo = isSoloRoom(game.room)
    return (
      <GameOverScreen
        streak={game.room.streak}
        best={solo ? soloBest : game.room.streak}
        solo={solo}
        maxLives={livesForMode(game.room.selected_mode)}
        roomCode={game.room.room_code}
        busy={game.busy}
        error={game.error}
        onRestart={() => void game.restartGame()}
        onLeave={game.leaveRoom}
      />
    )
  }

  return (
    <GameScreen
      room={game.room}
      playerId={game.playerId}
      busy={game.busy}
      error={game.error}
      onGuess={(guess) => void game.submitGuess(guess)}
      onLeave={game.leaveRoom}
    />
  )
}

export default function App() {
  const game = useRoom()

  if (!isSupabaseConfigured) {
    return <SetupScreen />
  }

  return <AppView game={game} />
}
