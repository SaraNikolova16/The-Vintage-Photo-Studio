// ============================================
// FACE TRACKER - Professional Version
// ============================================

class FaceTracker {
    constructor(videoElement, options = {}) {
        this.video = videoElement;
        this.canvas = null;
        this.ctx = null;
        this.isRunning = false;
        this.animationFrame = null;
        this.onFaceCount = options.onFaceCount || null;
        this.modelsLoaded = false;
        this.init();
    }

    async init() {
        console.log('🎯 Loading face-api.js models...');
        await this.loadModels();
        this.createOverlay();
        console.log('✅ Face tracker ready!');
    }

    async loadModels() {
        try {
            const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/';
            await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
            await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
            this.modelsLoaded = true;
            console.log('✅ Models loaded!');
        } catch (error) {
            console.error('❌ Model load failed:', error);
        }
    }

    createOverlay() {
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'faceTrackingCanvas';
        this.canvas.style.position = 'fixed';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.width = '100vw';
        this.canvas.style.height = '100vh';
        this.canvas.style.pointerEvents = 'none';
        this.canvas.style.zIndex = '9999';
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.ctx = this.canvas.getContext('2d');
        document.body.appendChild(this.canvas);
    }

    async start() {
        if (this.isRunning) return;
        this.isRunning = true;
        console.log('▶️ Face tracking started!');
        this.detect();
    }

    stop() {
        this.isRunning = false;
        if (this.animationFrame) cancelAnimationFrame(this.animationFrame);
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    async detect() {
        if (!this.isRunning || !this.modelsLoaded) {
            this.animationFrame = requestAnimationFrame(() => this.detect());
            return;
        }

        try {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

            const detections = await faceapi
                .detectAllFaces(this.video, new faceapi.TinyFaceDetectorOptions())
                .withFaceLandmarks();

            if (detections && detections.length > 0) {
                if (this.onFaceCount) this.onFaceCount(detections.length);

                const videoRect = this.video.getBoundingClientRect();

                detections.forEach((detection, i) => {
                    const box = detection.detection.box;
                    const landmarks = detection.landmarks;
                    
                    // Scale from camera resolution to display size
                    const scaleX = videoRect.width / this.video.videoWidth;
                    const scaleY = videoRect.height / this.video.videoHeight;
                    
                    // Scale box
                    const scaledX = box.x * scaleX;
                    const scaledY = box.y * scaleY;
                    const scaledW = box.width * scaleX * 1.2;
                    const scaledH = box.height * scaleY * 1.2;

                    // ========================================
// CALCULATE FEATURES - IMPROVED
// ========================================

const mouth = landmarks.getMouth();
const leftEye = landmarks.getLeftEye();
const rightEye = landmarks.getRightEye();

// 1. SMILE - Use mouth corner height difference
let smileLevel = 0;
if (mouth.length > 0) {
    const leftCorner = mouth[0];
    const rightCorner = mouth[6];
    const topLip = mouth[3];
    const bottomLip = mouth[9];
    
    const mouthWidth = Math.abs(rightCorner.x - leftCorner.x);
    const mouthHeight = Math.abs(bottomLip.y - topLip.y);
    
    // Ratio method
    const ratio = mouthWidth / Math.max(mouthHeight, 1);
    
    // ADJUSTED: neutral = 3.0, smile = 4.2+
    smileLevel = Math.min(Math.max((ratio - 3.0) / 1.5, 0), 1);  // Changed formula!
    
    console.log('Mouth Ratio:', ratio.toFixed(2), '→ Smile:', Math.round(smileLevel * 100) + '%');
}

// 2. BLINK - Use eye height
let eyesOpen = true;
if (leftEye.length >= 6 && rightEye.length >= 6) {
    // Get vertical distance
    const leftHeight = Math.abs(leftEye[1].y - leftEye[5].y);
    const rightHeight = Math.abs(rightEye[1].y - rightEye[5].y);
    const avgHeight = (leftHeight + rightHeight) / 2;
    
    // CHANGED: Your eyes are 15-17 open, so closed should be < 10
    eyesOpen = avgHeight > 10;  // Changed from 3 to 10!
    
    console.log('Eyes:', avgHeight.toFixed(1), eyesOpen ? '👁️' : '🚫 CLOSED!');
}

                    // 3. CALCULATE PHOTO QUALITY SCORE
                    let qualityScore = 0;
                    // Face centered (30 points)
                    const centerOffset = Math.abs((scaledX + scaledW/2) - videoRect.width/2);
                    const centerScore = Math.max(0, 30 - (centerOffset / 5));
                    qualityScore += centerScore;
                    // Eyes open (25 points)
                    if (eyesOpen) qualityScore += 25;
                    // Smiling (25 points)
                    qualityScore += smileLevel * 25;
                    // Good distance (20 points)
                    const sizeScore = scaledW > 100 && scaledW < 200 ? 20 : 10;
                    qualityScore += sizeScore;

                    qualityScore = Math.round(qualityScore);

                    // ========================================
// DRAW ELEGANT UI - TOP RIGHT CORNER
// ========================================

// Use WINDOW coordinates, not video coordinates
const panelX = window.innerWidth - 230;  // 230px from right edge of SCREEN
const panelY = 20;  // 20px from top of SCREEN
const panelW = 200;
const panelH = 260;

// ELEGANT GLASS PANEL
this.ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
this.ctx.fillRect(panelX, panelY, panelW, panelH);

// SUBTLE BORDER
this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
this.ctx.lineWidth = 2;
this.ctx.strokeRect(panelX, panelY, panelW, panelH);

// FACE COUNT
this.ctx.fillStyle = '#ffffff';
this.ctx.font = 'bold 24px Arial';
this.ctx.textAlign = 'left';
this.ctx.fillText('👤 ' + detections.length, panelX + 15, panelY + 35);

// QUALITY SCORE
const scoreColor = qualityScore >= 90 ? '#4ade80' : qualityScore >= 70 ? '#fbbf24' : '#f87171';
this.ctx.fillStyle = '#ffffff';
this.ctx.font = '600 20px Arial';
this.ctx.fillText('Quality', panelX + 15, panelY + 70);

this.ctx.fillStyle = scoreColor;
this.ctx.font = 'bold 36px Arial';
this.ctx.fillText(qualityScore + '%', panelX + 15, panelY + 105);

const qualityText = qualityScore >= 90 ? 'Excellent' : qualityScore >= 70 ? 'Good' : 'Adjust';
this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
this.ctx.font = '500 16px Arial';
this.ctx.fillText(qualityText, panelX + 15, panelY + 125);

// SMILE METER - ELEGANT VERTICAL
this.ctx.fillStyle = '#ffffff';
this.ctx.font = '500 18px Arial';
this.ctx.fillText('😊 Smile', panelX + 15, panelY + 160);

// Vertical bar - clean style
const barW = 30;
const barH = 80;
const barX = panelX + 130;
const barY = panelY + 145;

// Background track
this.ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
this.ctx.fillRect(barX, barY, barW, barH);

// Filled portion - gradient
const gradient = this.ctx.createLinearGradient(barX, barY + barH, barX, barY);
gradient.addColorStop(0, '#f87171');
gradient.addColorStop(0.5, '#fbbf24');
gradient.addColorStop(1, '#4ade80');
this.ctx.fillStyle = gradient;

const fillHeight = barH * smileLevel;
this.ctx.fillRect(barX, barY + barH - fillHeight, barW, fillHeight);

// Border
this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
this.ctx.lineWidth = 2;
this.ctx.strokeRect(barX, barY, barW, barH);

// Percentage below bar
this.ctx.fillStyle = '#ffffff';
this.ctx.font = '500 14px Arial';
this.ctx.textAlign = 'center';
this.ctx.fillText(Math.round(smileLevel * 100) + '%', barX + barW/2, barY + barH + 18);
this.ctx.textAlign = 'left';

// BLINK WARNING - ELEGANT
if (!eyesOpen) {
    const warnW = 280;
    const warnH = 70;
    const warnX = videoRect.left + videoRect.width/2 - warnW/2;
    const warnY = videoRect.top + videoRect.height/2 - warnH/2;
    
    this.ctx.fillStyle = 'rgba(248, 113, 113, 0.95)';
    this.ctx.fillRect(warnX, warnY, warnW, warnH);
    
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(warnX, warnY, warnW, warnH);
    
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = 'bold 24px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('⚠️ Open your eyes', videoRect.left + videoRect.width/2, warnY + 45);
}
                });

            } else {
    // NO FACE - ELEGANT
    const videoRect = this.video.getBoundingClientRect();
    const panelX = window.innerWidth - 230;
const panelY = 20;
    
    this.ctx.fillStyle = 'rgba(248, 113, 113, 0.2)';
    this.ctx.fillRect(panelX, panelY, 200, 70);
    
    this.ctx.strokeStyle = 'rgba(248, 113, 113, 0.5)';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(panelX, panelY, 200, 70);
    
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = 'bold 22px Arial';
    this.ctx.textAlign = 'left';
    this.ctx.fillText('👤 No face', panelX + 15, panelY + 45);
}
        } catch (e) {
            console.error('Detection error:', e);
        }

        setTimeout(() => {
    this.animationFrame = requestAnimationFrame(() => this.detect());
}, 100);  // Changed from 66 to 100ms - slower updates = less blink
    }

    getCenter(points) {
        let x = 0, y = 0;
        points.forEach(p => {
            x += p.x;
            y += p.y;
        });
        return { x: x / points.length, y: y / points.length };
    }

    getEyeAspectRatio(eye) {
        const v1 = Math.abs(eye[1].y - eye[5].y);
        const v2 = Math.abs(eye[2].y - eye[4].y);
        const h = Math.abs(eye[0].x - eye[3].x);
        return (v1 + v2) / (2 * h);
    }

    destroy() {
        this.stop();
        if (this.canvas) this.canvas.remove();
    }
}

window.FaceTracker = FaceTracker;