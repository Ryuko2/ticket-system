// ============================================
// DARK MODE TOGGLE
// Safe version that checks if elements exist
// ============================================

function initDarkMode() {
    const toggle = document.getElementById('darkModeToggle');
    
    // If toggle doesn't exist, skip dark mode initialization
    if (!toggle) {
        console.log('ℹ️ Dark mode toggle not found, skipping...');
        return;
    }
    
    // Check for saved theme preference or default to light mode
    const currentTheme = localStorage.getItem('theme') || 'light';
    
    if (currentTheme === 'dark') {
        document.documentElement.classList.add('dark');
        toggle.checked = true;
    }
    
    // Listen for toggle changes
    toggle.addEventListener('change', function() {
        if (this.checked) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    });
    
    console.log('✅ Dark mode toggle initialized');
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDarkMode);
} else {
    initDarkMode();
}
