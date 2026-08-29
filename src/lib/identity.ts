const STORAGE_KEY = 'high-low-team-stapel.identity'

export interface Identity {
  playerId: string
  name: string
  roomCode: string | null
}

function createPlayerId(): string {
  try {
    if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID()
  } catch {
    // http://LAN ohne Secure Context
  }
  try {
    const bytes = new Uint8Array(16)
    globalThis.crypto.getRandomValues(bytes)
    bytes[6] = (bytes[6] & 0x0f) | 0x40
    bytes[8] = (bytes[8] & 0x3f) | 0x80
    const hex = [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('')
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
  } catch {
    return `p-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`
  }
}

function emptyIdentity(): Identity {
  return { playerId: createPlayerId(), name: '', roomCode: null }
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
      playerId: parsed.playerId && parsed.playerId.length >= 8 ? parsed.playerId : createPlayerId(),
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

const BEST_KEY = 'high-low-team-stapel.soloBest'

export function loadSoloBest(): number {
  try {
    const n = Number(localStorage.getItem(BEST_KEY))
    if (Number.isFinite(n) && n > 0) return Math.floor(n)
  } catch {
    // private mode
  }
  return 0
}

export function noteSoloStreak(streak: number): number {
  const best = Math.max(loadSoloBest(), Math.max(0, Math.floor(streak)))
  try {
    localStorage.setItem(BEST_KEY, String(best))
  } catch {
    // private mode
  }
  return best
}
