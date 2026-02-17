import React from 'react';
import './Navbar.css';

function Navbar() {
  const scrollToExplore = (e) => {
    e.preventDefault();
    const exploreSection = document.querySelector('.postage-stamps-section');
    if (exploreSection) {
      exploreSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <nav className="navbar">
      <div className="logo-container">
        <img 
          src="/images/logo.png" 
          alt="Vintage Photo Studio Logo" 
          className="logo"
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'block';
          }}
        />
        <h1 className="logo-text" style={{ display: 'none' }}>
          The Vintage Photo Studio
        </h1>
      </div>
      
      <ul className="nav-links">
        <li><a href="/" className="active">Home</a></li>
        <li><a href="#explore" onClick={scrollToExplore}>Explore</a></li>
        <li><a href="/fotokabinka/pocetok/fotokabinapocetok.html">Photobooth</a></li>
        <li><a href="/kodak kamera/kamerapocetok.html">Kodak</a></li>
        <li><a href="/digitalna kamerka/index-digicam.html">DigiCam</a></li>
        <li><a href="/vintagepolaroid/index-vintagepolaroid.html">Polaroid</a></li>
      </ul>
    </nav>
  );
}

export default Navbar;