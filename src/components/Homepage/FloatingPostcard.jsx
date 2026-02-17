import React, { useState, useRef, useEffect } from 'react';
import './FloatingPostcard.css';
import html2canvas from 'html2canvas';

function FloatingPostcard() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isEditMode, setIsEditMode] = useState(true);
  
  // Front side data
  const [frontImage, setFrontImage] = useState(null);
  const [destination, setDestination] = useState('');
  const [textColor, setTextColor] = useState('#2c1810');
  
  // Back side data
  const [message, setMessage] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [senderName, setSenderName] = useState('');
  const [address, setAddress] = useState('');
  const [stamp, setStamp] = useState(null);
  
  // Photo strip (optional)
  const [photoStrip, setPhotoStrip] = useState([]);
  const [showPhotoStrip, setShowPhotoStrip] = useState(false);
  
  // Interaction states
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const dragStart = useRef({ x: 0, y: 0 });
  
  const postcardRef = useRef(null);
  const frontRef = useRef(null);
  const backRef = useRef(null);
  const fileInputRef = useRef(null);
  const stampInputRef = useRef(null);
  const photoStripInputRef = useRef(null);

  // Parallax tilt
  const handleMouseMove = (e) => {
    if (!postcardRef.current || isExpanded) return;
    const rect = postcardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) / rect.width;
    const y = (e.clientY - rect.top - rect.height / 2) / rect.height;
    setMousePosition({ x: x * 15, y: y * 15 });
  };

  const handleMouseLeave = () => {
    setMousePosition({ x: 0, y: 0 });
  };

  // Drag
  const handleDragStart = (e) => {
    if (isExpanded) return;
    e.preventDefault();
    setIsDragging(true);
    dragStart.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y
    };
  };

  const handleDrag = (e) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y
    });
  };

  const handleDragEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    setTimeout(() => setPosition({ x: 0, y: 0 }), 100);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleDrag);
      window.addEventListener('mouseup', handleDragEnd);
      return () => {
        window.removeEventListener('mousemove', handleDrag);
        window.removeEventListener('mouseup', handleDragEnd);
      };
    }
  }, [isDragging]);

  // Click handling
  const handlePostcardClick = () => {
    if (isDragging) return;
    if (!isExpanded) {
      setIsExpanded(true);
    } else {
      setIsFlipped(!isFlipped);
    }
  };

  const handleClose = (e) => {
    e.stopPropagation();
    setIsExpanded(false);
    setIsFlipped(false);
  };

  // Image uploads
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => setFrontImage(event.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleStampUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => setStamp(event.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handlePhotoStripUpload = (e) => {
    const files = Array.from(e.target.files).slice(0, 4);
    const readers = files.map(file => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (event) => resolve(event.target.result);
        reader.readAsDataURL(file);
      });
    });
    Promise.all(readers).then(images => {
      setPhotoStrip(images);
      setShowPhotoStrip(true);
    });
  };

  // Toggle modes
  const toggleEditMode = (e) => {
    e.stopPropagation();
    setIsEditMode(!isEditMode);
  };

  // Download function
  const downloadSide = async (side) => {
    const element = side === 'front' ? frontRef.current : backRef.current;
    if (!element) return;

    try {
      const canvas = await html2canvas(element, {
        backgroundColor: '#fef9f3',
        scale: 2,
        logging: false
      });
      
      const link = document.createElement('a');
      link.download = `postcard-${side}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  // Share function - generates link
  const sharePostcard = () => {
    const data = {
      frontImage,
      destination,
      textColor,
      message,
      recipientName,
      senderName,
      address,
      stamp,
      photoStrip,
      showPhotoStrip
    };
    
    const encoded = btoa(JSON.stringify(data));
    const shareUrl = `${window.location.origin}${window.location.pathname}?postcard=${encoded}`;
    
    navigator.clipboard.writeText(shareUrl).then(() => {
      alert('✨ Link copied to clipboard! Share it with anyone!');
    });
  };

  // Restart function
  const restartPostcard = (e) => {
    e.stopPropagation();
    if (window.confirm('Start fresh? This will clear all your content.')) {
      setFrontImage(null);
      setDestination('');
      setMessage('');
      setRecipientName('');
      setSenderName('');
      setAddress('');
      setStamp(null);
      setPhotoStrip([]);
      setShowPhotoStrip(false);
      setIsEditMode(true);
    }
  };

  // Load from URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const postcardData = params.get('postcard');
    if (postcardData) {
      try {
        const data = JSON.parse(atob(postcardData));
        setFrontImage(data.frontImage);
        setDestination(data.destination);
        setTextColor(data.textColor);
        setMessage(data.message);
        setRecipientName(data.recipientName);
        setSenderName(data.senderName);
        setAddress(data.address);
        setStamp(data.stamp);
        setPhotoStrip(data.photoStrip || []);
        setShowPhotoStrip(data.showPhotoStrip || false);
        setIsEditMode(false);
        setIsExpanded(true);
      } catch (e) {
        console.error('Failed to load postcard:', e);
      }
    }
  }, []);

  return (
    <>
      {/* Dust particles */}
      <div className="dust-particles">
        {[...Array(20)].map((_, i) => (
          <div key={i} className="dust-particle" style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${5 + Math.random() * 10}s`
          }} />
        ))}
      </div>

      {/* Vignette */}
      {isExpanded && <div className="postcard-vignette" onClick={handleClose} />}

      {/* Action buttons - Right side when expanded */}
      {isExpanded && (
        <div className="postcard-actions">
          <button className="action-btn download-front" onClick={() => downloadSide('front')} title="Download Front">
            <span className="btn-icon">⭳</span>
            <span className="btn-label">Front</span>
          </button>
          <button className="action-btn download-back" onClick={() => downloadSide('back')} title="Download Back">
            <span className="btn-icon">⭳</span>
            <span className="btn-label">Back</span>
          </button>
          <button className="action-btn share-btn" onClick={sharePostcard} title="Share Link">
            <span className="btn-icon">➶</span>
            <span className="btn-label">Share</span>
          </button>
          <button className="action-btn restart-btn" onClick={restartPostcard} title="Start Fresh">
            <span className="btn-icon">↺</span>
            <span className="btn-label">Restart</span>
          </button>
        </div>
      )}

      {/* Photo strip toggle - Left side when expanded */}
      {isExpanded && (
        <div className="photo-strip-toggle">
          <label className="strip-checkbox">
            <input 
              type="checkbox" 
              checked={showPhotoStrip}
              onChange={(e) => {
                e.stopPropagation();
                setShowPhotoStrip(e.target.checked);
              }}
            />
            <span>Show Photo Strip</span>
          </label>
          {showPhotoStrip && (
            <button 
              className="upload-strip-btn" 
              onClick={(e) => {
                e.stopPropagation();
                photoStripInputRef.current?.click();
              }}
            >
              ⋆.📷˚ Upload Photos (max 4)
            </button>
          )}
          <input 
            ref={photoStripInputRef}
            type="file" 
            accept="image/*" 
            multiple
            onChange={handlePhotoStripUpload}
            style={{ display: 'none' }}
          />
        </div>
      )}

      {/* Floating Postcard */}
      <div 
        ref={postcardRef}
        className={`floating-postcard ${isExpanded ? 'expanded' : ''} ${isFlipped ? 'flipped' : ''} ${isDragging ? 'dragging' : ''}`}
        style={{
          transform: isExpanded 
            ? 'translate(-50%, -50%) scale(1)' 
            : `translate(${position.x}px, ${position.y}px) rotateX(${mousePosition.y}deg) rotateY(${mousePosition.x}deg) rotate(8deg)`,
        }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onMouseDown={handleDragStart}
        onClick={handlePostcardClick}
      >
        {/* Close button */}
        {isExpanded && (
          <button className="postcard-close" onClick={handleClose}>✕</button>
        )}

        {/* Edit/View toggle */}
        {isExpanded && (
          <button className="postcard-edit-toggle" onClick={toggleEditMode}>
            {isEditMode ? '👁 View' : '✎𓂃Edit'}
          </button>
        )}

        {/* Card */}
        <div className="postcard-card">
          
          {/* FRONT SIDE */}
          <div ref={frontRef} className="postcard-side postcard-front">
            {/* Photo strip (optional) */}
            {showPhotoStrip && photoStrip.length > 0 && (
              <div className="photo-strip">
                {photoStrip.map((photo, i) => (
                  <div key={i} className="strip-photo">
                    <img src={photo} alt={`Photo ${i+1}`} />
                  </div>
                ))}
              </div>
            )}

            <div className="postcard-vintage-border">
              {/* Main image */}
              <div className="postcard-image-area">
                {frontImage ? (
                  <img src={frontImage} alt="Postcard" className="postcard-uploaded-image" />
                ) : (
                  <div className="postcard-upload-placeholder" onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}>
                    <span className="upload-icon">⋆.📷˚</span>
                    <span className="upload-text">Click to upload</span>
                  </div>
                )}
                <input 
                  ref={fileInputRef}
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageUpload}
                  style={{ display: 'none' }}
                />
              </div>

              {/* Greetings */}
              <div className="postcard-greetings">
                <p className="greetings-text">Greetings from</p>
                {isEditMode && isExpanded ? (
                  <div className="destination-edit" onClick={(e) => e.stopPropagation()}>
                    <input 
                      type="text"
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      placeholder="Italy"
                      className="destination-input"
                      style={{ color: textColor }}
                    />
                    <input 
                      type="color"
                      value={textColor}
                      onChange={(e) => setTextColor(e.target.value)}
                      className="color-picker"
                    />
                  </div>
                ) : (
                  <h1 className="destination-text" style={{ color: textColor }}>
                    {destination || 'Italy'}
                  </h1>
                )}
              </div>

              <div className="postcard-corner-stamp">POSTCARD</div>
            </div>
          </div>

          {/* BACK SIDE */}
          <div ref={backRef} className="postcard-side postcard-back">
            <div className="postcard-vintage-border">
              
              {/* POST CARD header */}
              <div className="postcard-header">
                <span className="postcard-title">POST</span>
                <div className="postcard-logo">
                  <svg viewBox="0 0 50 50" className="vintage-emblem">
                    <circle cx="25" cy="25" r="20" fill="none" stroke="currentColor" strokeWidth="1.5"/>
                    <text x="25" y="22" textAnchor="middle" fontSize="8" fill="currentColor">VINTAGE</text>
                    <text x="25" y="30" textAnchor="middle" fontSize="8" fill="currentColor">POST</text>
                  </svg>
                </div>
                <span className="postcard-title">CARD</span>
              </div>

              <div className="postcard-subtitle">
                <span>FOR CORRESPONDENCE</span>
                <span>FOR ADDRESS ONLY</span>
              </div>

              {/* Vertical divider */}
              <div className="postcard-divider" />

              {/* Left - Message */}
              <div className="postcard-message-area">
                {isEditMode && isExpanded ? (
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Write your heartfelt message here..."
                    className="message-textarea"
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <p className="message-display">{message || 'Your message...'}</p>
                )}
              </div>

              {/* Right - Address */}
              <div className="postcard-address-area">
                <p className="address-label">Please mail to:</p>
                {isEditMode && isExpanded ? (
                  <div className="address-inputs" onClick={(e) => e.stopPropagation()}>
                    <input 
                      type="text"
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                      placeholder="Recipient Name"
                      className="address-line"
                    />
                    <input 
                      type="text"
                      value={senderName}
                      onChange={(e) => setSenderName(e.target.value)}
                      placeholder="From: Your Name"
                      className="address-line"
                    />
                    <input 
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Full Address"
                      className="address-line"
                    />
                  </div>
                ) : (
                  <div className="address-display">
                    <p className="address-line">{recipientName || '_______________'}</p>
                    <p className="address-line">{senderName || '_______________'}</p>
                    <p className="address-line">{address || '_______________'}</p>
                  </div>
                )}

                {/* Stamp - TOP RIGHT */}
                <div className="postcard-stamp-corner">
                  {stamp ? (
                    <img src={stamp} alt="Stamp" className="uploaded-stamp" />
                  ) : (
                    <div 
                      className="stamp-placeholder" 
                      onClick={(e) => {
                        e.stopPropagation();
                        stampInputRef.current?.click();
                      }}
                    >
                      <span className="stamp-text">STAMP</span>
                    </div>
                  )}
                  <input 
                    ref={stampInputRef}
                    type="file" 
                    accept="image/*" 
                    onChange={handleStampUpload}
                    style={{ display: 'none' }}
                  />
                </div>
              </div>

              {/* Wax seal */}
              <div className="wax-seal">
                <svg viewBox="0 0 50 50" className="seal-svg">
                  <circle cx="25" cy="25" r="22" fill="#8b4513" opacity="0.8"/>
                  <text x="25" y="30" textAnchor="middle" fontSize="14" fill="#d4af37" fontFamily="serif">VP</text>
                </svg>
              </div>

              <div className="postcard-side-text">જ⁀➴THE VINTAGE PHOTO STUDIOS PERSONALISED POSTCARD SERVICEજ⁀➴</div>
            </div>
          </div>
        </div>

        <div className="postcard-ambient-glow" />
      </div>
    </>
  );
}

export default FloatingPostcard;