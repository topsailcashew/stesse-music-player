import React, { useState, useEffect } from 'react';
import { useMusicPlayer } from '../context/MusicPlayerContext';
import GenreModal from './GenreModal';
import './GenreButton.css';

/**
 * Genre display names for tooltip
 */
const GENRE_NAMES = {
  'lofi': 'Lo-Fi Hip Hop',
  'classical': 'Classical/Piano',
  'ambient': 'Ambient/Electronic',
  'jazz': 'Jazz/Smooth Jazz',
  'bass': 'Bass Boosted',
  'chill-trap': 'Chill Trap',
};

/**
 * GenreButton - Floating button to open genre selector
 *
 * Features:
 * - Fixed position bottom-right (top-right on mobile)
 * - Settings/filter icon
 * - Current genre tooltip on hover
 * - Pulse animation on first load
 * - Opens GenreModal on click
 */
const GenreButton = () => {
  const { selectedGenre } = useMusicPlayer();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showPulse, setShowPulse] = useState(false);

  // Show pulse animation on first load (only once)
  useEffect(() => {
    const hasSeenPulse = localStorage.getItem('genreButtonPulseSeen');
    if (!hasSeenPulse) {
      setShowPulse(true);
      localStorage.setItem('genreButtonPulseSeen', 'true');

      // Stop pulsing after 5 seconds
      const timer = setTimeout(() => {
        setShowPulse(false);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, []);

  const handleClick = () => {
    setIsModalOpen(true);
    setShowPulse(false); // Stop pulsing when clicked
  };

  const handleClose = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <button
        className={`genre-button ${showPulse ? 'pulse' : ''}`}
        onClick={handleClick}
        aria-label={`Change genre (current: ${GENRE_NAMES[selectedGenre] || selectedGenre})`}
        title={`Current: ${GENRE_NAMES[selectedGenre] || selectedGenre}`}
      >
        {/* Headphones icon */}
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 18v-6a9 9 0 0 1 18 0v6"></path>
          <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"></path>
        </svg>
      </button>

      <GenreModal isOpen={isModalOpen} onClose={handleClose} />
    </>
  );
};

export default GenreButton;
