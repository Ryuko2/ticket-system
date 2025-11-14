// ============================================
// Animated Side Menu (Vanilla JS Version)
// Inspired by StaggeredMenu from React Bits
// ============================================

class AnimatedSideMenu {
    constructor(options = {}) {
        this.position = options.position || 'right';
        this.menuItems = options.menuItems || [];
        this.colors = options.colors || ['#B19EEF', '#5227FF'];
        this.accentColor = options.accentColor || '#5227FF';
        this.isOpen = false;
        this.init();
    }

    init() {
        this.createMenuHTML();
        this.attachEventListeners();
        this.setupAnimations();
    }

    createMenuHTML() {
        const menuHTML = `
            <div class="animated-menu-wrapper" data-position="${this.position}">
                <!-- Background Layers -->
                <div class="animated-menu-layers">
                    ${this.colors.map((color, i) => `
                        <div class="animated-menu-layer" style="background: ${color}"></div>
                    `).join('')}
                </div>

                <!-- Menu Panel -->
                <aside class="animated-menu-panel">
                    <div class="animated-menu-inner">
                        <ul class="animated-menu-list">
                            ${this.menuItems.map((item, idx) => `
                                <li class="animated-menu-item-wrap">
                                    <a href="${item.link}" class="animated-menu-item" data-index="${idx + 1}">
                                        <span class="animated-menu-item-label">${item.label}</span>
                                    </a>
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                </aside>

                <!-- Toggle Button (3 Lines) -->
                <button class="animated-menu-toggle" aria-label="Toggle menu">
                    <span class="menu-text">Menu</span>
                    <span class="menu-icon">
                        <span class="menu-icon-line"></span>
                        <span class="menu-icon-line"></span>
                    </span>
                </button>
            </div>
        `;

        // Find navbar and inject menu
        const navbar = document.querySelector('.navbar');
        if (navbar) {
            const navRight = navbar.querySelector('.nav-right');
            if (navRight) {
                navRight.insertAdjacentHTML('afterbegin', menuHTML);
            }
        }
    }

    attachEventListeners() {
        this.toggleBtn = document.querySelector('.animated-menu-toggle');
        this.panel = document.querySelector('.animated-menu-panel');
        this.layers = document.querySelectorAll('.animated-menu-layer');
        this.menuItems = document.querySelectorAll('.animated-menu-item');

        if (this.toggleBtn) {
            this.toggleBtn.addEventListener('click', () => this.toggleMenu());
        }
    }

    setupAnimations() {
        // Set initial positions
        const offset = this.position === 'left' ? '-100%' : '100%';
        
        this.panel.style.transform = `translateX(${offset})`;
        this.layers.forEach(layer => {
            layer.style.transform = `translateX(${offset})`;
        });

        // Set initial state for menu items
        this.menuItems.forEach(item => {
            const label = item.querySelector('.animated-menu-item-label');
            label.style.transform = 'translateY(140%) rotate(10deg)';
            label.style.opacity = '0';
        });
    }

    toggleMenu() {
        this.isOpen = !this.isOpen;
        
        if (this.isOpen) {
            this.openMenu();
        } else {
            this.closeMenu();
        }
    }

    openMenu() {
        const wrapper = document.querySelector('.animated-menu-wrapper');
        wrapper.classList.add('menu-open');

        // Animate layers first (staggered)
        this.layers.forEach((layer, i) => {
            setTimeout(() => {
                layer.style.transition = 'transform 0.5s cubic-bezier(0.23, 1, 0.32, 1)';
                layer.style.transform = 'translateX(0)';
            }, i * 70);
        });

        // Then animate panel
        setTimeout(() => {
            this.panel.style.transition = 'transform 0.65s cubic-bezier(0.23, 1, 0.32, 1)';
            this.panel.style.transform = 'translateX(0)';
        }, this.layers.length * 70 + 80);

        // Finally animate menu items (staggered)
        setTimeout(() => {
            this.menuItems.forEach((item, i) => {
                setTimeout(() => {
                    const label = item.querySelector('.animated-menu-item-label');
                    label.style.transition = 'all 1s cubic-bezier(0.23, 1, 0.32, 1)';
                    label.style.transform = 'translateY(0) rotate(0deg)';
                    label.style.opacity = '1';
                    
                    // Fade in number
                    item.style.setProperty('--num-opacity', '1');
                }, i * 100);
            });
        }, this.layers.length * 70 + 80 + 150);

        // Rotate icon
        const icon = document.querySelector('.menu-icon');
        icon.style.transition = 'transform 0.8s cubic-bezier(0.23, 1, 0.32, 1)';
        icon.style.transform = 'rotate(225deg)';

        // Change text
        const text = document.querySelector('.menu-text');
        this.animateText(text, 'Close');
    }

    closeMenu() {
        const wrapper = document.querySelector('.animated-menu-wrapper');
        wrapper.classList.remove('menu-open');

        // Animate everything back
        const offset = this.position === 'left' ? '-100%' : '100%';
        
        this.panel.style.transition = 'transform 0.32s cubic-bezier(0.55, 0.055, 0.675, 0.19)';
        this.panel.style.transform = `translateX(${offset})`;

        this.layers.forEach((layer, i) => {
            layer.style.transition = 'transform 0.32s cubic-bezier(0.55, 0.055, 0.675, 0.19)';
            layer.style.transform = `translateX(${offset})`;
        });

        // Reset menu items
        setTimeout(() => {
            this.menuItems.forEach(item => {
                const label = item.querySelector('.animated-menu-item-label');
                label.style.transform = 'translateY(140%) rotate(10deg)';
                label.style.opacity = '0';
                item.style.setProperty('--num-opacity', '0');
            });
        }, 320);

        // Rotate icon back
        const icon = document.querySelector('.menu-icon');
        icon.style.transition = 'transform 0.35s cubic-bezier(0.455, 0.03, 0.515, 0.955)';
        icon.style.transform = 'rotate(0deg)';

        // Change text back
        const text = document.querySelector('.menu-text');
        this.animateText(text, 'Menu');
    }

    animateText(element, targetText) {
        const texts = ['Menu', 'Close', 'Menu', 'Close', targetText];
        let index = 0;
        
        const interval = setInterval(() => {
            element.textContent = texts[index];
            index++;
            if (index >= texts.length) {
                clearInterval(interval);
            }
        }, 70);
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Only initialize if on dashboard
    if (document.getElementById('dashboardScreen')) {
        new AnimatedSideMenu({
            position: 'right',
            menuItems: [
                { label: 'Tickets', link: '#', action: () => switchToDashboard('manual') },
                { label: 'Violations', link: '#', action: () => switchToDashboard('violations') },
                { label: 'WhatsApp', link: '#', action: () => switchToDashboard('whatsapp') },
                { label: 'Settings', link: '#' }
            ],
            colors: ['#667eea', '#764ba2'],
            accentColor: '#0078d4'
        });
    }
});
