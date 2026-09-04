/**
 * DELIVIA - Sound & Audio Notification System
 * Generates custom synthesized audio cues using standard Web Audio API
 * No external mp3 files required — 100% reliable and instantaneous.
 */

class DeliviaAudio {
  constructor() {
    this.ctx = null;
    this.enabled = true;
  }

  initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleSound(forceState) {
    if (typeof forceState === 'boolean') {
      this.enabled = forceState;
    } else {
      this.enabled = !this.enabled;
    }
    return this.enabled;
  }

  /**
   * Soft chime for status updates & menu interactions
   */
  playChime() {
    if (!this.enabled) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.15); // A5

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.36);
    } catch (e) {
      console.warn('Audio play failed', e);
    }
  }

  /**
   * Kitchen order alert bell (simulates metal kitchen ticket chime)
   */
  playKitchenBell() {
    if (!this.enabled) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      
      [784, 1046.5].forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + (i * 0.08));
        
        gain.gain.setValueAtTime(0.12, now + (i * 0.08));
        gain.gain.exponentialRampToValueAtTime(0.001, now + (i * 0.08) + 0.5);
        
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + (i * 0.08));
        osc.stop(now + (i * 0.08) + 0.52);
      });
    } catch (e) {
      console.warn('Audio play failed', e);
    }
  }

  /**
   * Highway 2-Minute Pull-Over Warning Sound (Alert tone for safe deceleration)
   */
  playPullOverAlert() {
    if (!this.enabled) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      [659.25, 880, 1174.66].forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + (i * 0.12));

        gain.gain.setValueAtTime(0.15, now + (i * 0.12));
        gain.gain.exponentialRampToValueAtTime(0.001, now + (i * 0.12) + 0.4);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + (i * 0.12));
        osc.stop(now + (i * 0.12) + 0.42);
      });
    } catch (e) {
      console.warn('Audio play failed', e);
    }
  }

  /**
   * Order Hand-Off Completed fanfare
   */
  playSuccess() {
    if (!this.enabled) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6

      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + (idx * 0.09));

        gain.gain.setValueAtTime(0.12, now + (idx * 0.09));
        gain.gain.exponentialRampToValueAtTime(0.001, now + (idx * 0.09) + 0.45);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + (idx * 0.09));
        osc.stop(now + (idx * 0.09) + 0.5);
      });
    } catch (e) {
      console.warn('Audio play failed', e);
    }
  }
}

const deliviaAudio = new DeliviaAudio();
