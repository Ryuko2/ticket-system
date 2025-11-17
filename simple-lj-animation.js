// ============================================
// SIMPLE LJ LOADING ANIMATION
// Just animates then hides
// ============================================

function initSimpleLJAnimation() {
    const loadingScreen = document.getElementById('loadingScreen');
    
    if (!loadingScreen) {
        console.error('Loading screen not found');
        return;
    }
    
    // Hide loading screen after 2.5 seconds
    setTimeout(() => {
        loadingScreen.style.opacity = '0';
        
        setTimeout(() => {
            loadingScreen.style.display = 'none';
        }, 500);
    }, 2500);
}

// Initialize when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSimpleLJAnimation);
} else {
    initSimpleLJAnimation();
}

console.log('✅ Simple LJ animation initialized');
