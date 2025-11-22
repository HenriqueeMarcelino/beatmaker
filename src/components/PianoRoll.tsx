import React, { useState } from 'react';
import { useStore } from '../store/useStore';

const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const OCTAVES = [6, 5, 4, 3, 2, 1, 0];

export const PianoRoll: React.FC = () => {
  const { zoom, selectedClipId, tracks } = useStore();
  const [hoveredNote, setHoveredNote] = useState<number | null>(null);

  const pixelsPerBeat = 50 * zoom;
  const noteHeight = 20;

  const selectedClip = tracks
    .flatMap((t) => t.clips)
    .find((c) => c.id === selectedClipId);

  const notes = selectedClip?.notes || [];

  const allNotes = OCTAVES.flatMap((octave) =>
    NOTES.map((note, index) => ({
      name: `${note}${octave}`,
      pitch: octave * 12 + index,
      isBlack: note.includes('#'),
    }))
  );

  const handleNoteClick = (pitch: number, beat: number) => {
    // TODO: Add note to selected clip
    console.log('Add note:', { pitch, beat });
  };

  if (!selectedClipId) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <p className="text-gray-400 text-lg mb-2">No clip selected</p>
          <p className="text-gray-500 text-sm">
            Select a clip from the timeline to edit notes
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
                'border-b border-gray-700 flex items-center justify-end px-3 text-xs font-medium',
                note.isBlack
                  ? 'bg-gray-900 text-gray-400'
                  : 'bg-gray-800 text-gray-300',
                hoveredNote === note.pitch && 'bg-primary-900'
              )}
              style={{ height: `${noteHeight}px`, width: '60px' }}
              onMouseEnter={() => setHoveredNote(note.pitch)}
              onMouseLeave={() => setHoveredNote(null)}
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
                    className="absolute bg-primary-600 rounded cursor-move border border-primary-400"
                    style={{
                      left: `${n.startTime * pixelsPerBeat}px`,
                      width: `${n.duration * pixelsPerBeat}px`,
                      height: `${noteHeight - 2}px`,
                      top: '1px',
                    }}
                  />
                ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

function clsx(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
