import React, { useRef, useState } from 'react';
import { ProgressBar } from 'react-bootstrap';
import { useMusicPlayer } from '../context/MusicPlayerContext';

const Seeker = () => {
  // Get state and actions from Context
  const { currentTime, duration, seek, formatTime } = useMusicPlayer();

  const progressBarRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  // Calculate progress percentage
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  // Handle click on progress bar to seek
  const handleProgressClick = (e) => {
    if (!progressBarRef.current || duration === 0) return;

    const rect = progressBarRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    const newTime = percentage * duration;

    seek(Math.max(0, Math.min(duration, newTime)));
  };

  // Handle mouse down to start dragging
  const handleMouseDown = (e) => {
    setIsDragging(true);
    handleProgressClick(e);
  };

  // Handle mouse move while dragging
  const handleMouseMove = (e) => {
    if (!isDragging) return;
    handleProgressClick(e);
  };

  // Handle mouse up to stop dragging
  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Add global mouse event listeners for dragging
  React.useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);

      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDragging, duration]);

  return (
    <div className="minimal-seeker">
      <div
        ref={progressBarRef}
        onClick={handleProgressClick}
        onMouseDown={handleMouseDown}
        className="seeker-container"
      >
        <ProgressBar
          className="seeker-bar"
          now={progress}
        />
      </div>
      <div className="time-display">
        <span className="time-current">{formatTime(currentTime)}</span>
        <span className="time-duration">{formatTime(duration)}</span>
      </div>
    </div>
  );
};

export default Seeker;
