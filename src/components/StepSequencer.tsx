import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { useStore } from '../store/useStore';
import { getDrumInstruments } from '../engine/InstrumentLibrary';
import AudioEngine from '../engine/AudioEngine';
import clsx from 'clsx';
import { Maximize2, Minimize2, X, Shuffle, Trash2, Undo2, Redo2 } from 'lucide-react';

const STEPS = 16;
const DRUM_INSTRUMENTS = getDrumInstruments();

export const StepSequencer: React.FC = () => {
  const {
    isPlaying,
    tempo,
    stepSequencerPattern,
    setStepSequencerPattern,
    isStepSequencerFullscreen,
    toggleStepSequencerFullscreen,
    undoStepSequencer,
    redoStepSequencer,
    stepSequencerHistoryIndex,
    stepSequencerHistory
  } = useStore();
  const [currentStep, setCurrentStep] = useState(0);
  const audioEngine = useRef(AudioEngine.getInstance());
  const sequenceRef = useRef<number | null>(null);

  // Initialize pattern if empty OR normalize to match current instrument count
  const normalizePattern = () => {
    if (stepSequencerPattern.length === 0) {
      // No pattern exists, create new one
      return DRUM_INSTRUMENTS.map(() => Array(STEPS).fill(false));
    }

    // Pattern exists but may have wrong size (from old version with fewer instruments)
    const normalized = [...stepSequencerPattern];

    // If pattern has fewer instruments than current library, add empty rows
    while (normalized.length < DRUM_INSTRUMENTS.length) {
      normalized.push(Array(STEPS).fill(false));
    }

    // If pattern has more instruments than current library, trim it (shouldn't happen)
    if (normalized.length > DRUM_INSTRUMENTS.length) {
      normalized.length = DRUM_INSTRUMENTS.length;
    }

    return normalized;
  };

  const pattern = normalizePattern();

  // Persist normalized pattern if it was changed
  useEffect(() => {
    if (stepSequencerPattern.length !== DRUM_INSTRUMENTS.length) {
      console.log(`📊 Normalizing pattern: ${stepSequencerPattern.length} → ${DRUM_INSTRUMENTS.length} instruments`);
      setStepSequencerPattern(pattern);
    }
  }, []);

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

  // Use refs to avoid closure issues
  const patternRef = useRef(pattern);
  useEffect(() => {
    patternRef.current = pattern;
  }, [pattern]);

  // Throttle UI updates using requestAnimationFrame for better performance
  const rafIdRef = useRef<number | null>(null);
  const pendingStepRef = useRef<number | null>(null);

  const scheduleUIUpdate = (step: number) => {
    pendingStepRef.current = step;
    if (rafIdRef.current === null) {
      rafIdRef.current = requestAnimationFrame(() => {
        if (pendingStepRef.current !== null) {
          setCurrentStep(pendingStepRef.current);
          pendingStepRef.current = null;
        }
        rafIdRef.current = null;
      });
    }
  };

  useEffect(() => {
    // IMPORTANT: Clear ALL scheduled events to prevent ghost sounds
    Tone.Transport.cancel(0);
    sequenceRef.current = null;
    setCurrentStep(0);

    // Cancel any pending RAF
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }

    if (!isPlaying) {
      return;
    }

    // Calculate step duration based on tempo
    const stepDuration = (60 / tempo) / 4; // 16th notes

    let step = 0;

    // Create new sequence
    sequenceRef.current = Tone.Transport.scheduleRepeat((time) => {
      // Use ref to get current pattern (avoid stale closure)
      const currentPattern = patternRef.current;

      // Throttle UI updates using requestAnimationFrame
      scheduleUIUpdate(step);

      // Play all active instruments on this step
      currentPattern.forEach((instrumentPattern, instrumentIndex) => {
        if (instrumentPattern && instrumentPattern[step]) {
          const instrument = DRUM_INSTRUMENTS[instrumentIndex];
          if (instrument) {
            audioEngine.current.playInstrumentPreview(instrument.type);
          }
        }
      });

      step = (step + 1) % STEPS;
    }, stepDuration);

    console.log('🎵 Step Sequencer: Scheduler created (unlimited voices, RAF throttling, limiter enabled)');

    return () => {
      console.log('🧹 Step Sequencer: Cleaning up scheduler');
      if (sequenceRef.current !== null) {
        Tone.Transport.clear(sequenceRef.current);
        sequenceRef.current = null;
      }
      // Cancel any pending RAF
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
      // Extra safety: cancel all events
      Tone.Transport.cancel(0);
    };
  }, [isPlaying, tempo]); // Note: pattern is NOT in deps, we use ref instead

  // Fullscreen mode
  if (isStepSequencerFullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-gray-900 flex flex-col">
        {/* Fullscreen Header */}
        <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-white text-2xl font-bold">🥁 Step Sequencer</h1>
              <p className="text-gray-400 text-sm mt-1">
                {DRUM_INSTRUMENTS.length} instrumentos • 16 passos • {tempo} BPM
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={undoStepSequencer}
                disabled={stepSequencerHistoryIndex <= 0}
                className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors text-sm disabled:opacity-40 disabled:cursor-not-allowed"
                title="Desfazer (Ctrl+Z)"
              >
                <Undo2 className="w-4 h-4" />
                Desfazer
              </button>
              <button
                onClick={redoStepSequencer}
                disabled={stepSequencerHistoryIndex >= stepSequencerHistory.length - 1}
                className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors text-sm disabled:opacity-40 disabled:cursor-not-allowed"
                title="Refazer (Ctrl+Y)"
              >
                <Redo2 className="w-4 h-4" />
                Refazer
              </button>

              <div className="w-px h-6 bg-gray-600" />

              <button
                onClick={clearPattern}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors text-sm font-medium"
              >
                <Trash2 className="w-4 h-4" />
                Limpar
              </button>
              <button
                onClick={randomizePattern}
                className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded transition-colors text-sm font-medium"
              >
                <Shuffle className="w-4 h-4" />
                Randomizar
              </button>
              <button
                onClick={toggleStepSequencerFullscreen}
                className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors text-sm"
              >
                <Minimize2 className="w-4 h-4" />
                Sair
              </button>
            </div>
          </div>
        </div>

        {/* Fullscreen Grid */}
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto">
            <div className="bg-gray-800 rounded-lg p-6">
              {/* Step Numbers */}
              <div className="flex mb-3">
                <div className="w-48" />
                {Array.from({ length: STEPS }).map((_, i) => (
                  <div
                    key={i}
                    className={clsx(
                      'flex-1 text-center text-sm font-bold',
                      i % 4 === 0 ? 'text-primary-400' : 'text-gray-500'
                    )}
                  >
                    {i + 1}
                  </div>
                ))}
              </div>

              {/* Instruments Grid */}
              <div className="space-y-2">
                {DRUM_INSTRUMENTS.map((instrument, instrumentIndex) => (
                  <div key={instrument.type} className="flex items-center">
                    {/* Instrument Name */}
                    <div className="w-48 pr-4">
                      <button
                        onClick={() => previewInstrument(instrumentIndex)}
                        className="w-full text-left hover:bg-gray-700 rounded px-3 py-2 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-4 h-4 rounded shadow-lg"
                            style={{ backgroundColor: instrument.color }}
                          />
                          <span className="text-sm text-white font-medium">
                            {instrument.name}
                          </span>
                        </div>
                      </button>
                    </div>

                    {/* Steps */}
                    <div className="flex-1 flex gap-1.5">
                      {Array.from({ length: STEPS }).map((_, stepIndex) => (
                        <button
                          key={stepIndex}
                          onClick={() => toggleStep(instrumentIndex, stepIndex)}
                          className={clsx(
                            'flex-1 aspect-square rounded-lg transition-all',
                            pattern[instrumentIndex][stepIndex]
                              ? 'shadow-xl transform scale-95'
                              : 'bg-gray-700 hover:bg-gray-600 hover:scale-105',
                            currentStep === stepIndex && isPlaying
                              ? 'ring-4 ring-white ring-offset-2 ring-offset-gray-800'
                              : '',
                            stepIndex % 4 === 0 && 'ml-3'
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
            </div>

            {/* Legend */}
            <div className="mt-6 grid grid-cols-3 gap-4">
              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="text-white font-semibold mb-2">🎹 Controles</h3>
                <div className="text-sm text-gray-300 space-y-1">
                  <p>• Clique nos quadrados para ativar/desativar</p>
                  <p>• Clique no nome do instrumento para preview</p>
                  <p>• Pressione SPACE para Play/Pause</p>
                </div>
              </div>
              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="text-white font-semibold mb-2">🎵 Instrumentos</h3>
                <div className="text-sm text-gray-300 space-y-1">
                  <p>• {DRUM_INSTRUMENTS.length} sons diferentes</p>
                  <p>• Kicks, snares, hi-hats, cymbals</p>
                  <p>• Percussão e sons agudos</p>
                </div>
              </div>
              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="text-white font-semibold mb-2">⚡ Dicas</h3>
                <div className="text-sm text-gray-300 space-y-1">
                  <p>• Use Randomizar para inspiração</p>
                  <p>• Combine sons graves e agudos</p>
                  <p>• Experimente padrões diferentes</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Normal mode
  return (
    <div className="flex-1 overflow-auto bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-white text-xl font-semibold">Step Sequencer</h2>
            <p className="text-gray-400 text-sm mt-1">
              {DRUM_INSTRUMENTS.length} instrumentos disponíveis • Clique para criar patterns
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={undoStepSequencer}
              disabled={stepSequencerHistoryIndex <= 0}
              className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors text-sm disabled:opacity-40 disabled:cursor-not-allowed"
              title="Desfazer (Ctrl+Z)"
            >
              <Undo2 className="w-4 h-4" />
            </button>
            <button
              onClick={redoStepSequencer}
              disabled={stepSequencerHistoryIndex >= stepSequencerHistory.length - 1}
              className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors text-sm disabled:opacity-40 disabled:cursor-not-allowed"
              title="Refazer (Ctrl+Y)"
            >
              <Redo2 className="w-4 h-4" />
            </button>
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
            <button
              onClick={toggleStepSequencerFullscreen}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition-colors text-sm font-medium"
            >
              <Maximize2 className="w-4 h-4" />
              Tela Cheia
            </button>
          </div>
        </div>

        {/* Step Grid - Scrollable to show all 20 instruments */}
        <div className="bg-gray-800 rounded-lg p-4 max-h-[600px] overflow-y-auto">
          {/* Step Numbers */}
          <div className="flex mb-2 sticky top-0 bg-gray-800 z-10 pb-2">
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
                    <span className="text-sm text-white font-medium truncate">
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
              <span className="text-primary-400 font-medium">💡 Dica:</span> Clique em "Tela Cheia" para ver todos os {DRUM_INSTRUMENTS.length} instrumentos de uma vez
            </p>
            <p>
              <span className="text-primary-400 font-medium">Tempo:</span> {tempo} BPM
            </p>
            <p>
              <span className="text-primary-400 font-medium">Resolução:</span> 16 steps (16th notes)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
