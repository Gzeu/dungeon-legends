// Audio system for game effects
class AudioManager {
    constructor() {
        this.sounds = {};
        this.enabled = true;
        this.volume = 0.5;
        this.initSounds();
    }

    initSounds() {
        this.sounds.flip = document.getElementById('audio-flip');
        this.sounds.combat = document.getElementById('audio-combat');
        this.sounds.treasure = document.getElementById('audio-treasure');

        Object.values(this.sounds).forEach(audio => {
            if (audio) {
                audio.volume = this.volume;
            }
        });
    }

    play(soundName) {
        if (!this.enabled || !this.sounds[soundName]) {
            return;
        }

        const audio = this.sounds[soundName];
        audio.currentTime = 0;
        
        const playPromise = audio.play();
        if (playPromise !== undefined) {
            playPromise.catch(error => {
                console.log('Audio play failed:', error);
            });
        }
    }

    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
        Object.values(this.sounds).forEach(audio => {
            if (audio) {
                audio.volume = this.volume;
            }
        });
    }

    toggle() {
        this.enabled = !this.enabled;
        return this.enabled;
    }

    playCardFlip() {
        this.play('flip');
    }

    playCombat() {
        this.play('combat');
    }

    playTreasure() {
        this.play('treasure');
    }

    generateBeep(frequency = 440, duration = 200) {
        if (!this.enabled) return;

        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.value = frequency;
            oscillator.type = 'sine';

            gainNode.gain.setValueAtTime(this.volume * 0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration / 1000);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + duration / 1000);
        } catch (error) {
            console.log('Web Audio API not supported:', error);
        }
    }
}