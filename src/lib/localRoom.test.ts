import { applyLocalGuess, openSoloRoom, restartLocalRoom } from './localRoom.ts'
import { MAX_LIVES } from '../types.ts'
import type { Guess } from '../types.ts'

const playerId = 'player-local-1'

function correctGuess(left: number, right: number): Guess {
  return right >= left ? 'higher' : 'lower'
}

describe('local solo room', () => {
  it('legt sofort ein Solo mit drei Leben und der gewählten Dichte', () => {
    const room = openSoloRoom({ playerId, name: ' Nils ', density: 'haarscharf' })
    expect(room.game_status).toBe('playing')
    expect(room.max_players).toBe(1)
    expect(room.lives).toBe(MAX_LIVES)
    expect(room.streak).toBe(0)
    expect(room.players).toEqual([{ id: playerId, name: 'Nils' }])
    expect(room.selected_density).toBe('haarscharf')
    expect(room.current_card).not.toBeNull()
    expect(room.next_card).not.toBeNull()
    expect(room.current_card?.axis).toBe(room.next_card?.axis)
  })

  it('zählt eine richtige Richtung als Serie und eine falsche als Leben', () => {
    const room = openSoloRoom({ playerId, name: 'Nils', density: 'knackig' })
    const current = room.current_card!
    const next = room.next_card!
    const right = correctGuess(current.value, next.value)
    const won = applyLocalGuess(room, playerId, right)
    expect(won.last_result?.correct).toBe(true)
    expect(won.streak).toBe(1)
    expect(won.lives).toBe(MAX_LIVES)
    expect(won.turn_nonce).toBe(room.turn_nonce + 1)
    expect(won.current_card?.axis).not.toBe(current.axis)

    if (current.value !== next.value) {
      const wrong: Guess = right === 'higher' ? 'lower' : 'higher'
      const lost = applyLocalGuess(room, playerId, wrong)
      expect(lost.last_result?.correct).toBe(false)
      expect(lost.lives).toBe(MAX_LIVES - 1)
      expect(lost.streak).toBe(0)
    }
  })

  it('setzt beim Neustart Leben und Serie zurück', () => {
    const room = openSoloRoom({ playerId, name: 'Nils', density: 'locker' })
    const played = applyLocalGuess(
      room,
      playerId,
      correctGuess(room.current_card!.value, room.next_card!.value),
    )
    const again = restartLocalRoom(played)
    expect(again.lives).toBe(MAX_LIVES)
    expect(again.streak).toBe(0)
    expect(again.game_status).toBe('playing')
    expect(again.selected_density).toBe('locker')
    expect(again.last_result).toBeNull()
  })
})
