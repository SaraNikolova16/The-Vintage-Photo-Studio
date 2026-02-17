import React, { useState, useRef } from 'react';
import YouTube from 'react-youtube';
import Homepage from './components/Homepage/Homepage';
import './App.css';

function App() {
  // Global player state
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const playerRef = useRef(null);

  // Control functions
  const togglePlayPause = () => {
    if (!playerRef.current) return;
    if (isPlaying) {
      playerRef.current.pauseVideo();
      setIsPlaying(false);
    } else {
      playerRef.current.playVideo();
      setIsPlaying(true);
    }
  };

  return (
    <div className="App">
      {/* Hidden YouTube player lives here */}
      {currentSong && (
        <YouTube
          videoId={currentSong.videoId}
          opts={{ playerVars: { autoplay: 1 } }}
          onReady={(e) => { playerRef.current = e.target; }}
          onStateChange={(e) => setIsPlaying(e.data === 1)}
          style={{ display: 'none' }}
        />
      )}

      {/* Homepage now receives props so it can control playback */}
      <Homepage
        currentSong={currentSong}
        setCurrentSong={setCurrentSong}
        isPlaying={isPlaying}
        togglePlayPause={togglePlayPause}
        playerRef={playerRef}
      />
    </div>
  );
}

export default App;
