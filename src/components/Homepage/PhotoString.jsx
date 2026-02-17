import React, { useRef, useState, useEffect } from 'react';
import './PhotoString.css';

function PhotoString() {
  const photos = [
    { id: 1, name: 'Photobooth', image: '/images/photobooth.png', link: '/fotokabinka/pocetok/fotokabinapocetok.html', size: 'photobooth' },
    { id: 2, name: 'Kodak Camera', image: '/images/kodak.png', link: '/kodak kamera/kamerapocetok.html', size: 'kodak' },
    { id: 3, name: 'DigiCam', image: '/images/digicam.png', link: '/digitalna kamerka/index-digicam.html', size: 'digicam' },
    { id: 4, name: 'Polaroid', image: '/images/polaroid.png', link: '/vintagepolaroid/index-vintagepolaroid.html', size: 'polaroid' }
  ];

  const positions = [
    { left: '10%', top: '45px' },
    { left: '32%', top: '60px' },
    { left: '58%', top: '90px' },
    { left: '82%', top: '95px' }
  ];

  const [photoStates, setPhotoStates] = useState(
    photos.map((photo, index) => ({
      ...photo,
      offsetX: 0,
      offsetY: 0,
      velocityX: 0,
      velocityY: 0,
      isDragging: false,
      originalLeft: positions[index].left,
      originalTop: positions[index].top
    }))
  );

  const dragState = useRef({
    photoIndex: null,
    startX: 0,
    startY: 0,
    lastX: 0,
    lastY: 0,
    hasMoved: false
  });

  const containerRef = useRef(null);

  // Physics animation loop
  useEffect(() => {
    let animationId;
    
    const animate = () => {
      setPhotoStates(prev => {
        let hasChanged = false;
        
        const newStates = prev.map((photo, index) => {
          if (photo.isDragging) return photo;

          // Spring physics
          const springForceX = -photo.offsetX * 0.12;
          const springForceY = -photo.offsetY * 0.12;
          
          const dampingX = photo.velocityX * -0.2;
          const dampingY = photo.velocityY * -0.2;
          
          let newVelocityX = photo.velocityX + springForceX + dampingX;
          let newVelocityY = photo.velocityY + springForceY + dampingY;
          
          let newOffsetX = photo.offsetX + newVelocityX;
          let newOffsetY = photo.offsetY + newVelocityY;
          
          // Stop when close to rest
          if (Math.abs(newOffsetX) < 0.3 && Math.abs(newVelocityX) < 0.3) {
            newOffsetX = 0;
            newVelocityX = 0;
          }
          if (Math.abs(newOffsetY) < 0.3 && Math.abs(newVelocityY) < 0.3) {
            newOffsetY = 0;
            newVelocityY = 0;
          }

          // Neighbor influence
          let neighborInfluenceX = 0;
          if (index > 0) {
            neighborInfluenceX += prev[index - 1].offsetX * 0.12;
          }
          if (index < prev.length - 1) {
            neighborInfluenceX += prev[index + 1].offsetX * 0.12;
          }

          const finalOffsetX = newOffsetX + neighborInfluenceX;
          const finalOffsetY = newOffsetY;

          if (finalOffsetX !== photo.offsetX || finalOffsetY !== photo.offsetY) {
            hasChanged = true;
          }

          return {
            ...photo,
            offsetX: finalOffsetX,
            offsetY: finalOffsetY,
            velocityX: newVelocityX,
            velocityY: newVelocityY
          };
        });

        return hasChanged ? newStates : prev;
      });

      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, []);

  const handleMouseDown = (e, index) => {
    e.preventDefault();
    e.stopPropagation();
    
    dragState.current = {
      photoIndex: index,
      startX: e.clientX,
      startY: e.clientY,
      lastX: e.clientX,
      lastY: e.clientY,
      hasMoved: false
    };

    setPhotoStates(prev => prev.map((photo, i) => 
      i === index ? { ...photo, isDragging: true, velocityX: 0, velocityY: 0 } : photo
    ));
  };

  const handleMouseMove = (e) => {
    if (dragState.current.photoIndex === null) return;
    
    const deltaX = e.clientX - dragState.current.startX;
    const deltaY = e.clientY - dragState.current.startY;
    
    // Track if user actually moved
    if (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3) {
      dragState.current.hasMoved = true;
    }
    
    const velocityX = e.clientX - dragState.current.lastX;
    const velocityY = e.clientY - dragState.current.lastY;
    
    dragState.current.lastX = e.clientX;
    dragState.current.lastY = e.clientY;

    setPhotoStates(prev => prev.map((photo, i) => 
      i === dragState.current.photoIndex
        ? { ...photo, offsetX: deltaX, offsetY: deltaY, velocityX, velocityY }
        : photo
    ));
  };

  const handleMouseUp = (e) => {
    if (dragState.current.photoIndex === null) return;

    const wasDragged = dragState.current.hasMoved;

    setPhotoStates(prev => prev.map((photo, i) => 
      i === dragState.current.photoIndex
        ? { ...photo, isDragging: false }
        : photo
    ));

    dragState.current.photoIndex = null;
    dragState.current.hasMoved = false;
  };

  useEffect(() => {
    const handleMove = (e) => handleMouseMove(e);
    const handleUp = (e) => handleMouseUp(e);
    
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
    
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
    };
  }, []);

  const anyDragging = photoStates.some(p => p.isDragging);

  return (
    <div className="photo-string-section" ref={containerRef}>
      <svg className="string-svg" viewBox="0 0 1400 120" preserveAspectRatio="none">
        <path
          d="M 0,60 Q 350,20 700,60 Q 1050,100 1400,60"
          stroke="#4a3728"
          strokeWidth="2"
          fill="none"
          className="string-line"
        />
      </svg>

      <div className={`photos-container ${anyDragging ? 'dragging-active' : ''}`}>
        {photoStates.map((photo, index) => {
          return (
            <a 
              key={photo.id}
              href={photo.link}
              onClick={(e) => {
                // Prevent navigation if photo was actually dragged
                if (Math.abs(photo.offsetX) > 10 || Math.abs(photo.offsetY) > 10) {
                  e.preventDefault();
                }
              }}
              className={`hanging-photo ${photo.size} ${photo.isDragging ? 'is-dragging' : ''}`}
              style={{ 
                '--offset-x': `${photo.offsetX}px`,
                '--offset-y': `${photo.offsetY}px`,
                '--drag-brightness': photo.isDragging ? '1.1' : '1',
                animationDelay: `${index * 0.2}s`,
                left: photo.originalLeft,
                top: photo.originalTop,
                transform: `translate(var(--offset-x), var(--offset-y))`,
                cursor: photo.isDragging ? 'grabbing' : 'pointer',
                zIndex: photo.isDragging ? 100 : 2
              }}
              onMouseDown={(e) => handleMouseDown(e, index)}
            >
              <div className="clothespin">
                <img 
                  src="/images/clothespin.png" 
                  alt="clothespin"
                  className="clothespin-img"
                  draggable="false"
                />
              </div>
              
              <div className="photo-content">
                <img 
                  src={photo.image} 
                  alt={photo.name}
                  draggable="false"
                />
              </div>
              <p className="photo-label">{photo.name}</p>
            </a>
          );
        })}
      </div>
    </div>
  );
}

export default PhotoString;