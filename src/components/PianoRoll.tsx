import React, { useState, useRef } from 'react';
import { useStore } from '../store/useStore';
import AudioEngine from '../engine/AudioEngine';
import clsx from 'clsx';

const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const OCTAVES = [6, 5, 4, 3, 2, 1, 0];

export const PianoRoll: React.FC = () => {
  const { zoom, selectedClipId, tracks, addNote, removeNote, updateNote, tempo, snapEnabled, snapDivision } = useStore();
  const [hoveredNote, setHoveredNote] = useState<number | null>(null);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const audioEngine = useRef(AudioEngine.getInstance());

  const pixelsPerBeat = 50 * zoom;
  const noteHeight = 20;

  const selectedClip = tracks
    .flatMap((t) => t.clips)
    .find((c) => c.id === selectedClipId);

  const selectedTrack = tracks.find(t => t.clips.some(c => c.id === selectedClipId));

  const notes = selectedClip?.notes || [];

  const allNotes = OCTAVES.flatMap((octave) =>
    NOTES.map((note, index) => ({
      name: `${note}${octave}`,
      pitch: octave * 12 + index,
      isBlack: note.includes('#'),
    }))
  );

  // Calculate snap grid for notes
  const getSnapGrid = () => {
    if (!snapEnabled) return 0.25; // Default to 16th note if snap disabled
    const beatDuration = 1; // 1 beat = 1 quarter note
    return beatDuration / (snapDivision / 4); // Divide by division ratio
  };

  // Snap a beat value to the grid
  const snapBeat = (beat: number) => {
    if (!snapEnabled) return beat;
    const grid = getSnapGrid();
    return Math.round(beat / grid) * grid;
  };

  const handleNoteClick = (pitch: number, beat: number) => {
    if (!selectedClipId) return;

    // Check if there's already a note at this position
    const existingNote = notes.find(
      (n) => n.pitch === pitch && n.startTime === beat
    );

    if (existingNote) {
      // Remove existing note
      removeNote(selectedClipId, existingNote.id);
    } else {
      // Add new note
      const snappedBeat = snapBeat(beat);
      const duration = getSnapGrid(); // Default duration is one grid unit
      addNote(selectedClipId, {
        pitch,
        velocity: 0.8,
        startTime: snappedBeat,
        duration,
      });

      // Preview the note
      if (selectedTrack?.instrumentType) {
        audioEngine.current.playInstrumentPreview(selectedTrack.instrumentType);
      }
    }
  };

  const handleNoteRightClick = (e: React.MouseEvent, noteId: string) => {
    e.preventDefault();
    if (selectedClipId) {
      removeNote(selectedClipId, noteId);
    }
  };

  const handleKeyClick = (pitch: number) => {
    // Preview note when clicking piano key
    if (selectedTrack?.instrumentType) {
      audioEngine.current.playInstrumentPreview(selectedTrack.instrumentType);
    }
  };

  if (!selectedClipId) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <p className="text-gray-400 text-lg mb-2">No clip selected</p>
          <p className="text-gray-500 text-sm">
            Select an instrument clip from the timeline to edit notes
          </p>
        </div>
      </div>
    );
  }

  if (!selectedClip?.notes) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <p className="text-gray-400 text-lg mb-2">Audio clip selected</p>
          <p className="text-gray-500 text-sm">
            Piano Roll only works with instrument clips
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto bg-gray-900">
      <div className="flex">
        {/* Piano Keys */}
        <div className="sticky left-0 z-10 bg-gray-800 border-r border-gray-700">
          {allNotes.map((note) => (
            <div
              key={note.pitch}
              className={clsx(
                'border-b border-gray-700 flex items-center justify-end px-3 text-xs font-medium cursor-pointer transition-colors',
                note.isBlack
                  ? 'bg-gray-900 text-gray-400 hover:bg-gray-800'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700',
                hoveredNote === note.pitch && 'bg-primary-900'
              )}
              style={{ height: `${noteHeight}px`, width: '60px' }}
              onMouseEnter={() => setHoveredNote(note.pitch)}
              onMouseLeave={() => setHoveredNote(null)}
              onClick={() => handleKeyClick(note.pitch)}
            >
              {note.name}
            </div>
          ))}
        </div>

        {/* Note Grid */}
        <div className="relative">
          {allNotes.map((note, noteIndex) => (
            <div
              key={note.pitch}
              className="border-b border-gray-800 relative"
              style={{ height: `${noteHeight}px` }}
            >
              {Array.from({ length: 64 }).map((_, beatIndex) => (
                <div
                  key={beatIndex}
                  className={clsx(
                    'absolute border-r cursor-pointer transition-colors',
                    beatIndex % 4 === 0
                      ? 'border-gray-700'
                      : 'border-gray-800',
                    note.isBlack ? 'bg-gray-850' : 'bg-gray-900',
                    'hover:bg-primary-900'
                  )}
                  style={{
                    left: `${beatIndex * pixelsPerBeat}px`,
                    width: `${pixelsPerBeat}px`,
                    height: `${noteHeight}px`,
                  }}
                  onClick={() => handleNoteClick(note.pitch, beatIndex)}
                />
              ))}

              {/* Render existing notes */}
              {notes
                .filter((n) => n.pitch === note.pitch)
                .map((n) => (
                  <div
                    key={n.id}
                    className={clsx(
                      'absolute rounded cursor-pointer border transition-all',
                      selectedNoteId === n.id
                        ? 'bg-primary-500 border-primary-300 ring-2 ring-primary-400'
                        : 'bg-primary-600 border-primary-400 hover:bg-primary-500'
                    )}
                    style={{
                      left: `${n.startTime * pixelsPerBeat}px`,
                      width: `${n.duration * pixelsPerBeat}px`,
                      height: `${noteHeight - 2}px`,
                      top: '1px',
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedNoteId(n.id);
                    }}
                    onContextMenu={(e) => handleNoteRightClick(e, n.id)}
                  />
                ))}
            </div>
          ))}
        </div>
      </div>

      {/* Info Panel */}
      <div className="fixed bottom-4 right-4 bg-gray-800 rounded-lg p-4 shadow-lg border border-gray-700">
        <div className="text-sm text-gray-300 space-y-1">
          <p className="font-medium text-white mb-2">Piano Roll Controls</p>
          <p>
            <span className="text-primary-400">Click:</span> Add/remove note
          </p>
          <p>
            <span className="text-primary-400">Right-click:</span> Delete note
          </p>
          <p>
            <span className="text-primary-400">Piano keys:</span> Preview sound
          </p>
          <p className="pt-2 border-t border-gray-700">
            <span className="text-primary-400">Snap:</span>{' '}
            {snapEnabled ? `1/${snapDivision}` : 'Off'}
          </p>
          <p>
            <span className="text-primary-400">Notes:</span> {notes.length}
          </p>
        </div>
      </div>
    </div>
  );
};
