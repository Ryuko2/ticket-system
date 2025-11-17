// Sidebar Navigation for LJ Services Group
console.log('✅ Sidebar navigation loaded');

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', function() {
    initializeSidebar();
});

function initializeSidebar() {
    const sidebar = document.getElementById('sidebar');
    const menuToggle = document.getElementById('menuToggle');
    const navItems = document.querySelectorAll('.nav-item[data-page]');
    const mainContent = document.querySelector('.main-content');
    
    if (!sidebar || !menuToggle) {
        console.warn('⚠️ Sidebar elements not found');
        return;
    }
    
    // Mobile sidebar toggle
    menuToggle.addEventListener('click', function() {
        sidebar.classList.toggle('mobile-active');
        
        // Add overlay for mobile
        if (sidebar.classList.contains('mobile-active')) {
            if (!document.querySelector('.sidebar-overlay')) {
                const overlay = document.createElement('div');
                overlay.className = 'sidebar-overlay';
                overlay.addEventListener('click', function() {
                    sidebar.classList.remove('mobile-active');
                    overlay.remove();
                });
                document.body.appendChild(overlay);
            }
        } else {
            const overlay = document.querySelector('.sidebar-overlay');
            if (overlay) overlay.remove();
        }
        
        console.log('🔄 Sidebar toggled:', sidebar.classList.contains('mobile-active'));
    });
    
    // Navigation items
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            const pageName = this.getAttribute('data-page');
            
            // Update active state
            navItems.forEach(navItem => navItem.classList.remove('active'));
            this.classList.add('active');
            
            // Hide all pages
            document.querySelectorAll('.page').forEach(page => {
                page.classList.remove('active');
            });
            
            // Show selected page
            const targetPage = document.getElementById(`${pageName}Page`);
            if (targetPage) {
                targetPage.classList.add('active');
                console.log(`📄 Navigated to: ${pageName}`);
            } else {
                console.warn(`⚠️ Page not found: ${pageName}Page`);
            }
            
            // Close mobile sidebar after navigation
            if (window.innerWidth <= 768) {
                sidebar.classList.remove('mobile-active');
                const overlay = document.querySelector('.sidebar-overlay');
                if (overlay) overlay.remove();
            }
        });
    });
    
    // Close sidebar when clicking outside on mobile
    document.addEventListener('click', function(e) {
        if (window.innerWidth <= 768) {
            if (!sidebar.contains(e.target) && !menuToggle.contains(e.target)) {
                sidebar.classList.remove('mobile-active');
                const overlay = document.querySelector('.sidebar-overlay');
                if (overlay) overlay.remove();
            }
        }
    });
    
    // Handle window resize
    let resizeTimer;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function() {
            if (window.innerWidth > 768) {
                sidebar.classList.remove('mobile-active');
                const overlay = document.querySelector('.sidebar-overlay');
                if (overlay) overlay.remove();
            }
        }, 250);
    });
    
    console.log('✅ Sidebar initialized with mobile toggle');
}

// Export for global access
window.initializeSidebar = initializeSidebar;
