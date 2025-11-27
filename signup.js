// STATE VARIABLES
let usernameAvailable = false;
let emailVerified = false;
let passwordsMatch = false;
let otpTimer = null;

// DOM ELEMENTS
const usernameInput = document.getElementById("signupUsername");
const emailInput = document.getElementById("signupIdentifier");
const passwordInput = document.getElementById("signupPassword");
const confirmPasswordInput = document.getElementById("confirmPassword");
const sendOtpBtn = document.getElementById("sendOtpBtn");
const verifyOtpBtn = document.getElementById("verifyOtpBtn");
const signupBtn = document.getElementById("signupBtn");
const otpSection = document.getElementById("otpSection");
const otpInput = document.getElementById("otpInput");

const usernameFeedback = document.getElementById("username-feedback");
const emailFeedback = document.getElementById("email-feedback");
const otpFeedback = document.getElementById("otp-feedback");
const otpTimerDisplay = document.getElementById("otp-timer");
const passwordFeedback = document.getElementById("password-feedback");
const errorMsg = document.getElementById("signup-error");

// ============================================================
// USERNAME VALIDATION
// ============================================================
usernameInput.addEventListener("blur", async () => {
    const username = usernameInput.value.trim();
    if (!username) {
        usernameFeedback.textContent = "";
        usernameFeedback.className = "feedback-text";
        usernameAvailable = false;
        updateSignupButton();
        return;
    }

    try {
        const response = await fetch("http://127.0.0.1:8000/check-username", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username })
        });

        const data = await response.json();

        if (data.available) {
            usernameFeedback.textContent = "✓ Username available";
            usernameFeedback.className = "feedback-text success";
            usernameAvailable = true;
        } else {
            usernameFeedback.textContent = "✗ Username already taken";
            usernameFeedback.className = "feedback-text error";
            usernameAvailable = false;
        }
    } catch (err) {
        usernameFeedback.textContent = "Error checking username";
        usernameFeedback.className = "feedback-text error";
        usernameAvailable = false;
    }

    updateSignupButton();
});

// ============================================================
// SEND OTP
// ============================================================
sendOtpBtn.addEventListener("click", async () => {
    const email = emailInput.value.trim();

    if (!email) {
        emailFeedback.textContent = "Please enter an email";
        emailFeedback.className = "feedback-text error";
        return;
    }

    sendOtpBtn.disabled = true;
    sendOtpBtn.textContent = "Sending...";
    emailFeedback.textContent = "";

    try {
        const response = await fetch("http://127.0.0.1:8000/send-signup-otp", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email })
        });

        const data = await response.json();

        if (response.ok) {
            emailFeedback.textContent = "✓ OTP sent to your email";
            emailFeedback.className = "feedback-text success";

            // Show OTP section
            otpSection.style.display = "block";

            // Start countdown timer (5 minutes)
            startOtpTimer(300);

        } else {
            emailFeedback.textContent = data.detail || "Failed to send OTP";
            emailFeedback.className = "feedback-text error";
            sendOtpBtn.disabled = false;
            sendOtpBtn.textContent = "Send OTP";
        }
    } catch (err) {
        emailFeedback.textContent = "Server error. Try again.";
        emailFeedback.className = "feedback-text error";
        sendOtpBtn.disabled = false;
        sendOtpBtn.textContent = "Send OTP";
    }
});

// ============================================================
// VERIFY OTP
// ============================================================
verifyOtpBtn.addEventListener("click", async () => {
    const email = emailInput.value.trim();
    const otp = parseInt(otpInput.value.trim());

    if (!otp || otpInput.value.length !== 6) {
        otpFeedback.textContent = "Please enter a valid 6-digit OTP";
        otpFeedback.className = "feedback-text error";
        return;
    }

    verifyOtpBtn.disabled = true;
    verifyOtpBtn.textContent = "Verifying...";
    otpFeedback.textContent = "";

    try {
        const response = await fetch("http://127.0.0.1:8000/verify-signup-otp", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, otp })
        });

        const data = await response.json();

        if (response.ok && data.verified) {
            otpFeedback.textContent = "✓ Email verified successfully!";
            otpFeedback.className = "feedback-text success";
            emailVerified = true;

            // Disable OTP fields
            verifyOtpBtn.disabled = true;
            otpInput.disabled = true;

            // Stop timer
            if (otpTimer) clearInterval(otpTimer);
            otpTimerDisplay.textContent = "";

            updateSignupButton();
        } else {
            otpFeedback.textContent = data.detail || "Invalid OTP";
            otpFeedback.className = "feedback-text error";
            verifyOtpBtn.disabled = false;
            verifyOtpBtn.textContent = "Verify";
        }
    } catch (err) {
        otpFeedback.textContent = "Server error. Try again.";
        otpFeedback.className = "feedback-text error";
        verifyOtpBtn.disabled = false;
        verifyOtpBtn.textContent = "Verify";
    }
});

// ============================================================
// OTP TIMER
// ============================================================
function startOtpTimer(seconds) {
    let timeLeft = seconds;

    otpTimer = setInterval(() => {
        const minutes = Math.floor(timeLeft / 60);
        const secs = timeLeft % 60;
        otpTimerDisplay.textContent = `Time left: ${minutes}:${secs.toString().padStart(2, '0')}`;

        timeLeft--;

        if (timeLeft < 0) {
            clearInterval(otpTimer);
            otpTimerDisplay.textContent = "OTP expired. Request a new one.";
            otpTimerDisplay.style.color = "#ff4466";
            sendOtpBtn.disabled = false;
            sendOtpBtn.textContent = "Resend OTP";
        }
    }, 1000);
}

// ============================================================
// PASSWORD MATCHING VALIDATION
// ============================================================
function checkPasswordMatch() {
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    if (!confirmPassword) {
        passwordFeedback.textContent = "";
        passwordFeedback.className = "feedback-text";
        passwordsMatch = false;
        updateSignupButton();
        return;
    }

    if (password === confirmPassword) {
        passwordFeedback.textContent = "✓ Passwords match";
        passwordFeedback.className = "feedback-text success";
        passwordsMatch = true;
    } else {
        passwordFeedback.textContent = "✗ Passwords do not match";
        passwordFeedback.className = "feedback-text error";
        passwordsMatch = false;
    }

    updateSignupButton();
}

// Add event listeners for password matching
passwordInput.addEventListener("input", checkPasswordMatch);
confirmPasswordInput.addEventListener("input", checkPasswordMatch);

// ============================================================
// UPDATE SIGNUP BUTTON STATE
// ============================================================
function updateSignupButton() {
    if (usernameAvailable && emailVerified && passwordsMatch) {
        signupBtn.disabled = false;
    } else {
        signupBtn.disabled = true;
    }
}

// ============================================================
// FINAL SIGNUP FORM SUBMISSION
// ============================================================
document.getElementById("signupForm").addEventListener("submit", async function (event) {
    event.preventDefault();

    const username = usernameInput.value.trim();
    const identifier = emailInput.value.trim();
    const password = passwordInput.value.trim();
    const confirmPassword = confirmPasswordInput.value.trim();

    if (!usernameAvailable) {
        errorMsg.textContent = "Please choose an available username";
        errorMsg.classList.remove("hidden");
        return;
    }

    if (!emailVerified) {
        errorMsg.textContent = "Please verify your email with OTP";
        errorMsg.classList.remove("hidden");
        return;
    }

    if (password !== confirmPassword) {
        errorMsg.textContent = "Passwords do not match";
        errorMsg.classList.remove("hidden");
        return;
    }

    try {
        const response = await fetch("http://127.0.0.1:8000/signup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, identifier, password })
        });

        const data = await response.json();

        if (!response.ok) {
            errorMsg.textContent = data.detail || "Signup failed";
            errorMsg.classList.remove("hidden");
            return;
        }

        // Set first-time user flag for welcome popup
        localStorage.setItem("firstTimeUser", "true");

        // Redirect to profile page for first-time setup
        window.location.href = "profile_sudeeptha.html";

    } catch (err) {
        errorMsg.textContent = "Server error. Try again later.";
        errorMsg.classList.remove("hidden");
    }
});
