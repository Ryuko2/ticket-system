// ============================================
// PROFESSIONAL ANIMATED SIDEBAR
// Smooth animations and navigation
// ============================================

class AnimatedSidebar {
    constructor() {
        this.sidebar = document.getElementById('sidebar');
        this.overlay = document.getElementById('sidebarOverlay');
        this.menuToggle = document.getElementById('menuToggle');
        this.sidebarClose = document.getElementById('sidebarClose');
        this.navItems = document.querySelectorAll('.nav-item');
        
        this.isOpen = false;
        this.init();
    }

    init() {
        // Toggle sidebar
        this.menuToggle?.addEventListener('click', () => this.toggle());
        this.sidebarClose?.addEventListener('click', () => this.close());
        this.overlay?.addEventListener('click', () => this.close());

        // Handle navigation
        this.navItems.forEach(item => {
            item.addEventListener('click', (e) => this.handleNavigation(e, item));
        });

        // Close on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        });

        // Handle resize
        window.addEventListener('resize', () => this.handleResize());
    }

    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }

    open() {
        this.sidebar.classList.add('active');
        this.overlay.classList.add('active');
        this.isOpen = true;
        document.body.style.overflow = 'hidden';
    }

    close() {
        this.sidebar.classList.remove('active');
        this.overlay.classList.remove('active');
        this.isOpen = false;
        document.body.style.overflow = '';
    }

    handleNavigation(e, item) {
        e.preventDefault();

        // Remove active from all
        this.navItems.forEach(nav => nav.classList.remove('active'));
        
        // Add active to clicked
        item.classList.add('active');

        // Get page from data attribute
        const page = item.dataset.page;

        // Handle different pages
        switch(page) {
            case 'dashboard':
            case 'tickets':
                if (typeof switchToDashboard === 'function') {
                    switchToDashboard('manual');
                }
                break;
            case 'workorders':
                if (typeof switchToDashboard === 'function') {
                    switchToDashboard('workorders');
                }
                break;
            case 'violations':
                if (typeof switchToDashboard === 'function') {
                    switchToDashboard('violations');
                }
                break;
            case 'whatsapp':
                if (typeof switchToDashboard === 'function') {
                    switchToDashboard('whatsapp');
                }
                break;
            case 'settings':
                this.showSettings();
                break;
        }

        // Close sidebar on mobile
        if (window.innerWidth <= 768) {
            setTimeout(() => this.close(), 300);
        }
    }

    showSettings() {
        alert('Settings page coming soon!');
    }

    handleResize() {
        // Auto-close on desktop if open
        if (window.innerWidth > 768 && this.isOpen) {
            this.close();
        }
    }
}

// Initialize sidebar when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.animatedSidebar = new AnimatedSidebar();
    console.log('✅ Animated sidebar initialized');
});
