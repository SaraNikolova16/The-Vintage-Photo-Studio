import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import './RecordPlayer.css';

const API_KEY = process.env.REACT_APP_YOUTUBE_API_KEY;

function RecordPlayer({ currentSong, setCurrentSong, isPlaying, togglePlayPause, playerRef }) {
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState('landing'); // landing | search | player
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [popularSongs, setPopularSongs] = useState([]);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  // Fetch Popular Songs
  useEffect(() => {
    const fetchPopularSongs = async () => {
      try {
        const response = await axios.get(
          'https://www.googleapis.com/youtube/v3/videos',
          {
            params: {
              part: 'snippet,contentDetails',
              chart: 'mostPopular',
              regionCode: 'US',
              videoCategoryId: '10',
              maxResults: 8,
              key: API_KEY
            }
          }
        );
        const results = response.data.items.map(item => ({
          videoId: item.id,
          title: item.snippet.title,
          thumbnail: item.snippet.thumbnails.medium.url,
          channel: item.snippet.channelTitle
        }));
        setPopularSongs(results);
      } catch (error) {
        console.error('Error fetching popular songs:', error);
      }
    };
    fetchPopularSongs();
  }, []);

  // Progress bar sync
  useEffect(() => {
    if (!playerRef || !playerRef.current) return; // guard
    const interval = setInterval(() => {
      const currentTime = playerRef.current.getCurrentTime();
      const totalDuration = playerRef.current.getDuration();
      if (totalDuration > 0) {
        setProgress((currentTime / totalDuration) * 100);
        setDuration(totalDuration);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [playerRef]);

  const handleSeek = (e) => {
    if (!playerRef || !playerRef.current) return; // guard
    const newProgress = e.target.value;
    const newTime = (newProgress / 100) * duration;
    playerRef.current.seekTo(newTime, true);
    setProgress(newProgress);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Search YouTube
  const searchYouTube = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const response = await axios.get(
        'https://www.googleapis.com/youtube/v3/search',
        {
          params: {
            part: 'snippet',
            q: searchQuery + ' audio',
            type: 'video',
            maxResults: 10,
            key: API_KEY,
            videoCategoryId: '10'
          }
        }
      );
      const results = response.data.items.map(item => ({
        videoId: item.id.videoId,
        title: item.snippet.title,
        thumbnail: item.snippet.thumbnails.medium.url,
        channel: item.snippet.channelTitle
      }));
      setSearchResults(results);
      setView('search');
    } catch (error) {
      console.error('YouTube search error:', error);
      alert('Search failed. Please check your API key.');
    } finally {
      setIsSearching(false);
    }
  };

  const playSong = (song) => {
    setCurrentSong(song);
    setSearchResults([]);
    setSearchQuery('');
    setView('player');
  };

  const togglePlayer = () => {
  setIsOpen(!isOpen);
  if (!isOpen) {
    setView(currentSong ? 'player' : 'landing'); // ✅ show player if a song is active
  }
};


  return (
    <>
      {/* Homepage Vinyl */}
      {!isOpen && (
        <motion.div
          className="record-player-home"
          onClick={togglePlayer}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <div className={`vinyl-record ${isPlaying ? 'spinning glowing' : ''}`}>
            {currentSong && (
              <img
                src={currentSong.thumbnail}
                alt={currentSong.title}
                className="vinyl-art"
              />
            )}
            <div className="vinyl-center"></div>
            <div className="vinyl-grooves"></div>
          </div>
        </motion.div>
      )}

      {/* Fullscreen Player */}
      <AnimatePresence>
        {isOpen && (
          <motion.div className="record-player-fullscreen">
            <motion.div className="player-container">
              <button className="close-button" onClick={togglePlayer}>✗</button>
              {view !== 'landing' && (
                <button className="back-button" onClick={() => setView('landing')}>⮜</button>
              )}

              {/* Search Bar */}
              <div className="search-bar">
                <input
                  type="text"
                  placeholder="Search for songs, artists, albums..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && searchYouTube()}
                  className="search-input-full"
                />
                <button 
                  onClick={searchYouTube} 
                  className="search-button"
                  disabled={isSearching}
                >
                  {isSearching ? '🧐' : '🔍︎'}
                </button>
              </div>

              {/* Landing View */}
              {view === 'landing' && (
                <div className="popular-section">
                  <h3>Popular Songs of the Week</h3>
                  <div className="popular-grid">
                    {popularSongs.slice(0, 9).map((song, index) => (
  <div 
    key={index} 
    className="popular-item" 
    onClick={() => playSong(song)}   // ✅ add this
  >
    <img src={song.thumbnail} alt={song.title} />
    <div className="popular-info">
      <p className="popular-title">{song.title}</p>
      <p className="popular-channel">{song.channel}</p>
    </div>
  </div>
))}

                  </div>
                </div>
              )}

              {/* Search Results View */}
              {view === 'search' && (
                <div className="search-results">
                  <h3>Results</h3>
                  <div className="results-list">
                    {searchResults.map((song, index) => (
  <div 
    key={index} 
    className="result-item" 
    onClick={() => playSong(song)}   // ✅ add this
  >
    <img src={song.thumbnail} alt={song.title} />
    <div className="result-info">
      <p className="result-title">{song.title}</p>
      <p className="result-channel">{song.channel}</p>
    </div>
  </div>
))}

                  </div>
                </div>
              )}

              {/* Record Player View */}
              {view === 'player' && currentSong && (
                <div className="record-player-view">
                  <div className="vinyl-side">
                    <div className={`vinyl-overlay ${isPlaying ? 'spinning glowing' : ''}`}>
                      <img src={currentSong.thumbnail} alt={currentSong.title} className="vinyl-art" />
                      <div className="vinyl-overlay-center"></div>
                    </div>
                    <div className={`tone-arm ${isPlaying ? 'playing' : ''}`}></div>
                  </div>

                  <div className="info-side">
                    <div className="track-info">
                      <h3 className="track-title">{currentSong.title}</h3>
                      <p className="track-artist">{currentSong.channel}</p>
                    </div>

                    <div className="progress-bar">
                      <span>{formatTime((progress / 100) * duration)}</span>
                      <input type="range" min="0" max="100" value={progress} onChange={handleSeek} />
                      <span>{formatTime(duration)}</span>
                    </div>

                    <div className="player-controls-full">
                      <button className="control-btn">⏮</button>
                      <button className="control-btn play-btn-large" onClick={togglePlayPause}>
                        {isPlaying ? '⏸' : '▶'}
                      </button>
                      <button className="control-btn">⏭</button>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default RecordPlayer;
