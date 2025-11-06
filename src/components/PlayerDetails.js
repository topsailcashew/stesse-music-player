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

  // Get album image
  const getAlbumImage = () => {
    if (currentTrack?.coverUrl) {
      return currentTrack.coverUrl;
    }
    return "https://source.unsplash.com/featured/400x400";
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
