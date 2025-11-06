import React, { useEffect } from 'react';
import { useMusicPlayer } from '../context/MusicPlayerContext';
import './GenreModal.css';

/**
 * Genre data with icons, names, and descriptions
 * Based on design spec: 6 study/work music genres
 */
const GENRES = [
  {
    id: 'lofi',
    name: 'Lo-Fi Hip Hop',
    description: 'Chill beats for studying and focus',
    icon: '🎧',
  },
  {
    id: 'classical',
    name: 'Classical/Piano',
    description: 'Peaceful piano and classical music',
    icon: '🎹',
  },
  {
    id: 'ambient',
    name: 'Ambient/Electronic',
    description: 'Atmospheric sounds for concentration',
    icon: '🌊',
  },
  {
    id: 'jazz',
    name: 'Jazz/Smooth Jazz',
    description: 'Smooth jazz instrumentals',
    icon: '🎷',
  },
  {
    id: 'bass',
    name: 'Bass Boosted',
    description: 'Deep bass for productivity',
    icon: '🔊',
  },
  {
    id: 'chill-trap',
    name: 'Chill Trap',
    description: 'Melodic trap beats',
    icon: '🎵',
  },
];

/**
 * GenreModal - Modal overlay for genre selection
 *
 * Features:
 * - Grid layout (3 cols desktop, 2 tablet, 1 mobile)
 * - Click genre to update Context
 * - Close via X or backdrop click
 * - Smooth animations (fade/scale)
 */
const GenreModal = ({ isOpen, onClose }) => {
  const { selectedGenre, selectGenre } = useMusicPlayer();

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Handle genre selection
  const handleGenreClick = (genreId) => {
    selectGenre(genreId);
    onClose();
  };

  // Handle backdrop click
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="genre-modal-backdrop"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="genre-modal-title"
    >
      <div className="genre-modal">
        <div className="genre-modal-header">
          <h2 id="genre-modal-title">Select Genre</h2>
          <button
            className="genre-modal-close"
            onClick={onClose}
            aria-label="Close genre selector"
          >
            ✕
          </button>
        </div>

        <div className="genre-grid">
          {GENRES.map((genre) => (
            <button
              key={genre.id}
              className={`genre-card ${selectedGenre === genre.id ? 'active' : ''}`}
              onClick={() => handleGenreClick(genre.id)}
              aria-label={`Select ${genre.name}`}
              aria-pressed={selectedGenre === genre.id}
            >
              <div className="genre-icon">{genre.icon}</div>
              <h3 className="genre-name">{genre.name}</h3>
              <p className="genre-description">{genre.description}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GenreModal;
