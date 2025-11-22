import React, { useRef, useState } from 'react';
import {
  Plus,
  Upload,
  Download,
  Sliders,
  Music,
  Grid3x3,
  Piano,
  Settings,
  Zap,
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { InstrumentPicker } from './InstrumentPicker';
import { InstrumentType } from '../engine/InstrumentLibrary';
import clsx from 'clsx';

export const Toolbar: React.FC = () => {
  const {
    addTrack,
    addClip,
    tracks,
    viewMode,
    setViewMode,
    exportAudio,
    zoom,
    setZoom,
    setTrackInstrument,
  } = useStore();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showInstrumentPicker, setShowInstrumentPicker] = useState(false);

  const handleAddAudioTrack = () => {
    const colors = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899'];
    addTrack({
      name: `Audio ${tracks.length + 1}`,
      type: 'audio',
      volume: 0.8,
      pan: 0,
      muted: false,
      solo: false,
      color: colors[tracks.length % colors.length],
    });
  };

  const handleAddInstrumentTrack = () => {
    setShowInstrumentPicker(true);
  };

  const handleInstrumentSelect = (instrumentType: InstrumentType) => {
    const colors = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899'];
    const trackId = `track-${Date.now()}-${Math.random()}`;

    addTrack({
      name: `Instrument ${tracks.length + 1}`,
      type: 'instrument',
      volume: 0.8,
      pan: 0,
      muted: false,
      solo: false,
      color: colors[tracks.length % colors.length],
    });

    // Set instrument on the track we just created
    // We use the generated trackId from zustand's internal logic
    // by waiting and checking the last added track
    setTimeout(() => {
      const allTracks = useStore.getState().tracks;
      if (allTracks.length > 0) {
        const newTrack = allTracks[allTracks.length - 1];
        setTrackInstrument(newTrack.id, instrumentType);
      }
    }, 100);
  };

  const handleImportAudio = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create audio track if none exists
    if (tracks.length === 0) {
      handleAddAudioTrack();
    }

    // Wait for track to be added
    await new Promise((resolve) => setTimeout(resolve, 100));

    const targetTrack = tracks.find((t) => t.type === 'audio');
    if (targetTrack) {
      await addClip(
        targetTrack.id,
        {
          trackId: targetTrack.id,
          startTime: 0,
          duration: 4,
          offset: 0,
        },
        file
      );
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="bg-gray-800 border-b border-gray-700">
      <div className="flex items-center justify-between px-4 py-2">
        {/* Left Section - Add Tracks */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleAddAudioTrack}
            className="flex items-center gap-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors text-sm"
          >
            <Plus className="w-4 h-4" />
            Audio Track
          </button>

          <button
            onClick={handleAddInstrumentTrack}
            className="flex items-center gap-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors text-sm"
          >
            <Music className="w-4 h-4" />
            Instrument
          </button>

          <div className="w-px h-6 bg-gray-700" />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-3 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded transition-colors text-sm"
          >
            <Upload className="w-4 h-4" />
            Import Audio
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*"
            onChange={handleImportAudio}
            className="hidden"
          />
        </div>

        {/* Center Section - View Mode */}
        <div className="flex items-center gap-1 bg-gray-700 rounded p-1">
          <button
            onClick={() => setViewMode('timeline')}
            className={clsx(
              'flex items-center gap-2 px-3 py-1.5 rounded transition-colors text-sm',
              viewMode === 'timeline'
                ? 'bg-gray-900 text-white'
                : 'text-gray-400 hover:text-white'
            )}
          >
            <Grid3x3 className="w-4 h-4" />
            Timeline
          </button>

          <button
            onClick={() => setViewMode('piano-roll')}
            className={clsx(
              'flex items-center gap-2 px-3 py-1.5 rounded transition-colors text-sm',
              viewMode === 'piano-roll'
                ? 'bg-gray-900 text-white'
                : 'text-gray-400 hover:text-white'
            )}
          >
            <Piano className="w-4 h-4" />
            Piano Roll
          </button>

          <button
            onClick={() => setViewMode('step-sequencer')}
            className={clsx(
              'flex items-center gap-2 px-3 py-1.5 rounded transition-colors text-sm',
              viewMode === 'step-sequencer'
                ? 'bg-gray-900 text-white'
                : 'text-gray-400 hover:text-white'
            )}
          >
            <Zap className="w-4 h-4" />
            Step Seq
          </button>
        </div>

        {/* Right Section - Actions */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-2 bg-gray-700 rounded text-sm">
            <Sliders className="w-4 h-4 text-gray-400" />
            <span className="text-gray-400">Zoom:</span>
            <input
              type="range"
              min={0.5}
              max={3}
              step={0.1}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-24 h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-white w-8">{zoom.toFixed(1)}x</span>
          </div>

          <button
            onClick={exportAudio}
            className="flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition-colors text-sm"
          >
            <Download className="w-4 h-4" />
            Export
          </button>

          <button className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors">
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Instrument Picker Modal */}
      {showInstrumentPicker && (
        <InstrumentPicker
          onSelect={handleInstrumentSelect}
          onClose={() => setShowInstrumentPicker(false)}
        />
      )}
    </div>
  );
};
