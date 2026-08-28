const STORAGE_KEY = 'high-low-team-stapel.identity'

export interface Identity {
  playerId: string
  name: string
  roomCode: string | null
}

function emptyIdentity(): Identity {
  return { playerId: crypto.randomUUID(), name: '', roomCode: null }
}

export function loadIdentity(): Identity {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      const created = emptyIdentity()
      localStorage.setItem(STORAGE_KEY, JSON.stringify(created))
      return created
    }
    const parsed = JSON.parse(raw) as Partial<Identity>
    const identity: Identity = {
      playerId: parsed.playerId && parsed.playerId.length >= 8 ? parsed.playerId : crypto.randomUUID(),
      name: typeof parsed.name === 'string' ? parsed.name : '',
      roomCode: typeof parsed.roomCode === 'string' ? parsed.roomCode : null,
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(identity))
    return identity
  } catch {
    const created = emptyIdentity()
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(created))
    } catch {
      // private mode
    }
    return created
  }
}

export function saveIdentity(patch: Partial<Identity>): Identity {
  const current = loadIdentity()
  const next: Identity = {
    playerId: patch.playerId ?? current.playerId,
    name: patch.name ?? current.name,
    roomCode: patch.roomCode === undefined ? current.roomCode : patch.roomCode,
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  return next
}
