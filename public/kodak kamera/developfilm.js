// ============================================
// FILM CAMERA - DEVELOPED PHOTOS RESULTS
// ============================================

// DOM Elements
const photosContainer = document.querySelector('.photos-container');
const photoContent1 = document.getElementById('photoContent1');
const photoContent2 = document.getElementById('photoContent2');
const photoContent3 = document.getElementById('photoContent3');
const date1 = document.getElementById('date1');
const date2 = document.getElementById('date2');
const date3 = document.getElementById('date3');

const check1 = document.getElementById('check1');
const check2 = document.getElementById('check2');
const check3 = document.getElementById('check3');

const selectAllBtn = document.getElementById('selectAllBtn');
const downloadBtn = document.getElementById('downloadBtn');
const shareBtn = document.getElementById('shareBtn');
const printBtn = document.getElementById('printBtn');
const restartBtn = document.getElementById('restartBtn');

const fullscreenViewer = document.getElementById('fullscreenViewer');
const fullscreenImage = document.getElementById('fullscreenImage');
const closeBtn = document.getElementById('closeBtn');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');

const downloadCanvas = document.getElementById('downloadCanvas');
const ctx = downloadCanvas.getContext('2d');

// State
let developedPhotos = [];
let currentFullscreenIndex = 0;

// ============================================
// INITIALIZATION
// ============================================

function init() {
    console.log('📸 Results page loaded');
    
    // Get photos from sessionStorage
    const photosData = sessionStorage.getItem('developedPhotos');
    
    if (photosData) {
        developedPhotos = JSON.parse(photosData);
        console.log(`✅ Loaded ${developedPhotos.length} photos`);
        
        // Display photos
        displayPhotos();
        
        // Set today's date on all photos
        setDates();
        
    } else {
        console.error('❌ No photos found!');
        alert('No photos found. Returning to start...');
        window.location.href = 'camera-start.html'
    }
}

// ============================================
// DISPLAY PHOTOS
// ============================================

function displayPhotos() {
    const photoElements = [photoContent1, photoContent2, photoContent3];
    
    developedPhotos.forEach((photoData, index) => {
        if (photoElements[index]) {
            photoElements[index].style.backgroundImage = `url(${photoData})`;
        }
    });
    
    console.log('✅ Photos displayed');
}

// ============================================
// SET DATES
// ============================================

function setDates() {
    const today = new Date();
    const dateStr = `${today.getMonth() + 1}/${today.getDate()}/${today.getFullYear()}`;
    
    date1.textContent = dateStr;
    date2.textContent = dateStr;
    date3.textContent = dateStr;
}

// ============================================
// FULLSCREEN VIEWER
// ============================================

function openFullscreen(index) {
    currentFullscreenIndex = index;
    fullscreenImage.src = developedPhotos[index];
    fullscreenViewer.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closeFullscreen() {
    fullscreenViewer.classList.add('hidden');
    document.body.style.overflow = 'auto';
}

function showPrevPhoto() {
    currentFullscreenIndex = (currentFullscreenIndex - 1 + developedPhotos.length) % developedPhotos.length;
    fullscreenImage.src = developedPhotos[currentFullscreenIndex];
}

function showNextPhoto() {
    currentFullscreenIndex = (currentFullscreenIndex + 1) % developedPhotos.length;
    fullscreenImage.src = developedPhotos[currentFullscreenIndex];
}

// ============================================
// SELECTION MANAGEMENT
// ============================================

function getSelectedPhotos() {
    const selected = [];
    if (check1.checked) selected.push(0);
    if (check2.checked) selected.push(1);
    if (check3.checked) selected.push(2);
    return selected;
}

function selectAll() {
    const allChecked = check1.checked && check2.checked && check3.checked;
    check1.checked = !allChecked;
    check2.checked = !allChecked;
    check3.checked = !allChecked;
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
            link.download = `film-photo-${index + 1}-${Date.now()}.jpg`;
            link.href = developedPhotos[index];
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
    
    // Try native share
    if (navigator.share) {
        try {
            const files = [];
            
            for (let index of selected) {
                const response = await fetch(developedPhotos[index]);
                const blob = await response.blob();
                const file = new File([blob], `photo-${index + 1}.jpg`, { type: 'image/jpeg' });
                files.push(file);
            }
            
            await navigator.share({
                files: files,
                title: 'My Film Photos!',
                text: 'Check out my vintage film photos!'
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
        printWindow.document.write(`<img src="${developedPhotos[index]}">`);
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
    window.location.href = 'camera-start.html';
}

// ============================================
// EVENT LISTENERS
// ============================================

// Photo click - open fullscreen
document.querySelectorAll('.vintage-photo').forEach((photo, index) => {
    photo.addEventListener('click', (e) => {
        if (!e.target.matches('input[type="checkbox"]') && !e.target.matches('label')) {
            openFullscreen(index);
        }
    });
});

// Fullscreen controls
closeBtn.addEventListener('click', closeFullscreen);
prevBtn.addEventListener('click', showPrevPhoto);
nextBtn.addEventListener('click', showNextPhoto);

// Close fullscreen on background click
fullscreenViewer.addEventListener('click', (e) => {
    if (e.target === fullscreenViewer) {
        closeFullscreen();
    }
});

// Keyboard navigation in fullscreen
document.addEventListener('keydown', (e) => {
    if (!fullscreenViewer.classList.contains('hidden')) {
        if (e.key === 'Escape') closeFullscreen();
        if (e.key === 'ArrowLeft') showPrevPhoto();
        if (e.key === 'ArrowRight') showNextPhoto();
    }
    
    // Restart shortcut
    if (e.key.toLowerCase() === 'r' && fullscreenViewer.classList.contains('hidden')) {
        restart();
    }
});

// Action buttons
selectAllBtn.addEventListener('click', selectAll);
downloadBtn.addEventListener('click', downloadSelected);
shareBtn.addEventListener('click', shareSelected);
printBtn.addEventListener('click', printSelected);
restartBtn.addEventListener('click', restart);

// ============================================
// INITIALIZATION ON PAGE LOAD
// ============================================

document.addEventListener('DOMContentLoaded', init);

console.log('📸 Film results ready!');
console.log('💡 Click photos to view fullscreen');
console.log('💡 Press "R" to restart');
