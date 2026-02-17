// ============================================
// VINTAGE PHOTOBOOTH - DELIVERY & PICKUP
// ============================================

// Configuration
const CONFIG = {
    countdownStart: 5,       // Start countdown from 5
    slideDownDuration: 2000, // 2 seconds for photo strip to slide
    soundEnabled: true       // Enable sound effects
};

// DOM Elements - Delivery Screen
const deliveryScreen = document.getElementById('deliveryScreen');
const timerNumber = document.getElementById('timerNumber');
const photoStrip = document.getElementById('photoStrip');
const pickupButton = document.getElementById('pickupButton');

// DOM Elements - Results Screen
const resultsScreen = document.getElementById('resultsScreen');
const finalPhotoStrip = document.getElementById('finalPhotoStrip');
const downloadBtn = document.getElementById('downloadBtn');
const shareBtn = document.getElementById('shareBtn');
const printBtn = document.getElementById('printBtn');
const restartBtn = document.getElementById('restartBtn');
const tiktokShare = document.getElementById('tiktokShare');
const instagramShare = document.getElementById('instagramShare');

// State
let capturedPhotos = [];
let countdown = CONFIG.countdownStart;

// ============================================
// INITIALIZATION
// ============================================

/**
 * Load photos from previous page and start countdown
 */
function init() {
    console.log('📸 Delivery page loaded');
    
    // Get photos from sessionStorage
    const photosData = sessionStorage.getItem('photoboothPhotos');
    
    if (photosData) {
        capturedPhotos = JSON.parse(photosData);
        console.log(`✅ Loaded ${capturedPhotos.length} photos`);
        
        // Apply vintage filter and display in strip
        applyVintageFilter();
        
        // Start countdown
        startCountdown();
    } else {
        console.error('❌ No photos found!');
        alert('No photos found. Returning to camera...');
        window.location.href = 'camera.html';
    }
}

// ============================================
// VINTAGE FILTER
// ============================================

/**
 * Apply black & white vintage photobooth filter to photos
 */
function applyVintageFilter() {
    capturedPhotos.forEach((photoData, index) => {
        const img = new Image();
        img.onload = function() {
            // Create canvas for filtering
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = img.width;
            canvas.height = img.height;
            
            // Draw original image
            ctx.drawImage(img, 0, 0);
            
            // Get image data
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;
            
            // Apply vintage B&W filter
            for (let i = 0; i < data.length; i += 4) {
                // Convert to grayscale
                const gray = data[i] * 0.3 + data[i + 1] * 0.59 + data[i + 2] * 0.11;
                
                // Add slight sepia/warm tone
                data[i] = gray + 20;      // Red
                data[i + 1] = gray + 10;  // Green
                data[i + 2] = gray;       // Blue
                
                // Increase contrast
                const contrast = 1.2;
                data[i] = ((data[i] - 128) * contrast) + 128;
                data[i + 1] = ((data[i + 1] - 128) * contrast) + 128;
                data[i + 2] = ((data[i + 2] - 128) * contrast) + 128;
            }
            
            // Put filtered image back
            ctx.putImageData(imageData, 0, 0);
            
            // Update photo data
            capturedPhotos[index] = canvas.toDataURL('image/jpeg', 0.95);
            
            // Set as background of strip photo
            const stripPhoto = document.getElementById(`photo${index + 1}`);
            stripPhoto.style.backgroundImage = `url(${capturedPhotos[index]})`;
        };
        img.src = photoData;
    });
}

// ============================================
// COUNTDOWN TIMER
// ============================================

/**
 * Start countdown from 5 to 0
 */
function startCountdown() {
    console.log('⏱ Starting countdown...');
    
    const countdownInterval = setInterval(() => {
        countdown--;
        timerNumber.textContent = countdown;
        
        // Play tick sound
        if (CONFIG.soundEnabled) {
            playTickSound();
        }
        
        // When countdown reaches 0
        if (countdown === 0) {
            clearInterval(countdownInterval);
            console.log('✅ Countdown finished!');
            
            // Wait a moment, then slide photos down
            setTimeout(() => {
                slidePhotosDown();
            }, 500);
        }
    }, 1000);
}

/**
 * Slide photo strip down into frame
 */
function slidePhotosDown() {
    console.log('📸 Sliding photos down...');
    
    // Play slide sound
    if (CONFIG.soundEnabled) {
        playSlideSound();
    }
    
    // Add slide-down class to trigger animation
    photoStrip.classList.add('slide-down');
    
    // After animation completes, show pickup button
    setTimeout(() => {
        showPickupButton();
    }, CONFIG.slideDownDuration);
}

/**
 * Show pickup button after photos are delivered
 */
function showPickupButton() {
    console.log('✨ Photos delivered!');
    pickupButton.classList.remove('hidden');
}

// ============================================
// SOUND EFFECTS
// ============================================

/**
 * Play tick sound for countdown
 */
function playTickSound() {
    const audio = new Audio();
    // Base64 encoded tick sound
    audio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSiAy/LahC8GGmi56+OZSA0PUqfj8LJjHAU7k9jyyXYpBSl+yu7ZkUM=';
    audio.volume = 0.2;
    audio.play().catch(e => console.log('Sound blocked:', e));
}

/**
 * Play slide sound for photo strip
 */
function playSlideSound() {
    const audio = new Audio();
    // Base64 encoded slide/whoosh sound
    audio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSiAy/LahC8GGmi56+OZSA0PUqfj8LJjHAU7k9jyyXYpBSl+yu7ZkUM=';
    audio.volume = 0.3;
    audio.play().catch(e => console.log('Sound blocked:', e));
}
// ============================================
// INITIALIZATION ON PAGE LOAD
// ============================================

document.addEventListener('DOMContentLoaded', init);

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() === 'r') {
        restart();
    }
});

console.log('🎪 Vintage Photobooth Delivery System Ready!');
console.log('💡 Press "R" to restart');

function goToResults() {
    console.log('🎉 Going to results screen...');
    
    // Store photos for next page
    sessionStorage.setItem('finalPhotos', JSON.stringify(capturedPhotos));
    
    // Navigate to results page
    window.location.href = 'vidislika.html';
}
pickupButton.addEventListener('click', goToResults);