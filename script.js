// =============================================================
//  script.js — Premium Romantic Website Logic
//  3D Glassmorphism Love Theme with Apple-Level Animations
// =============================================================

// ─── GLOBAL: Page Transitions ────────────────────────────────
function navigateTo(pageUrl) {
  // Smooth fade-out before navigation
  document.body.style.transition = 'opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1), transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
  document.body.style.opacity = '0';
  document.body.style.transform = 'scale(0.98)';
  setTimeout(() => {
    window.location.href = pageUrl;
  }, 380);
}

// Fade in on page load
document.addEventListener('DOMContentLoaded', () => {
  document.body.style.opacity = '0';
  document.body.style.transform = 'scale(1.02)';
  requestAnimationFrame(() => {
    document.body.style.transition = 'opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
    document.body.style.opacity = '1';
    document.body.style.transform = 'scale(1)';
  });
  
  // Initialize the 3D Glass Hearts engine if canvas exists
  initGlassHeartsEngine();
});

// =============================================================
//  3D GLASS HEARTS CANVAS PHYSICS ENGINE
// =============================================================
function initGlassHeartsEngine() {
  const canvas = document.getElementById('heartsCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width = canvas.width = window.innerWidth;
  let height = canvas.height = window.innerHeight;

  // Handle high DPI screens for crisp rendering
  const dpr = window.devicePixelRatio || 1;
  
  function resizeCanvas() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.scale(dpr, dpr);
  }
  
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  // Core properties
  const hearts = [];
  const maxHearts = Math.min(28, Math.floor((width * height) / 32000)); // Adaptive count for performance
  const particles = [];
  const maxParticles = Math.min(45, Math.floor((width * height) / 20000));

  // Pointer state for repulsion and parallax
  const pointer = {
    x: width / 2,
    y: height / 2,
    targetX: width / 2,
    targetY: height / 2,
    active: false,
    radius: 130 // Repulsion range
  };

  // Gyroscope tilt state (for mobile parallax)
  const tilt = {
    x: 0,
    y: 0,
    targetX: 0,
    targetY: 0
  };

  // Track pointer movements
  const updatePointer = (e) => {
    const x = e.touches ? e.touches[0].clientX : e.clientX;
    const y = e.touches ? e.touches[0].clientY : e.clientY;
    pointer.targetX = x;
    pointer.targetY = y;
    pointer.active = true;
  };

  window.addEventListener('mousemove', updatePointer);
  window.addEventListener('touchmove', updatePointer, { passive: true });
  window.addEventListener('touchend', () => { pointer.active = false; });
  window.addEventListener('mouseleave', () => { pointer.active = false; });

  // Mobile Device Orientation (Gyroscope Parallax)
  let gyroPermissionGranted = false;
  
  function requestGyroPermission() {
    if (typeof DeviceOrientationEvent !== 'undefined' && 
        typeof DeviceOrientationEvent.requestPermission === 'function') {
      DeviceOrientationEvent.requestPermission()
        .then(response => {
          if (response === 'granted') {
            gyroPermissionGranted = true;
            window.addEventListener('deviceorientation', handleOrientation);
          }
        })
        .catch(console.error);
    } else {
      window.addEventListener('deviceorientation', handleOrientation);
    }
  }

  function handleOrientation(e) {
    // gamma is left-to-right tilt (-90 to 90), beta is front-to-back tilt (-180 to 180)
    let gx = e.gamma || 0; // -90 to 90
    let gy = e.beta || 0;  // -180 to 180

    // Clamp values to realistic handheld angles
    gx = Math.max(-45, Math.min(45, gx));
    gy = Math.max(-45, Math.min(45, gy - 40)); // center around vertical reading stance

    // Normalize tilt between -1 and 1
    tilt.targetX = gx / 45;
    tilt.targetY = gy / 45;
  }

  // Trigger permission request on first user touch/click
  window.addEventListener('click', requestGyroPermission, { once: true });
  window.addEventListener('touchstart', requestGyroPermission, { once: true });

  // Class representing a 3D Glass Heart
  class GlassHeart {
    constructor(isInitial = false) {
      this.reset(isInitial);
    }

    reset(isInitial = false) {
      this.z = 0.3 + Math.random() * 1.7; // Depth layer (0.3 = far, 2.0 = very close)
      this.size = (18 + Math.random() * 22) * this.z; // Size scaled by depth
      this.x = Math.random() * width;
      // Start below screen initially or disperse vertically if setup
      this.y = isInitial ? Math.random() * height : height + this.size + 40;
      
      // Speed scales with depth for natural parallax speed
      this.speedY = -(0.35 + Math.random() * 0.45) * this.z;
      this.speedX = (Math.random() - 0.5) * 0.25 * this.z;
      
      this.angle = (Math.random() - 0.5) * 0.3;
      this.spinSpeed = (Math.random() - 0.5) * 0.004 * this.z;
      this.opacity = Math.min(1.0, 0.2 + (this.z * 0.4)); // Far hearts are faint
      
      // Physics forces
      this.vx = 0;
      this.vy = 0;
      this.friction = 0.95;
    }

    update(parallaxX, parallaxY) {
      // 1. Interactive Pointer Repulsion Physics
      if (pointer.active) {
        const dx = this.x - pointer.x;
        const dy = this.y - pointer.y;
        const distance = Math.hypot(dx, dy);
        
        // Scale repulsion radius based on z depth layer
        const repulsionRadius = pointer.radius * (0.6 + this.z * 0.4);
        
        if (distance < repulsionRadius) {
          const force = (repulsionRadius - distance) / repulsionRadius;
          // Apply outward acceleration
          const angle = Math.atan2(dy, dx);
          const push = force * 1.4 * this.z; // Closer hearts pushed faster
          this.vx += Math.cos(angle) * push;
          this.vy += Math.sin(angle) * push;
        }
      }

      // Apply physics velocity
      this.x += this.speedX + this.vx;
      this.y += this.speedY + this.vy;
      
      // Apply friction
      this.vx *= this.friction;
      this.vy *= this.friction;

      // Spin rotation
      this.angle += this.spinSpeed;

      // Recycle when moving off-screen
      if (this.y < -this.size || this.x < -this.size || this.x > width + this.size) {
        this.reset(false);
      }
    }

    draw(parallaxX, parallaxY) {
      // 2. Compute Depth / Parallax Offset
      // Deeper hearts shift more with parallax
      const px = parallaxX * this.z * 25;
      const py = parallaxY * this.z * 25;

      const drawX = this.x + px;
      const drawY = this.y + py;

      ctx.save();
      ctx.translate(drawX, drawY);
      ctx.rotate(this.angle);
      ctx.scale(this.size / 100, this.size / 100);

      // 3. Volumetric 3D Drop Shadow
      // Deeper shadows are more offset and blurred
      ctx.shadowColor = `rgba(255, 79, 163, ${0.12 * this.opacity})`;
      ctx.shadowBlur = 10 + this.z * 8;
      ctx.shadowOffsetX = 3 + this.z * 5;
      ctx.shadowOffsetY = 6 + this.z * 10;

      // Heart Path
      ctx.beginPath();
      ctx.moveTo(0, -25);
      ctx.bezierCurveTo(45, -75, 90, -25, 0, 75);
      ctx.bezierCurveTo(-90, -25, -45, -75, 0, -25);
      ctx.closePath();

      // 4. Volumetric Glass Radial Gradient Fill
      // Specular highlights are offset to upper left (-20, -25)
      const fillGrad = ctx.createRadialGradient(-15, -25, 10, 0, 0, 85);
      // Premium light pink glass colors
      fillGrad.addColorStop(0, `rgba(255, 240, 247, ${0.8 * this.opacity})`);
      fillGrad.addColorStop(0.3, `rgba(255, 182, 217, ${0.5 * this.opacity})`);
      fillGrad.addColorStop(0.85, `rgba(255, 79, 163, ${0.2 * this.opacity})`);
      fillGrad.addColorStop(1, `rgba(255, 133, 194, ${0.15 * this.opacity})`);
      ctx.fillStyle = fillGrad;
      ctx.fill();

      // Remove shadow for border and reflection lines to avoid blur
      ctx.shadowColor = 'transparent';

      // 5. Specular Border / Beveled Glass Edge Glow
      const borderGrad = ctx.createLinearGradient(-40, -40, 40, 75);
      borderGrad.addColorStop(0, `rgba(255, 255, 255, ${0.9 * this.opacity})`); // Shiny highlights
      borderGrad.addColorStop(0.4, `rgba(255, 214, 234, ${0.3 * this.opacity})`);
      borderGrad.addColorStop(1, `rgba(255, 79, 163, ${0.7 * this.opacity})`); // Hot pink edge glow
      ctx.strokeStyle = borderGrad;
      ctx.lineWidth = 3.5;
      ctx.stroke();

      // 6. Extra Glass Refraction Reflection Sheen (Inner Arc Overlay)
      ctx.beginPath();
      ctx.moveTo(-30, -40);
      ctx.bezierCurveTo(-12, -60, 10, -50, -10, -25);
      ctx.bezierCurveTo(-14, -34, -26, -38, -30, -40);
      ctx.closePath();
      const reflectionGrad = ctx.createLinearGradient(-25, -50, -5, -25);
      reflectionGrad.addColorStop(0, `rgba(255, 255, 255, ${0.65 * this.opacity})`);
      reflectionGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = reflectionGrad;
      ctx.fill();

      ctx.restore();
    }
  }

  // Class representing a floating light particle (sparkle)
  class GlassParticle {
    constructor(isInitial = false) {
      this.reset(isInitial);
    }

    reset(isInitial = false) {
      this.x = Math.random() * width;
      this.y = isInitial ? Math.random() * height : height + 10;
      this.z = 0.5 + Math.random() * 1.5;
      this.size = (1.5 + Math.random() * 2) * this.z;
      this.speedY = -(0.2 + Math.random() * 0.4) * this.z;
      this.speedX = (Math.random() - 0.5) * 0.15;
      this.opacity = 0.2 + Math.random() * 0.5;
      this.color = Math.random() > 0.4 ? 'rgba(255,255,255,' : 'rgba(255,182,217,';
      this.pulseSpeed = 0.01 + Math.random() * 0.02;
      this.pulseVal = Math.random() * Math.PI;
    }

    update() {
      this.y += this.speedY;
      this.x += this.speedX;
      this.pulseVal += this.pulseSpeed;

      if (this.y < -10 || this.x < -10 || this.x > width + 10) {
        this.reset(false);
      }
    }

    draw(parallaxX, parallaxY) {
      const px = parallaxX * this.z * 15;
      const py = parallaxY * this.z * 15;
      const currentOpacity = Math.max(0.1, this.opacity * (0.6 + Math.sin(this.pulseVal) * 0.4));

      ctx.save();
      ctx.beginPath();
      ctx.arc(this.x + px, this.y + py, this.size, 0, Math.PI * 2);
      ctx.fillStyle = this.color + currentOpacity + ')';
      ctx.shadowColor = 'rgba(255, 133, 194, 0.4)';
      ctx.shadowBlur = 6;
      ctx.fill();
      ctx.restore();
    }
  }

  // Populate elements
  for (let i = 0; i < maxHearts; i++) {
    hearts.push(new GlassHeart(true));
  }
  for (let i = 0; i < maxParticles; i++) {
    particles.push(new GlassParticle(true));
  }

  // Linear interpolation for smooth motion
  let currentParallaxX = 0;
  let currentParallaxY = 0;

  // Animation Loop
  function animate() {
    ctx.clearRect(0, 0, width, height);

    // 1. Interpolated Parallax Coordinates
    let targetParallaxX = 0;
    let targetParallaxY = 0;

    if (pointer.active) {
      // Desktop cursor offset normalized (-0.5 to 0.5)
      targetParallaxX = (pointer.x / width - 0.5);
      targetParallaxY = (pointer.y / height - 0.5);
    }

    // Blend desktop cursor and phone orientation tilt inputs
    // Linear interpolation creates that premium lag / heavy fluid feel
    const combinedX = targetParallaxX * 0.6 + tilt.targetX * 0.4;
    const combinedY = targetParallaxY * 0.6 + tilt.targetY * 0.4;

    currentParallaxX += (combinedX - currentParallaxX) * 0.08;
    currentParallaxY += (combinedY - currentParallaxY) * 0.08;

    // Smooth pointer coordinate tracking
    pointer.x += (pointer.targetX - pointer.x) * 0.12;
    pointer.y += (pointer.targetY - pointer.y) * 0.12;

    // 2. Draw & Update background particles
    particles.forEach(p => {
      p.update();
      p.draw(currentParallaxX, currentParallaxY);
    });

    // 3. Draw & Update glass hearts
    hearts.forEach(h => {
      h.update(currentParallaxX, currentParallaxY);
      h.draw(currentParallaxX, currentParallaxY);
    });

    requestAnimationFrame(animate);
  }

  animate();
}


// =============================================================
//  index.html — PASSCODE PAGE
// =============================================================
if (
  window.location.pathname.endsWith('index.html') ||
  window.location.pathname === '/' ||
  window.location.pathname === '' ||
  window.location.pathname.endsWith('mylove/')
) {
  const correctPasscode = '4669';
  let enteredPasscode = '';

  const passcodeDots = document.getElementById('passcodeDots');
  const passcodeMessage = document.getElementById('passcodeMessage');

  // Attach listeners to numpad buttons
  document.querySelectorAll('.num-button').forEach(button => {
    button.addEventListener('click', () => {
      const value = button.dataset.value;

      if (value === 'cancel') {
        clearPasscode();
        return;
      }

      if (enteredPasscode.length >= 4) return;

      enteredPasscode += value;
      updatePasscodeDots();
      createRipple(button);

      if (enteredPasscode.length === 4) {
        // Debounce slightly for user feedback
        setTimeout(evaluatePasscode, 200);
      }
    });
  });

  // Physical keyboard support
  document.addEventListener('keydown', e => {
    if (/^[0-9]$/.test(e.key) && enteredPasscode.length < 4) {
      enteredPasscode += e.key;
      updatePasscodeDots();
      if (enteredPasscode.length === 4) {
        setTimeout(evaluatePasscode, 200);
      }
    } else if (e.key === 'Backspace' || e.key === 'Escape') {
      clearPasscode();
    }
  });

  function evaluatePasscode() {
    if (enteredPasscode === correctPasscode) {
      showMessage('Yayy! Access Granted 💗', false);
      passcodeDots.querySelectorAll('.dot').forEach(dot => {
        dot.style.boxShadow = '0 0 24px rgba(255,79,163,1.0), 0 0 45px rgba(255,79,163,0.5)';
        dot.style.borderColor = 'var(--pink-hot)';
      });
      setTimeout(() => navigateTo('countdown.html'), 1000);
    } else {
      showMessage('Incorrect Passcode ✕', true);
      passcodeDots.style.animation = 'none';
      void passcodeDots.offsetWidth; // Trigger reflow
      passcodeDots.style.animation = 'shake 0.45s cubic-bezier(0.36,0.07,0.19,0.97)';
      
      passcodeDots.querySelectorAll('.dot').forEach(dot => {
        dot.style.borderColor = '#ff4f70';
        dot.style.boxShadow = '0 0 12px rgba(255, 79, 112, 0.4)';
      });

      setTimeout(() => {
        clearPasscode();
        passcodeDots.style.animation = '';
      }, 1300);
    }
  }

  function clearPasscode() {
    enteredPasscode = '';
    updatePasscodeDots();
    passcodeMessage.textContent = '';
    passcodeMessage.classList.remove('visible', 'error');
  }

  function showMessage(text, isError) {
    passcodeMessage.textContent = text;
    passcodeMessage.classList.remove('visible', 'error');
    void passcodeMessage.offsetWidth; // Force reflow
    passcodeMessage.classList.add('visible');
    if (isError) passcodeMessage.classList.add('error');
  }

  function updatePasscodeDots() {
    const dots = passcodeDots.querySelectorAll('.dot');
    dots.forEach((dot, index) => {
      if (index < enteredPasscode.length) {
        dot.classList.add('filled');
      } else {
        dot.classList.remove('filled');
        dot.style.boxShadow = '';
        dot.style.borderColor = '';
      }
    });
  }

  // Ripple click animation
  function createRipple(button) {
    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    ripple.style.cssText = `
      position: absolute;
      width: 100px; height: 100px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(255,79,163,0.4) 0%, transparent 60%);
      transform: translate(-50%, -50%) scale(0);
      pointer-events: none;
      animation: rippleAnim 0.5s cubic-bezier(0.1, 0.8, 0.3, 1) forwards;
    `;
    
    // Position ripple relative to click inside button
    button.style.position = 'relative';
    button.style.overflow = 'hidden';
    
    const rect = button.getBoundingClientRect();
    // Default to center if client x/y are not captured
    const left = rect.width / 2;
    const top = rect.height / 2;
    
    ripple.style.left = left + 'px';
    ripple.style.top = top + 'px';
    
    button.appendChild(ripple);
    setTimeout(() => ripple.remove(), 550);
  }

  updatePasscodeDots();
}

// =============================================================
//  countdown.html — TIMER PAGE
// =============================================================
if (window.location.pathname.endsWith('countdown.html')) {
  const startDate = new Date('2025-01-01T00:00:00');

  const daysEl = document.getElementById('days');
  const hoursEl = document.getElementById('hours');
  const minutesEl = document.getElementById('minutes');
  const secondsEl = document.getElementById('seconds');

  function pad(n) { return String(n).padStart(2, '0'); }

  // Flip-like scale animation for value change
  function animateValue(el, newVal) {
    if (el.textContent === newVal) return;
    el.style.transform = 'scale(0.85) translateY(5px)';
    el.style.opacity = '0.5';
    setTimeout(() => {
      el.textContent = newVal;
      el.style.transform = 'scale(1) translateY(0)';
      el.style.opacity = '1';
    }, 150);
  }

  document.querySelectorAll('.timer-value').forEach(el => {
    el.style.transition = 'transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.2s ease';
  });

  function updateCountdown() {
    const now = new Date();
    const diff = now.getTime() - startDate.getTime();

    if (diff < 0) {
      [daysEl, hoursEl, minutesEl, secondsEl].forEach(el => {
        if (el) el.textContent = '00';
      });
      return;
    }

    const totalSeconds = Math.floor(diff / 1000);
    const totalMinutes = Math.floor(totalSeconds / 60);
    const totalHours = Math.floor(totalMinutes / 60);
    const totalDays = Math.floor(totalHours / 24);

    if (daysEl) animateValue(daysEl, pad(totalDays));
    if (hoursEl) animateValue(hoursEl, pad(totalHours % 24));
    if (minutesEl) animateValue(minutesEl, pad(totalMinutes % 60));
    if (secondsEl) animateValue(secondsEl, pad(totalSeconds % 60));
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);
}

// =============================================================
//  recap.html — RECAP / GALLERY PAGE
// =============================================================
if (window.location.pathname.endsWith('recap.html')) {
  // Music interaction
  document.querySelectorAll('.music-item').forEach(item => {
    let clickTimeout = null;

    item.addEventListener('click', () => {
      item.classList.add('bounce');
      setTimeout(() => item.classList.remove('bounce'), 350);

      if (clickTimeout === null) {
        clickTimeout = setTimeout(() => { clickTimeout = null; }, 300);
      } else {
        clearTimeout(clickTimeout);
        clickTimeout = null;
        const url = item.dataset.url;
        if (url) window.open(url, '_blank');
      }
    });

    item.addEventListener('dblclick', () => {
      const url = item.dataset.url;
      if (url) window.open(url, '_blank');
    });
  });
}

// =============================================================
//  message.html — MESSAGE ENVELOPE
// =============================================================
if (window.location.pathname.endsWith('message.html')) {
  // Legacy wrappers for backward compatibility
  window.showMessage = function () {
    const box = document.getElementById('loveMessage');
    if (box) {
      box.style.display = 'block';
      box.style.animation = 'messageReveal 0.6s cubic-bezier(0.22, 1, 0.36, 1) both';
    }
    const envelopeImg = document.querySelector('.envelope-img') || document.getElementById('envelopeCard');
    if (envelopeImg) envelopeImg.style.display = 'none';
  };

  window.hideMessage = function () {
    const box = document.getElementById('loveMessage');
    if (box) box.style.display = 'none';
    const envelopeImg = document.querySelector('.envelope-img') || document.getElementById('envelopeCard');
    if (envelopeImg) envelopeImg.style.display = '';
  };
}

// =============================================================
//  3D PERSPECTIVE TILT COMPONENT (Apple Hover Parallax Effect)
// =============================================================
(function initCardTiltEffect() {
  // Apply tilt to gallery cards and statistics cards
  const tiltCards = document.querySelectorAll('.gallery-card, .stat-block, .envelope-card, .message-box');
  
  tiltCards.forEach(card => {
    // Skip placeholder cards
    if (card.querySelector('.photo-placeholder') && !card.querySelector('img')) return;

    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left; // x position inside element
      const y = e.clientY - rect.top;  // y position inside element
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      // Calculate rotation angles based on cursor offset (-10 to 10 degrees)
      const rotateX = ((centerY - y) / centerY) * 10;
      const rotateY = ((x - centerX) / centerX) * 10;
      
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px) scale(1.02)`;
      
      // Dynamic shine reflection overlay if styling supports it
      const shine = card.querySelector('.glass-shine');
      if (shine) {
        const px = (x / rect.width) * 100;
        const py = (y / rect.height) * 100;
        shine.style.background = `radial-gradient(circle at ${px}% ${py}%, rgba(255, 255, 255, 0.18) 0%, transparent 60%)`;
      }
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px) scale(1)';
      const shine = card.querySelector('.glass-shine');
      if (shine) {
        shine.style.background = 'transparent';
      }
    });
  });
})();
