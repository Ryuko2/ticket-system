// ============================================
// LJ SERVICES GROUP - SIDEBAR NAVIGATION
// Handles Dashboard / Tickets / Work Orders / Violations / WhatsApp
// ============================================

console.log("✅ Sidebar navigation loaded");

document.addEventListener("DOMContentLoaded", initializeSidebar);

function initializeSidebar() {
    const sidebar    = document.getElementById("sidebar");
    const menuToggle = document.getElementById("menuToggle");
    const overlayEl  = document.getElementById("sidebarOverlay");
    const navItems   = document.querySelectorAll(".nav-item[data-page]");

    if (!sidebar || !menuToggle) {
        console.warn("⚠️ Sidebar elements not found");
        return;
    }

    // Map sidebar data-page -> real sections in index.html
    const sectionMap = {
        dashboard:  "manualTicketsSection",   // Default dashboard view
        tickets:    "manualTicketsSection",   // Same list, just logically "Tickets"
        workorders: "workOrdersSection",
        violations: "violationsSection",
        whatsapp:   "whatsappTicketsSection",
        settings:   null                      // Settings handled by separate UI
    };

    const sections = document.querySelectorAll(".content-section");

    function showSection(pageName) {
        const sectionId = sectionMap[pageName];

        // Hide all content sections
        sections.forEach(sec => {
            sec.style.display = "none";
        });

        if (!sectionId) {
            console.warn(`⚠️ No mapped section for page: ${pageName}`);
            return;
        }

        const target = document.getElementById(sectionId);
        if (target) {
            target.style.display = "block";
            console.log(`📄 Navigated to section: ${sectionId}`);
        } else {
            console.warn(`⚠️ Section element not found: ${sectionId}`);
        }
    }

    // ---- MOBILE SIDEBAR TOGGLE ----
    menuToggle.addEventListener("click", () => {
        sidebar.classList.toggle("mobile-active");

        if (sidebar.classList.contains("mobile-active")) {
            if (overlayEl) {
                overlayEl.classList.add("active");
            } else {
                const overlay = document.createElement("div");
                overlay.className = "sidebar-overlay active";
                overlay.addEventListener("click", () => {
                    sidebar.classList.remove("mobile-active");
                    overlay.remove();
                });
                document.body.appendChild(overlay);
            }
        } else {
            const overlay = document.querySelector(".sidebar-overlay");
            if (overlay) overlay.classList.remove("active");
        }

        console.log("🔄 Sidebar toggled:", sidebar.classList.contains("mobile-active"));
    });

    // ---- NAV ITEM CLICKS ----
    navItems.forEach(item => {
        item.addEventListener("click", function (e) {
            e.preventDefault();

            const pageName = this.getAttribute("data-page");

            // Active state
            navItems.forEach(nav => nav.classList.remove("active"));
            this.classList.add("active");

            // Show selected section
            showSection(pageName);

            // Close sidebar on mobile
            if (window.innerWidth <= 768) {
                sidebar.classList.remove("mobile-active");
                const overlay = document.querySelector(".sidebar-overlay");
                if (overlay) overlay.classList.remove("active");
            }
        });
    });

    // ---- DEFAULT VIEW ON LOAD (Dashboard Tickets) ----
    sections.forEach(sec => (sec.style.display = "none"));
    const defaultSection = document.getElementById("manualTicketsSection");
    if (defaultSection) {
        defaultSection.style.display = "block";
    }

    console.log("✅ Sidebar initialized with mobile toggle");
}
