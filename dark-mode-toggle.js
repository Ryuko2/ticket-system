// Dark Mode Toggle
class DarkModeToggle {
    constructor() {
        this.toggle = document.getElementById('themeToggle');
        this.init();
    }
    
    init() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        this.setTheme(savedTheme);
        if (this.toggle) {
            this.toggle.addEventListener('change', () => {
                const newTheme = this.toggle.checked ? 'dark' : 'light';
                this.setTheme(newTheme);
            });
        }
    }
    
    setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        if (this.toggle) this.toggle.checked = theme === 'dark';
        localStorage.setItem('theme', theme);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new DarkModeToggle();
});
