
// ============================================
// VINTAGE POLAROID CAMERA
// ============================================

// DOM Elements
const bgMusic = document.getElementById('bgMusic');
const cameraVideo = document.getElementById('cameraVideo');
const canvas = document.getElementById('photoCanvas');
const ctx = canvas.getContext('2d');

const instruction = document.getElementById('instruction');
const cameraWrapper = document.getElementById('cameraWrapper');
const redButton = document.getElementById('redButton');
const polaroidPhoto = document.getElementById('polaroidPhoto');
const photoInner = document.getElementById('photoInner');
const photoCaption = document.getElementById('photoCaption');

const actionButtons = document.getElementById('actionButtons');
const downloadBtn = document.getElementById('downloadBtn');
const writeBtn = document.getElementById('writeBtn');
const retakeBtn = document.getElementById('retakeBtn');
const shareBtn = document.getElementById('shareBtn');
const uploadBtn = document.getElementById('uploadBtn');

const writePanel = document.getElementById('writePanel');
const messageInput = document.getElementById('messageInput');
const colorPicker = document.getElementById('colorPicker');
const applyBtn = document.getElementById('applyBtn');
const cancelBtn = document.getElementById('cancelBtn');

const uploadInput = document.getElementById('uploadInput');

// State
let stream = null;
let currentPhoto = null;
let photoTaken = false;

// ============================================
// INITIALIZATION
// ============================================

async function init() {
    console.log('📸 Polaroid camera loaded!');
    
    // Start background music
    try {
        await bgMusic.play();
        console.log('🎵 Music playing');
    } catch (error) {
        console.log('Music autoplay blocked - user interaction needed');
        // Play on first click
        document.addEventListener('click', () => {
            bgMusic.play();
        }, { once: true });
    }
    
    // Initialize camera
    await initCamera();
}

async function initCamera() {
    try {
        stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'user' },
            audio: false
        });
        cameraVideo.srcObject = stream;
        console.log('✅ Camera ready!');
    } catch (error) {
        console.error('❌ Camera error:', error);
        alert('Camera access needed for polaroid photos!');
    }
}

// ============================================
// TAKE PHOTO
// ============================================

async function takePhoto() {
    if (photoTaken) return;
    
    console.log('📷 Taking photo...');

    // Flash effect
    const flash = document.getElementById('flashOverlay');
    flash.classList.add('active');
    setTimeout(() => {flash.classList.remove('active');}, 200);

    // Lens flare effect
    const lensFlare = document.getElementById('lensFlare');
    lensFlare.classList.add('active');
    setTimeout(() => {lensFlare.classList.remove('active');}, 400);

    // Hide instruction
    instruction.classList.add('hidden');
    
    // Capture photo from video
    canvas.width = cameraVideo.videoWidth;
    canvas.height = cameraVideo.videoHeight;
    
    // Mirror flip
    ctx.save();
    ctx.scale(-1, 1);
    ctx.drawImage(cameraVideo, -canvas.width, 0, canvas.width, canvas.height);
    ctx.restore();
    
    currentPhoto = canvas.toDataURL('image/jpeg', 0.95);

    // Show the existing polaroid photo element
    polaroidPhoto.classList.remove('hidden');
    
    // Add image to photo inner
    const img = document.createElement('img');
    img.src = currentPhoto;
    photoInner.appendChild(img);

    // Move camera up
    setTimeout(() => {
        cameraWrapper.classList.add('photo-taken');
        photoTaken = true;

        // Show action buttons after development (5 seconds)
        setTimeout(() => {
            actionButtons.classList.remove('hidden');
        }, 5000);
    }, 100);
}

// ============================================
// WRITE MESSAGE
// ============================================

function showWritePanel() {
    writePanel.classList.remove('hidden');
    messageInput.value = photoCaption.textContent;
    colorPicker.value = rgbToHex(photoCaption.style.color || '#2c2c2c');
}

function applyMessage() {
    photoCaption.textContent = messageInput.value;
    photoCaption.style.color = colorPicker.value;
    writePanel.classList.add('hidden');
}

function cancelMessage() {
    writePanel.classList.add('hidden');
}

// Helper: RGB to Hex
function rgbToHex(rgb) {
    if (rgb.startsWith('#')) return rgb;
    const values = rgb.match(/\d+/g);
    if (!values) return '#2c2c2c';
    return '#' + values.slice(0, 3).map(x => {
        const hex = parseInt(x).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    }).join('');
}

// ============================================
// DOWNLOAD
// ============================================

function downloadPhoto() {
    // Create full polaroid with caption
    const fullCanvas = document.createElement('canvas');
    const fullCtx = fullCanvas.getContext('2d');
    
    fullCanvas.width = 280;
    fullCanvas.height = 340;
    
    // White polaroid background
    fullCtx.fillStyle = 'white';
    fullCtx.fillRect(0, 0, fullCanvas.width, fullCanvas.height);
    
    // Draw photo
    const img = new Image();
    img.onload = () => {
        fullCtx.drawImage(img, 15, 15, 250, 250);
        
        // Draw caption
        if (photoCaption.textContent) {
            fullCtx.font = '32px "Reenie Beanie", cursive';
            fullCtx.fillStyle = photoCaption.style.color || '#2c2c2c';
            fullCtx.textAlign = 'center';
            fullCtx.fillText(photoCaption.textContent, fullCanvas.width / 2, 300);
        }
        
        // Download
        const link = document.createElement('a');
        link.download = `polaroid-${Date.now()}.png`;
        link.href = fullCanvas.toDataURL('image/png');
        link.click();
    };
    img.src = currentPhoto;
}

// ============================================
// SHARE
// ============================================

async function sharePhoto() {
    if (navigator.share) {
        try {
            const response = await fetch(currentPhoto);
            const blob = await response.blob();
            const file = new File([blob], 'polaroid.jpg', { type: 'image/jpeg' });
            
            await navigator.share({
                files: [file],
                title: 'My Polaroid Photo!',
                text: 'Check out my vintage polaroid!'
            });
        } catch (error) {
            console.log('Share cancelled');
        }
    } else {
        alert('Sharing not supported. Use download instead!');
    }
}

// ============================================
// RETAKE
// ============================================

function retake() {
    // Reset everything
    photoInner.innerHTML = '';
    photoCaption.textContent = '';
    polaroidPhoto.classList.add('hidden');
    cameraWrapper.classList.remove('photo-taken');
    actionButtons.classList.add('hidden');
    instruction.classList.remove('hidden');
    photoTaken = false;
}

// ============================================
// UPLOAD PHOTO
// ============================================

function triggerUpload() {
    uploadInput.click();
}

uploadInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
        currentPhoto = event.target.result;
        
        // Hide instruction
        instruction.classList.add('hidden');
        
        // Show polaroid with developing animation
        const img = document.createElement('img');
        img.src = currentPhoto;
        photoInner.appendChild(img);
        
        polaroidPhoto.classList.remove('hidden');
        
        setTimeout(() => {
            cameraWrapper.classList.add('photo-taken');
            photoTaken = true;
            
            setTimeout(() => {
                actionButtons.classList.remove('hidden');
            }, 5000);
        }, 100);
    };
    reader.readAsDataURL(file);


});

// ============================================
// EVENT LISTENERS
// ============================================

redButton.addEventListener('click', takePhoto);
downloadBtn.addEventListener('click', downloadPhoto);
writeBtn.addEventListener('click', showWritePanel);
retakeBtn.addEventListener('click', retake);
shareBtn.addEventListener('click', sharePhoto);
uploadBtn.addEventListener('click', triggerUpload);

applyBtn.addEventListener('click', applyMessage);
cancelBtn.addEventListener('click', cancelMessage);

// ============================================
// START
// ============================================

document.addEventListener('DOMContentLoaded', init);

console.log('📸 Vintage polaroid ready!');
