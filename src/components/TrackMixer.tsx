import React from 'react';
import { Volume2, VolumeX, Headphones } from 'lucide-react';
import { useStore } from '../store/useStore';
import clsx from 'clsx';

export const TrackMixer: React.FC = () => {
  const { tracks, updateTrack, selectedTrackId, setSelectedTrack } = useStore();

  return (
    <div className="w-80 bg-gray-800 border-l border-gray-700 overflow-y-auto">
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-white font-semibold">Mixer</h2>
      </div>

      <div className="p-4 space-y-4">
        {tracks.map((track) => (
          <div
            key={track.id}
            className={clsx(
              'p-3 rounded-lg border-2 transition-all cursor-pointer',
              selectedTrackId === track.id
                ? 'border-primary-500 bg-gray-700'
                : 'border-gray-700 bg-gray-750 hover:border-gray-600'
            )}
            onClick={() => setSelectedTrack(track.id)}
          >
            {/* Track Name */}
            <div className="flex items-center gap-2 mb-3">
              <div
                className="w-3 h-3 rounded"
                style={{ backgroundColor: track.color }}
              />
              <span className="text-sm text-white font-medium flex-1 truncate">
                {track.name}
              </span>
            </div>

            {/* Volume Fader */}
            <div className="mb-3">
              <label className="text-xs text-gray-400 mb-1 block">Volume</label>
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-gray-400" />
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={track.volume}
                  onChange={(e) =>
                    updateTrack(track.id, { volume: Number(e.target.value) })
                  }
                  className="flex-1 h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                />
                <span className="text-xs text-gray-400 w-10 text-right">
                  {Math.round(track.volume * 100)}%
                </span>
              </div>
            </div>

            {/* Pan Control */}
            <div className="mb-3">
              <label className="text-xs text-gray-400 mb-1 block">Pan</label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">L</span>
                <input
                  type="range"
                  min={-1}
                  max={1}
                  step={0.01}
                  value={track.pan}
                  onChange={(e) =>
                    updateTrack(track.id, { pan: Number(e.target.value) })
                  }
                  className="flex-1 h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                />
                <span className="text-xs text-gray-400">R</span>
              </div>
            </div>

            {/* Mute and Solo */}
            <div className="flex gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  updateTrack(track.id, { muted: !track.muted });
                }}
                className={clsx(
                  'flex-1 px-3 py-1.5 rounded text-xs font-medium transition-colors',
                  track.muted
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                )}
              >
                <VolumeX className="w-4 h-4 mx-auto" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  updateTrack(track.id, { solo: !track.solo });
                }}
                className={clsx(
                  'flex-1 px-3 py-1.5 rounded text-xs font-medium transition-colors',
                  track.solo
                    ? 'bg-yellow-600 text-white'
                    : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                )}
              >
                <Headphones className="w-4 h-4 mx-auto" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
