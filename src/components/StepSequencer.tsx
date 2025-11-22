import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { useStore } from '../store/useStore';
import { getDrumInstruments } from '../engine/InstrumentLibrary';
import AudioEngine from '../engine/AudioEngine';
import clsx from 'clsx';

const STEPS = 16;
const DRUM_INSTRUMENTS = getDrumInstruments();

export const StepSequencer: React.FC = () => {
  const { isPlaying, tempo, stepSequencerPattern, setStepSequencerPattern } = useStore();
  const [currentStep, setCurrentStep] = useState(0);
  const audioEngine = useRef(AudioEngine.getInstance());
  const sequenceRef = useRef<number | null>(null);

  // Initialize pattern if empty
  const pattern = stepSequencerPattern.length > 0
    ? stepSequencerPattern
    : DRUM_INSTRUMENTS.map(() => Array(STEPS).fill(false));

  const setPattern = (newPattern: boolean[][] | ((prev: boolean[][]) => boolean[][])) => {
    if (typeof newPattern === 'function') {
      setStepSequencerPattern(newPattern(pattern));
    } else {
      setStepSequencerPattern(newPattern);
    }
  };

  const toggleStep = (instrumentIndex: number, stepIndex: number) => {
    setPattern((prev) => {
      const newPattern = [...prev];
      newPattern[instrumentIndex] = [...newPattern[instrumentIndex]];
      newPattern[instrumentIndex][stepIndex] = !newPattern[instrumentIndex][stepIndex];
      return newPattern;
    });
  };

  const clearPattern = () => {
    setPattern(DRUM_INSTRUMENTS.map(() => Array(STEPS).fill(false)));
  };

  const randomizePattern = () => {
    setPattern(
      DRUM_INSTRUMENTS.map(() =>
        Array(STEPS)
          .fill(false)
          .map(() => Math.random() > 0.7)
      )
    );
  };

  const previewInstrument = (instrumentIndex: number) => {
    const instrument = DRUM_INSTRUMENTS[instrumentIndex];
    audioEngine.current.playInstrumentPreview(instrument.type);
  };

  useEffect(() => {
    if (!isPlaying) {
      setCurrentStep(0);
      if (sequenceRef.current !== null) {
        Tone.Transport.clear(sequenceRef.current);
        sequenceRef.current = null;
      }
      return;
    }

    // Calculate step duration based on tempo
    const stepDuration = (60 / tempo) / 4; // 16th notes

    let step = 0;
    sequenceRef.current = Tone.Transport.scheduleRepeat((time) => {
      setCurrentStep(step);

      // Play all instruments that are active on this step
      pattern.forEach((instrumentPattern, instrumentIndex) => {
        if (instrumentPattern[step]) {
          const instrument = DRUM_INSTRUMENTS[instrumentIndex];
          audioEngine.current.playInstrumentPreview(instrument.type);
        }
      });

      step = (step + 1) % STEPS;
    }, stepDuration);

    return () => {
      if (sequenceRef.current !== null) {
        Tone.Transport.clear(sequenceRef.current);
        sequenceRef.current = null;
      }
    };
  }, [isPlaying, pattern, tempo]);

  return (
    <div className="flex-1 overflow-auto bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-white text-xl font-semibold">Step Sequencer</h2>
            <p className="text-gray-400 text-sm mt-1">
              Click on the grid to create drum patterns
            </p>
          </div>
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
            <div className="w-40" />
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
          {DRUM_INSTRUMENTS.map((instrument, instrumentIndex) => (
            <div key={instrument.type} className="flex items-center mb-2">
              {/* Instrument Name */}
              <div className="w-40 pr-4">
                <button
                  onClick={() => previewInstrument(instrumentIndex)}
                  className="w-full text-left hover:bg-gray-700 rounded px-2 py-1 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded"
                      style={{ backgroundColor: instrument.color }}
                    />
                    <span className="text-sm text-white font-medium">
                      {instrument.name}
                    </span>
                  </div>
                </button>
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
                        ? 'shadow-lg transform scale-95'
                        : 'bg-gray-700 hover:bg-gray-600',
                      currentStep === stepIndex && isPlaying
                        ? 'ring-2 ring-white ring-offset-2 ring-offset-gray-800'
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
        <div className="mt-4 p-4 bg-gray-800 rounded-lg">
          <div className="text-sm text-gray-300 space-y-1">
            <p>
              <span className="text-primary-400 font-medium">Tip:</span> Click on
              instrument names to preview sounds
            </p>
            <p>
              <span className="text-primary-400 font-medium">Tempo:</span> {tempo} BPM
            </p>
            <p>
              <span className="text-primary-400 font-medium">Resolution:</span> 16 steps
              (16th notes)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
