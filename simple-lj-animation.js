// ============================================
// SIMPLE LJ LOADING ANIMATION CONTROLLER
// Shows LJ logo briefly, then removes overlay
// ============================================

console.log("✅ Simple LJ animation initialized");

document.addEventListener("DOMContentLoaded", () => {
    const loadingScreen = document.getElementById("loadingScreen");
    if (!loadingScreen) {
        console.warn("⚠️ loadingScreen element not found");
        return;
    }

    // Make sure it starts visible
    loadingScreen.style.display = "flex";
    loadingScreen.style.opacity = "1";
    loadingScreen.style.pointerEvents = "auto";

    function hideLoadingScreenOnce() {
        // Avoid running twice
        if (!loadingScreen || loadingScreen.dataset.hidden === "true") return;
        loadingScreen.dataset.hidden = "true";

        // Smooth fade-out
        loadingScreen.style.transition = "opacity 0.4s ease-out";
        loadingScreen.style.opacity = "0";

        // After fade, remove from layout completely
        setTimeout(() => {
            loadingScreen.style.display = "none";
            loadingScreen.style.pointerEvents = "none";
            console.log("🧹 Loading screen removed");
        }, 400);
    }

    // Hide when everything finishes loading
    window.addEventListener("load", hideLoadingScreenOnce);

    // Failsafe: if load event is slow or missed, hide after 3 seconds anyway
    setTimeout(hideLoadingScreenOnce, 3000);
});
