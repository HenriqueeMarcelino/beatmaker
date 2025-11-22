import React, { useState } from 'react';
import { X, Play } from 'lucide-react';
import { INSTRUMENT_LIBRARY, InstrumentType } from '../engine/InstrumentLibrary';
import AudioEngine from '../engine/AudioEngine';
import clsx from 'clsx';

interface InstrumentPickerProps {
  onSelect: (instrumentType: InstrumentType) => void;
  onClose: () => void;
}

export const InstrumentPicker: React.FC<InstrumentPickerProps> = ({ onSelect, onClose }) => {
  const [selectedCategory, setSelectedCategory] = useState<'drums' | 'synth'>('drums');
  const audioEngine = AudioEngine.getInstance();

  const instruments = Object.values(INSTRUMENT_LIBRARY).filter(
    (inst) => inst.category === selectedCategory
  );

  const handlePreview = (type: InstrumentType) => {
    audioEngine.playInstrumentPreview(type);
  };

  const handleSelect = (type: InstrumentType) => {
    onSelect(type);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-white text-lg font-semibold">Choose Instrument</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-700 rounded transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Category Tabs */}
        <div className="flex border-b border-gray-700">
          <button
            onClick={() => setSelectedCategory('drums')}
            className={clsx(
              'flex-1 px-4 py-3 text-sm font-medium transition-colors',
              selectedCategory === 'drums'
                ? 'text-white border-b-2 border-primary-500 bg-gray-750'
                : 'text-gray-400 hover:text-white hover:bg-gray-750'
            )}
          >
            🥁 Drums
          </button>
          <button
            onClick={() => setSelectedCategory('synth')}
            className={clsx(
              'flex-1 px-4 py-3 text-sm font-medium transition-colors',
              selectedCategory === 'synth'
                ? 'text-white border-b-2 border-primary-500 bg-gray-750'
                : 'text-gray-400 hover:text-white hover:bg-gray-750'
            )}
          >
            🎹 Synths
          </button>
        </div>

        {/* Instrument Grid */}
        <div className="p-4 grid grid-cols-2 gap-3 max-h-96 overflow-y-auto">
          {instruments.map((instrument) => (
            <div
              key={instrument.type}
              className="bg-gray-700 rounded-lg p-4 hover:bg-gray-650 transition-colors border-2 border-transparent hover:border-primary-500"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: instrument.color }}
                  />
                  <h3 className="text-white font-medium">{instrument.name}</h3>
                </div>
                <button
                  onClick={() => handlePreview(instrument.type)}
                  className="p-1.5 bg-gray-600 hover:bg-primary-600 rounded transition-colors"
                  title="Preview sound"
                >
                  <Play className="w-3 h-3 text-white fill-white" />
                </button>
              </div>

              <button
                onClick={() => handleSelect(instrument.type)}
                className="w-full px-3 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded text-sm font-medium transition-colors"
              >
                Select
              </button>
            </div>
          ))}
        </div>

        {/* Info */}
        <div className="p-4 bg-gray-750 border-t border-gray-700 rounded-b-lg">
          <p className="text-xs text-gray-400">
            <span className="text-primary-400 font-medium">Tip:</span> Click the play
            button to preview each instrument sound
          </p>
        </div>
      </div>
    </div>
  );
};
