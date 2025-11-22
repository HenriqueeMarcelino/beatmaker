import React, { useRef, useState } from 'react';
import { useStore } from '../store/useStore';
import { ContextMenu } from './ContextMenu';
import Draggable from 'react-draggable';
import clsx from 'clsx';

export const Timeline: React.FC = () => {
  const { tracks, zoom, selectedClipId, setSelectedClip, updateClip, removeClip, duplicateClip } = useStore();
  const [draggedClip, setDraggedClip] = useState<{ trackId: string; clipId: string } | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; trackId: string; clipId: string } | null>(null);

  const pixelsPerSecond = 100 * zoom;

  const handleClipDrag = (trackId: string, clipId: string, data: { x: number; y: number }) => {
    const newStartTime = Math.max(0, data.x / pixelsPerSecond);
    updateClip(trackId, clipId, { startTime: newStartTime });
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

  return (
    <div className="flex-1 overflow-auto bg-gray-900">
      {/* Timeline Ruler */}
      <div className="sticky top-0 z-10 bg-gray-800 border-b border-gray-700">
        <div className="h-8 flex items-center px-4">
          {Array.from({ length: 100 }).map((_, i) => (
            <div
              key={i}
              className="text-xs text-gray-400"
              style={{ width: `${pixelsPerSecond}px` }}
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
                  axis="x"
                  position={{ x: clip.startTime * pixelsPerSecond, y: 0 }}
                  onDrag={(e, data) => handleClipDrag(track.id, clip.id, data)}
                  onStart={() => setDraggedClip({ trackId: track.id, clipId: clip.id })}
                  onStop={() => setDraggedClip(null)}
                  grid={[pixelsPerSecond / 16, 1]}
                >
                  <div
                    className={clsx(
                      'absolute top-2 h-16 rounded cursor-move transition-all',
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
                    <div className="px-2 py-1 text-xs text-white truncate">
                      Clip {clip.id.slice(-4)}
                    </div>
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
