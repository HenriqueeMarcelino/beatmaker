import { create } from 'zustand';
import * as Tone from 'tone';
import AudioEngine, { Track, Clip, Effect } from '../engine/AudioEngine';
import { InstrumentType } from '../engine/InstrumentLibrary';
import { generateId } from '../utils/generateId';

interface AppState {
  // Playback
  isPlaying: boolean;
  tempo: number;
  currentTime: number;
  loopEnabled: boolean;

  // Tracks
  tracks: Track[];
  selectedTrackId: string | null;

  // Step Sequencer
  stepSequencerPattern: boolean[][];
  setStepSequencerPattern: (pattern: boolean[][]) => void;

  // UI
  zoom: number;
  viewMode: 'timeline' | 'piano-roll' | 'step-sequencer';
  selectedClipId: string | null;

  // Master
  masterVolume: number;

  // Actions
  play: () => void;
  pause: () => void;
  stop: () => void;
  setTempo: (tempo: number) => void;
  setCurrentTime: (time: number) => void;
  toggleLoop: () => void;

  addTrack: (track: Omit<Track, 'id' | 'clips' | 'effects'>) => void;
  removeTrack: (trackId: string) => void;
  updateTrack: (trackId: string, updates: Partial<Track>) => void;
  setSelectedTrack: (trackId: string | null) => void;
  setTrackInstrument: (trackId: string, instrumentType: InstrumentType) => void;

  addClip: (trackId: string, clip: Omit<Clip, 'id'>, file?: File) => Promise<void>;
  removeClip: (trackId: string, clipId: string) => void;
  updateClip: (trackId: string, clipId: string, updates: Partial<Clip>) => void;
  duplicateClip: (trackId: string, clipId: string) => void;
  moveClipToTrack: (fromTrackId: string, toTrackId: string, clipId: string) => void;
  setSelectedClip: (clipId: string | null) => void;

  addEffect: (trackId: string, effect: Omit<Effect, 'id' | 'node'>) => void;
  removeEffect: (trackId: string, effectId: string) => void;
  updateEffect: (trackId: string, effectId: string, updates: Partial<Effect>) => void;

  setZoom: (zoom: number) => void;
  setViewMode: (mode: 'timeline' | 'piano-roll' | 'step-sequencer') => void;
  setMasterVolume: (volume: number) => void;

  exportAudio: () => Promise<void>;
}

const audioEngine = AudioEngine.getInstance();

export const useStore = create<AppState>((set, get) => ({
  // Initial state
  isPlaying: false,
  tempo: 120,
  currentTime: 0,
  loopEnabled: true,
  tracks: [],
  selectedTrackId: null,
  stepSequencerPattern: [],
  zoom: 1,
  viewMode: 'timeline',
  selectedClipId: null,
  masterVolume: 0.8,

  // Playback actions
  play: async () => {
    const state = get();
    await audioEngine.init();
    // Set step sequencer pattern before playing
    audioEngine.setStepSequencerPattern(state.stepSequencerPattern);
    await audioEngine.play();
    set({ isPlaying: true });
  },

  pause: () => {
    audioEngine.pause();
    set({ isPlaying: false });
  },

  stop: () => {
    audioEngine.stop();
    set({ isPlaying: false, currentTime: 0 });
  },

  setTempo: (tempo: number) => {
    audioEngine.setTempo(tempo);
    set({ tempo });
  },

  setCurrentTime: (time: number) => {
    set({ currentTime: time });
  },

  toggleLoop: () => {
    const newLoopEnabled = !get().loopEnabled;
    audioEngine.setLoop(newLoopEnabled, 0, 16); // Loop 16 seconds by default
    set({ loopEnabled: newLoopEnabled });
  },

  // Track actions
  addTrack: (trackData) => {
    const track: Track = {
      ...trackData,
      id: generateId('track'),
      clips: [],
      effects: [],
    };

    audioEngine.addTrack(track);
    set((state) => ({
      tracks: [...state.tracks, track],
    }));
  },

  removeTrack: (trackId: string) => {
    audioEngine.removeTrack(trackId);
    set((state) => ({
      tracks: state.tracks.filter((t) => t.id !== trackId),
      selectedTrackId: state.selectedTrackId === trackId ? null : state.selectedTrackId,
    }));
  },

  updateTrack: (trackId: string, updates: Partial<Track>) => {
    set((state) => ({
      tracks: state.tracks.map((t) =>
        t.id === trackId ? { ...t, ...updates } : t
      ),
    }));

    // Update audio engine
    if ('volume' in updates && updates.volume !== undefined) {
      audioEngine.setTrackVolume(trackId, updates.volume);
    }
    if ('pan' in updates && updates.pan !== undefined) {
      audioEngine.setTrackPan(trackId, updates.pan);
    }
    if ('muted' in updates && updates.muted !== undefined) {
      audioEngine.setTrackMute(trackId, updates.muted);
    }
    if ('solo' in updates && updates.solo !== undefined) {
      audioEngine.setTrackSolo(trackId, updates.solo);
    }
  },

  setSelectedTrack: (trackId: string | null) => {
    set({ selectedTrackId: trackId });
  },

  setTrackInstrument: (trackId: string, instrumentType: InstrumentType) => {
    audioEngine.setTrackInstrument(trackId, instrumentType);
    set((state) => ({
      tracks: state.tracks.map((t) =>
        t.id === trackId
          ? { ...t, instrumentType }
          : t
      ),
    }));
  },

  // Clip actions
  addClip: async (trackId: string, clipData, file?: File) => {
    const clip: Clip = {
      ...clipData,
      id: generateId('clip'),
    };

    if (file) {
      const buffer = await audioEngine.loadAudioFile(file);
      // Update clip duration to match actual audio file duration
      clip.duration = buffer.duration;
      await audioEngine.addAudioClip(trackId, clip, buffer);
    }

    set((state) => ({
      tracks: state.tracks.map((t) =>
        t.id === trackId
          ? { ...t, clips: [...t.clips, clip] }
          : t
      ),
    }));
  },

  removeClip: (trackId: string, clipId: string) => {
    audioEngine.removeClip(trackId, clipId);
    set((state) => ({
      tracks: state.tracks.map((t) =>
        t.id === trackId
          ? { ...t, clips: t.clips.filter((c) => c.id !== clipId) }
          : t
      ),
      selectedClipId: state.selectedClipId === clipId ? null : state.selectedClipId,
    }));
  },

  updateClip: (trackId: string, clipId: string, updates: Partial<Clip>) => {
    set((state) => ({
      tracks: state.tracks.map((t) =>
        t.id === trackId
          ? {
              ...t,
              clips: t.clips.map((c) =>
                c.id === clipId ? { ...c, ...updates } : c
              ),
            }
          : t
      ),
    }));
  },

  setSelectedClip: (clipId: string | null) => {
    set({ selectedClipId: clipId });
  },

  duplicateClip: (trackId: string, clipId: string) => {
    const state = get();
    const track = state.tracks.find((t) => t.id === trackId);
    if (!track) return;

    const originalClip = track.clips.find((c) => c.id === clipId);
    if (!originalClip) return;

    // Create duplicate with new ID and offset position
    const duplicatedClip: Clip = {
      ...originalClip,
      id: generateId('clip'),
      startTime: originalClip.startTime + originalClip.duration, // Place right after original
    };

    // If it's an audio clip with a player, create a new player for the duplicate
    if (originalClip.buffer && track.channel) {
      const player = new Tone.Player(originalClip.buffer).connect(track.channel);
      player.sync().start(duplicatedClip.startTime, duplicatedClip.offset, duplicatedClip.duration);
      duplicatedClip.player = player;
    }

    set((state) => ({
      tracks: state.tracks.map((t) =>
        t.id === trackId
          ? { ...t, clips: [...t.clips, duplicatedClip] }
          : t
      ),
    }));
  },

  moveClipToTrack: (fromTrackId: string, toTrackId: string, clipId: string) => {
    const state = get();
    const fromTrack = state.tracks.find((t) => t.id === fromTrackId);
    const toTrack = state.tracks.find((t) => t.id === toTrackId);

    if (!fromTrack || !toTrack || fromTrackId === toTrackId) return;

    const originalClip = fromTrack.clips.find((c) => c.id === clipId);
    if (!originalClip) return;

    // Create a new clip object for the new track
    const movedClip: Clip = {
      ...originalClip,
      trackId: toTrackId,
    };

    // Remove player from old clip
    if (originalClip.player) {
      originalClip.player.dispose();
    }

    // Create new player if it's an audio clip
    if (movedClip.buffer && toTrack.channel) {
      const player = new Tone.Player(movedClip.buffer).connect(toTrack.channel);
      player.sync();
      movedClip.player = player;
    }

    // Update audio engine
    audioEngine.removeClip(fromTrackId, clipId);
    if (movedClip.buffer) {
      audioEngine.addAudioClip(toTrackId, movedClip, movedClip.buffer);
    }

    set((state) => ({
      tracks: state.tracks.map((t) => {
        if (t.id === fromTrackId) {
          return { ...t, clips: t.clips.filter((c) => c.id !== clipId) };
        }
        if (t.id === toTrackId) {
          return { ...t, clips: [...t.clips, movedClip] };
        }
        return t;
      }),
    }));
  },

  // Effect actions
  addEffect: (trackId: string, effectData) => {
    const effect: Effect = {
      ...effectData,
      id: generateId('effect'),
    };

    audioEngine.addEffect(trackId, effect);

    set((state) => ({
      tracks: state.tracks.map((t) =>
        t.id === trackId
          ? { ...t, effects: [...t.effects, effect] }
          : t
      ),
    }));
  },

  removeEffect: (trackId: string, effectId: string) => {
    audioEngine.removeEffect(trackId, effectId);
    set((state) => ({
      tracks: state.tracks.map((t) =>
        t.id === trackId
          ? { ...t, effects: t.effects.filter((e) => e.id !== effectId) }
          : t
      ),
    }));
  },

  updateEffect: (trackId: string, effectId: string, updates: Partial<Effect>) => {
    set((state) => ({
      tracks: state.tracks.map((t) =>
        t.id === trackId
          ? {
              ...t,
              effects: t.effects.map((e) =>
                e.id === effectId ? { ...e, ...updates } : e
              ),
            }
          : t
      ),
    }));

    // Update audio engine parameters
    if (updates.params) {
      Object.entries(updates.params).forEach(([param, value]) => {
        audioEngine.updateEffectParam(trackId, effectId, param, value);
      });
    }
  },

  // UI actions
  setZoom: (zoom: number) => {
    set({ zoom });
  },

  setViewMode: (mode) => {
    set({ viewMode: mode });
  },

  setStepSequencerPattern: (pattern: boolean[][]) => {
    set({ stepSequencerPattern: pattern });
  },

  setMasterVolume: (volume: number) => {
    audioEngine.setMasterVolume(volume);
    set({ masterVolume: volume });
  },

  exportAudio: async () => {
    try {
      const state = get();
      // Set step sequencer pattern before exporting
      audioEngine.setStepSequencerPattern(state.stepSequencerPattern);
      const blob = await audioEngine.exportAudio();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `beatmaker-export-${Date.now()}.wav`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting audio:', error);
    }
  },
}));
