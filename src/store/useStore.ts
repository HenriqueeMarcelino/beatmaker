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
  isRecordingMic: boolean;

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
  snapEnabled: boolean;
  snapDivision: number; // 1, 2, 4, 8, 16, 32

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

  addNote: (clipId: string, note: Omit<import('../engine/AudioEngine').Note, 'id'>) => void;
  removeNote: (clipId: string, noteId: string) => void;
  updateNote: (clipId: string, noteId: string, updates: Partial<import('../engine/AudioEngine').Note>) => void;

  addEffect: (trackId: string, effect: Omit<Effect, 'id' | 'node'>) => void;
  removeEffect: (trackId: string, effectId: string) => void;
  updateEffect: (trackId: string, effectId: string, updates: Partial<Effect>) => void;

  setZoom: (zoom: number) => void;
  setViewMode: (mode: 'timeline' | 'piano-roll' | 'step-sequencer') => void;
  setMasterVolume: (volume: number) => void;
  setSnapEnabled: (enabled: boolean) => void;
  setSnapDivision: (division: number) => void;

  exportAudio: () => Promise<void>;
  startMicRecording: () => Promise<void>;
  stopMicRecording: () => Promise<void>;

  saveProject: () => void;
  loadProject: (file: File) => Promise<void>;
}

const audioEngine = AudioEngine.getInstance();

export const useStore = create<AppState>((set, get) => ({
  // Initial state
  isPlaying: false,
  tempo: 120,
  currentTime: 0,
  loopEnabled: true,
  isRecordingMic: false,
  tracks: [],
  selectedTrackId: null,
  stepSequencerPattern: [],
  zoom: 1,
  viewMode: 'timeline',
  selectedClipId: null,
  snapEnabled: true,
  snapDivision: 16, // 16th notes by default
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
    } else if (clip.notes && clip.notes.length > 0) {
      // Instrument clip with MIDI notes
      audioEngine.addInstrumentClip(trackId, clip);
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

  // Note actions
  addNote: (clipId: string, noteData) => {
    const note: import('../engine/AudioEngine').Note = {
      ...noteData,
      id: generateId('note'),
    };

    set((state) => ({
      tracks: state.tracks.map((track) => ({
        ...track,
        clips: track.clips.map((clip) =>
          clip.id === clipId
            ? { ...clip, notes: [...(clip.notes || []), note] }
            : clip
        ),
      })),
    }));

    // Update AudioEngine for instrument clips
    const state = get();
    const track = state.tracks.find(t => t.clips.some(c => c.id === clipId));
    if (track) {
      const clip = track.clips.find(c => c.id === clipId);
      if (clip) {
        audioEngine.addInstrumentClip(track.id, clip);
      }
    }
  },

  removeNote: (clipId: string, noteId: string) => {
    set((state) => ({
      tracks: state.tracks.map((track) => ({
        ...track,
        clips: track.clips.map((clip) =>
          clip.id === clipId
            ? { ...clip, notes: (clip.notes || []).filter(n => n.id !== noteId) }
            : clip
        ),
      })),
    }));

    // Update AudioEngine for instrument clips
    const state = get();
    const track = state.tracks.find(t => t.clips.some(c => c.id === clipId));
    if (track) {
      const clip = track.clips.find(c => c.id === clipId);
      if (clip) {
        audioEngine.addInstrumentClip(track.id, clip);
      }
    }
  },

  updateNote: (clipId: string, noteId: string, updates) => {
    set((state) => ({
      tracks: state.tracks.map((track) => ({
        ...track,
        clips: track.clips.map((clip) =>
          clip.id === clipId
            ? {
                ...clip,
                notes: (clip.notes || []).map(n =>
                  n.id === noteId ? { ...n, ...updates } : n
                ),
              }
            : clip
        ),
      })),
    }));

    // Update AudioEngine for instrument clips
    const state = get();
    const track = state.tracks.find(t => t.clips.some(c => c.id === clipId));
    if (track) {
      const clip = track.clips.find(c => c.id === clipId);
      if (clip) {
        audioEngine.addInstrumentClip(track.id, clip);
      }
    }
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

  setSnapEnabled: (enabled: boolean) => {
    set({ snapEnabled: enabled });
  },

  setSnapDivision: (division: number) => {
    set({ snapDivision: division });
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

  startMicRecording: async () => {
    try {
      await audioEngine.startMicRecording();
      set({ isRecordingMic: true });
    } catch (error) {
      console.error('Error starting mic recording:', error);
      alert('Erro ao acessar microfone. Permissão negada?');
    }
  },

  stopMicRecording: async () => {
    try {
      const blob = await audioEngine.stopMicRecording();
      set({ isRecordingMic: false });

      // Convert blob to File
      const file = new File([blob], `recording-${Date.now()}.wav`, { type: 'audio/wav' });

      // Find or create an audio track
      const state = get();
      let targetTrack = state.tracks.find(t => t.type === 'audio');

      if (!targetTrack) {
        const colors = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899'];
        state.addTrack({
          name: `Recording ${state.tracks.length + 1}`,
          type: 'audio',
          volume: 0.8,
          pan: 0,
          muted: false,
          solo: false,
          color: colors[state.tracks.length % colors.length],
        });

        // Wait for track to be created
        await new Promise(resolve => setTimeout(resolve, 50));
        targetTrack = useStore.getState().tracks.find(t => t.type === 'audio');
      }

      if (targetTrack) {
        // Add the recording as a clip
        await state.addClip(
          targetTrack.id,
          {
            trackId: targetTrack.id,
            startTime: 0,
            duration: 0, // Will be set from buffer
            offset: 0,
          },
          file
        );
      }
    } catch (error) {
      console.error('Error stopping mic recording:', error);
      set({ isRecordingMic: false });
    }
  },

  saveProject: () => {
    const state = get();

    // Serialize project data
    const projectData = {
      version: '1.0.0',
      name: `Project-${Date.now()}`,
      tempo: state.tempo,
      loopEnabled: state.loopEnabled,
      zoom: state.zoom,
      masterVolume: state.masterVolume,
      stepSequencerPattern: state.stepSequencerPattern,
      tracks: state.tracks.map(track => ({
        id: track.id,
        name: track.name,
        type: track.type,
        volume: track.volume,
        pan: track.pan,
        muted: track.muted,
        solo: track.solo,
        color: track.color,
        instrumentType: track.instrumentType,
        clips: track.clips.map(clip => ({
          id: clip.id,
          trackId: clip.trackId,
          startTime: clip.startTime,
          duration: clip.duration,
          offset: clip.offset,
          notes: clip.notes,
          // Note: Audio buffers are not saved, users need to re-import files
        })),
        effects: track.effects.map(effect => ({
          id: effect.id,
          type: effect.type,
          enabled: effect.enabled,
          params: effect.params,
        })),
      })),
    };

    // Download as JSON
    const json = JSON.stringify(projectData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projectData.name}.bmp`;
    a.click();
    URL.revokeObjectURL(url);

    console.log('💾 Project saved:', projectData.name);
  },

  loadProject: async (file: File) => {
    try {
      const text = await file.text();
      const projectData = JSON.parse(text);

      console.log('📂 Loading project:', projectData);

      // Clear current project
      const state = get();
      state.tracks.forEach(track => {
        audioEngine.removeTrack(track.id);
      });

      // Restore state
      set({
        tempo: projectData.tempo || 120,
        loopEnabled: projectData.loopEnabled !== undefined ? projectData.loopEnabled : true,
        zoom: projectData.zoom || 1,
        masterVolume: projectData.masterVolume || 0.8,
        stepSequencerPattern: projectData.stepSequencerPattern || [],
        tracks: [],
      });

      // Set tempo in audio engine
      audioEngine.setTempo(projectData.tempo || 120);
      audioEngine.setMasterVolume(projectData.masterVolume || 0.8);

      // Restore tracks
      for (const trackData of projectData.tracks) {
        // Add track
        const track: Track = {
          id: trackData.id,
          name: trackData.name,
          type: trackData.type,
          volume: trackData.volume,
          pan: trackData.pan,
          muted: trackData.muted,
          solo: trackData.solo,
          color: trackData.color,
          clips: [],
          effects: [],
        };

        audioEngine.addTrack(track);

        // Set instrument if it's an instrument track
        if (trackData.instrumentType) {
          audioEngine.setTrackInstrument(track.id, trackData.instrumentType);
          track.instrumentType = trackData.instrumentType;
        }

        // Restore clips (except audio clips which need re-import)
        for (const clipData of trackData.clips) {
          if (clipData.notes && clipData.notes.length > 0) {
            // Instrument clip
            const clip: Clip = {
              id: clipData.id,
              trackId: clipData.trackId,
              startTime: clipData.startTime,
              duration: clipData.duration,
              offset: clipData.offset,
              notes: clipData.notes,
            };
            track.clips.push(clip);
            audioEngine.addInstrumentClip(track.id, clip);
          }
        }

        // Restore effects
        for (const effectData of trackData.effects) {
          const effect: Effect = {
            id: effectData.id,
            type: effectData.type,
            enabled: effectData.enabled,
            params: effectData.params,
          };
          const node = audioEngine.createEffect(effect.type, effect.params);
          effect.node = node;
          track.effects.push(effect);
          audioEngine.addEffect(track.id, effect);
        }

        set((state) => ({
          tracks: [...state.tracks, track],
        }));
      }

      console.log('✅ Project loaded successfully');
      alert(`Projeto carregado! ${projectData.tracks.length} tracks restauradas.\n\nNota: Clips de áudio precisam ser re-importados manualmente.`);
    } catch (error) {
      console.error('Error loading project:', error);
      alert('Erro ao carregar projeto. Arquivo inválido?');
    }
  },
}));
