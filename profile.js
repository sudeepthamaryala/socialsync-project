// ============================================================
// FIRST-TIME USER WELCOME POPUP
// ============================================================

document.addEventListener("DOMContentLoaded", function () {
    // Check if this is a first-time user
    const isFirstTimeUser = localStorage.getItem("firstTimeUser");

    if (isFirstTimeUser === "true") {
        // Show the welcome popup
        showWelcomePopup();
    }
});

function showWelcomePopup() {
    const popup = document.getElementById("welcomePopup");

    if (!popup) {
        console.warn("Welcome popup element not found");
        return;
    }

    // Show popup with animation
    setTimeout(() => {
        popup.classList.add("active");
    }, 300);

    // Handle the "Step in & shine" button
    const actionBtn = document.getElementById("welcomeActionBtn");
    if (actionBtn) {
        actionBtn.addEventListener("click", function () {
            // Clear the first-time user flag
            localStorage.removeItem("firstTimeUser");

            // Redirect to edit profile page
            window.location.href = "edit-profile.html";
        });
    }

    // Optional: Close popup when clicking outside
    popup.addEventListener("click", function (e) {
        if (e.target === popup) {
            closeWelcomePopup();
        }
    });
}

function closeWelcomePopup() {
    const popup = document.getElementById("welcomePopup");
    if (popup) {
        popup.classList.remove("active");

        // Clear the flag after closing
        localStorage.removeItem("firstTimeUser");
    }
}
