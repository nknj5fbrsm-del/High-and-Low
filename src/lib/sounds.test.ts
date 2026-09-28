import { afterEach, describe, expect, it, vi } from 'vitest'
import { isSoundMuted, playRevealSound, setSoundMuted, toggleSoundMuted } from './sounds.ts'

describe('sounds mute', () => {
  afterEach(() => {
    setSoundMuted(false)
    localStorage.removeItem('high-low-team-stapel.muted')
  })

  it('merkt sich Mute in localStorage', () => {
    expect(isSoundMuted()).toBe(false)
    expect(toggleSoundMuted()).toBe(true)
    expect(isSoundMuted()).toBe(true)
    expect(localStorage.getItem('high-low-team-stapel.muted')).toBe('1')
    expect(toggleSoundMuted()).toBe(false)
  })

  it('spielt bei Mute nichts', () => {
    const AudioContextMock = vi.fn()
    vi.stubGlobal('AudioContext', AudioContextMock)
    setSoundMuted(true)
    playRevealSound(true)
    playRevealSound(false)
    expect(AudioContextMock).not.toHaveBeenCalled()
    vi.unstubAllGlobals()
  })
})
