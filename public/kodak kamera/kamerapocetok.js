
// ============================================
// VINTAGE FILM CAMERA - START PAGE
// ============================================

// DOM Elements
const takePhotosBtn = document.getElementById('takePhotosBtn');

// ============================================
// NAVIGATION
// ============================================

/**
 * Navigate to camera shooting page
 */
function goToCamera() {
    console.log('📷 Going to camera shoot page...');
    window.location.href = 'slikajse.html';
}

// ============================================
// EVENT LISTENERS
// ============================================

takePhotosBtn.addEventListener('click', goToCamera);

// Keyboard shortcut - Press 'Space' to start
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault();
        goToCamera();
    }
});

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('📷 Vintage Film Camera - Start Page Loaded!');
    console.log('💡 Press "Space" to start taking photos');
    
    // Add entrance animation to button
    setTimeout(() => {
        takePhotosBtn.style.animation = 'bounceIn 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
    }, 500);
});

// Bounce in animation
const style = document.createElement('style');
style.textContent = `
    @keyframes bounceIn {
        0% {
            opacity: 0;
            transform: scale(0.3);
        }
        50% {
            opacity: 1;
            transform: scale(1.05);
        }
        70% {
            transform: scale(0.9);
        }
        100% {
            opacity: 1;
            transform: scale(1);
        }
    }
`;
document.head.appendChild(style);

console.log('✨ Ready to capture memories!');