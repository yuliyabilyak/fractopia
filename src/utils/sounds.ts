function tone(
  ctx: AudioContext,
  freq: number,
  start: number,
  duration: number,
  type: OscillatorType = 'sine',
  volume = 0.28,
) {
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.type = type
  osc.frequency.value = freq
  gain.gain.setValueAtTime(volume, ctx.currentTime + start)
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + duration)
  osc.start(ctx.currentTime + start)
  osc.stop(ctx.currentTime + start + duration + 0.05)
}

export function playVictorySound() {
  try {
    const ctx = new AudioContext()
    // Triumphant ascending fanfare C5 → E5 → G5 → C6 with harmony
    tone(ctx, 523.25, 0,    0.12)
    tone(ctx, 659.25, 0.10, 0.12)
    tone(ctx, 783.99, 0.20, 0.12)
    tone(ctx, 1046.5, 0.30, 0.60)
    tone(ctx, 523.25, 0.30, 0.60, 'sine', 0.10) // C5 harmony under C6
  } catch {
    // AudioContext unavailable
  }
}

export function playChimeSound() {
  try {
    const ctx = new AudioContext()
    // Ancient bell-like chime, ascending fourth
    tone(ctx, 698.46, 0,    0.35, 'triangle', 0.22)
    tone(ctx, 932.33, 0.08, 0.5,  'triangle', 0.18)
  } catch {
    // AudioContext unavailable
  }
}

export function playFeedbackSound(correct: boolean) {
  try {
    const ctx = new AudioContext()
    if (correct) {
      // Ascending arpeggio C5 → E5 → G5
      tone(ctx, 523.25, 0,    0.15)
      tone(ctx, 659.25, 0.13, 0.15)
      tone(ctx, 783.99, 0.26, 0.32)
    } else {
      // Gentle descending D5 → B♭4
      tone(ctx, 587.33, 0,    0.22, 'triangle', 0.18)
      tone(ctx, 466.16, 0.18, 0.34, 'triangle', 0.14)
    }
  } catch {
    // AudioContext unavailable (e.g. automated tests)
  }
}
