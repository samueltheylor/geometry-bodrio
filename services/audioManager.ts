class AudioManager {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private nextNoteTime: number = 0;
  private timerID: number | null = null;
  private beatCount: number = 0;
  private isPlaying: boolean = false;

  // Music Pattern (Kick, Bass, HiHat pseudo-sequence)
  private readonly tempo = 155; // BPM - fast like DnB/Techno
  private readonly lookahead = 25.0; // ms
  private readonly scheduleAheadTime = 0.1; // s

  constructor() {
    // Lazy init in start()
  }

  public init() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioContextClass();
    }
  }

  public startMusic() {
    this.init();
    if (!this.ctx || this.isPlaying) return;
    
    // Resume context if suspended (browser policy)
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    this.isPlaying = true;
    this.nextNoteTime = this.ctx.currentTime;
    this.beatCount = 0;
    this.scheduler();
  }

  public stopMusic() {
    this.isPlaying = false;
    if (this.timerID !== null) {
      window.clearTimeout(this.timerID);
      this.timerID = null;
    }
  }

  public playJump() {
    if (!this.ctx || this.isMuted) return;
    
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'square';
    osc.frequency.setValueAtTime(150, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(600, this.ctx.currentTime + 0.1);
    
    gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start();
    osc.stop(this.ctx.currentTime + 0.1);
  }

  public playDeath() {
    if (!this.ctx || this.isMuted) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(200, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(50, this.ctx.currentTime + 0.3);

    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.3);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.3);
  }

  private nextNote() {
    const secondsPerBeat = 60.0 / this.tempo;
    this.nextNoteTime += secondsPerBeat; // Add beat length to last beat time
    this.beatCount++;
  }

  private playNote(time: number) {
    if (!this.ctx || this.isMuted) return;

    // KICK DRUM (Every beat)
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.frequency.setValueAtTime(150, time);
    osc.frequency.exponentialRampToValueAtTime(0.01, time + 0.5);
    gain.gain.setValueAtTime(0.4, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.5);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(time);
    osc.stop(time + 0.5);

    // BASSLINE (Off beat)
    if (this.beatCount % 2 !== 0) {
      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();
      osc2.type = 'sawtooth';
      osc2.frequency.setValueAtTime(60, time);
      gain2.gain.setValueAtTime(0.1, time);
      gain2.gain.linearRampToValueAtTime(0, time + 0.2);
      osc2.connect(gain2);
      gain2.connect(this.ctx.destination);
      osc2.start(time);
      osc2.stop(time + 0.2);
    }
    
    // MELODY (Simple arpeggio)
    const noteFreqs = [220, 261.63, 329.63, 392.00, 523.25]; // Am7 pentatonic
    if (this.beatCount % 4 === 0) {
       const mOsc = this.ctx.createOscillator();
       const mGain = this.ctx.createGain();
       mOsc.type = 'triangle';
       const note = noteFreqs[(this.beatCount / 4) % noteFreqs.length];
       mOsc.frequency.setValueAtTime(note, time);
       mGain.gain.setValueAtTime(0.05, time);
       mGain.gain.exponentialRampToValueAtTime(0.001, time + 0.3);
       mOsc.connect(mGain);
       mGain.connect(this.ctx.destination);
       mOsc.start(time);
       mOsc.stop(time + 0.3);
    }
  }

  private scheduler() {
    // While there are notes that will need to play before the next interval,
    // schedule them and advance the pointer.
    if (!this.ctx) return;
    
    while (this.nextNoteTime < this.ctx.currentTime + this.scheduleAheadTime) {
      this.playNote(this.nextNoteTime);
      this.nextNote();
    }
    
    this.timerID = window.setTimeout(() => this.scheduler(), this.lookahead);
  }
}

export const audioManager = new AudioManager();