class AudioManager {
  constructor() {
    this.audioContext = null
    this.isInitialized = false
    this.volume = 0.36
    this.soundEnabled = true
  }

  async init() {
    if (typeof window === 'undefined') return false
    if (this.isInitialized && this.audioContext) return true

    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)()
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume()
      }
      this.isInitialized = true
      return true
    } catch (error) {
      console.warn('Audio manager initialization failed:', error)
      return false
    }
  }

  setVolume(volume) {
    const parsed = Number(volume)
    this.volume = Number.isFinite(parsed) ? Math.max(0, Math.min(1, parsed)) : this.volume
  }

  setSoundEnabled(enabled) {
    this.soundEnabled = Boolean(enabled)
  }

  createTone(frequency, duration, type = 'sine', volume = this.volume, offset = 0) {
    if (!this.soundEnabled || !this.audioContext) return null

    const startAt = this.audioContext.currentTime + offset
    const oscillator = this.audioContext.createOscillator()
    const gainNode = this.audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(this.audioContext.destination)

    oscillator.type = type
    oscillator.frequency.setValueAtTime(frequency, startAt)

    gainNode.gain.setValueAtTime(0.0001, startAt)
    gainNode.gain.exponentialRampToValueAtTime(Math.max(0.0001, volume), startAt + 0.018)
    gainNode.gain.exponentialRampToValueAtTime(0.0001, startAt + duration)

    oscillator.start(startAt)
    oscillator.stop(startAt + duration + 0.03)
    return oscillator
  }

  createChord(frequencies, duration, type = 'sine', volume = this.volume, offset = 0) {
    if (!Array.isArray(frequencies)) return []
    return frequencies.map((frequency) => this.createTone(frequency, duration, type, volume * 0.72, offset)).filter(Boolean)
  }

  async playPreset(presetId, options = {}) {
    if (presetId === 'none') return false
    if (options.enabled === false || !this.soundEnabled) return false

    const ready = await this.init()
    if (!ready) return false

    const baseVolume = Number.isFinite(Number(options.volume)) ? Number(options.volume) : this.volume
    this.setVolume(baseVolume)

    const preset = SOUND_PRESETS[presetId] || SOUND_PRESETS.atelier_chime
    preset.forEach((step) => {
      if (Array.isArray(step.frequencies)) {
        this.createChord(step.frequencies, step.duration, step.type, this.volume * (step.gain ?? 1), step.offset ?? 0)
        return
      }
      this.createTone(step.frequency, step.duration, step.type, this.volume * (step.gain ?? 1), step.offset ?? 0)
    })

    return true
  }

  playEventSound(eventKey, soundId, options = {}) {
    const fallbackSoundId = DEFAULT_EVENT_SOUNDS[eventKey] || 'atelier_chime'
    return this.playPreset(soundId || fallbackSoundId, options)
  }

  playNotificationSound() {
    return this.playEventSound('notification')
  }

  playSuccessSound() {
    return this.playEventSound('complete')
  }

  playErrorSound() {
    return this.playEventSound('error')
  }

  playSnoozeSound() {
    return this.playEventSound('snooze')
  }

  playDismissSound() {
    return this.playEventSound('dismiss')
  }

  playFocusStartSound() {
    return this.playEventSound('focus_start')
  }

  playFocusEndSound() {
    return this.playEventSound('focus_end')
  }

  playBreakStartSound() {
    return this.playPreset('quiet_snooze')
  }

  playCustomSound(frequencies, duration = 0.3, type = 'sine', volume = this.volume) {
    return this.init().then((ready) => {
      if (!ready) return false
      if (Array.isArray(frequencies)) {
        this.createChord(frequencies, duration, type, volume)
      } else {
        this.createTone(frequencies, duration, type, volume)
      }
      return true
    })
  }

  playSoundSequence(sounds) {
    return this.init().then((ready) => {
      if (!ready || !Array.isArray(sounds)) return false
      sounds.forEach((sound, index) => {
        const delay = (sound.delay ?? 180) * index
        window.setTimeout(() => {
          const { frequencies, frequency, duration, type, volume } = sound
          if (Array.isArray(frequencies)) {
            this.createChord(frequencies, duration, type, volume)
          } else {
            this.createTone(frequency ?? frequencies, duration, type, volume)
          }
        }, delay)
      })
      return true
    })
  }

  testAllSounds() {
    return Object.entries(DEFAULT_EVENT_SOUNDS).forEach(([eventKey, soundId], index) => {
      window.setTimeout(() => {
        this.playEventSound(eventKey, soundId)
      }, index * 720)
    })
  }

  cleanup() {
    if (this.audioContext) {
      this.audioContext.close()
      this.audioContext = null
      this.isInitialized = false
    }
  }
}

export const DEFAULT_EVENT_SOUNDS = {
  notification: 'atelier_chime',
  dismiss: 'soft_tap',
  complete: 'warm_resolve',
  focus_start: 'deep_start',
  error: 'low_notice',
  focus_end: 'clear_finish',
  snooze: 'quiet_snooze'
}

export const SOUND_PRESETS = {
  atelier_chime: [
    { frequency: 523.25, duration: 0.16, type: 'sine', gain: 0.42, offset: 0 },
    { frequency: 659.25, duration: 0.18, type: 'sine', gain: 0.36, offset: 0.08 },
    { frequencies: [783.99, 987.77], duration: 0.28, type: 'triangle', gain: 0.24, offset: 0.18 }
  ],
  warm_resolve: [
    { frequencies: [392, 493.88, 587.33], duration: 0.22, type: 'triangle', gain: 0.34, offset: 0 },
    { frequencies: [440, 554.37, 659.25], duration: 0.34, type: 'sine', gain: 0.3, offset: 0.18 }
  ],
  deep_start: [
    { frequency: 196, duration: 0.16, type: 'triangle', gain: 0.32, offset: 0 },
    { frequency: 293.66, duration: 0.18, type: 'triangle', gain: 0.28, offset: 0.11 },
    { frequencies: [392, 493.88], duration: 0.24, type: 'sine', gain: 0.24, offset: 0.22 }
  ],
  clear_finish: [
    { frequencies: [523.25, 659.25], duration: 0.18, type: 'sine', gain: 0.3, offset: 0 },
    { frequencies: [659.25, 783.99, 1046.5], duration: 0.4, type: 'triangle', gain: 0.26, offset: 0.18 }
  ],
  quiet_snooze: [
    { frequency: 349.23, duration: 0.18, type: 'triangle', gain: 0.24, offset: 0 },
    { frequency: 392, duration: 0.24, type: 'triangle', gain: 0.2, offset: 0.18 }
  ],
  soft_tap: [
    { frequency: 261.63, duration: 0.08, type: 'sine', gain: 0.18, offset: 0 }
  ],
  low_notice: [
    { frequency: 246.94, duration: 0.14, type: 'triangle', gain: 0.22, offset: 0 },
    { frequency: 220, duration: 0.2, type: 'triangle', gain: 0.18, offset: 0.13 }
  ]
}

const audioManager = new AudioManager()

export default audioManager
