// ============================================
// VINTAGE FILM CAMERA - PHOTO SHOOTING
// ============================================

// Configuration
const CONFIG = {
    countdownDuration: 3,      // Countdown from 3 to 1
    totalPhotos: 3,            // Take 3 photos total
    delayBetweenPhotos: 3000,  // 3 seconds between each photo
    flashDuration: 200         // Flash effect duration
};

// State
let stream = null;
let capturedPhotos = [];
let isCapturing = false;
let currentPhotoCount = 0;

// DOM Elements
const video = document.getElementById('cameraVideo');
const canvas = document.getElementById('photoCanvas');
const ctx = canvas.getContext('2d');
const startButton = document.getElementById('startButton');
const processBtn = document.getElementById('processBtn');
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
        console.log('📷 Requesting camera access...');
        
        // Request camera with ideal constraints
        stream = await navigator.mediaDevices.getUserMedia({
            video: {
                width: { ideal: 1280 },
                height: { ideal: 960 },
                facingMode: 'user'
            },
            audio: false
        });
        
        // Set video source
        video.srcObject = stream;
        
        // Wait for video to be ready
        video.onloadedmetadata = () => {
            console.log('✅ Camera initialized!');
            
            
        };
        
    } catch (error) {
        console.error('❌ Camera error:', error);
        alert('Unable to access camera. Please grant camera permissions.');
    }
}

// ============================================
// PHOTO CAPTURE SYSTEM
// ============================================

/**
 * Start photo session - take 3 photos with countdown
 */
async function startPhotoSession() {
    if (isCapturing) return;
    
    isCapturing = true;
    capturedPhotos = [];
    currentPhotoCount = 0;

     // Hide start button
    startButton.classList.add('hidden');
    
    console.log('🎬 Starting photo session...');
    
    // Take 3 photos with countdown
    for (let i = 0; i < CONFIG.totalPhotos; i++) {
        currentPhotoCount = i + 1;
        console.log(`📸 Taking photo ${currentPhotoCount}/${CONFIG.totalPhotos}`);
        
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
    
    // Show process button
    showProcessButton();
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
 * Capture a single photo from video stream
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
    countdownOverlay.style.background = 'rgba(255, 255, 255, 0.6)';
    countdownOverlay.classList.add('active');
    
    setTimeout(() => {
        countdownOverlay.style.background = 'rgba(0, 0, 0, 0.5)';
        countdownOverlay.classList.remove('active');
    }, CONFIG.flashDuration);
}

/**
 * Show process film button after all photos taken
 */
function showProcessButton() {
    processBtn.classList.remove('hidden');
    console.log('✨ Ready to process film!');
}

/**
 * Navigate to film processing/delivery page
 */
function goToProcessing() {
    // Store photos in sessionStorage for next page
    sessionStorage.setItem('filmPhotos', JSON.stringify(capturedPhotos));
    
    // Navigate to delivery page
    window.location.href = 'vidisliki.html';
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

// Process button click
startButton.addEventListener('click', startPhotoSession);

processBtn.addEventListener('click', goToProcessing);

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Press 'R' to reload
    if (e.key.toLowerCase() === 'r') {
        location.reload();
    }
});

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('📷 Film Camera Shooting Page Loaded!');
    console.log('💡 Press "S" to start photo session');
    console.log('💡 Press "R" to restart');
    
    // Initialize camera
    initCamera();
});

// Cleanup camera when page unloads
window.addEventListener('beforeunload', () => {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
    }
});

console.log('🎞️ Ready to capture film photos!');