// ============================================
// FILM CAMERA - DELIVERY PAGE
// ============================================

// Configuration
const CONFIG = {
    slideDuration: 2000,  // Film roll slides for 2 seconds
    buttonDelay: 500      // Button appears 0.5s after slide finishes
};

// DOM Elements
const filmContainer = document.getElementById('filmContainer');
const developBtn = document.getElementById('developBtn');
const photo1 = document.getElementById('photo1');
const photo2 = document.getElementById('photo2');
const photo3 = document.getElementById('photo3');

// State
let filmPhotos = [];

// ============================================
// INITIALIZATION
// ============================================

/**
 * Load photos and apply vintage filter
 */
function init() {
    console.log('🎞️ Film delivery page loaded');
    
    // Get photos from sessionStorage
    const photosData = sessionStorage.getItem('filmPhotos');
    
    if (photosData) {
        filmPhotos = JSON.parse(photosData);
        console.log(`✅ Loaded ${filmPhotos.length} film photos`);
        
        // Apply photos to film roll
        applyPhotosToFilm();
        
        // Show develop button after slide animation completes
        setTimeout(() => {
            showDevelopButton();
        }, CONFIG.slideDuration + CONFIG.buttonDelay);
        
    } else {
        console.error('❌ No photos found!');
        alert('No photos found. Returning to camera...');
        window.location.href = 'camera-start.html';
    }
}

// ============================================
// PHOTO PROCESSING
// ============================================

/**
 * Apply captured photos to film roll with vintage filter
 */
function applyPhotosToFilm() {
    const photoElements = [photo1, photo2, photo3];
    
    filmPhotos.forEach((photoData, index) => {
        if (photoElements[index]) {
            // Apply photo as background with vintage film filter already in CSS
            photoElements[index].style.backgroundImage = `url(${photoData})`;
        }
    });
    
    console.log('✅ Photos applied to film roll with vintage filter');
}

/**
 * Show develop button with animation
 */
function showDevelopButton() {
    developBtn.classList.remove('hidden');
    developBtn.classList.add('visible');
    console.log('✨ Develop button visible');
}

// ============================================
// NAVIGATION
// ============================================

/**
 * Navigate to developed photos page
 */
function goToDeveloped() {
    console.log('🎬 Going to developed photos...');
    
    // Store photos for next page
    sessionStorage.setItem('developedPhotos', JSON.stringify(filmPhotos));
    
    // Navigate to results page
    window.location.href = 'developfilm.html';
}

// ============================================
// EVENT LISTENERS
// ============================================

developBtn.addEventListener('click', goToDeveloped);

// Keyboard shortcut
document.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() === 'r') {
        sessionStorage.clear();
        window.location.href = 'camera-start.html';
    }
});

// ============================================
// INITIALIZATION ON PAGE LOAD
// ============================================

document.addEventListener('DOMContentLoaded', init);

console.log('📸 Film delivery system ready!');
console.log('💡 Press "R" to restart from beginning');
