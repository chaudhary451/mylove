// =============================================================
//  script.js — Premium Romantic Website Logic
//  Pink Glassmorphism Love Theme
// =============================================================

// ─── GLOBAL: Page navigation ──────────────────────────────────
function navigateTo(pageUrl) {
  // Smooth fade-out before navigation
  document.body.style.transition = 'opacity 0.35s ease';
  document.body.style.opacity = '0';
  setTimeout(() => {
    window.location.href = pageUrl;
  }, 320);
}

// Fade in on page load
document.addEventListener('DOMContentLoaded', () => {
  document.body.style.opacity = '0';
  requestAnimationFrame(() => {
    document.body.style.transition = 'opacity 0.5s ease';
    document.body.style.opacity = '1';
  });
});

// =============================================================
//  index.html — PASSCODE PAGE
// =============================================================
if (
  window.location.pathname.endsWith('index.html') ||
  window.location.pathname === '/' ||
  window.location.pathname === ''
) {
  const correctPasscode = '4669';
  let enteredPasscode = '';

  const passcodeDots = document.getElementById('passcodeDots');
  const passcodeMessage = document.getElementById('passcodeMessage');

  // Attach listeners to all numpad buttons
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

      // Ripple effect on button press
      createRipple(button);

      if (enteredPasscode.length === 4) {
        evaluatePasscode();
      }
    });

    // Keyboard support — allow typing digits
  });

  // Physical keyboard support
  document.addEventListener('keydown', e => {
    if (/^[0-9]$/.test(e.key) && enteredPasscode.length < 4) {
      enteredPasscode += e.key;
      updatePasscodeDots();
      if (enteredPasscode.length === 4) evaluatePasscode();
    } else if (e.key === 'Backspace' || e.key === 'Escape') {
      clearPasscode();
    }
  });

  function evaluatePasscode() {
    if (enteredPasscode === correctPasscode) {
      // ✅ Correct
      showMessage('Yayy! Welcome 💗', false);
      // Glow the dots pink
      passcodeDots.querySelectorAll('.dot').forEach(dot => {
        dot.style.boxShadow = '0 0 20px rgba(255,79,163,0.9), 0 0 40px rgba(255,79,163,0.4)';
      });
      setTimeout(() => navigateTo('countdown.html'), 1100);
    } else {
      // ❌ Wrong
      showMessage('Incorrect Passcode ✕', true);
      // Shake the dots
      passcodeDots.style.animation = 'none';
      requestAnimationFrame(() => {
        passcodeDots.style.animation = 'shake 0.4s cubic-bezier(0.36,0.07,0.19,0.97)';
      });
      setTimeout(() => {
        clearPasscode();
        passcodeDots.style.animation = '';
      }, 1500);
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
    // Force reflow
    void passcodeMessage.offsetWidth;
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
      }
    });
  }

  // Ripple animation on button click
  function createRipple(button) {
    const ripple = document.createElement('span');
    ripple.style.cssText = `
      position: absolute;
      width: 100%; height: 100%;
      top: 0; left: 0;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(255,79,163,0.35) 0%, transparent 70%);
      transform: scale(0);
      animation: rippleAnim 0.45s ease forwards;
      pointer-events: none;
    `;
    button.style.position = 'relative';
    button.style.overflow = 'hidden';
    button.appendChild(ripple);
    setTimeout(() => ripple.remove(), 500);
  }

  // Inject ripple keyframe
  const styleTag = document.createElement('style');
  styleTag.textContent = `
    @keyframes rippleAnim {
      to { transform: scale(2.5); opacity: 0; }
    }
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      20%       { transform: translateX(-10px); }
      40%       { transform: translateX(10px); }
      60%       { transform: translateX(-6px); }
      80%       { transform: translateX(6px); }
    }
  `;
  document.head.appendChild(styleTag);

  updatePasscodeDots();
}

// =============================================================
//  countdown.html — TIMER PAGE
// =============================================================
if (window.location.pathname.endsWith('countdown.html')) {
  // ── Set your relationship start date here ──────────────────
  const startDate = new Date('2025-01-01T00:00:00');

  const daysEl = document.getElementById('days');
  const hoursEl = document.getElementById('hours');
  const minutesEl = document.getElementById('minutes');
  const secondsEl = document.getElementById('seconds');

  function pad(n) { return String(n).padStart(2, '0'); }

  // Animate value change (flip effect)
  function animateValue(el, newVal) {
    if (el.textContent === newVal) return;
    el.style.transform = 'scale(0.88)';
    el.style.opacity = '0.6';
    setTimeout(() => {
      el.textContent = newVal;
      el.style.transform = 'scale(1)';
      el.style.opacity = '1';
    }, 150);
  }

  // Add transition to timer values
  document.querySelectorAll('.timer-value').forEach(el => {
    el.style.transition = 'transform 0.15s ease, opacity 0.15s ease';
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
  // Tab logic, lightbox, and music are all handled inline
  // in recap.html for cleaner scoping. Nothing extra needed here.

  // Legacy fallback: support old .icon-button data-content pattern
  // if the page still uses the old markup
  const mainRecapButtons = document.getElementById('mainRecapButtons');
  const septemberPicSection = document.getElementById('septemberPicSection');
  const januaryPicSection = document.getElementById('januaryPicSection');
  const musicListSection = document.getElementById('musicListSection');

  if (mainRecapButtons) {
    // Old recap layout — keep working
    const recapHeading = document.getElementById('recapHeading');
    const backButtons = document.querySelectorAll('.back-to-recap-button');

    document.querySelectorAll('.icon-button').forEach(button => {
      button.addEventListener('click', () => {
        const contentType = button.dataset.content;
        [septemberPicSection, januaryPicSection, musicListSection, mainRecapButtons].forEach(s => {
          if (s) s.classList.add('hidden');
        });
        if (contentType === 'september-pic' && septemberPicSection) {
          septemberPicSection.classList.remove('hidden');
          if (recapHeading) recapHeading.textContent = 'Best Pics!!';
        } else if (contentType === 'january-pic' && januaryPicSection) {
          januaryPicSection.classList.remove('hidden');
          if (recapHeading) recapHeading.textContent = 'Our Pictures';
        } else if (contentType === 'music-list' && musicListSection) {
          musicListSection.classList.remove('hidden');
          if (recapHeading) recapHeading.textContent = 'Our Favorite Songs';
        }
      });
    });

    backButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        [septemberPicSection, januaryPicSection, musicListSection].forEach(s => {
          if (s) s.classList.add('hidden');
        });
        if (mainRecapButtons) mainRecapButtons.classList.remove('hidden');
        if (recapHeading) recapHeading.textContent = "Let's recap our time together";
      });
    });
  }

  // Music bounce + double-click for any music-item
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
//  message.html — MESSAGE PAGE
// =============================================================
if (window.location.pathname.endsWith('message.html')) {
  // showMessage / hideMessage legacy support
  window.showMessage = function () {
    const box = document.getElementById('loveMessage');
    if (box) {
      box.style.display = 'block';
      box.style.animation = 'fadeUp 0.5s cubic-bezier(0.22,1,0.36,1) both';
    }
    const envelopeImg = document.querySelector('.envelope-img');
    if (envelopeImg) envelopeImg.style.display = 'none';
  };

  window.hideMessage = function () {
    const box = document.getElementById('loveMessage');
    if (box) box.style.display = 'none';
    const envelopeImg = document.querySelector('.envelope-img');
    if (envelopeImg) envelopeImg.style.display = '';
  };
}

// =============================================================
//  thankyou.html — THANK YOU PAGE (no extra logic needed)
// =============================================================
// All logic is inline in thankyou.html

// =============================================================
//  GLOBAL: Mouse-follow ambient glow effect
// =============================================================
(function initMouseGlow() {
  const glow = document.createElement('div');
  glow.style.cssText = `
    position: fixed;
    width: 320px;
    height: 320px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(255,79,163,0.07) 0%, transparent 70%);
    pointer-events: none;
    z-index: 0;
    transform: translate(-50%, -50%);
    transition: left 0.6s ease, top 0.6s ease;
    filter: blur(20px);
  `;
  document.body.appendChild(glow);

  let ticking = false;
  document.addEventListener('mousemove', e => {
    if (!ticking) {
      requestAnimationFrame(() => {
        glow.style.left = e.clientX + 'px';
        glow.style.top = e.clientY + 'px';
        ticking = false;
      });
      ticking = true;
    }
  });
})();
