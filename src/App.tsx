import { useEffect, useState } from 'react'
import { isGameOverScreen } from './appFlow.ts'
import { GameOverScreen } from './components/GameOverScreen.tsx'
import { GameScreen } from './components/GameScreen.tsx'
import { LobbyScreen } from './components/LobbyScreen.tsx'
import { SetupScreen } from './components/SetupScreen.tsx'
import { useRoom } from './hooks/useRoom.ts'
import { isSupabaseConfigured } from './lib/supabase.ts'
import { REVEAL_MS } from './types.ts'

export default function App() {
  const game = useRoom()
  const [name, setName] = useState(game.identity.name)
  const [joinCode, setJoinCode] = useState('')
  const [finishedNonce, setFinishedNonce] = useState<number | null>(null)

  useEffect(() => {
    if (game.room?.game_status !== 'game_over') return
    const nonce = game.room.turn_nonce
    const timer = window.setTimeout(() => setFinishedNonce(nonce), REVEAL_MS)
    return () => window.clearTimeout(timer)
  }, [game.room?.game_status, game.room?.turn_nonce])

  if (!isSupabaseConfigured) {
    return <SetupScreen />
  }

  if (game.restoring) {
    return (
      <div className="flex min-h-dvh items-center justify-center text-sm font-medium text-zinc-400">
        Verbinde mit dem Raum …
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
        playerId={game.playerId}
        error={game.error}
        busy={game.busy}
        onCreate={() => void game.createRoom(name)}
        onJoin={() => void game.joinRoom(joinCode, name)}
        onStart={() => void game.startGame()}
        onLeave={game.leaveRoom}
      />
    )
  }

  if (isGameOverScreen(status, game.room.turn_nonce, finishedNonce)) {
    return (
      <GameOverScreen
        streak={game.room.streak}
        roomCode={game.room.room_code}
        busy={game.busy}
        error={game.error}
        onRestart={() => void game.restartGame()}
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
    />
  )
}
