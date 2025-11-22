import * as Tone from 'tone';

export type InstrumentType =
  | 'kick'
  | 'snare'
  | 'hihat-closed'
  | 'hihat-open'
  | 'clap'
  | 'tom'
  | 'cymbal'
  | 'perc'
  | 'rimshot'
  | 'cowbell'
  | 'shaker'
  | 'bass-808'
  | 'synth-bass'
  | 'synth-lead'
  | 'synth-pad'
  | 'synth-pluck';

export interface InstrumentConfig {
  name: string;
  type: InstrumentType;
  color: string;
  category: 'drums' | 'synth';
  createSynth: () => Tone.Instrument;
}

// Drum Instruments
const createKick = (): Tone.MembraneSynth => {
  return new Tone.MembraneSynth({
    pitchDecay: 0.05,
    octaves: 10,
    oscillator: { type: 'sine' },
    envelope: {
      attack: 0.001,
      decay: 0.4,
      sustain: 0.01,
      release: 1.4,
      attackCurve: 'exponential'
    }
  });
};

const createSnare = (): Tone.NoiseSynth => {
  return new Tone.NoiseSynth({
    noise: { type: 'white' },
    envelope: {
      attack: 0.001,
      decay: 0.15,
      sustain: 0,
      release: 0.15
    },
    volume: -8 // Aumenta o volume
  });
};

const createHiHatClosed = (): Tone.MetalSynth => {
  return new Tone.MetalSynth({
    frequency: 200,
    envelope: {
      attack: 0.001,
      decay: 0.05,
      release: 0.01
    },
    harmonicity: 5.1,
    modulationIndex: 32,
    resonance: 4000,
    octaves: 1.5,
    volume: -12 // Ajusta volume
  });
};

const createHiHatOpen = (): Tone.MetalSynth => {
  return new Tone.MetalSynth({
    frequency: 200,
    envelope: {
      attack: 0.001,
      decay: 0.3,
      release: 0.3
    },
    harmonicity: 5.1,
    modulationIndex: 32,
    resonance: 4000,
    octaves: 1.5
  });
};

const createClap = (): Tone.NoiseSynth => {
  return new Tone.NoiseSynth({
    noise: { type: 'white' },
    envelope: {
      attack: 0.001,
      decay: 0.12,
      sustain: 0,
      release: 0.12
    },
    volume: -6 // Aumenta o volume
  });
};

const createTom = (): Tone.MembraneSynth => {
  return new Tone.MembraneSynth({
    pitchDecay: 0.08,
    octaves: 4,
    oscillator: { type: 'sine' },
    envelope: {
      attack: 0.001,
      decay: 0.5,
      sustain: 0.1,
      release: 0.5
    }
  });
};

const createCymbal = (): Tone.MetalSynth => {
  return new Tone.MetalSynth({
    frequency: 250,
    envelope: {
      attack: 0.001,
      decay: 1.4,
      release: 0.3
    },
    harmonicity: 5.1,
    modulationIndex: 64,
    resonance: 4000,
    octaves: 1.5
  });
};

const createPerc = (): Tone.Synth => {
  return new Tone.Synth({
    oscillator: { type: 'triangle' },
    envelope: {
      attack: 0.001,
      decay: 0.2,
      sustain: 0,
      release: 0.2
    }
  });
};

const createRimshot = (): Tone.MetalSynth => {
  return new Tone.MetalSynth({
    frequency: 800,
    envelope: {
      attack: 0.001,
      decay: 0.03,
      release: 0.01
    },
    harmonicity: 8,
    modulationIndex: 16,
    resonance: 2000,
    octaves: 0.5,
    volume: -10
  });
};

const createCowbell = (): Tone.MetalSynth => {
  return new Tone.MetalSynth({
    frequency: 540,
    envelope: {
      attack: 0.001,
      decay: 0.15,
      release: 0.08
    },
    harmonicity: 6,
    modulationIndex: 25,
    resonance: 3000,
    octaves: 1,
    volume: -8
  });
};

const createShaker = (): Tone.NoiseSynth => {
  return new Tone.NoiseSynth({
    noise: { type: 'white' },
    envelope: {
      attack: 0.001,
      decay: 0.05,
      sustain: 0,
      release: 0.05
    },
    volume: -12
  });
};

const createBass808 = (): Tone.MembraneSynth => {
  return new Tone.MembraneSynth({
    pitchDecay: 0.08,
    octaves: 6,
    oscillator: { type: 'sine' },
    envelope: {
      attack: 0.001,
      decay: 0.6,
      sustain: 0.01,
      release: 1.2,
      attackCurve: 'exponential'
    },
    volume: -3
  });
};

// Melodic Instruments
const createSynthBass = (): Tone.MonoSynth => {
  return new Tone.MonoSynth({
    oscillator: {
      type: 'sawtooth'
    },
    filter: {
      Q: 2,
      type: 'lowpass',
      rolloff: -24
    },
    envelope: {
      attack: 0.01,
      decay: 0.3,
      sustain: 0.4,
      release: 0.5
    },
    filterEnvelope: {
      attack: 0.01,
      decay: 0.1,
      sustain: 0.2,
      release: 0.3,
      baseFrequency: 100,
      octaves: 4
    }
  });
};

const createSynthLead = (): Tone.Synth => {
  return new Tone.Synth({
    oscillator: {
      type: 'square'
    },
    envelope: {
      attack: 0.005,
      decay: 0.1,
      sustain: 0.3,
      release: 0.3
    }
  });
};

const createSynthPad = (): Tone.PolySynth => {
  return new Tone.PolySynth(Tone.Synth, {
    oscillator: {
      type: 'sine'
    },
    envelope: {
      attack: 0.5,
      decay: 0.3,
      sustain: 0.8,
      release: 1.5
    }
  });
};

const createSynthPluck = (): Tone.PluckSynth => {
  return new Tone.PluckSynth({
    attackNoise: 1,
    dampening: 4000,
    resonance: 0.9
  });
};

// Instrument Library
export const INSTRUMENT_LIBRARY: Record<InstrumentType, InstrumentConfig> = {
  'kick': {
    name: 'Kick',
    type: 'kick',
    color: '#ef4444',
    category: 'drums',
    createSynth: createKick
  },
  'snare': {
    name: 'Snare',
    type: 'snare',
    color: '#f59e0b',
    category: 'drums',
    createSynth: createSnare
  },
  'hihat-closed': {
    name: 'Hi-Hat Closed',
    type: 'hihat-closed',
    color: '#10b981',
    category: 'drums',
    createSynth: createHiHatClosed
  },
  'hihat-open': {
    name: 'Hi-Hat Open',
    type: 'hihat-open',
    color: '#06b6d4',
    category: 'drums',
    createSynth: createHiHatOpen
  },
  'clap': {
    name: 'Clap',
    type: 'clap',
    color: '#8b5cf6',
    category: 'drums',
    createSynth: createClap
  },
  'tom': {
    name: 'Tom',
    type: 'tom',
    color: '#ec4899',
    category: 'drums',
    createSynth: createTom
  },
  'cymbal': {
    name: 'Cymbal',
    type: 'cymbal',
    color: '#6366f1',
    category: 'drums',
    createSynth: createCymbal
  },
  'perc': {
    name: 'Perc',
    type: 'perc',
    color: '#14b8a6',
    category: 'drums',
    createSynth: createPerc
  },
  'rimshot': {
    name: 'Rimshot',
    type: 'rimshot',
    color: '#f97316',
    category: 'drums',
    createSynth: createRimshot
  },
  'cowbell': {
    name: 'Cowbell',
    type: 'cowbell',
    color: '#fbbf24',
    category: 'drums',
    createSynth: createCowbell
  },
  'shaker': {
    name: 'Shaker',
    type: 'shaker',
    color: '#84cc16',
    category: 'drums',
    createSynth: createShaker
  },
  'bass-808': {
    name: '808 Bass',
    type: 'bass-808',
    color: '#dc2626',
    category: 'drums',
    createSynth: createBass808
  },
  'synth-bass': {
    name: 'Synth Bass',
    type: 'synth-bass',
    color: '#3b82f6',
    category: 'synth',
    createSynth: createSynthBass
  },
  'synth-lead': {
    name: 'Synth Lead',
    type: 'synth-lead',
    color: '#8b5cf6',
    category: 'synth',
    createSynth: createSynthLead
  },
  'synth-pad': {
    name: 'Synth Pad',
    type: 'synth-pad',
    color: '#06b6d4',
    category: 'synth',
    createSynth: createSynthPad
  },
  'synth-pluck': {
    name: 'Synth Pluck',
    type: 'synth-pluck',
    color: '#10b981',
    category: 'synth',
    createSynth: createSynthPluck
  }
};

// Helper to get drum instruments for step sequencer
export const getDrumInstruments = (): InstrumentConfig[] => {
  return Object.values(INSTRUMENT_LIBRARY).filter(i => i.category === 'drums');
};

// Helper to get synth instruments
export const getSynthInstruments = (): InstrumentConfig[] => {
  return Object.values(INSTRUMENT_LIBRARY).filter(i => i.category === 'synth');
};

// Helper to create an instrument by type
export const createInstrument = (type: InstrumentType): Tone.Instrument => {
  return INSTRUMENT_LIBRARY[type].createSynth();
};

// Note mapping for drums (always play the same note)
export const DRUM_NOTES: Record<InstrumentType, string> = {
  'kick': 'C1',
  'snare': 'D1',
  'hihat-closed': 'F#1',
  'hihat-open': 'A#1',
  'clap': 'E1',
  'tom': 'G1',
  'cymbal': 'C2',
  'perc': 'D2',
  'rimshot': 'C#1',
  'cowbell': 'D#2',
  'shaker': 'F1',
  'bass-808': 'C0',
  'synth-bass': 'C2',
  'synth-lead': 'C4',
  'synth-pad': 'C3',
  'synth-pluck': 'C4'
};
