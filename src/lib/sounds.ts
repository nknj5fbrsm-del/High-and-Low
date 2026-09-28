const MUTE_KEY = 'high-low-team-stapel.muted'

let sharedCtx: AudioContext | null = null
let muted = loadMuted()

function loadMuted(): boolean {
  try {
    return localStorage.getItem(MUTE_KEY) === '1'
  } catch {
    return false
  }
}

export function isSoundMuted(): boolean {
  return muted
}

export function setSoundMuted(next: boolean): void {
  muted = next
  try {
    localStorage.setItem(MUTE_KEY, next ? '1' : '0')
  } catch {
    // private mode
  }
}

export function toggleSoundMuted(): boolean {
  setSoundMuted(!muted)
  return muted
}

function ctx(): AudioContext | null {
  if (typeof window === 'undefined') return null
  const AudioCtx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!AudioCtx) return null
  if (!sharedCtx) sharedCtx = new AudioCtx()
  if (sharedCtx.state === 'suspended') void sharedCtx.resume()
  return sharedCtx
}

function tone(
  audio: AudioContext,
  {
    frequency,
    duration,
    type = 'sine',
    gain = 0.12,
    slideTo,
    startAt = 0,
  }: {
    frequency: number
    duration: number
    type?: OscillatorType
    gain?: number
    slideTo?: number
    startAt?: number
  },
) {
  const osc = audio.createOscillator()
  const amp = audio.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(frequency, audio.currentTime + startAt)
  if (slideTo != null) {
    osc.frequency.exponentialRampToValueAtTime(Math.max(1, slideTo), audio.currentTime + startAt + duration)
  }
  amp.gain.setValueAtTime(0.0001, audio.currentTime + startAt)
  amp.gain.exponentialRampToValueAtTime(gain, audio.currentTime + startAt + 0.02)
  amp.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + startAt + duration)
  osc.connect(amp)
  amp.connect(audio.destination)
  osc.start(audio.currentTime + startAt)
  osc.stop(audio.currentTime + startAt + duration + 0.02)
}

/** Kurzes helles Pling bei richtiger Antwort. */
export function playCorrectSound(): void {
  if (muted) return
  const audio = ctx()
  if (!audio) return
  tone(audio, { frequency: 880, duration: 0.09, gain: 0.1 })
  tone(audio, { frequency: 1320, duration: 0.16, gain: 0.08, startAt: 0.06 })
}

/** Kurzes Oink/Buzzer bei falscher Antwort. */
export function playWrongSound(): void {
  if (muted) return
  const audio = ctx()
  if (!audio) return
  tone(audio, {
    frequency: 180,
    slideTo: 90,
    duration: 0.28,
    type: 'sawtooth',
    gain: 0.09,
  })
  tone(audio, {
    frequency: 140,
    slideTo: 70,
    duration: 0.18,
    type: 'square',
    gain: 0.04,
    startAt: 0.05,
  })
}

export function playRevealSound(correct: boolean): void {
  if (correct) playCorrectSound()
  else playWrongSound()
}
