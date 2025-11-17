// ============================================
// SIMPLE LJ LOADING ANIMATION
// Just animates then hides
// ============================================

function initSimpleLJAnimation() {
    const loadingScreen = document.getElementById('loadingScreen');
    
    if (!loadingScreen) {
        console.error('❌ Loading screen not found!');
        return;
    }
    
    console.log('🎬 Starting loading animation...');
    
    // Hide loading screen after 2.5 seconds
    setTimeout(() => {
        console.log('⏰ Hiding loading screen...');
        loadingScreen.style.opacity = '0';
        
        setTimeout(() => {
            loadingScreen.style.display = 'none';
            console.log('✅ Loading screen hidden!');
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
