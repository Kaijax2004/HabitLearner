// 专业音效管理器
// 提供多种类型的通知音效和音频处理功能

class AudioManager {
  constructor() {
    this.audioContext = null
    this.isInitialized = false
    this.volume = 0.3 // 默认音量
    this.soundEnabled = true
  }

  // 初始化音频上下文
  async init() {
    if (this.isInitialized) return

    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)()
      
      // 如果音频上下文被暂停，需要用户交互来恢复
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume()
      }
      
      this.isInitialized = true
      console.log('🔊 音频管理器初始化成功')
    } catch (error) {
      console.error('❌ 音频管理器初始化失败:', error)
    }
  }

  // 设置音量
  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume))
  }

  // 启用/禁用音效
  setSoundEnabled(enabled) {
    this.soundEnabled = enabled
  }

  // 创建音调
  createTone(frequency, duration, type = 'sine', volume = this.volume) {
    if (!this.soundEnabled || !this.audioContext) return

    const oscillator = this.audioContext.createOscillator()
    const gainNode = this.audioContext.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(this.audioContext.destination)
    
    oscillator.type = type
    oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime)
    
    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime)
    gainNode.gain.linearRampToValueAtTime(volume, this.audioContext.currentTime + 0.01)
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration)
    
    oscillator.start(this.audioContext.currentTime)
    oscillator.stop(this.audioContext.currentTime + duration)
    
    return oscillator
  }

  // 创建和弦
  createChord(frequencies, duration, type = 'sine', volume = this.volume) {
    if (!this.soundEnabled || !this.audioContext) return

    const oscillators = []
    
    frequencies.forEach(freq => {
      const oscillator = this.audioContext.createOscillator()
      const gainNode = this.audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(this.audioContext.destination)
      
      oscillator.type = type
      oscillator.frequency.setValueAtTime(freq, this.audioContext.currentTime)
      
      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime)
      gainNode.gain.linearRampToValueAtTime(volume * 0.7, this.audioContext.currentTime + 0.01)
      gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration)
      
      oscillator.start(this.audioContext.currentTime)
      oscillator.stop(this.audioContext.currentTime + duration)
      
      oscillators.push(oscillator)
    })
    
    return oscillators
  }

  // 通知音效 - 温和提醒
  playNotificationSound() {
    this.init().then(() => {
      console.log('🔔 播放通知音效')
      
      // 创建温和的上升音调
      const frequencies = [523, 659, 784] // C5, E5, G5
      const durations = [0.15, 0.15, 0.2]
      
      frequencies.forEach((freq, index) => {
        setTimeout(() => {
          this.createTone(freq, durations[index], 'sine', this.volume * 0.6)
        }, index * 100)
      })
    })
  }

  // 完成音效 - 成功提示
  playSuccessSound() {
    this.init().then(() => {
      console.log('✅ 播放完成音效')
      
      // 创建胜利和弦
      const chord1 = [523, 659, 784] // C5, E5, G5
      const chord2 = [659, 784, 1047] // E5, G5, C6
      
      setTimeout(() => {
        this.createChord(chord1, 0.3, 'sine', this.volume * 0.7)
      }, 0)
      
      setTimeout(() => {
        this.createChord(chord2, 0.4, 'sine', this.volume * 0.8)
      }, 200)
    })
  }

  // 错误音效 - 错误提示
  playErrorSound() {
    this.init().then(() => {
      console.log('❌ 播放错误音效')
      
      // 创建下降音调
      const frequencies = [440, 392, 349] // A4, G4, F4
      const durations = [0.2, 0.2, 0.3]
      
      frequencies.forEach((freq, index) => {
        setTimeout(() => {
          this.createTone(freq, durations[index], 'sawtooth', this.volume * 0.5)
        }, index * 150)
      })
    })
  }

  // 稍后提醒音效 - 延迟提示
  playSnoozeSound() {
    this.init().then(() => {
      console.log('⏰ 播放稍后提醒音效')
      
      // 创建温和的延迟音效
      const frequencies = [392, 440] // G4, A4
      const durations = [0.2, 0.3]
      
      frequencies.forEach((freq, index) => {
        setTimeout(() => {
          this.createTone(freq, durations[index], 'triangle', this.volume * 0.4)
        }, index * 200)
      })
    })
  }

  // 忽略音效 - 取消提示
  playDismissSound() {
    this.init().then(() => {
      console.log('🚫 播放忽略音效')
      
      // 创建简短的取消音效
      this.createTone(330, 0.15, 'square', this.volume * 0.3)
    })
  }

  // 专注开始音效 - 番茄钟开始
  playFocusStartSound() {
    this.init().then(() => {
      console.log('🎯 播放专注开始音效')
      
      // 创建激励性的开始音效
      const frequencies = [440, 554, 659] // A4, C#5, E5
      const durations = [0.2, 0.2, 0.3]
      
      frequencies.forEach((freq, index) => {
        setTimeout(() => {
          this.createTone(freq, durations[index], 'sine', this.volume * 0.6)
        }, index * 100)
      })
    })
  }

  // 专注结束音效 - 番茄钟结束
  playFocusEndSound() {
    this.init().then(() => {
      console.log('🏁 播放专注结束音效')
      
      // 创建完成音效
      const chord = [523, 659, 784, 1047] // C5, E5, G5, C6
      this.createChord(chord, 0.5, 'sine', this.volume * 0.8)
    })
  }

  // 休息开始音效
  playBreakStartSound() {
    this.init().then(() => {
      console.log('☕ 播放休息开始音效')
      
      // 创建放松音效
      const frequencies = [392, 440, 523] // G4, A4, C5
      const durations = [0.3, 0.3, 0.4]
      
      frequencies.forEach((freq, index) => {
        setTimeout(() => {
          this.createTone(freq, durations[index], 'sine', this.volume * 0.5)
        }, index * 150)
      })
    })
  }

  // 自定义音效
  playCustomSound(frequencies, duration = 0.3, type = 'sine', volume = this.volume) {
    this.init().then(() => {
      console.log('🎵 播放自定义音效')
      
      if (Array.isArray(frequencies)) {
        this.createChord(frequencies, duration, type, volume)
      } else {
        this.createTone(frequencies, duration, type, volume)
      }
    })
  }

  // 播放音效序列
  playSoundSequence(sounds) {
    this.init().then(() => {
      console.log('🎼 播放音效序列')
      
      sounds.forEach((sound, index) => {
        setTimeout(() => {
          const { frequencies, duration, type, volume } = sound
          if (Array.isArray(frequencies)) {
            this.createChord(frequencies, duration, type, volume)
          } else {
            this.createTone(frequencies, duration, type, volume)
          }
        }, index * (sound.delay || 200))
      })
    })
  }

  // 测试所有音效
  testAllSounds() {
    console.log('🧪 测试所有音效')
    
    const sounds = [
      { name: '通知音效', fn: () => this.playNotificationSound() },
      { name: '完成音效', fn: () => this.playSuccessSound() },
      { name: '错误音效', fn: () => this.playErrorSound() },
      { name: '稍后提醒音效', fn: () => this.playSnoozeSound() },
      { name: '忽略音效', fn: () => this.playDismissSound() },
      { name: '专注开始音效', fn: () => this.playFocusStartSound() },
      { name: '专注结束音效', fn: () => this.playFocusEndSound() },
      { name: '休息开始音效', fn: () => this.playBreakStartSound() }
    ]
    
    sounds.forEach((sound, index) => {
      setTimeout(() => {
        console.log(`🔊 测试: ${sound.name}`)
        sound.fn()
      }, index * 1000)
    })
  }

  // 清理资源
  cleanup() {
    if (this.audioContext) {
      this.audioContext.close()
      this.audioContext = null
      this.isInitialized = false
      console.log('🧹 音频管理器已清理')
    }
  }
}

// 创建全局实例
const audioManager = new AudioManager()

export default audioManager
