// ============================================
// DARK/LIGHT MODE TOGGLE
// Beautiful animated theme switcher
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    const toggleInput = document.getElementById('themeToggle');
    const rootElement = document.documentElement;
    
    // Apply theme function
    const applyTheme = (isDark) => {
        if (isDark) {
            rootElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
        } else {
            rootElement.setAttribute('data-theme', 'light');
            localStorage.setItem('theme', 'light');
        }
    };
    
    // Check saved theme or system preference
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
    
    toggleInput.checked = isDark;
    applyTheme(isDark);
    
    // Toggle event with animation
    toggleInput.addEventListener('change', (event) => {
        const isDark = toggleInput.checked;
        
        // Get toggle position for animation
        let x = window.innerWidth / 2;
        let y = 40; // Header height
        
        const toggleElement = document.querySelector('.theme-toggle');
        if (toggleElement) {
            const rect = toggleElement.getBoundingClientRect();
            x = rect.left + rect.width / 2;
            y = rect.top + rect.height / 2;
        }
        
        // Use View Transition API if supported
        if (!document.startViewTransition) {
            applyTheme(isDark);
            return;
        }
        
        const transition = document.startViewTransition(() => {
            applyTheme(isDark);
        });
        
        transition.ready.then(() => {
            rootElement.style.setProperty('--x', `${x}px`);
            rootElement.style.setProperty('--y', `${y}px`);
        }).catch(error => {
            console.error("Theme transition error:", error);
        });
    });
    
    console.log('✅ Dark mode toggle initialized');
});
