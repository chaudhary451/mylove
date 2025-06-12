// script.js

// Function to navigate to different pages
function navigateTo(pageUrl) {
    window.location.href = pageUrl;
}

// ===========================================
// Logic for index.html (Passcode Page)
// ===========================================
if (window.location.pathname.endsWith('index.html') || window.location.pathname === '/') { // Handles '/' for root
    const correctPasscode = "1234"; // Aapka passcode
    let enteredPasscode = "";
    const passcodeDots = document.getElementById('passcodeDots');
    const passcodeMessage = document.getElementById('passcodeMessage');

    document.querySelectorAll('.num-button').forEach(button => {
        button.addEventListener('click', () => {
            const value = button.dataset.value;

            if (value === "cancel") {
                enteredPasscode = "";
                updatePasscodeDots();
                passcodeMessage.textContent = "";
                passcodeMessage.classList.remove('visible', 'error');
            } else if (enteredPasscode.length < 4) {
                enteredPasscode += value;
                updatePasscodeDots();

                if (enteredPasscode.length === 4) {
                    if (enteredPasscode === correctPasscode) {
                        passcodeMessage.textContent = "Yayy! :)";
                        passcodeMessage.classList.remove('error');
                        passcodeMessage.classList.add('visible');
                        // Navigate to Google Search Mock page after a short delay
                        setTimeout(() => {
                            navigateTo('countdown.html');
                        }, 1000); // 1 second delay
                    } else {
                        passcodeMessage.textContent = "Incorrect Passcode!";
                        passcodeMessage.classList.add('error', 'visible');
                        setTimeout(() => {
                            enteredPasscode = "";
                            updatePasscodeDots();
                            passcodeMessage.classList.remove('visible', 'error');
                        }, 1500); // Show error for 1.5 seconds
                    }
                }
            }
        });
    });

    function updatePasscodeDots() {
        const dots = passcodeDots.querySelectorAll('.dot');
        dots.forEach((dot, index) => {
            if (index < enteredPasscode.length) {
                dot.classList.add('filled');
            } else {
                dot.classList.remove('filled');
            }
        });
    }

    // Initial update for dots on page load
    updatePasscodeDots();
}

// ===========================================
// Logic for countdown.html
// ===========================================
if (window.location.pathname.endsWith('countdown.html')) {
    // Set your specific date and time here
    // Example: December 25, 2024, 00:00:00 (Year, Month-1, Day, Hour, Minute, Second)
    // Make sure the month is 0-indexed (Jan is 0, Dec is 11)
    const startDate = new Date('2025-01-01T00:00:00'); // Ye aapki relationship ki shuruat ki date hai

    const daysSpan = document.getElementById('days');
    const hoursSpan = document.getElementById('hours');
    const minutesSpan = document.getElementById('minutes');
    const secondsSpan = document.getElementById('seconds');

    function updateCountdown() {
        const now = new Date();
        const diff = now.getTime() - startDate.getTime(); // Difference in milliseconds

        if (diff < 0) { // If start date is in the future
            daysSpan.textContent = "00";
            hoursSpan.textContent = "00";
            minutesSpan.textContent = "00";
            secondsSpan.textContent = "00";
            return;
        }

        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        daysSpan.textContent = String(days).padStart(2, '0');
        hoursSpan.textContent = String(hours % 24).padStart(2, '0');
        minutesSpan.textContent = String(minutes % 60).padStart(2, '0');
        secondsSpan.textContent = String(seconds % 60).padStart(2, '0');
    }

    // Update countdown every second
    setInterval(updateCountdown, 1000);
    // Initial call to display immediately
    updateCountdown();
}

// ===========================================
// Logic for recap.html (Recap Page)
// ===========================================
if (window.location.pathname.endsWith('recap.html')) {
    const mainRecapButtons = document.getElementById('mainRecapButtons');
    const septemberPicSection = document.getElementById('septemberPicSection');
    const januaryPicSection = document.getElementById('januaryPicSection');
    const musicListSection = document.getElementById('musicListSection');
    const recapHeading = document.getElementById('recapHeading');

    const backButtons = document.querySelectorAll('.back-to-recap-button'); // Select all back buttons

    document.querySelectorAll('.icon-button').forEach(button => {
        button.addEventListener('click', () => {
            const contentType = button.dataset.content;

            // Hide all content sections first
            septemberPicSection.classList.add('hidden');
            januaryPicSection.classList.add('hidden');
            musicListSection.classList.add('hidden');
            mainRecapButtons.classList.add('hidden'); // Hide main selection buttons

            if (contentType === 'september-pic') {
                septemberPicSection.classList.remove('hidden');
                recapHeading.textContent = "Best Pics!!";
            } else if (contentType === 'january-pic') {
                januaryPicSection.classList.remove('hidden');
                recapHeading.textContent = "Our Pictures";
            } else if (contentType === 'music-list') {
                musicListSection.classList.remove('hidden');
                recapHeading.textContent = "Our Favorite Songs";
            }
        });
    });

    // Add event listener for all back buttons
    backButtons.forEach(button => {
        button.addEventListener('click', () => {
            showMainRecapPage();
        });
    });

    function showMainRecapPage() {
        septemberPicSection.classList.add('hidden');
        januaryPicSection.classList.add('hidden');
        musicListSection.classList.add('hidden');
        mainRecapButtons.classList.remove('hidden'); // Show main selection buttons
        recapHeading.textContent = "Let's recap our time together"; // Reset heading
    }
}

// ===========================================
// Logic for message.html and thankyou.html (no specific JS needed other than navigateTo)
// ===========================================
// The MapsTo function is global, so it works for all pages.
// No page-specific JS needed for message.html or thankyou.html unless you add more interactive elements.