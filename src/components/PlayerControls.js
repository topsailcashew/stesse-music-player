import React from 'react';
import {
  TbPlayerPlay,
  TbPlayerPause,
  TbPlayerSkipForward,
  TbPlayerSkipBack,
} from 'react-icons/tb';
import { ButtonGroup, Button } from 'react-bootstrap';
import { useMusicPlayer } from '../context/MusicPlayerContext';

const PlayerControls = () => {
  // Get state and actions from Context
  const {
    isPlaying,
    togglePlay,
    playNext,
    playPrevious,
  } = useMusicPlayer();

  return (
    <div className="minimal-controls">
      <ButtonGroup className="control-buttons" aria-label="Player controls">
        <Button
          size="lg"
          variant="link"
          onClick={playPrevious}
          title="Previous track"
          className="control-btn"
        >
          <TbPlayerSkipBack size={28} />
        </Button>

        <Button
          size="lg"
          variant="link"
          onClick={togglePlay}
          title={isPlaying ? "Pause" : "Play"}
          className="control-btn play-btn"
        >
          {isPlaying ? (
            <TbPlayerPause size={40} />
          ) : (
            <TbPlayerPlay size={40} />
          )}
        </Button>

        <Button
          size="lg"
          variant="link"
          onClick={playNext}
          title="Next track"
          className="control-btn"
        >
          <TbPlayerSkipForward size={28} />
        </Button>
      </ButtonGroup>
    </div>
  );
};

export default PlayerControls;
