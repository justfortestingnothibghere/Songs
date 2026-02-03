/* =========================================
   1. INITIALIZATION & FEATURES
========================================= */
document.addEventListener('DOMContentLoaded', () => {
    
    // Retrieve Config from HTML (Window Object)
    const config = window.siteConfig;

    // A. Set Thumbnail via JS
    const videoEl = document.getElementById('myVideo');
    if(config && config.thumbnailUrl) {
        videoEl.setAttribute('poster', config.thumbnailUrl);
    }

    // B. Initialize Plyr Video Player
    const player = new Plyr('#myVideo', {
        controls: ['play-large', 'play', 'progress', 'current-time', 'mute', 'volume', 'fullscreen', 'settings'],
        hideControls: true
    });

    // C. Inject Watermark via JS
    if(config && config.watermarkText) {
        injectWatermark(config.watermarkText);
    }

    // D. Start Background Animation
    initParticles();
    
    // E. Initialize Security Layer
    initSecurity();
});

/* =========================================
   2. WATERMARK LOGIC
========================================= */
function injectWatermark(text) {
    const wrapper = document.getElementById('videoContainer');
    if (!wrapper) return;

    const wmDiv = document.createElement('div');
    wmDiv.classList.add('watermark-overlay');
    wmDiv.innerHTML = text;
    
    wrapper.appendChild(wmDiv);
}

/* =========================================
   3. UI INTERACTION (Drawer & Share & Support)
========================================= */
// Drawer Toggle
const menuBtn = document.getElementById('menuToggle');
const drawer = document.getElementById('drawer');

if(menuBtn && drawer) {
    menuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isHidden = drawer.style.display === 'none' || drawer.style.display === '';
        drawer.style.display = isHidden ? 'flex' : 'none';
        
        if (isHidden) menuBtn.classList.add('active');
        else menuBtn.classList.remove('active');
    });

    // Close drawer when clicking outside
    document.addEventListener('click', (e) => {
        if (!drawer.contains(e.target) && !menuBtn.contains(e.target)) {
            drawer.style.display = 'none';
            menuBtn.classList.remove('active');
        }
    });
}

// Support Popup Toggle
function toggleSupport() {
    const popup = document.getElementById('supportPopup');
    if (popup.style.display === 'flex') {
        popup.style.display = 'none';
    } else {
        popup.style.display = 'flex';
    }
}

// Share Functionality
async function shareLink() {
    const shareData = {
        title: document.title,
        text: 'Watch this video on @TEAM_X_OG,s WEB',
        url: window.location.href
    };
    try {
        await navigator.share(shareData);
    } catch (err) {
        navigator.clipboard.writeText(window.location.href);
        alert("Link copied to clipboard!");
    }
}

/* =========================================
   4. SECURITY LAYER
========================================= */
function initSecurity() {
    // Disable Context Menu (Right Click)
    document.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        showSecurityWarning();
    });

    // Disable Key Combinations for DevTools
    document.addEventListener('keydown', function(e) {
        if (e.keyCode == 123 || // F12
            (e.ctrlKey && e.shiftKey && e.keyCode == 73) || // Ctrl+Shift+I
            (e.ctrlKey && e.shiftKey && e.keyCode == 67) || // Ctrl+Shift+C
            (e.ctrlKey && e.keyCode == 85)) // Ctrl+U
        {
            e.preventDefault();
            showSecurityWarning();
        }
    });
}

function showSecurityWarning() {
    const modal = document.getElementById('securityModal');
    if(modal) modal.style.display = 'flex';
}

function closeSecurity() {
    const modal = document.getElementById('securityModal');
    if(modal) modal.style.display = 'none';
}

/* =========================================
   5. INTENT LOGIC
========================================= */
function play_intent(pkg) {
    // Read URL from Global Config
    const rawUrl = window.siteConfig ? window.siteConfig.videoUrl.trim() : "";
    
    if (!rawUrl || rawUrl.includes("{{")) {
        alert("Video URL not found or invalid.");
        return;
    }
    let cleanUrl = rawUrl.replace(/^https?:\/\//, '');
    window.location.href = `intent://${cleanUrl}#Intent;package=${pkg};type=video/*;scheme=https;end`;
}

/* =========================================
   6. BACKGROUND PARTICLE ANIMATION
========================================= */
function initParticles() {
    const canvas = document.getElementById("particle-canvas");
    if(!canvas) return;

    const ctx = canvas.getContext("2d");
    let w, h, particles = [];

    const resize = () => { 
        w = canvas.width = window.innerWidth; 
        h = canvas.height = window.innerHeight; 
    };
    
    window.addEventListener('resize', resize);
    resize();

    class P {
        constructor() {
            this.x = Math.random() * w;
            this.y = Math.random() * h;
            this.vx = (Math.random() - 0.5) * 1.5;
            this.vy = (Math.random() - 0.5) * 1.5;
        }
        update() {
            this.x += this.vx;
            this.y += this.vy;
            if(this.x < 0 || this.x > w) this.vx *= -1;
            if(this.y < 0 || this.y > h) this.vy *= -1;
        }
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, 2, 0, Math.PI * 2);
            ctx.fillStyle = "rgba(0, 240, 255, 0.6)";
            ctx.fill();
        }
    }

    const pCount = window.innerWidth < 600 ? 40 : 80;
    for(let i=0; i<pCount; i++) particles.push(new P());

    function anim() {
        ctx.clearRect(0, 0, w, h);
        particles.forEach((p, i) => {
            p.update();
            p.draw();
            for(let j=i; j<particles.length; j++){
                let dx = p.x - particles[j].x;
                let dy = p.y - particles[j].y;
                let dist = Math.sqrt(dx*dx + dy*dy);
                if(dist < 100) {
                    ctx.beginPath();
                    ctx.strokeStyle = `rgba(0, 240, 255, ${0.4 - dist/100})`;
                    ctx.lineWidth = 0.5;
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }
        });
        requestAnimationFrame(anim);
    }
    anim();
}
