import { loadIdentity, saveIdentity } from './identity.ts'

describe('identity', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('erzeugt eine stabile Spieler-ID', () => {
    const first = loadIdentity()
    const second = loadIdentity()
    expect(first.playerId).toBe(second.playerId)
    expect(first.playerId.length).toBeGreaterThanOrEqual(8)
  })

  it('merkt sich Name und Raumcode', () => {
    loadIdentity()
    saveIdentity({ name: 'Nils', roomCode: 'ABCD' })
    expect(loadIdentity()).toMatchObject({ name: 'Nils', roomCode: 'ABCD' })
  })

  it('löscht den Raumcode und behält Name sowie Spieler-ID', () => {
    const created = loadIdentity()
    saveIdentity({ name: 'Nils', roomCode: 'ABCD' })
    saveIdentity({ roomCode: null })
    const next = loadIdentity()
    expect(next.roomCode).toBeNull()
    expect(next.name).toBe('Nils')
    expect(next.playerId).toBe(created.playerId)
  })
})
