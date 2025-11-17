// ============================================
// LJ SERVICES GROUP - LOADING CONTROLLER
// Shows LJ animation and then removes overlay
// ============================================

console.log("✅ Simple LJ animation initialized");

document.addEventListener("DOMContentLoaded", () => {
    const loadingScreen = document.getElementById("loadingScreen");
    if (!loadingScreen) {
        console.warn("⚠️ #loadingScreen not found");
        return;
    }

    // Ensure it's visible while loading
    loadingScreen.style.display = "flex";
    loadingScreen.style.opacity = "1";
    loadingScreen.style.pointerEvents = "auto";

    function hideLoadingScreen() {
        if (!loadingScreen || loadingScreen.dataset.hidden === "true") return;
        loadingScreen.dataset.hidden = "true";

        loadingScreen.style.transition = "opacity 0.4s ease-out, transform 0.4s ease-out";
        loadingScreen.style.opacity = "0";
        loadingScreen.style.transform = "scale(1.02)";

        setTimeout(() => {
            loadingScreen.style.display = "none";
            loadingScreen.style.pointerEvents = "none";
            console.log("🧹 Loading screen removed");
        }, 450);
    }

    // Hide when all assets have loaded
    window.addEventListener("load", hideLoadingScreen);

    // Failsafe: in case load is delayed / blocked
    setTimeout(hideLoadingScreen, 3500);
});
