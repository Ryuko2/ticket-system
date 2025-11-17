// Sidebar Navigation
class AnimatedSidebar {
    constructor() {
        this.sidebar = document.getElementById('sidebar');
        this.overlay = document.getElementById('sidebarOverlay');
        this.menuToggle = document.getElementById('menuToggle');
        this.sidebarClose = document.getElementById('sidebarClose');
        this.navItems = document.querySelectorAll('.nav-item');
        this.init();
    }
    
    init() {
        if (this.menuToggle) {
            this.menuToggle.addEventListener('click', () => this.toggleSidebar());
        }
        if (this.sidebarClose) {
            this.sidebarClose.addEventListener('click', () => this.closeSidebar());
        }
        if (this.overlay) {
            this.overlay.addEventListener('click', () => this.closeSidebar());
        }
        this.navItems.forEach(item => {
            item.addEventListener('click', (e) => this.handleNavigation(e));
        });
    }
    
    toggleSidebar() {
        this.sidebar?.classList.toggle('active');
        this.overlay?.classList.toggle('active');
    }
    
    closeSidebar() {
        this.sidebar?.classList.remove('active');
        this.overlay?.classList.remove('active');
    }
    
    handleNavigation(e) {
        e.preventDefault();
        const page = e.currentTarget.dataset.page;
        this.navItems.forEach(item => item.classList.remove('active'));
        e.currentTarget.classList.add('active');
        if (window.innerWidth < 1024) this.closeSidebar();
        console.log('Navigate to:', page);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new AnimatedSidebar();
});
