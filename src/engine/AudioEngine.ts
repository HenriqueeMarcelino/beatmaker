import * as Tone from 'tone';
import { InstrumentType, createInstrument, DRUM_NOTES } from './InstrumentLibrary';

export interface Track {
  id: string;
  name: string;
  type: 'audio' | 'instrument';
  volume: number;
  pan: number;
  muted: boolean;
  solo: boolean;
  color: string;
  clips: Clip[];
  effects: Effect[];
  channel?: Tone.Channel;
  instrument?: Tone.Instrument;
  instrumentType?: InstrumentType;
}

export interface Clip {
  id: string;
  trackId: string;
  startTime: number;
  duration: number;
  offset: number;
  buffer?: Tone.ToneAudioBuffer;
  player?: Tone.Player;
  notes?: Note[];
}

export interface Note {
  id: string;
  pitch: number;
  velocity: number;
  startTime: number;
  duration: number;
}

export interface Effect {
  id: string;
  type: 'reverb' | 'delay' | 'eq' | 'compressor' | 'distortion' | 'filter' | 'chorus' | 'phaser';
  enabled: boolean;
  params: Record<string, number>;
  node?: Tone.ToneAudioNode;
}

class AudioEngine {
  private static instance: AudioEngine;
  private initialized = false;
  private tracks: Map<string, Track> = new Map();
  private masterChannel: Tone.Channel;
  private recorder?: Tone.Recorder;
  private previewSynths: Map<InstrumentType, Tone.Instrument> = new Map();

  private constructor() {
    this.masterChannel = new Tone.Channel({
      volume: 0,
      pan: 0
    }).toDestination();
  }

  static getInstance(): AudioEngine {
    if (!AudioEngine.instance) {
      AudioEngine.instance = new AudioEngine();
    }
    return AudioEngine.instance;
  }

  async init(): Promise<void> {
    if (this.initialized) return;

    await Tone.start();
    console.log('Audio Engine initialized');
    this.initialized = true;
  }

  async play(): Promise<void> {
    await this.init();
    Tone.Transport.start();
  }

  pause(): void {
    Tone.Transport.pause();
  }

  stop(): void {
    Tone.Transport.stop();
  }

  setLoop(enabled: boolean, loopStart: number = 0, loopEnd: number = 8): void {
    Tone.Transport.loop = enabled;
    if (enabled) {
      Tone.Transport.loopStart = loopStart;
      Tone.Transport.loopEnd = loopEnd;
    }
  }

  setLoopPoints(loopStart: number, loopEnd: number): void {
    Tone.Transport.loopStart = loopStart;
    Tone.Transport.loopEnd = loopEnd;
  }

  setTempo(bpm: number): void {
    Tone.Transport.bpm.value = bpm;
  }

  getTempo(): number {
    return Tone.Transport.bpm.value;
  }

  setPosition(bars: number, beats: number, sixteenths: number): void {
    Tone.Transport.position = `${bars}:${beats}:${sixteenths}`;
  }

  getPosition(): string {
    return Tone.Transport.position.toString();
  }

  addTrack(track: Track): void {
    const channel = new Tone.Channel({
      volume: Tone.gainToDb(track.volume),
      pan: track.pan
    }).connect(this.masterChannel);

    track.channel = channel;
    this.tracks.set(track.id, track);
  }

  removeTrack(trackId: string): void {
    const track = this.tracks.get(trackId);
    if (track?.channel) {
      track.channel.dispose();
    }
    this.tracks.delete(trackId);
  }

  setTrackVolume(trackId: string, volume: number): void {
    const track = this.tracks.get(trackId);
    if (track?.channel) {
      track.channel.volume.value = Tone.gainToDb(volume);
      track.volume = volume;
    }
  }

  setTrackPan(trackId: string, pan: number): void {
    const track = this.tracks.get(trackId);
    if (track?.channel) {
      track.channel.pan.value = pan;
      track.pan = pan;
    }
  }

  setTrackMute(trackId: string, muted: boolean): void {
    const track = this.tracks.get(trackId);
    if (track?.channel) {
      track.channel.mute = muted;
      track.muted = muted;
    }
  }

  setTrackSolo(trackId: string, solo: boolean): void {
    const track = this.tracks.get(trackId);
    if (track) {
      track.solo = solo;

      // Update all tracks solo state
      const hasSolo = Array.from(this.tracks.values()).some(t => t.solo);
      this.tracks.forEach((t) => {
        if (t.channel) {
          t.channel.mute = hasSolo && !t.solo;
        }
      });
    }
  }

  async loadAudioFile(file: File): Promise<Tone.ToneAudioBuffer> {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = await Tone.context.decodeAudioData(arrayBuffer);
    return new Tone.ToneAudioBuffer(buffer);
  }

  async addAudioClip(trackId: string, clip: Clip, buffer: Tone.ToneAudioBuffer): Promise<void> {
    const track = this.tracks.get(trackId);
    if (!track?.channel) return;

    const player = new Tone.Player(buffer).connect(track.channel);
    player.sync().start(clip.startTime, clip.offset, clip.duration);

    clip.player = player;
    clip.buffer = buffer;

    track.clips.push(clip);
  }

  removeClip(trackId: string, clipId: string): void {
    const track = this.tracks.get(trackId);
    if (!track) return;

    const clipIndex = track.clips.findIndex(c => c.id === clipId);
    if (clipIndex >= 0) {
      const clip = track.clips[clipIndex];
      if (clip.player) {
        clip.player.dispose();
      }
      track.clips.splice(clipIndex, 1);
    }
  }

  createEffect(type: Effect['type'], params: Record<string, number> = {}): Tone.ToneAudioNode {
    switch (type) {
      case 'reverb':
        return new Tone.Reverb({
          decay: params.decay ?? 1.5,
          preDelay: params.preDelay ?? 0.01,
          wet: params.wet ?? 0.3
        });

      case 'delay':
        return new Tone.FeedbackDelay({
          delayTime: params.delayTime ?? 0.25,
          feedback: params.feedback ?? 0.5,
          wet: params.wet ?? 0.3
        });

      case 'eq':
        return new Tone.EQ3({
          low: params.low ?? 0,
          mid: params.mid ?? 0,
          high: params.high ?? 0,
          lowFrequency: params.lowFrequency ?? 400,
          highFrequency: params.highFrequency ?? 2500
        });

      case 'compressor':
        return new Tone.Compressor({
          threshold: params.threshold ?? -24,
          ratio: params.ratio ?? 4,
          attack: params.attack ?? 0.003,
          release: params.release ?? 0.25
        });

      case 'distortion':
        return new Tone.Distortion({
          distortion: params.distortion ?? 0.4,
          wet: params.wet ?? 0.5
        });

      case 'filter':
        return new Tone.Filter({
          frequency: params.frequency ?? 1000,
          type: 'lowpass',
          rolloff: -12,
          Q: params.Q ?? 1
        });

      case 'chorus':
        return new Tone.Chorus({
          frequency: params.frequency ?? 1.5,
          delayTime: params.delayTime ?? 3.5,
          depth: params.depth ?? 0.7,
          wet: params.wet ?? 0.3
        });

      case 'phaser':
        return new Tone.Phaser({
          frequency: params.frequency ?? 0.5,
          octaves: params.octaves ?? 3,
          baseFrequency: params.baseFrequency ?? 350,
          wet: params.wet ?? 0.3
        });

      default:
        return new Tone.Gain(1);
    }
  }

  addEffect(trackId: string, effect: Effect): void {
    const track = this.tracks.get(trackId);
    if (!track?.channel) return;

    const effectNode = this.createEffect(effect.type, effect.params);

    // Disconnect track from master
    track.channel.disconnect();

    // Connect through effect chain
    if (track.effects.length === 0) {
      track.channel.connect(effectNode);
    } else {
      const lastEffect = track.effects[track.effects.length - 1];
      if (lastEffect.node) {
        lastEffect.node.disconnect();
        lastEffect.node.connect(effectNode);
      }
    }

    effectNode.connect(this.masterChannel);
    effect.node = effectNode;
    track.effects.push(effect);
  }

  removeEffect(trackId: string, effectId: string): void {
    const track = this.tracks.get(trackId);
    if (!track) return;

    const effectIndex = track.effects.findIndex(e => e.id === effectId);
    if (effectIndex >= 0) {
      const effect = track.effects[effectIndex];
      if (effect.node) {
        effect.node.dispose();
      }
      track.effects.splice(effectIndex, 1);

      // Reconnect chain
      this.reconnectEffectChain(trackId);
    }
  }

  updateEffectParam(trackId: string, effectId: string, param: string, value: number): void {
    const track = this.tracks.get(trackId);
    if (!track) return;

    const effect = track.effects.find(e => e.id === effectId);
    if (effect?.node && param in effect.node) {
      (effect.node as any)[param].value = value;
      effect.params[param] = value;
    }
  }

  private reconnectEffectChain(trackId: string): void {
    const track = this.tracks.get(trackId);
    if (!track?.channel) return;

    track.channel.disconnect();

    if (track.effects.length === 0) {
      track.channel.connect(this.masterChannel);
    } else {
      let current = track.channel;
      track.effects.forEach((effect, index) => {
        if (effect.node) {
          effect.node.disconnect();
          current.connect(effect.node);
          current = effect.node;
        }
      });
      current.connect(this.masterChannel);
    }
  }

  setMasterVolume(volume: number): void {
    this.masterChannel.volume.value = Tone.gainToDb(volume);
  }

  async startRecording(): Promise<void> {
    this.recorder = new Tone.Recorder();
    this.masterChannel.connect(this.recorder);
    this.recorder.start();
  }

  async stopRecording(): Promise<Blob> {
    if (!this.recorder) {
      throw new Error('Recorder not started');
    }

    const recording = await this.recorder.stop();
    this.recorder.dispose();
    this.recorder = undefined;

    return recording;
  }

  async exportAudio(): Promise<Blob> {
    await this.startRecording();

    // Play from start to end
    const duration = this.calculateTotalDuration();
    Tone.Transport.stop();
    Tone.Transport.position = 0;
    Tone.Transport.start();

    // Wait for playback to complete
    await new Promise(resolve => setTimeout(resolve, duration * 1000));

    Tone.Transport.stop();
    return await this.stopRecording();
  }

  private calculateTotalDuration(): number {
    let maxDuration = 0;
    this.tracks.forEach(track => {
      track.clips.forEach(clip => {
        const endTime = clip.startTime + clip.duration;
        if (endTime > maxDuration) {
          maxDuration = endTime;
        }
      });
    });
    return maxDuration;
  }

  // Instrument methods
  setTrackInstrument(trackId: string, instrumentType: InstrumentType): void {
    const track = this.tracks.get(trackId);
    if (!track?.channel) return;

    // Dispose old instrument
    if (track.instrument) {
      track.instrument.dispose();
    }

    // Create new instrument
    const instrument = createInstrument(instrumentType);
    instrument.connect(track.channel);

    track.instrument = instrument;
    track.instrumentType = instrumentType;
  }

  playNote(trackId: string, note: string, duration: string = '8n', velocity: number = 1): void {
    const track = this.tracks.get(trackId);
    if (!track?.instrument) return;

    const now = Tone.now();

    // Use duck typing instead of instanceof
    if (track.instrument && typeof track.instrument.triggerAttackRelease === 'function') {
      track.instrument.triggerAttackRelease(note, duration, now, velocity);
    }
  }

  async playInstrumentPreview(instrumentType: InstrumentType): Promise<void> {
    // Ensure audio context is started
    await Tone.start();

    if (!this.previewSynths.has(instrumentType)) {
      const synth = createInstrument(instrumentType);
      synth.toDestination();
      this.previewSynths.set(instrumentType, synth);
    }

    const synth = this.previewSynths.get(instrumentType);
    if (!synth) return;

    const note = DRUM_NOTES[instrumentType] || 'C4';
    const now = Tone.now();

    // NoiseSynth doesn't accept note parameter, just duration
    if (synth.constructor.name === 'NoiseSynth') {
      if (typeof (synth as any).triggerAttackRelease === 'function') {
        (synth as any).triggerAttackRelease('8n', now);
      }
    } else {
      // Use duck typing for other synths
      if (synth && typeof synth.triggerAttackRelease === 'function') {
        synth.triggerAttackRelease(note, '8n', now, 0.8);
      }
    }
  }

  scheduleNote(
    trackId: string,
    note: string,
    time: number,
    duration: number,
    velocity: number = 1
  ): void {
    const track = this.tracks.get(trackId);
    if (!track?.instrument) return;

    // Use duck typing instead of instanceof
    if (track.instrument && typeof track.instrument.triggerAttackRelease === 'function') {
      track.instrument.triggerAttackRelease(note, duration, time, velocity);
    }
  }

  dispose(): void {
    this.tracks.forEach(track => {
      track.clips.forEach(clip => {
        if (clip.player) {
          clip.player.dispose();
        }
      });
      track.effects.forEach(effect => {
        if (effect.node) {
          effect.node.dispose();
        }
      });
      if (track.channel) {
        track.channel.dispose();
      }
    });

    this.tracks.clear();
    this.masterChannel.dispose();
    Tone.Transport.stop();
  }
}

export default AudioEngine;
