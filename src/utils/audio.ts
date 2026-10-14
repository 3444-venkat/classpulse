import { SoundType } from '../types/timetable';

class AudioSynthesizer {
  private ctx: AudioContext | null = null;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  playAlert(type: SoundType = 'bell', volume = 0.8) {
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(Math.max(0.05, Math.min(volume, 1)), now);
      masterGain.connect(ctx.destination);

      if (type === 'bell') {
        // Classic Collegiate Bell (Two tuned chimes with harmonic decay)
        this.createBellTone(ctx, masterGain, 587.33, now, 1.8); // D5
        this.createBellTone(ctx, masterGain, 880.00, now + 0.15, 2.0); // A5
      } else if (type === 'chime') {
        // Ascending harmonic chime (C5 -> E5 -> G5)
        this.createChimeTone(ctx, masterGain, 523.25, now);        // C5
        this.createChimeTone(ctx, masterGain, 659.25, now + 0.12); // E5
        this.createChimeTone(ctx, masterGain, 783.99, now + 0.24); // G5
      } else if (type === 'ping') {
        // Focused high-clarity notification ping
        this.createPingTone(ctx, masterGain, 987.77, now); // B5
      } else if (type === 'marimba') {
        // Organic wooden strike marimba
        this.createMarimbaTone(ctx, masterGain, 440, now);
        this.createMarimbaTone(ctx, masterGain, 554.37, now + 0.1);
        this.createMarimbaTone(ctx, masterGain, 659.25, now + 0.2);
      }
    } catch (e) {
      console.warn('Audio playback not permitted or supported yet:', e);
    }
  }

  private createBellTone(ctx: AudioContext, destination: GainNode, freq: number, startTime: number, duration: number) {
    // Fundamental oscillator
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    // Subtle harmonic overtone for rich metallic bell realism
    const overtone = ctx.createOscillator();
    const overtoneGain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, startTime);

    overtone.type = 'triangle';
    overtone.frequency.setValueAtTime(freq * 2.76, startTime);

    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(0.7, startTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    overtoneGain.gain.setValueAtTime(0, startTime);
    overtoneGain.gain.linearRampToValueAtTime(0.2, startTime + 0.015);
    overtoneGain.gain.exponentialRampToValueAtTime(0.0001, startTime + (duration * 0.6));

    osc.connect(gain);
    gain.connect(destination);

    overtone.connect(overtoneGain);
    overtoneGain.connect(destination);

    osc.start(startTime);
    osc.stop(startTime + duration);
    overtone.start(startTime);
    overtone.stop(startTime + duration);
  }

  private createChimeTone(ctx: AudioContext, destination: GainNode, freq: number, startTime: number) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, startTime);

    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(0.4, startTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + 1.2);

    osc.connect(gain);
    gain.connect(destination);

    osc.start(startTime);
    osc.stop(startTime + 1.2);
  }

  private createPingTone(ctx: AudioContext, destination: GainNode, freq: number, startTime: number) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, startTime);

    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(0.5, startTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.8);

    osc.connect(gain);
    gain.connect(destination);

    osc.start(startTime);
    osc.stop(startTime + 0.8);
  }

  private createMarimbaTone(ctx: AudioContext, destination: GainNode, freq: number, startTime: number) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, startTime);

    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(0.45, startTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.6);

    osc.connect(gain);
    gain.connect(destination);

    osc.start(startTime);
    osc.stop(startTime + 0.6);
  }
}

export const audioSynth = new AudioSynthesizer();
