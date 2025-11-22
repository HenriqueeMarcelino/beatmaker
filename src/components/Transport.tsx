import React from 'react';
import { Play, Pause, Square, SkipBack } from 'lucide-react';
import { useStore } from '../store/useStore';

export const Transport: React.FC = () => {
  const { isPlaying, tempo, play, pause, stop, setTempo } = useStore();

  return (
    <div className="flex items-center gap-4 bg-gray-800 p-4 border-b border-gray-700">
      {/* Playback Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={stop}
          className="p-2 hover:bg-gray-700 rounded transition-colors"
          title="Stop"
        >
          <SkipBack className="w-5 h-5 text-gray-300" />
        </button>

        {!isPlaying ? (
          <button
            onClick={play}
            className="p-3 bg-primary-600 hover:bg-primary-700 rounded-full transition-colors"
            title="Play"
          >
            <Play className="w-6 h-6 text-white fill-white" />
          </button>
        ) : (
          <button
            onClick={pause}
            className="p-3 bg-primary-600 hover:bg-primary-700 rounded-full transition-colors"
            title="Pause"
          >
            <Pause className="w-6 h-6 text-white fill-white" />
          </button>
        )}

        <button
          onClick={stop}
          className="p-2 hover:bg-gray-700 rounded transition-colors"
          title="Stop"
        >
          <Square className="w-5 h-5 text-gray-300 fill-gray-300" />
        </button>
      </div>

      {/* Tempo Control */}
      <div className="flex items-center gap-2 border-l border-gray-700 pl-4">
        <label className="text-gray-300 text-sm font-medium">BPM</label>
        <input
          type="number"
          value={tempo}
          onChange={(e) => setTempo(Number(e.target.value))}
          min={40}
          max={240}
          className="w-20 px-3 py-1 bg-gray-700 text-white rounded border border-gray-600 focus:border-primary-500 focus:outline-none"
        />
      </div>

      {/* Time Display */}
      <div className="flex items-center gap-2 border-l border-gray-700 pl-4">
        <div className="text-gray-300 font-mono text-sm">
          00:00:00
        </div>
      </div>
    </div>
  );
};
