
// ============================================
// PHOTOBOOTH FRAME ANIMATION CONTROLLER
// ============================================

// Configuration
const CONFIG = {
    frameDelay: 350,        // Delay between frames in milliseconds (ADJUST THIS!)
    totalFrames: 10,        // Total number of frames
    loopCount: 1,           // How many times to loop (1 = play once, 2 = twice, etc.)
    buttonDelay: 500        // Delay before showing button after animation ends
};

// State
let currentFrame = 1;
let loopsCompleted = 0;
let animationInterval = null;
let isAnimationComplete = false;

// Get DOM elements
const frames = document.querySelectorAll('.frame');
const enterButton = document.getElementById('enterButton');

// ============================================
// ANIMATION FUNCTIONS
// ============================================


/**
 * Show specific frame - SEAMLESS VERSION
 */
function showFrame(frameNumber) {
    frames.forEach(frame => {
        const frameNum = parseInt(frame.getAttribute('data-frame'));
        if (frameNum === frameNumber) {
            frame.style.opacity = '1';
            frame.style.zIndex = '2';
        } else {
            frame.style.opacity = '0';
            frame.style.zIndex = '1';
        }
    });
}

/**
 * Advance to next frame
 */
function nextFrame() {
    currentFrame++;
    
    // If we've reached the end of the sequence
    if (currentFrame > CONFIG.totalFrames) {
        loopsCompleted++;
        
        // If we've completed all loops
        if (loopsCompleted >= CONFIG.loopCount) {
            stopAnimation();
            showEnterButton();
            return;
        }
        
        // Otherwise, restart from frame 1
        currentFrame = 1;
    }
    
    showFrame(currentFrame);
}

/**
 * Start animation sequence
 */
function startAnimation() {
    if (isAnimationComplete) return;
    
    console.log('🎬 Starting photobooth animation...');
    showFrame(1);
    
    animationInterval = setInterval(nextFrame, CONFIG.frameDelay);
}

/**
 * Stop animation
 */
function stopAnimation() {
    if (animationInterval) {
        clearInterval(animationInterval);
        animationInterval = null;
    }
    isAnimationComplete = true;
    console.log('✅ Animation complete!');
}

/**
 * Show enter button with delay
 */
function showEnterButton() {
    setTimeout(() => {
        enterButton.classList.add('visible');
        console.log('✨ Enter button visible');
    }, CONFIG.buttonDelay);
}

// ============================================
// MANUAL CONTROLS (for testing)
// ============================================

/**
 * Restart animation (for testing)
 */
function restartAnimation() {
    stopAnimation();
    currentFrame = 1;
    loopsCompleted = 0;
    isAnimationComplete = false;
    enterButton.classList.remove('visible');
    startAnimation();
}

// Expose restart function globally for testing in console
window.restartAnimation = restartAnimation;

// Keyboard shortcut: Press 'R' to restart animation
document.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() === 'r') {
        console.log('🔄 Restarting animation...');
        restartAnimation();
    }
});

// ============================================
// INITIALIZATION
// ============================================

/**
 * Initialize on page load
 */
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎪 Vintage Photobooth Loaded');
    console.log(`⚙️ Configuration: ${CONFIG.totalFrames} frames, ${CONFIG.frameDelay}ms delay`);
    console.log('💡 Press "R" to restart animation');
    
    // Start animation automatically
    startAnimation();
});

// ============================================
// CONFIGURATION HELPERS
// ============================================

/**
 * Change animation speed (call from console)
 * Example: setSpeed(200) for slower, setSpeed(100) for faster
 */
window.setSpeed = function(milliseconds) {
    CONFIG.frameDelay = milliseconds;
    console.log(`⚡ Speed changed to ${milliseconds}ms per frame`);
    if (!isAnimationComplete) {
        restartAnimation();
    }
};

/**
 * Set how many times animation loops
 * Example: setLoops(3) to loop 3 times
 */
window.setLoops = function(count) {
    CONFIG.loopCount = count;
    console.log(`🔁 Loop count set to ${count}`);
};

// Log available commands
console.log('');
console.log('🎮 Available Commands:');
console.log('  restartAnimation() - Restart the sequence');
console.log('  setSpeed(ms) - Change animation speed');
console.log('  setLoops(n) - Set number of loops');
console.log('');
