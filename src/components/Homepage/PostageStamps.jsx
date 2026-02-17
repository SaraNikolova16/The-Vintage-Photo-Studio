import React from 'react';
import './PostageStamps.css';

function PostageStamps() {
  const stamps = [
    { id: 1, image: '/images/stamp1.png', link: '/fotokabinka/pocetok/fotokabinapocetok.html' },
    { id: 2, image: '/images/stamp2.png', link: '/kodak kamera/kamerapocetok.html' },
    { id: 3, image: '/images/stamp3.png', link: '/digitalna kamerka/index-digicam.html' },
    { id: 4, image: '/images/stamp4.png', link: '/vintagepolaroid/index-vintagepolaroid.html' }
  ];

  return (
    <div className="postage-stamps-section">
      <h2 className="stamps-title">Explore Our Cameras</h2>
      
      <div className="stamps-grid">
        {stamps.map((stamp, index) => (
          <a 
            key={stamp.id}
            href={stamp.link}
            className="stamp-link"
            style={{ animationDelay: `${index * 0.15}s` }}
          >
            {/* Just your stamp design - nothing else */}
            <img 
              src={stamp.image} 
              alt={`Camera ${index + 1}`}
              className="stamp-image"
            />
          </a>
        ))}
      </div>
    </div>
  );
}

export default PostageStamps;