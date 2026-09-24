// Web Audio API Synthesizer for football sounds (zero external file dependencies)
class SoundManager {
  constructor() {
    this.audioCtx = null;
    this.enabled = true;
    this.wrongBuffer = null;
    this.wrongSource = null;
    this.wrongAudio = null;
    this.isLoadingWrong = false;

    try {
      const saved = localStorage.getItem('bayern_draft_sound');
      if (saved !== null) {
        this.enabled = JSON.parse(saved);
      }
    } catch {
      this.enabled = true;
    }
  }

  initContext() {
    if (!this.audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.audioCtx = new AudioContext();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    this.loadWrongAudio();
  }

  loadWrongAudio() {
    if (typeof window === 'undefined' || this.wrongBuffer || this.isLoadingWrong) return;
    this.isLoadingWrong = true;

    if (!this.wrongAudio) {
      try {
        this.wrongAudio = new Audio('/audio/buzzer-or-wrong-answer-20582.mp3');
        this.wrongAudio.preload = 'auto';
      } catch {
        // ignore
      }
    }

    if (typeof fetch !== 'undefined') {
      fetch('/audio/buzzer-or-wrong-answer-20582.mp3')
        .then(res => res.arrayBuffer())
        .then(arrayBuffer => {
          if (!this.audioCtx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) this.audioCtx = new AudioContext();
          }
          if (this.audioCtx) {
            return this.audioCtx.decodeAudioData(arrayBuffer);
          }
        })
        .then(decoded => {
          if (decoded) {
            this.wrongBuffer = decoded;
          }
        })
        .catch(() => {
          // Fallback to HTML5 audio
        })
        .finally(() => {
          this.isLoadingWrong = false;
        });
    }
  }

  toggleSound() {
    this.enabled = !this.enabled;
    if (!this.enabled) {
      this.stopWrong();
    }
    try {
      localStorage.setItem('bayern_draft_sound', JSON.stringify(this.enabled));
    } catch {
      // ignore
    }
    return this.enabled;
  }

  isEnabled() {
    return this.enabled;
  }

  // Play uploaded wrong answer buzzer sound at original 1.0x speed
  playWrong() {
    if (!this.enabled) return;
    this.stopWrong(); // Prevent overlapping playback

    try {
      this.initContext();

      // Preferred: Web Audio API (zero latency, resilient across browsers)
      if (this.audioCtx && this.wrongBuffer) {
        const source = this.audioCtx.createBufferSource();
        source.buffer = this.wrongBuffer;
        source.playbackRate.value = 1.0; // Original 1.0x playback speed
        
        const gainNode = this.audioCtx.createGain();
        gainNode.gain.setValueAtTime(0.35, this.audioCtx.currentTime);
        
        source.connect(gainNode);
        gainNode.connect(this.audioCtx.destination);
        
        source.start(0);
        this.wrongSource = source;
        return;
      }

      // Fallback: HTML5 Audio
      if (!this.wrongAudio) {
        this.wrongAudio = new Audio('/audio/buzzer-or-wrong-answer-20582.mp3');
      }
      this.wrongAudio.playbackRate = 1.0; // Original 1.0x playback speed
      this.wrongAudio.volume = 0.35;
      this.wrongAudio.currentTime = 0;
      this.wrongAudio.play().catch(() => {});
    } catch {
      // Audio playback failed silently
    }
  }

  // Stop wrong answer sound if currently playing
  stopWrong() {
    try {
      if (this.wrongSource) {
        this.wrongSource.stop();
        this.wrongSource.disconnect();
        this.wrongSource = null;
      }
    } catch {
      // ignore
    }
    try {
      if (this.wrongAudio) {
        this.wrongAudio.pause();
        this.wrongAudio.currentTime = 0;
      }
    } catch {
      // ignore
    }
  }

  // Card select sound
  playSelect() {
    if (!this.enabled) return;
    try {
      this.initContext();
      if (!this.audioCtx) return;

      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(260, this.audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(520, this.audioCtx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.15, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.12);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.12);
    } catch {
      // Audio playback failed silently
    }
  }

  // Dramatic mystery reveal chime
  playReveal() {
    if (!this.enabled) return;
    try {
      this.initContext();
      if (!this.audioCtx) return;

      const notes = [440, 554.37, 659.25, 880]; // A major chord arpeggio
      notes.forEach((freq, index) => {
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime + (index * 0.07));

        gain.gain.setValueAtTime(0, this.audioCtx.currentTime + (index * 0.07));
        gain.gain.linearRampToValueAtTime(0.2, this.audioCtx.currentTime + (index * 0.07) + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + (index * 0.07) + 0.4);

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);

        osc.start(this.audioCtx.currentTime + (index * 0.07));
        osc.stop(this.audioCtx.currentTime + (index * 0.07) + 0.45);
      });
    } catch {
      // ignore
    }
  }

  // Football referee whistle (start / finish)
  playWhistle() {
    if (!this.enabled) return;
    try {
      this.initContext();
      if (!this.audioCtx) return;

      const osc1 = this.audioCtx.createOscillator();
      const osc2 = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc1.type = 'sawtooth';
      osc2.type = 'sine';

      osc1.frequency.setValueAtTime(2500, this.audioCtx.currentTime);
      osc2.frequency.setValueAtTime(2530, this.audioCtx.currentTime);

      gain.gain.setValueAtTime(0.08, this.audioCtx.currentTime);
      gain.gain.linearRampToValueAtTime(0.12, this.audioCtx.currentTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.35);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc1.start();
      osc2.start();
      osc1.stop(this.audioCtx.currentTime + 0.35);
      osc2.stop(this.audioCtx.currentTime + 0.35);
    } catch {
      // ignore
    }
  }
}

export const sounds = new SoundManager();
