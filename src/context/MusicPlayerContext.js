import React, { createContext, useContext, useEffect, useCallback } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import useAudioPlayer from '../hooks/useAudioPlayer';
import usePlaylist from '../hooks/usePlaylist';
import useLocalStorage from '../hooks/useLocalStorage';
import { resolveStreamUrl } from '../services/soundcloudApi';

/**
 * MusicPlayerContext - Manages global music player state
 * Combines audio playback, playlist management, and genre selection
 */
const MusicPlayerContext = createContext(undefined);

// Create QueryClient instance for React Query
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      cacheTime: 30 * 60 * 1000,      // 30 minutes
      staleTime: 10 * 60 * 1000,      // 10 minutes
      retry: 2,                        // 2 retry attempts
      refetchOnWindowFocus: true,      // Keep fresh
      refetchOnReconnect: true,
    },
  },
});

/**
 * MusicPlayerProvider - Provides music player state to entire app
 * Wraps children with Context and React Query providers
 */
export const MusicPlayerProvider = ({ children, fetchPlaylistFn }) => {
  // Persistent state for selected genre
  const [selectedGenre, setSelectedGenre] = useLocalStorage('selectedGenre', 'lofi');
  const [isMuted, setIsMuted] = useLocalStorage('isMuted', false);

  // Audio player hook
  const audioPlayer = useAudioPlayer(0.7);

  // Playlist hook
  const playlistHook = usePlaylist(fetchPlaylistFn);

  // Sync audio when current track changes
  useEffect(() => {
    const loadTrack = async () => {
      if (!playlistHook.currentTrack) return;

      try {
        // Resolve the actual stream URL from SoundCloud
        const streamUrl = await resolveStreamUrl(playlistHook.currentTrack);

        if (streamUrl) {
          audioPlayer.loadTrack(streamUrl);
        } else {
          console.error('Failed to resolve stream URL for track:', playlistHook.currentTrack.title);
        }
      } catch (error) {
        console.error('Error loading track:', error);
      }
    };

    loadTrack();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playlistHook.currentTrack?.id, audioPlayer.loadTrack]);

  // Auto-play next track when current track ends
  useEffect(() => {
    if (!audioPlayer.isPlaying && audioPlayer.currentTime === audioPlayer.duration && audioPlayer.duration > 0) {
      playlistHook.playNext();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioPlayer.isPlaying, audioPlayer.currentTime, audioPlayer.duration, playlistHook.playNext]);

  // Handle mute state
  const toggleMute = useCallback(() => {
    setIsMuted(prev => !prev);
    audioPlayer.toggleMute();
  }, [audioPlayer, setIsMuted]);

  // Genre selection
  const selectGenre = useCallback((genre) => {
    setSelectedGenre(genre);
  }, [setSelectedGenre]);

  // Combined context value
  const value = {
    // Audio state
    isPlaying: audioPlayer.isPlaying,
    currentTime: audioPlayer.currentTime,
    duration: audioPlayer.duration,
    volume: audioPlayer.volume,
    isLoading: audioPlayer.isLoading || playlistHook.isLoading,
    error: audioPlayer.error || playlistHook.error,
    playbackRate: audioPlayer.playbackRate,
    isMuted,

    // Playlist state
    playlist: playlistHook.playlist,
    currentTrack: playlistHook.currentTrack,
    currentIndex: playlistHook.currentIndex,
    isShuffled: playlistHook.isShuffled,
    repeatMode: playlistHook.repeatMode,
    searchQuery: playlistHook.searchQuery,

    // Genre state
    selectedGenre,

    // Audio actions
    togglePlay: audioPlayer.togglePlay,
    play: audioPlayer.play,
    pause: audioPlayer.pause,
    seek: audioPlayer.seek,
    changeVolume: audioPlayer.changeVolume,
    toggleMute,
    changePlaybackRate: audioPlayer.changePlaybackRate,

    // Playlist actions
    playNext: playlistHook.playNext,
    playPrevious: playlistHook.playPrevious,
    playTrackAtIndex: playlistHook.playTrackAtIndex,
    playTrackById: playlistHook.playTrackById,
    toggleShuffle: playlistHook.toggleShuffle,
    toggleRepeat: playlistHook.toggleRepeat,
    updateSearchQuery: playlistHook.updateSearchQuery,
    clearSearch: playlistHook.clearSearch,
    setPlaylist: playlistHook.setPlaylist,

    // Genre actions
    selectGenre,

    // Utilities
    formatTime: audioPlayer.formatTime,
  };

  return (
    <QueryClientProvider client={queryClient}>
      <MusicPlayerContext.Provider value={value}>
        {children}
      </MusicPlayerContext.Provider>
    </QueryClientProvider>
  );
};

/**
 * useMusicPlayer - Hook to access music player context
 * Throws error if used outside MusicPlayerProvider
 */
export const useMusicPlayer = () => {
  const context = useContext(MusicPlayerContext);

  if (context === undefined) {
    throw new Error('useMusicPlayer must be used within a MusicPlayerProvider');
  }

  return context;
};

export default MusicPlayerContext;
