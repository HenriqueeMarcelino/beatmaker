import * as Tone from 'tone';

export type InstrumentType =
  | 'kick'
  | 'snare'
  | 'hihat-closed'
  | 'hihat-open'
  | 'hihat-pedal'
  | 'clap'
  | 'tom'
  | 'cymbal'
  | 'crash'
  | 'ride'
  | 'perc'
  | 'rimshot'
  | 'cowbell'
  | 'shaker'
  | 'tambourine'
  | 'clave'
  | 'timbale'
  | 'agogo'
  | 'triangle'
  | 'bass-808'
  | 'tom-high'
  | 'tom-mid'
  | 'tom-low'
  | 'conga-high'
  | 'conga-low'
  | 'bongo-high'
  | 'bongo-low'
  | 'woodblock'
  | 'bell'
  | 'china-cymbal'
  | 'splash-cymbal'
  | 'kick-deep'
  | 'snare-tight'
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

const createSnare = (): Tone.MetalSynth => {
  return new Tone.MetalSynth({
    frequency: 100,
    envelope: {
      attack: 0.001,
      decay: 0.2,
      release: 0.15
    },
    harmonicity: 3.5,
    modulationIndex: 40,
    resonance: 3000,
    octaves: 1.5,
    volume: -8
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

const createClap = (): Tone.MetalSynth => {
  return new Tone.MetalSynth({
    frequency: 150,
    envelope: {
      attack: 0.001,
      decay: 0.15,
      release: 0.1
    },
    harmonicity: 4,
    modulationIndex: 30,
    resonance: 2500,
    octaves: 1.2,
    volume: -6
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

const createShaker = (): Tone.MetalSynth => {
  return new Tone.MetalSynth({
    frequency: 400,
    envelope: {
      attack: 0.001,
      decay: 0.06,
      release: 0.04
    },
    harmonicity: 6,
    modulationIndex: 20,
    resonance: 5000,
    octaves: 1,
    volume: -12
  });
};

const createHiHatPedal = (): Tone.MetalSynth => {
  return new Tone.MetalSynth({
    frequency: 180,
    envelope: {
      attack: 0.001,
      decay: 0.04,
      release: 0.02
    },
    harmonicity: 4.5,
    modulationIndex: 25,
    resonance: 3500,
    octaves: 1.2,
    volume: -14
  });
};

const createCrash = (): Tone.MetalSynth => {
  return new Tone.MetalSynth({
    frequency: 300,
    envelope: {
      attack: 0.01,
      decay: 2.5,
      release: 0.8
    },
    harmonicity: 6,
    modulationIndex: 80,
    resonance: 5000,
    octaves: 2,
    volume: -6
  });
};

const createRide = (): Tone.MetalSynth => {
  return new Tone.MetalSynth({
    frequency: 280,
    envelope: {
      attack: 0.001,
      decay: 0.8,
      release: 0.4
    },
    harmonicity: 5.5,
    modulationIndex: 48,
    resonance: 4500,
    octaves: 1.8,
    volume: -8
  });
};

const createTambourine = (): Tone.MetalSynth => {
  return new Tone.MetalSynth({
    frequency: 500,
    envelope: {
      attack: 0.001,
      decay: 0.12,
      release: 0.08
    },
    harmonicity: 7,
    modulationIndex: 35,
    resonance: 6000,
    octaves: 1.5,
    volume: -10
  });
};

const createClave = (): Tone.Synth => {
  return new Tone.Synth({
    oscillator: { type: 'square' },
    envelope: {
      attack: 0.001,
      decay: 0.04,
      sustain: 0,
      release: 0.03
    },
    volume: -6
  });
};

const createTimbale = (): Tone.MetalSynth => {
  return new Tone.MetalSynth({
    frequency: 350,
    envelope: {
      attack: 0.001,
      decay: 0.25,
      release: 0.15
    },
    harmonicity: 6.5,
    modulationIndex: 45,
    resonance: 4200,
    octaves: 1.3,
    volume: -7
  });
};

const createAgogo = (): Tone.MetalSynth => {
  return new Tone.MetalSynth({
    frequency: 650,
    envelope: {
      attack: 0.001,
      decay: 0.15,
      release: 0.1
    },
    harmonicity: 8,
    modulationIndex: 30,
    resonance: 5500,
    octaves: 0.8,
    volume: -8
  });
};

const createTriangle = (): Tone.MetalSynth => {
  return new Tone.MetalSynth({
    frequency: 900,
    envelope: {
      attack: 0.001,
      decay: 0.6,
      release: 0.4
    },
    harmonicity: 9,
    modulationIndex: 20,
    resonance: 7000,
    octaves: 0.5,
    volume: -10
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

// NEW INSTRUMENTS - More variety for music production!

const createTomHigh = (): Tone.MembraneSynth => {
  return new Tone.MembraneSynth({
    pitchDecay: 0.04,
    octaves: 4,
    oscillator: { type: 'sine' },
    envelope: {
      attack: 0.001,
      decay: 0.15,
      sustain: 0.01,
      release: 0.3
    },
    volume: -5
  });
};

const createTomMid = (): Tone.MembraneSynth => {
  return new Tone.MembraneSynth({
    pitchDecay: 0.05,
    octaves: 5,
    oscillator: { type: 'sine' },
    envelope: {
      attack: 0.001,
      decay: 0.2,
      sustain: 0.01,
      release: 0.4
    },
    volume: -5
  });
};

const createTomLow = (): Tone.MembraneSynth => {
  return new Tone.MembraneSynth({
    pitchDecay: 0.06,
    octaves: 6,
    oscillator: { type: 'sine' },
    envelope: {
      attack: 0.001,
      decay: 0.3,
      sustain: 0.01,
      release: 0.5
    },
    volume: -4
  });
};

const createCongaHigh = (): Tone.MembraneSynth => {
  return new Tone.MembraneSynth({
    pitchDecay: 0.03,
    octaves: 3,
    oscillator: { type: 'triangle' },
    envelope: {
      attack: 0.001,
      decay: 0.12,
      sustain: 0,
      release: 0.08
    },
    volume: -7
  });
};

const createCongaLow = (): Tone.MembraneSynth => {
  return new Tone.MembraneSynth({
    pitchDecay: 0.04,
    octaves: 4,
    oscillator: { type: 'triangle' },
    envelope: {
      attack: 0.001,
      decay: 0.18,
      sustain: 0,
      release: 0.12
    },
    volume: -6
  });
};

const createBongoHigh = (): Tone.MembraneSynth => {
  return new Tone.MembraneSynth({
    pitchDecay: 0.02,
    octaves: 2.5,
    oscillator: { type: 'triangle' },
    envelope: {
      attack: 0.001,
      decay: 0.08,
      sustain: 0,
      release: 0.05
    },
    volume: -8
  });
};

const createBongoLow = (): Tone.MembraneSynth => {
  return new Tone.MembraneSynth({
    pitchDecay: 0.03,
    octaves: 3,
    oscillator: { type: 'triangle' },
    envelope: {
      attack: 0.001,
      decay: 0.12,
      sustain: 0,
      release: 0.08
    },
    volume: -7
  });
};

const createWoodblock = (): Tone.Synth => {
  return new Tone.Synth({
    oscillator: { type: 'square' },
    envelope: {
      attack: 0.001,
      decay: 0.02,
      sustain: 0,
      release: 0.02
    },
    volume: -4
  });
};

const createBell = (): Tone.MetalSynth => {
  return new Tone.MetalSynth({
    frequency: 800,
    envelope: {
      attack: 0.001,
      decay: 1.2,
      release: 0.8
    },
    harmonicity: 12,
    modulationIndex: 25,
    resonance: 8000,
    octaves: 0.5,
    volume: -12
  });
};

const createChinaCymbal = (): Tone.MetalSynth => {
  return new Tone.MetalSynth({
    frequency: 320,
    envelope: {
      attack: 0.005,
      decay: 2.0,
      release: 0.8
    },
    harmonicity: 4,
    modulationIndex: 90,
    resonance: 4500,
    octaves: 2.5,
    volume: -6
  });
};

const createSplashCymbal = (): Tone.MetalSynth => {
  return new Tone.MetalSynth({
    frequency: 400,
    envelope: {
      attack: 0.001,
      decay: 0.3,
      release: 0.15
    },
    harmonicity: 7,
    modulationIndex: 45,
    resonance: 6000,
    octaves: 1.2,
    volume: -9
  });
};

const createKickDeep = (): Tone.MembraneSynth => {
  return new Tone.MembraneSynth({
    pitchDecay: 0.08,
    octaves: 12,
    oscillator: { type: 'sine' },
    envelope: {
      attack: 0.001,
      decay: 0.6,
      sustain: 0,
      release: 1.8,
      attackCurve: 'exponential'
    },
    volume: 0
  });
};

const createSnareTight = (): Tone.MetalSynth => {
  return new Tone.MetalSynth({
    frequency: 150,
    envelope: {
      attack: 0.001,
      decay: 0.08,
      release: 0.05
    },
    harmonicity: 4.5,
    modulationIndex: 50,
    resonance: 4000,
    octaves: 1,
    volume: -6
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
  'hihat-pedal': {
    name: 'Hi-Hat Pedal',
    type: 'hihat-pedal',
    color: '#22d3ee',
    category: 'drums',
    createSynth: createHiHatPedal
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
  'crash': {
    name: 'Crash',
    type: 'crash',
    color: '#7c3aed',
    category: 'drums',
    createSynth: createCrash
  },
  'ride': {
    name: 'Ride',
    type: 'ride',
    color: '#4f46e5',
    category: 'drums',
    createSynth: createRide
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
  'tambourine': {
    name: 'Tambourine',
    type: 'tambourine',
    color: '#a3e635',
    category: 'drums',
    createSynth: createTambourine
  },
  'clave': {
    name: 'Clave',
    type: 'clave',
    color: '#fb923c',
    category: 'drums',
    createSynth: createClave
  },
  'timbale': {
    name: 'Timbale',
    type: 'timbale',
    color: '#f472b6',
    category: 'drums',
    createSynth: createTimbale
  },
  'agogo': {
    name: 'Agogo',
    type: 'agogo',
    color: '#facc15',
    category: 'drums',
    createSynth: createAgogo
  },
  'triangle': {
    name: 'Triangle',
    type: 'triangle',
    color: '#cbd5e1',
    category: 'drums',
    createSynth: createTriangle
  },
  'bass-808': {
    name: '808 Bass',
    type: 'bass-808',
    color: '#dc2626',
    category: 'drums',
    createSynth: createBass808
  },
  'tom-high': {
    name: 'Tom High',
    type: 'tom-high',
    color: '#f97316',
    category: 'drums',
    createSynth: createTomHigh
  },
  'tom-mid': {
    name: 'Tom Mid',
    type: 'tom-mid',
    color: '#fb923c',
    category: 'drums',
    createSynth: createTomMid
  },
  'tom-low': {
    name: 'Tom Low',
    type: 'tom-low',
    color: '#fdba74',
    category: 'drums',
    createSynth: createTomLow
  },
  'conga-high': {
    name: 'Conga High',
    type: 'conga-high',
    color: '#d946ef',
    category: 'drums',
    createSynth: createCongaHigh
  },
  'conga-low': {
    name: 'Conga Low',
    type: 'conga-low',
    color: '#e879f9',
    category: 'drums',
    createSynth: createCongaLow
  },
  'bongo-high': {
    name: 'Bongo High',
    type: 'bongo-high',
    color: '#c026d3',
    category: 'drums',
    createSynth: createBongoHigh
  },
  'bongo-low': {
    name: 'Bongo Low',
    type: 'bongo-low',
    color: '#d946ef',
    category: 'drums',
    createSynth: createBongoLow
  },
  'woodblock': {
    name: 'Woodblock',
    type: 'woodblock',
    color: '#92400e',
    category: 'drums',
    createSynth: createWoodblock
  },
  'bell': {
    name: 'Bell',
    type: 'bell',
    color: '#fde047',
    category: 'drums',
    createSynth: createBell
  },
  'china-cymbal': {
    name: 'China Cymbal',
    type: 'china-cymbal',
    color: '#818cf8',
    category: 'drums',
    createSynth: createChinaCymbal
  },
  'splash-cymbal': {
    name: 'Splash',
    type: 'splash-cymbal',
    color: '#a5b4fc',
    category: 'drums',
    createSynth: createSplashCymbal
  },
  'kick-deep': {
    name: 'Kick Deep',
    type: 'kick-deep',
    color: '#991b1b',
    category: 'drums',
    createSynth: createKickDeep
  },
  'snare-tight': {
    name: 'Snare Tight',
    type: 'snare-tight',
    color: '#ea580c',
    category: 'drums',
    createSynth: createSnareTight
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
  'hihat-pedal': 'G#1',
  'clap': 'E1',
  'tom': 'G1',
  'cymbal': 'C2',
  'crash': 'C#2',
  'ride': 'D#2',
  'perc': 'D2',
  'rimshot': 'C#1',
  'cowbell': 'E2',
  'shaker': 'F1',
  'tambourine': 'F#2',
  'clave': 'G2',
  'timbale': 'G#2',
  'agogo': 'A2',
  'triangle': 'A#2',
  'bass-808': 'C0',
  'tom-high': 'A1',
  'tom-mid': 'F1',
  'tom-low': 'D1',
  'conga-high': 'B1',
  'conga-low': 'G1',
  'bongo-high': 'C2',
  'bongo-low': 'A1',
  'woodblock': 'D2',
  'bell': 'E2',
  'china-cymbal': 'F2',
  'splash-cymbal': 'G2',
  'kick-deep': 'B0',
  'snare-tight': 'C#1',
  'synth-bass': 'C2',
  'synth-lead': 'C4',
  'synth-pad': 'C3',
  'synth-pluck': 'C4'
};
