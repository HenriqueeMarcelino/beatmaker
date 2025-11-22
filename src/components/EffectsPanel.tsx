import React, { useState } from 'react';
import { Plus, X, Power } from 'lucide-react';
import { useStore } from '../store/useStore';
import { Effect } from '../engine/AudioEngine';
import clsx from 'clsx';

const EFFECT_TYPES: Effect['type'][] = [
  'reverb',
  'delay',
  'eq',
  'compressor',
  'distortion',
  'filter',
  'chorus',
  'phaser',
];

const EFFECT_PRESETS: Record<Effect['type'], Record<string, number>> = {
  reverb: { decay: 1.5, preDelay: 0.01, wet: 0.3 },
  delay: { delayTime: 0.25, feedback: 0.5, wet: 0.3 },
  eq: { low: 0, mid: 0, high: 0, lowFrequency: 400, highFrequency: 2500 },
  compressor: { threshold: -24, ratio: 4, attack: 0.003, release: 0.25 },
  distortion: { distortion: 0.4, wet: 0.5 },
  filter: { frequency: 1000, Q: 1 },
  chorus: { frequency: 1.5, delayTime: 3.5, depth: 0.7, wet: 0.3 },
  phaser: { frequency: 0.5, octaves: 3, baseFrequency: 350, wet: 0.3 },
};

export const EffectsPanel: React.FC = () => {
  const { tracks, selectedTrackId, addEffect, removeEffect, updateEffect } = useStore();
  const [showAddEffect, setShowAddEffect] = useState(false);

  const selectedTrack = tracks.find((t) => t.id === selectedTrackId);

  if (!selectedTrackId || !selectedTrack) {
    return (
      <div className="w-80 bg-gray-800 border-l border-gray-700 flex items-center justify-center">
        <div className="text-center p-4">
          <p className="text-gray-400 text-sm mb-2">No track selected</p>
          <p className="text-gray-500 text-xs">
            Select a track to view and edit effects
          </p>
        </div>
      </div>
    );
  }

  const handleAddEffect = (type: Effect['type']) => {
    addEffect(selectedTrackId, {
      type,
      enabled: true,
      params: EFFECT_PRESETS[type],
    });
    setShowAddEffect(false);
  };

  return (
    <div className="w-80 bg-gray-800 border-l border-gray-700 overflow-y-auto">
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <h2 className="text-white font-semibold">Effects</h2>
          <button
            onClick={() => setShowAddEffect(!showAddEffect)}
            className="p-1.5 bg-primary-600 hover:bg-primary-700 rounded text-white transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {showAddEffect && (
          <div className="mt-3 grid grid-cols-2 gap-2">
            {EFFECT_TYPES.map((type) => (
              <button
                key={type}
                onClick={() => handleAddEffect(type)}
                className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded text-white text-xs capitalize transition-colors"
              >
                {type}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="p-4 space-y-3">
        {selectedTrack.effects.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400 text-sm">No effects added</p>
            <p className="text-gray-500 text-xs mt-1">
              Click + to add an effect
            </p>
          </div>
        ) : (
          selectedTrack.effects.map((effect) => (
            <div
              key={effect.id}
              className="bg-gray-700 rounded-lg p-3 border border-gray-600"
            >
              {/* Effect Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      updateEffect(selectedTrackId, effect.id, {
                        enabled: !effect.enabled,
                      })
                    }
                    className={clsx(
                      'p-1 rounded transition-colors',
                      effect.enabled
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-600 text-gray-400'
                    )}
                  >
                    <Power className="w-3 h-3" />
                  </button>
                  <span className="text-white text-sm font-medium capitalize">
                    {effect.type}
                  </span>
                </div>
                <button
                  onClick={() => removeEffect(selectedTrackId, effect.id)}
                  className="p-1 hover:bg-gray-600 rounded text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Effect Parameters */}
              <div className="space-y-2">
                {Object.entries(effect.params).map(([param, value]) => (
                  <div key={param}>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs text-gray-300 capitalize">
                        {param}
                      </label>
                      <span className="text-xs text-gray-400">
                        {typeof value === 'number' ? value.toFixed(2) : value}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={param.includes('frequency') ? 20000 : param === 'ratio' ? 20 : 1}
                      step={0.01}
                      value={value}
                      onChange={(e) => {
                        const newParams = { ...effect.params };
                        newParams[param] = Number(e.target.value);
                        updateEffect(selectedTrackId, effect.id, {
                          params: newParams,
                        });
                      }}
                      disabled={!effect.enabled}
                      className="w-full h-1.5 bg-gray-600 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
                    />
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
