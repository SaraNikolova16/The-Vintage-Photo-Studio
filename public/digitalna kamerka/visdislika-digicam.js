
// ============================================
// DIGITAL CAMERA - PHOTO COLLECTION
// ============================================

// DOM Elements
const photoContent1 = document.getElementById('photoContent1');
const photoContent2 = document.getElementById('photoContent2');
const timestamp1 = document.getElementById('timestamp1');
const timestamp2 = document.getElementById('timestamp2');

const check1 = document.getElementById('check1');
const check2 = document.getElementById('check2');

const selectAllBtn = document.getElementById('selectAllBtn');
const downloadBtn = document.getElementById('downloadBtn');
const shareBtn = document.getElementById('shareBtn');
const printBtn = document.getElementById('printBtn');
const restartBtn = document.getElementById('restartBtn');

// State
let digitalPhotos = [];
let photoTimestamp = '';

// ============================================
// INITIALIZATION
// ============================================

function init() {
    console.log('📸 Collection page loaded');
    
    // Get photos from sessionStorage
    const photosData = sessionStorage.getItem('filmPhotos');
    
    if (photosData) {
        digitalPhotos = JSON.parse(photosData);
        console.log(`✅ Loaded ${digitalPhotos.length} photos`);
        
        // Display photos
        displayPhotos();
        
        // Set timestamp
        setTimestamp();
        
    } else {
        console.error('❌ No photos found!');
        alert('No photos found. Returning to start...');
        window.location.href = 'camera-start.html';
    }
}

// ============================================
// DISPLAY PHOTOS
// ============================================

function displayPhotos() {
    const photoElements = [photoContent1, photoContent2];
    
    digitalPhotos.forEach((photoData, index) => {
        if (photoElements[index]) {
            photoElements[index].style.backgroundImage = `url(${photoData})`;
        }
    });
    
    console.log('✅ Photos displayed with 2010 filter');
}

// ============================================
// SET TIMESTAMP (2010 DIGITAL CAMERA STYLE)
// ============================================

function setTimestamp() {
    const now = new Date();
    
    // Format: 2025/02/06 14:30
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    
    photoTimestamp = `${year}/${month}/${day} ${hours}:${minutes}`;
    
    timestamp1.textContent = photoTimestamp;
    timestamp2.textContent = photoTimestamp;
}

// ============================================
// SELECTION MANAGEMENT
// ============================================

function getSelectedPhotos() {
    const selected = [];
    if (check1.checked) selected.push(0);
    if (check2.checked) selected.push(1);
    return selected;
}

function selectAll() {
    const allChecked = check1.checked && check2.checked;
    check1.checked = !allChecked;
    check2.checked = !allChecked;
}

// ============================================
// DOWNLOAD
// ============================================

function downloadSelected() {
    const selected = getSelectedPhotos();
    
    if (selected.length === 0) {
        alert('Please select at least one photo to download!');
        return;
    }
    
    console.log(`📥 Downloading ${selected.length} photo(s)...`);
    
    selected.forEach((index, i) => {
        setTimeout(() => {
            const link = document.createElement('a');
            link.download = `digicam-photo-${index + 1}-${Date.now()}.jpg`;
            link.href = digitalPhotos[index];
            link.click();
        }, i * 500);
    });
}

// ============================================
// SHARE
// ============================================

async function shareSelected() {
    const selected = getSelectedPhotos();
    
    if (selected.length === 0) {
        alert('Please select at least one photo to share!');
        return;
    }
    
    console.log(`↗ Sharing ${selected.length} photo(s)...`);
    
    if (navigator.share) {
        try {
            const files = [];
            
            for (let index of selected) {
                const response = await fetch(digitalPhotos[index]);
                const blob = await response.blob();
                const file = new File([blob], `photo-${index + 1}.jpg`, { type: 'image/jpeg' });
                files.push(file);
            }
            
            await navigator.share({
                files: files,
                title: 'My Digital Camera Photos!',
                text: 'Check out my photos!'
            });
            
            console.log('✅ Shared successfully!');
        } catch (error) {
            console.log('Share cancelled or failed');
        }
    } else {
        alert('Sharing not supported. Use download instead!');
    }
}

// ============================================
// PRINT
// ============================================

function printSelected() {
    const selected = getSelectedPhotos();
    
    if (selected.length === 0) {
        alert('Please select at least one photo to print!');
        return;
    }
    
    console.log(`🖨 Printing ${selected.length} photo(s)...`);
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write('<html><head><title>Print Photos</title><style>body{margin:0;padding:20px;text-align:center;}img{max-width:100%;margin:20px 0;page-break-after:always;}</style></head><body>');
    
    selected.forEach(index => {
        printWindow.document.write(`<img src="${digitalPhotos[index]}">`);
    });
    
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.print();
}

// ============================================
// RESTART
// ============================================

function restart() {
    sessionStorage.clear();
    window.location.href = 'index-digicam.html';
}

// ============================================
// EVENT LISTENERS
// ============================================

selectAllBtn.addEventListener('click', selectAll);
downloadBtn.addEventListener('click', downloadSelected);
shareBtn.addEventListener('click', shareSelected);
printBtn.addEventListener('click', printSelected);
restartBtn.addEventListener('click', restart);

// Keyboard shortcut
document.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() === 'r') {
        restart();
    }
});

// ============================================
// INITIALIZATION ON PAGE LOAD
// ============================================

document.addEventListener('DOMContentLoaded', init);

console.log('📸 Digital camera collection ready!');
console.log('💡 Press "R" to restart');
