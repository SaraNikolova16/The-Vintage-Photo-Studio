import React from 'react';
import './Homepage.css';
import Navbar from './Navbar';
import PhotoString from './PhotoString';
import PostageStamps from './PostageStamps';
import RecordPlayer from './RecordPlayer';
import FloatingPostcard from './FloatingPostcard';  // ADD THIS LINE


function Homepage({ currentSong, setCurrentSong, isPlaying, togglePlayPause, playerRef }) {
  return (
    <div className="homepage">
      {/* Sticky Navigation */}
      <Navbar />

      {/* Main Content Area */}
      <main className="main-content">
        {/* Hanging Photos on String */}
        <PhotoString />

        {/* Postage Stamps Grid */}
        <PostageStamps />
      </main>

      {/* Footer */}
      <footer className="footer">
        <p> ｡꩜⋆˚ Made and designed by Sara ⋆˚꩜｡ </p>
      </footer>

      {/* Fixed Bottom Right Features */}
      
      <RecordPlayer
        currentSong={currentSong}
        setCurrentSong={setCurrentSong}
        isPlaying={isPlaying}
        togglePlayPause={togglePlayPause}
        playerRef={playerRef}   
      />
      <FloatingPostcard /> {/* ADD THIS COMPONENT */}

    </div>
  );
}

export default Homepage;
