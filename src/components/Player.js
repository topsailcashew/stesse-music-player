//Player.js

import React, { useEffect } from "react";
import { useQuery } from '@tanstack/react-query';
import Navigation from "./Navigation";
import PlayerDetails from "./PlayerDetails";
import { Container } from 'react-bootstrap';
import { useMusicPlayer } from '../context/MusicPlayerContext';
import { usePlayerPersistence } from '../hooks/useLocalStorage';
import { fetchPlaylistByGenre } from '../services/soundcloudApi';

const Player = () => {
  // Get player state and actions from Context
  const {
    selectedGenre,
    currentTrack,
    currentTime,
    volume,
    isShuffled,
    repeatMode,
    setPlaylist,
    changeVolume,
    seek,
  } = useMusicPlayer();

  const { savedState, savePlayerState } = usePlayerPersistence();

  // Fetch playlist based on selected genre using React Query
  const { data: playlistData, isLoading, isError, error } = useQuery({
    queryKey: ['playlist', selectedGenre],
    queryFn: () => fetchPlaylistByGenre(selectedGenre),
    staleTime: 10 * 60 * 1000, // 10 minutes
    cacheTime: 30 * 60 * 1000, // 30 minutes
  });

  // Update playlist in Context when data changes
  useEffect(() => {
    if (playlistData && playlistData.length > 0) {
      setPlaylist(playlistData);
    }
  }, [playlistData, setPlaylist]);

  // Load saved state on mount
  useEffect(() => {
    if (savedState.volume !== undefined) {
      changeVolume(savedState.volume);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  // Restore saved position when track loads
  useEffect(() => {
    if (
      currentTrack &&
      savedState.currentTrackId === currentTrack.id &&
      savedState.currentTime > 0
    ) {
      // Small delay to ensure audio is ready
      const timer = setTimeout(() => {
        seek(savedState.currentTime);
      }, 100);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTrack?.id]);

  // Save state periodically and on unmount
  useEffect(() => {
    const saveInterval = setInterval(() => {
      if (currentTrack) {
        savePlayerState({
          currentTrackId: currentTrack.id,
          currentTime: currentTime,
          volume: volume,
          isShuffled: isShuffled,
          repeatMode: repeatMode,
        });
      }
    }, 5000); // Save every 5 seconds

    return () => {
      clearInterval(saveInterval);
      // Final save on unmount
      if (currentTrack) {
        savePlayerState({
          currentTrackId: currentTrack.id,
          currentTime: currentTime,
          volume: volume,
          isShuffled: isShuffled,
          repeatMode: repeatMode,
        });
      }
    };
  }, [
    currentTime,
    volume,
    currentTrack,
    isShuffled,
    repeatMode,
    savePlayerState,
  ]);

  // Show loading state while fetching playlist
  if (isLoading) {
    return (
      <div className="d-flex align-items-center justify-content-center">
        <Container className="pt-4">
          <Navigation />
          <div className="text-center p-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3">Loading playlist...</p>
          </div>
        </Container>
      </div>
    );
  }

  // Show error state if fetch failed
  if (isError) {
    return (
      <div className="d-flex align-items-center justify-content-center">
        <Container className="pt-4">
          <Navigation />
          <div className="text-center p-5">
            <p className="text-danger">Failed to load playlist: {error?.message}</p>
            <button
              className="btn btn-primary mt-3"
              onClick={() => window.location.reload()}
            >
              Retry
            </button>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="d-flex align-items-center justify-content-center">
      <Container className="pt-4">
        <Navigation />
        <PlayerDetails />
      </Container>
    </div>
  );
};

export default Player;
