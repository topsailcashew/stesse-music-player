// App.js

import React from 'react';
import { MusicPlayerProvider } from './context/MusicPlayerContext';
import Player from './components/Player';
import GenreButton from './components/GenreButton';
import './App.css';

const App = () => {
  // Fetch function that uses the selected genre from Context
  const fetchPlaylist = async () => {
    // This will be called by the Provider, which has access to selectedGenre
    // For now, we'll let the Player handle the genre-specific fetching
    return [];
  };

  return (
    <MusicPlayerProvider fetchPlaylistFn={fetchPlaylist}>
      <div className="App">
        <Player />
        <GenreButton />
      </div>
    </MusicPlayerProvider>
  );
}

export default App;