// ============================================
// VINTAGE PHOTOBOOTH - CAMERA SYSTEM
// ============================================

// Configuration
const CONFIG = {
    countdownDuration: 3,      // Countdown from 3 to 1
    totalPhotos: 4,            // Take 4 photos total
    delayBetweenPhotos: 3000,  // 3 seconds between each photo
    flashDuration: 200         // Camera flash effect duration
};

// State variables
let stream = null;
let capturedPhotos = [];
let isCapturing = false;
let currentPhotoCount = 0;

// DOM elements
const video = document.getElementById('cameraVideo');
const canvas = document.getElementById('photoCanvas');
const ctx = canvas.getContext('2d');
const startButton = document.getElementById('startButton');
const collectButton = document.getElementById('collectButton');
const countdownOverlay = document.getElementById('countdownOverlay');
const countdownNumber = document.getElementById('countdownNumber');

// ============================================
// CAMERA INITIALIZATION
// ============================================

/**
 * Initialize camera on page load
 */
async function initCamera() {
    try {
        console.log('🎥 Requesting camera access...');
        
        // Request camera with ideal constraints
        stream = await navigator.mediaDevices.getUserMedia({
            video: {
                width: { ideal: 1280 },
                height: { ideal: 1280 },
                facingMode: 'user' // Front camera on mobile
            },
            audio: false
        });
        
        // Set video source
        video.srcObject = stream;
        
        // Wait for video to be ready
        video.onloadedmetadata = () => {
            console.log('✅ Camera initialized successfully!');
        };
        
    } catch (error) {
        console.error('❌ Camera error:', error);
        alert('Unable to access camera. Please grant camera permissions and try again.');
    }
}

// ============================================
// PHOTO CAPTURE SYSTEM
// ============================================

/**
 * Start the photo session (4 photos with countdown)
 */
async function startPhotoSession() {
    if (isCapturing) return;
    
    isCapturing = true;
    capturedPhotos = [];
    currentPhotoCount = 0;
    
    // Hide start button
    startButton.classList.add('hidden');
    
    console.log('📸 Starting photo session...');
    
    // Take 4 photos with countdown
    for (let i = 0; i < CONFIG.totalPhotos; i++) {
        currentPhotoCount = i + 1;
        console.log(`📷 Taking photo ${currentPhotoCount}/${CONFIG.totalPhotos}`);
        
        // Show countdown
        await showCountdown();
        
        // Capture photo
        await capturePhoto();
        
        // Wait before next photo (except after last one)
        if (i < CONFIG.totalPhotos - 1) {
            await sleep(CONFIG.delayBetweenPhotos);
        }
    }
    
    // All photos captured
    console.log('✅ All photos captured!');
    isCapturing = false;
    
    // Show collect button
    showCollectButton();
}

/**
 * Show countdown overlay (3, 2, 1)
 */
function showCountdown() {
    return new Promise((resolve) => {
        let count = CONFIG.countdownDuration;
        
        // Show overlay
        countdownOverlay.classList.add('active');
        countdownNumber.textContent = count;
        
        const countdownInterval = setInterval(() => {
            count--;
            
            if (count > 0) {
                countdownNumber.textContent = count;
            } else {
                clearInterval(countdownInterval);
                countdownOverlay.classList.remove('active');
                resolve();
            }
        }, 1000);
    });
}

/**
 * Capture a single photo from video stream - MIRROR FLIPPED
 */
function capturePhoto() {
    return new Promise((resolve) => {
        // Set canvas size to match video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        // Flip context horizontally (mirror effect)
        ctx.save();
        ctx.scale(-1, 1);
        ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
        ctx.restore();
        
        // Convert to data URL and store
        const photoData = canvas.toDataURL('image/jpeg', 0.95);
        capturedPhotos.push(photoData);
        
        console.log(`✅ Photo ${currentPhotoCount} captured!`);
        
        // Flash effect
        flashEffect();
        
        // Small delay for flash
        setTimeout(resolve, CONFIG.flashDuration);
    });
}

/**
 * Camera flash effect
 */
function flashEffect() {
    countdownOverlay.style.background = 'rgba(255, 255, 255, 0.34)';
    countdownOverlay.classList.add('active');
    
    setTimeout(() => {
        countdownOverlay.style.background = 'rgba(0, 0, 0, 0.06)';
        countdownOverlay.classList.remove('active');
    }, CONFIG.flashDuration);
}

/**
 * Show collect photos button
 */
function showCollectButton() {
    collectButton.classList.remove('hidden');
}

/**
 * Navigate to photo pickup page
 */
function goToPickup() {
    // Store photos in sessionStorage for next page
    sessionStorage.setItem('photoboothPhotos', JSON.stringify(capturedPhotos));
    
    
    // Navigate to pickup page
    window.location.href = 'zemisliki.html';
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Sleep/delay function
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// ============================================
// EVENT LISTENERS
// ============================================

// Start button click
startButton.addEventListener('click', startPhotoSession);

// Collect button click
collectButton.addEventListener('click', goToPickup);

// Keyboard shortcuts (for testing)
document.addEventListener('keydown', (e) => {
    // Press 'S' to start
    if (e.key.toLowerCase() === 's' && !isCapturing) {
        startPhotoSession();
    }
    
    // Press 'R' to reset
    if (e.key.toLowerCase() === 'r') {
        location.reload();
    }
});

// ============================================
// INITIALIZATION ON PAGE LOAD
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('🎪 Vintage Photobooth Camera Page Loaded!');
    console.log('💡 Press "S" to start photo session');
    console.log('💡 Press "R" to reset');
    
    // Initialize camera
    initCamera();
});

// Cleanup camera when page unloads
window.addEventListener('beforeunload', () => {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
    }
});