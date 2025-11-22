import React from 'react';
import { Transport } from './components/Transport';
import { Toolbar } from './components/Toolbar';
import { Timeline } from './components/Timeline';
import { PianoRoll } from './components/PianoRoll';
import { StepSequencer } from './components/StepSequencer';
import { TrackMixer } from './components/TrackMixer';
import { EffectsPanel } from './components/EffectsPanel';
import { useStore } from './store/useStore';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';

function App() {
  const { viewMode } = useStore();
  useKeyboardShortcuts();

  return (
    <div className="h-screen flex flex-col bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">B</span>
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
              BeatMaker
            </h1>
          </div>
          <span className="text-gray-500 text-sm">Web DAW</span>
        </div>
      </header>

      {/* Transport Controls */}
      <Transport />

      {/* Toolbar */}
      <Toolbar />

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Main View */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {viewMode === 'timeline' && <Timeline />}
          {viewMode === 'piano-roll' && <PianoRoll />}
          {viewMode === 'step-sequencer' && <StepSequencer />}
        </div>

        {/* Right Panels */}
        <TrackMixer />
        <EffectsPanel />
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 border-t border-gray-700 px-4 py-2">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <div>
            Sistema de produção musical web - Inspirado em FL Studio, LMMS e Cakewalk
          </div>
          <div className="flex items-center gap-4">
            <span>Web Audio API</span>
            <span>•</span>
            <span>Tone.js</span>
            <span>•</span>
            <span>React</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
