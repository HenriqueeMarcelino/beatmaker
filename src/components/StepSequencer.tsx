import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import clsx from 'clsx';

const INSTRUMENTS = [
  { name: 'Kick', color: '#ef4444' },
  { name: 'Snare', color: '#f59e0b' },
  { name: 'Hi-Hat Closed', color: '#10b981' },
  { name: 'Hi-Hat Open', color: '#06b6d4' },
  { name: 'Clap', color: '#8b5cf6' },
  { name: 'Tom', color: '#ec4899' },
  { name: 'Cymbal', color: '#6366f1' },
  { name: 'Perc', color: '#14b8a6' },
];

const STEPS = 16;

export const StepSequencer: React.FC = () => {
  const { isPlaying } = useStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [pattern, setPattern] = useState<boolean[][]>(
    INSTRUMENTS.map(() => Array(STEPS).fill(false))
  );

  const toggleStep = (instrumentIndex: number, stepIndex: number) => {
    setPattern((prev) => {
      const newPattern = [...prev];
      newPattern[instrumentIndex] = [...newPattern[instrumentIndex]];
      newPattern[instrumentIndex][stepIndex] = !newPattern[instrumentIndex][stepIndex];
      return newPattern;
    });
  };

  const clearPattern = () => {
    setPattern(INSTRUMENTS.map(() => Array(STEPS).fill(false)));
  };

  const randomizePattern = () => {
    setPattern(
      INSTRUMENTS.map(() =>
        Array(STEPS)
          .fill(false)
          .map(() => Math.random() > 0.7)
      )
    );
  };

  React.useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        setCurrentStep((prev) => (prev + 1) % STEPS);
      }, 125); // 120 BPM, 16th notes

      return () => clearInterval(interval);
    }
  }, [isPlaying]);

  return (
    <div className="flex-1 overflow-auto bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-white text-xl font-semibold">Step Sequencer</h2>
          <div className="flex gap-2">
            <button
              onClick={clearPattern}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors text-sm"
            >
              Clear
            </button>
            <button
              onClick={randomizePattern}
              className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded transition-colors text-sm"
            >
              Randomize
            </button>
          </div>
        </div>

        {/* Step Grid */}
        <div className="bg-gray-800 rounded-lg p-4">
          {/* Step Numbers */}
          <div className="flex mb-2">
            <div className="w-32" />
            {Array.from({ length: STEPS }).map((_, i) => (
              <div
                key={i}
                className={clsx(
                  'flex-1 text-center text-xs font-medium',
                  i % 4 === 0 ? 'text-primary-400' : 'text-gray-500'
                )}
              >
                {i + 1}
              </div>
            ))}
          </div>

          {/* Instruments */}
          {INSTRUMENTS.map((instrument, instrumentIndex) => (
            <div key={instrument.name} className="flex items-center mb-2">
              {/* Instrument Name */}
              <div className="w-32 pr-4">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded"
                    style={{ backgroundColor: instrument.color }}
                  />
                  <span className="text-sm text-white font-medium">
                    {instrument.name}
                  </span>
                </div>
              </div>

              {/* Steps */}
              <div className="flex-1 flex gap-1">
                {Array.from({ length: STEPS }).map((_, stepIndex) => (
                  <button
                    key={stepIndex}
                    onClick={() => toggleStep(instrumentIndex, stepIndex)}
                    className={clsx(
                      'flex-1 aspect-square rounded transition-all',
                      pattern[instrumentIndex][stepIndex]
                        ? 'shadow-lg'
                        : 'bg-gray-700 hover:bg-gray-600',
                      currentStep === stepIndex && isPlaying
                        ? 'ring-2 ring-white'
                        : '',
                      stepIndex % 4 === 0 && 'ml-2'
                    )}
                    style={{
                      backgroundColor: pattern[instrumentIndex][stepIndex]
                        ? instrument.color
                        : undefined,
                    }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Info */}
        <div className="mt-4 text-center text-sm text-gray-400">
          Click on the grid to toggle steps. Press play to hear the pattern.
        </div>
      </div>
    </div>
  );
};
