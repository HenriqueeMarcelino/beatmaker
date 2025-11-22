import React, { useState, useRef } from 'react';
import { useStore } from '../store/useStore';
import { ContextMenu } from './ContextMenu';
import Draggable from 'react-draggable';
import clsx from 'clsx';

type ResizeState = {
  trackId: string;
  clipId: string;
  edge: 'left' | 'right';
  initialX: number;
  initialStartTime: number;
  initialDuration: number;
} | null;

export const Timeline: React.FC = () => {
  const { tracks, zoom, selectedClipId, setSelectedClip, updateClip, removeClip, duplicateClip, moveClipToTrack, snapEnabled, snapDivision, tempo } = useStore();
  const [draggedClip, setDraggedClip] = useState<{ trackId: string; clipId: string; initialTrackIndex: number } | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; trackId: string; clipId: string } | null>(null);
  const [resizeState, setResizeState] = useState<ResizeState>(null);

  const pixelsPerSecond = 100 * zoom;
  const trackHeight = 80;
  const minClipDuration = 0.1; // Minimum 100ms

  // Calculate snap grid size in seconds
  const getSnapGrid = () => {
    if (!snapEnabled) return 0;
    // Calculate beat duration in seconds
    const beatDuration = 60 / tempo; // One quarter note
    return beatDuration / (snapDivision / 4); // Divide by division ratio
  };

  // Snap a time value to the grid
  const snapTime = (time: number) => {
    if (!snapEnabled) return time;
    const grid = getSnapGrid();
    return Math.round(time / grid) * grid;
  };

  const handleClipDrag = (trackId: string, clipId: string, data: { x: number; y: number }) => {
    const rawTime = Math.max(0, data.x / pixelsPerSecond);
    const newStartTime = snapTime(rawTime);
    updateClip(trackId, clipId, { startTime: newStartTime });
  };

  const handleClipDragStop = (originalTrackId: string, clipId: string, data: { x: number; y: number }, initialTrackIndex: number) => {
    // Calculate which track the clip was dropped on based on y position
    const trackIndex = Math.max(0, Math.min(tracks.length - 1, initialTrackIndex + Math.round(data.y / trackHeight)));
    const newTrackId = tracks[trackIndex]?.id;

    // If dropped on a different track, move it
    if (newTrackId && newTrackId !== originalTrackId) {
      const rawTime = Math.max(0, data.x / pixelsPerSecond);
      const newStartTime = snapTime(rawTime);
      moveClipToTrack(originalTrackId, newTrackId, clipId);
      updateClip(newTrackId, clipId, { startTime: newStartTime });
    }

    setDraggedClip(null);
  };

  const handleContextMenu = (e: React.MouseEvent, trackId: string, clipId: string) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      trackId,
      clipId,
    });
  };

  // Resize handlers
  const handleResizeStart = (
    e: React.MouseEvent,
    trackId: string,
    clipId: string,
    edge: 'left' | 'right'
  ) => {
    e.stopPropagation();
    const track = tracks.find(t => t.id === trackId);
    const clip = track?.clips.find(c => c.id === clipId);
    if (!clip) return;

    setResizeState({
      trackId,
      clipId,
      edge,
      initialX: e.clientX,
      initialStartTime: clip.startTime,
      initialDuration: clip.duration,
    });

    setSelectedClip(clipId);
  };

  const handleResizeMove = (e: MouseEvent) => {
    if (!resizeState) return;

    const deltaX = e.clientX - resizeState.initialX;
    const deltaTime = deltaX / pixelsPerSecond;

    if (resizeState.edge === 'left') {
      // Resizing from the left edge - change startTime and duration
      const rawStartTime = Math.max(0, resizeState.initialStartTime + deltaTime);
      const newStartTime = snapTime(rawStartTime);
      const actualDelta = newStartTime - resizeState.initialStartTime;
      const newDuration = Math.max(minClipDuration, resizeState.initialDuration - actualDelta);

      updateClip(resizeState.trackId, resizeState.clipId, {
        startTime: newStartTime,
        duration: newDuration,
      });
    } else {
      // Resizing from the right edge - only change duration
      const rawDuration = Math.max(minClipDuration, resizeState.initialDuration + deltaTime);
      const newDuration = snapTime(rawDuration);
      updateClip(resizeState.trackId, resizeState.clipId, {
        duration: newDuration,
      });
    }
  };

  const handleResizeEnd = () => {
    setResizeState(null);
  };

  // Add global mouse event listeners for resize
  React.useEffect(() => {
    if (resizeState) {
      window.addEventListener('mousemove', handleResizeMove);
      window.addEventListener('mouseup', handleResizeEnd);
      return () => {
        window.removeEventListener('mousemove', handleResizeMove);
        window.removeEventListener('mouseup', handleResizeEnd);
      };
    }
  }, [resizeState]);

  return (
    <div className="flex-1 overflow-auto bg-gray-900">
      {/* Timeline Ruler */}
      <div className="sticky top-0 z-10 bg-gray-800 border-b border-gray-700">
        <div className="h-8 flex items-center relative ml-48">
          {Array.from({ length: 100 }).map((_, i) => (
            <div
              key={i}
              className="text-xs text-gray-400 border-l border-gray-700 pl-1 flex-shrink-0"
              style={{
                width: `${pixelsPerSecond}px`,
                minWidth: `${pixelsPerSecond}px`
              }}
            >
              {i}s
            </div>
          ))}
        </div>
      </div>

      {/* Tracks */}
      <div className="relative">
        {tracks.map((track, trackIndex) => (
          <div
            key={track.id}
            className="border-b border-gray-800"
            style={{ height: '80px' }}
          >
            {/* Track Header */}
            <div className="absolute left-0 w-48 h-20 bg-gray-800 border-r border-gray-700 flex items-center px-4 z-10">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded"
                    style={{ backgroundColor: track.color }}
                  />
                  <span className="text-sm text-white font-medium truncate">
                    {track.name}
                  </span>
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {track.type === 'audio' ? 'Audio' : 'Instrument'}
                </div>
              </div>
            </div>

            {/* Track Content */}
            <div className="ml-48 relative h-20">
              {track.clips.map((clip) => (
                <Draggable
                  key={clip.id}
                  position={{ x: clip.startTime * pixelsPerSecond, y: 0 }}
                  onDrag={(e, data) => handleClipDrag(track.id, clip.id, data)}
                  onStart={() => setDraggedClip({ trackId: track.id, clipId: clip.id, initialTrackIndex: trackIndex })}
                  onStop={(e, data) => handleClipDragStop(track.id, clip.id, data, trackIndex)}
                  disabled={!!resizeState}
                >
                  <div
                    className={clsx(
                      'absolute top-2 h-16 rounded transition-all group',
                      resizeState ? 'cursor-default' : 'cursor-move',
                      selectedClipId === clip.id
                        ? 'ring-2 ring-primary-500'
                        : 'hover:ring-2 hover:ring-primary-400'
                    )}
                    style={{
                      width: `${clip.duration * pixelsPerSecond}px`,
                      backgroundColor: `${track.color}80`,
                      borderLeft: `3px solid ${track.color}`,
                    }}
                    onClick={() => setSelectedClip(clip.id)}
                    onContextMenu={(e) => handleContextMenu(e, track.id, clip.id)}
                  >
                    <div className="px-2 py-1 text-xs text-white truncate pointer-events-none">
                      Clip {clip.id.slice(-4)}
                    </div>

                    {/* Left Resize Handle */}
                    <div
                      className="absolute left-0 top-0 w-2 h-full cursor-ew-resize hover:bg-white hover:bg-opacity-30 transition-colors z-10"
                      onMouseDown={(e) => handleResizeStart(e, track.id, clip.id, 'left')}
                      title="Resize left edge"
                    />

                    {/* Right Resize Handle */}
                    <div
                      className="absolute right-0 top-0 w-2 h-full cursor-ew-resize hover:bg-white hover:bg-opacity-30 transition-colors z-10"
                      onMouseDown={(e) => handleResizeStart(e, track.id, clip.id, 'right')}
                      title="Resize right edge"
                    />
                  </div>
                </Draggable>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onDuplicate={() => duplicateClip(contextMenu.trackId, contextMenu.clipId)}
          onDelete={() => removeClip(contextMenu.trackId, contextMenu.clipId)}
          onClose={() => setContextMenu(null)}
        />
      )}
    </div>
  );
};
