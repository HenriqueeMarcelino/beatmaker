import { useEffect } from 'react';
import { useStore } from '../store/useStore';

export const useKeyboardShortcuts = () => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const { isPlaying, play, pause, saveProject, selectedClipId, tracks, removeClip, duplicateClip } = useStore.getState();

      // Prevent shortcuts when typing in inputs
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return;
      }

      // Spacebar: Play/Pause
      if (e.code === 'Space') {
        e.preventDefault();
        if (isPlaying) {
          pause();
        } else {
          play();
        }
        console.log('⌨️ Spacebar:', isPlaying ? 'Pause' : 'Play');
        return;
      }

      // Ctrl/Cmd + S: Save Project
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        saveProject();
        console.log('⌨️ Ctrl+S: Save Project');
        return;
      }

      // Delete/Backspace: Remove selected clip (already handled in Timeline, but global fallback)
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedClipId) {
        const track = tracks.find(t => t.clips.some(c => c.id === selectedClipId));
        if (track) {
          e.preventDefault();
          removeClip(track.id, selectedClipId);
          console.log('⌨️ Delete: Removed clip');
        }
        return;
      }

      // Ctrl/Cmd + D: Duplicate selected clip (already handled in Timeline, but global fallback)
      if ((e.ctrlKey || e.metaKey) && e.key === 'd' && selectedClipId) {
        e.preventDefault();
        const track = tracks.find(t => t.clips.some(c => c.id === selectedClipId));
        if (track) {
          duplicateClip(track.id, selectedClipId);
          console.log('⌨️ Ctrl+D: Duplicated clip');
        }
        return;
      }

      // Escape: Deselect clip
      if (e.key === 'Escape' && selectedClipId) {
        e.preventDefault();
        useStore.getState().setSelectedClip(null);
        console.log('⌨️ Escape: Deselected clip');
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
};
