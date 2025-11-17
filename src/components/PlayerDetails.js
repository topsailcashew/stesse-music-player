// PlayerDetails.js - Minimal Design

import React from "react";
import { Container, Image, Spinner, Alert } from 'react-bootstrap';
import { useMusicPlayer } from '../context/MusicPlayerContext';
import PlayerControls from "./PlayerControls";
import Seeker from "./Seeker";

function PlayerDetails() {
  // Get state from Context (only what's needed in this component)
  const {
    currentTrack,
    isPlaying,
    isLoading,
    error,
  } = useMusicPlayer();

  // Get high-quality album image
  const getAlbumImage = () => {
    if (currentTrack?.coverUrl) {
      // Replace small SoundCloud artwork with large version
      return currentTrack.coverUrl.replace('-large', '-t500x500').replace('large', 't500x500');
    }
    return "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800&q=90";
  };

  return (
    <Container fluid className="minimal-player">
      {/* Error messages */}
      {error && (
        <Alert variant="danger" className="error-alert">
          {error}
        </Alert>
      )}

      {/* Main content */}
      <div className="minimal-content">

        {/* Album Artwork - Centered */}
        <div className="album-container">
          {isLoading ? (
            <div className="loading-container">
              <Spinner animation="border" role="status" />
            </div>
          ) : (
            <div className={`album-artwork ${isPlaying ? 'playing' : 'paused'}`}>
              <Image
                src={getAlbumImage()}
                alt={currentTrack?.album || 'Album cover'}
                className="album-image"
              />
            </div>
          )}
        </div>

        {/* Artist Info - Bottom Left */}
        {currentTrack && (
          <div className="artist-info">
            <div className="artist-name">{currentTrack.artist || 'Unknown Artist'}</div>
            <div className="song-title">{currentTrack.title || 'Unknown Title'}</div>
          </div>
        )}

        {/* Seeker - Bottom Center */}
        <Seeker />

        {/* Player Controls - Bottom Center */}
        <PlayerControls />
      </div>
    </Container>
  );
}

export default PlayerDetails;
