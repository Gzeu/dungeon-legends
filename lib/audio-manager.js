// Audio Manager Adapter for React/Next integration
export class AudioManager {
  constructor(settings = { masterVolume: 0.7, sfxVolume: 0.8, musicVolume: 0.5, isEnabled: true }) {
    this.settings = settings;
    this.ctx = null;
    this.sounds = {};
    if (typeof window !== 'undefined') {
      this.init();
    }
  }

  init() {
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      this.master = this.ctx.createGain();
      this.master.gain.value = this.settings.masterVolume;
      this.master.connect(this.ctx.destination);

      this.sfx = this.ctx.createGain();
      this.sfx.gain.value = this.settings.sfxVolume;
      this.sfx.connect(this.master);

      this.music = this.ctx.createGain();
      this.music.gain.value = this.settings.musicVolume;
      this.music.connect(this.master);
    } catch (e) {
      console.warn('Audio not supported');
    }
  }

  updateSettings(newSettings) {
    this.settings = { ...this.settings, ...newSettings };
    if (this.master) this.master.gain.value = this.settings.masterVolume;
    if (this.sfx) this.sfx.gain.value = this.settings.sfxVolume;
    if (this.music) this.music.gain.value = this.settings.musicVolume;
  }

  playSound(type, options = {}) {
    if (!this.settings.isEnabled || !this.ctx) return;
    const now = this.ctx.currentTime;
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.connect(g); g.connect(this.sfx);

    switch (type) {
      case 'attack':
        o.type = 'square'; o.frequency.setValueAtTime(300, now); o.frequency.exponentialRampToValueAtTime(150, now + 0.2);
        g.gain.setValueAtTime(0.2, now); g.gain.exponentialRampToValueAtTime(0.01, now + 0.2); break;
      case 'defend':
        o.type = 'sawtooth'; o.frequency.setValueAtTime(180, now); g.gain.setValueAtTime(0.2, now); g.gain.exponentialRampToValueAtTime(0.01, now + 0.2); break;
      case 'magic':
      case 'spellFire':
      case 'spellIce':
      case 'spellHeal':
      case 'spellShadow':
      case 'spellLight':
        o.type = 'sine'; o.frequency.setValueAtTime(600, now); o.frequency.exponentialRampToValueAtTime(1200, now + 0.3); g.gain.setValueAtTime(0.15, now); g.gain.exponentialRampToValueAtTime(0.01, now + 0.4); break;
      case 'combo':
        o.type = 'triangle'; o.frequency.setValueAtTime(800, now); g.gain.setValueAtTime(0.2, now); g.gain.exponentialRampToValueAtTime(0.01, now + 0.3); break;
      case 'roomTransition':
        o.type = 'sine'; o.frequency.setValueAtTime(200, now); o.frequency.exponentialRampToValueAtTime(100, now + 0.4); g.gain.setValueAtTime(0.1, now); g.gain.exponentialRampToValueAtTime(0.01, now + 0.4); break;
      case 'enemyHit':
        o.type = 'square'; o.frequency.setValueAtTime(150, now); g.gain.setValueAtTime(0.2, now); g.gain.exponentialRampToValueAtTime(0.01, now + 0.2); break;
      case 'enemyDefeated':
        o.type = 'triangle'; o.frequency.setValueAtTime(400, now); g.gain.setValueAtTime(0.25, now); g.gain.exponentialRampToValueAtTime(0.01, now + 0.5); break;
      case 'victory':
        o.type = 'sine'; o.frequency.setValueAtTime(500, now); g.gain.setValueAtTime(0.3, now); g.gain.exponentialRampToValueAtTime(0.01, now + 0.8); break;
      case 'defeat':
        o.type = 'sine'; o.frequency.setValueAtTime(120, now); g.gain.setValueAtTime(0.3, now); g.gain.exponentialRampToValueAtTime(0.01, now + 1.0); break;
      case 'buttonClick':
        o.type = 'square'; o.frequency.setValueAtTime(1000, now); o.frequency.exponentialRampToValueAtTime(800, now + 0.1); g.gain.setValueAtTime(0.1, now); g.gain.exponentialRampToValueAtTime(0.01, now + 0.1); break;
      default:
        o.type = 'sine'; o.frequency.setValueAtTime(440, now); g.gain.setValueAtTime(0.1, now); g.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
    }

    o.start(now); o.stop(now + 1);
  }

  setRoomAmbience(roomIndex) {
    // In a full implementation, pick different ambient loops per room
  }
}
