// Web Audio API helper for zero-dependency study alarms & chimes
class AudioPlayer {
  private ctx: AudioContext | null = null;

  private init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  // Play a beautiful metallic chime indicating work focus session finish
  public playSuccessChime() {
    try {
      this.init();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      // Synthesize a beautiful double chime: high clear bell tones
      this.playNote(523.25, now, 0.4); // C5
      this.playNote(659.25, now + 0.15, 0.4); // E5
      this.playNote(783.99, now + 0.3, 0.6); // G5
    } catch (e) {
      console.warn("AudioContext blocking or not supported", e);
    }
  }

  // Play a soft bubble click sound for interaction
  public playClick() {
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      this.playNote(400, now, 0.05, 'triangle');
    } catch (e) {
      // Ignored
    }
  }

  private playNote(freq: number, start: number, duration: number, type: OscillatorType = 'sine') {
    if (!this.ctx) return;
    
    // Resume context if suspended (browser security autoplay policy)
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    const osc = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, start);

    gainNode.gain.setValueAtTime(0.15, start);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, start + duration);

    osc.connect(gainNode);
    gainNode.connect(this.ctx.destination);

    osc.start(start);
    osc.stop(start + duration);
  }
}

export const audio = new AudioPlayer();
