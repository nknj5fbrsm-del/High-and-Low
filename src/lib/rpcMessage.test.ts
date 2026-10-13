import { describe, expect, it } from 'vitest'
import { rpcMessage } from './rpcMessage.ts'

describe('rpcMessage', () => {
  it('erkennt Netzwerkfehler als wahrscheinliche Supabase-Pause', () => {
    expect(rpcMessage({ message: 'Failed to fetch' })).toBe(
      'Keine Verbindung zur Datenbank. Oft ist Supabase pausiert — im Dashboard auf „Resume project“ tippen.',
    )
    expect(rpcMessage({ message: 'NetworkError when attempting to fetch resource.' })).toContain(
      'Resume project',
    )
    expect(rpcMessage({ message: 'TypeError: Load failed' })).toContain('Resume project')
  })

  it('lässt andere Fehlertexte durch', () => {
    expect(rpcMessage({ message: 'ERROR: Raum ist voll' })).toBe('Raum ist voll')
  })
})
