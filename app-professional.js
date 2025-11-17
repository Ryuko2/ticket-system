// ============================================
// LJ SERVICES GROUP - MAIN APPLICATION
// Firebase-Integrated Multi-Device System
// ============================================

// ---- MSAL CONFIG ----
const msalConfig = {
    auth: {
        clientId: "YOUR_MICROSOFT_CLIENT_ID", // replace with real client ID if you use MS login
        authority: "https://login.microsoftonline.com/common",
        redirectUri: window.location.origin
    }
};

let msalInstance;
let currentUser = { name: "Demo User", email: "demo@ljservices.com" };
window.currentUser = currentUser;

// Initialize MSAL (if available)
try {
    msalInstance = new msal.PublicClientApplication(msalConfig);
} catch (error) {
    console.error("MSAL initialization error:", error);
}

// ---- DEFAULT DATA ----
let associations = [
    "Atlantic III", "Atlantic V", "Brickell View", "Champlain South",
    "Commodore Club South", "Cricket Club", "Kings Bay", "Mirasol",
    "Mirasol North", "Normandy Shores", "Ocean View II", "Plaza at Oceanside",
    "Porto Bellagio 1", "Porto Bellagio 2", "Porto Bellagio 3", "Porto Bellagio 4",
    "Portofino Tower", "Decoplage", "Soleil"
];

let staffMembers = [
    "Linda Johnson", "Kevin", "Maintenance Team", "Accounting", "Management"
];

// ---- APP INIT ----
document.addEventListener("DOMContentLoaded", initApp);

async function initApp() {
    console.log("🚀 Initializing LJ Services Ticketing System...");

    // Make sure loading screen shows briefly
    showLoadingScreen();

    // Load settings from Firebase (associations, staff, etc.)
    loadSettingsFromFirebase();

    // Setup event listeners
    setupEventListeners();

    // Populate dropdowns with defaults (will refresh when settings load)
    populateAssociationDropdowns();
    populateStaffDropdowns();

    // Check session auth
    checkAuthentication();

    // Hide loading animation after short delay so UI is usable
    setTimeout(hideLoadingScreen, 800);

    console.log("✅ App initialized");
}

// ---- LOADING SCREEN HELPERS ----
function showLoadingScreen() {
    const el = document.getElementById("loadingScreen");
    if (el) {
        el.style.display = "flex";
    }
}

function hideLoadingScreen() {
    const el = document.getElementById("loadingScreen");
    if (el) {
        el.style.display = "none";
    }
}

// ---- LOAD SETTINGS FROM FIREBASE ----
async function loadSettingsFromFirebase() {
    // Wait until a Firebase App exists (fixes the "No Firebase App '[DEFAULT]'" error)
    if (
        typeof firebase === "undefined" ||
        !firebase.apps ||
        !firebase.apps.length
    ) {
        console.log("⏳ Waiting for Firebase app to load settings...");
        setTimeout(loadSettingsFromFirebase, 500);
        return;
    }

    try {
        const db = firebase.database();
        const settingsRef = db.ref("settings");
        const snapshot = await settingsRef.once("value");
        const settings = snapshot.val();

        if (settings) {
            if (settings.associations) {
                associations = settings.associations;
                populateAssociationDropdowns();
            }
            if (settings.staffMembers) {
                staffMembers = settings.staffMembers;
                populateStaffDropdowns();
            }
        } else {
            // First time: initialize defaults in DB
            await settingsRef.set({
                associations: associations,
                staffMembers: staffMembers,
                vendors: [],
                violationRules: {}
            });
        }

        console.log("✅ Settings loaded from Firebase");
    } catch (error) {
        console.error("Error loading settings:", error);
    }
}

// ---- EVENT LISTENERS ----
function setupEventListeners() {
    // Login buttons
    document.getElementById("loginButton")?.addEventListener("click", handleMicrosoftLogin);
    document.getElementById("demoLoginBtn")?.addEventListener("click", handleDemoLogin);
    document.getElementById("logoutButton")?.addEventListener("click", handleLogout);

    // Create ticket button
    document.getElementById("createTicketBtn")?.addEventListener("click", openCreateTicketModal);

    // Ticket form submit
    document.getElementById("ticketForm")?.addEventListener("submit", handleCreateTicket);

    // Modal close buttons
    document.querySelectorAll(".modal-close, .cancel-btn").forEach(btn => {
        btn.addEventListener("click", closeAllModals);
    });

    // Filters
    document.getElementById("statusFilter")?.addEventListener("change", applyFilters);
    document.getElementById("associationFilter")?.addEventListener("change", applyFilters);
    document.getElementById("priorityFilter")?.addEventListener("change", applyFilters);
    document.getElementById("searchInput")?.addEventListener("input", applyFilters);
}

// ---- AUTH ----
function checkAuthentication() {
    const isAuthenticated = sessionStorage.getItem("isAuthenticated");
    if (isAuthenticated) {
        const userData = JSON.parse(sessionStorage.getItem("userData") || "{}");
        currentUser = userData;
        window.currentUser = userData;
        showDashboard();
    }
}

async function handleMicrosoftLogin() {
    if (!msalInstance) {
        alert("Microsoft login not available (MSAL not initialized).");
        return;
    }

    try {
        const loginResponse = await msalInstance.loginPopup({
            scopes: ["user.read"]
        });

        currentUser = {
            name: loginResponse.account.name,
            email: loginResponse.account.username
        };
        window.currentUser = currentUser;

        sessionStorage.setItem("isAuthenticated", "true");
        sessionStorage.setItem("userData", JSON.stringify(currentUser));

        showDashboard();
    } catch (error) {
        console.error("Login error:", error);
        alert("Login failed. Please try again.");
    }
}

function handleDemoLogin() {
    currentUser = {
        name: "Demo User",
        email: "demo@ljservices.com"
    };
    window.currentUser = currentUser;

    sessionStorage.setItem("isAuthenticated", "true");
    sessionStorage.setItem("userData", JSON.stringify(currentUser));

    showDashboard();
}

function handleLogout() {
    sessionStorage.clear();
    window.location.reload();
}

// ---- UI: DASHBOARD / LOGIN ----
function showDashboard() {
    const loginScreen = document.getElementById("loginScreen");
    const dashboardScreen = document.getElementById("dashboardScreen");

    if (loginScreen) loginScreen.style.display = "none";
    if (dashboardScreen) dashboardScreen.style.display = "block";

    const userEmailEl = document.getElementById("userEmail");
    const logoutBtn = document.getElementById("logoutButton");

    if (userEmailEl) {
        userEmailEl.textContent = currentUser.name || currentUser.email;
    }
    if (logoutBtn) {
        logoutBtn.style.display = "block";
    }

    hideLoadingScreen();
}

// ---- WAIT FOR FIREBASE (optional log) ----
function waitForFirebase() {
    if (typeof firebase === "undefined" || !firebase.apps || !firebase.apps.length) {
        console.log("⏳ Waiting for Firebase (waitForFirebase)...");
        setTimeout(waitForFirebase, 500);
        return;
    }

    console.log("✅ Firebase ready, tickets will sync in real-time.");
}

// ---- DROPDOWNS ----
function populateAssociationDropdowns() {
    const selects = [
        document.getElementById("ticketAssociation"),
        document.getElementById("associationFilter"),
        document.getElementById("violationAssociation"),
        document.getElementById("workOrderAssociation")
    ];

    selects.forEach(select => {
        if (!select) return;

        const currentValue = select.value;

        if (select.id === "associationFilter") {
            select.innerHTML = '<option value="">All Associations</option>';
        } else {
            select.innerHTML = '<option value="">Select Association</option>';
        }

        associations
            .slice()
            .sort()
            .forEach(assoc => {
                const option = document.createElement("option");
                option.value = assoc;
                option.textContent = assoc;
                select.appendChild(option);
            });

        if (currentValue && associations.includes(currentValue)) {
            select.value = currentValue;
        }
    });
}

function populateStaffDropdowns() {
    const select = document.getElementById("ticketAssignedTo");
    if (!select) return;

    const currentValue = select.value;
    select.innerHTML = '<option value="">Unassigned</option>';

    staffMembers
        .slice()
        .sort()
        .forEach(staff => {
            const option = document.createElement("option");
            option.value = staff;
            option.textContent = staff;
            select.appendChild(option);
        });

    if (currentValue && staffMembers.includes(currentValue)) {
        select.value = currentValue;
    }
}

// ---- TICKETS (CREATE / MODAL) ----
function openCreateTicketModal() {
    const modal = document.getElementById("ticketModal");
    if (!modal) return;

    document.getElementById("ticketForm").reset();
    document.getElementById("modalTitle").textContent = "Create New Ticket";

    modal.classList.add("active");
    modal.style.display = "flex";
}

async function handleCreateTicket(e) {
    e.preventDefault();

    const title = document.getElementById("ticketTitle").value.trim();
    const association = document.getElementById("ticketAssociation").value;
    const priority = document.getElementById("ticketPriority").value;
    const assignedTo = document.getElementById("ticketAssignedTo").value;
    const description = document.getElementById("ticketDescription").value.trim();
    const dueDate = document.getElementById("ticketDueDate").value;

    if (!title || !association || !priority) {
        alert("Please fill in all required fields");
        return;
    }

    const ticketData = {
        title,
        association,
        priority,
        status: "open",
        assignedTo: assignedTo || "Unassigned",
        description,
        dueDate,
        createdBy: currentUser.name || currentUser.email,
        createdDate: new Date().toISOString(),
        source: "manual",
        updates: []
    };

    try {
        if (typeof createTicketFirebase !== "function") {
            throw new Error("createTicketFirebase is not available.");
        }

        await createTicketFirebase(ticketData);

        closeAllModals();
        document.getElementById("ticketForm").reset();

        showNotification("Ticket created successfully!", "success");
    } catch (error) {
        console.error("Error creating ticket:", error);
        showNotification("Error creating ticket. Please try again.", "error");
    }
}

function closeAllModals() {
    document.querySelectorAll(".modal").forEach(modal => {
        modal.classList.remove("active");
        modal.style.display = "none";
    });
}

// ---- FILTERS ----
function applyFilters() {
    console.log("Filters updated");
    if (typeof renderTickets === "function" && Array.isArray(window.getTicketsCache?.())) {
        renderTickets(window.getTicketsCache());
    }
}

// ---- NOTIFICATIONS ----
function showNotification(message, type = "info") {
    const notification = document.createElement("div");
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        background: ${type === "success" ? "#10b981" : type === "error" ? "#ef4444" : "#3b82f6"};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = "slideOut 0.3s ease";
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Inject notification CSS keyframes once
const notifStyle = document.createElement("style");
notifStyle.textContent = `
    @keyframes slideIn {
        from { transform: translateX(400px); opacity: 0; }
        to   { transform: translateX(0);     opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0);     opacity: 1; }
        to   { transform: translateX(400px); opacity: 0; }
    }
`;
document.head.appendChild(notifStyle);

// ---- STATS ----
function updateStats() {
    const tickets = (typeof getTicketsCache === "function") ? getTicketsCache() : [];
    if (!Array.isArray(tickets)) return;

    const openCount       = tickets.filter(t => t.status === "open").length;
    const inProgressCount = tickets.filter(t => t.status === "in-progress").length;
    const completedCount  = tickets.filter(t => t.status === "completed").length;

    const totalCount = tickets.length;

    const openEl       = document.getElementById("openTickets");
    const inProgEl     = document.getElementById("inProgressTickets");
    const completedEl  = document.getElementById("completedTickets");
    const totalEl      = document.getElementById("totalTickets");

    if (openEl)      openEl.textContent = openCount;
    if (inProgEl)    inProgEl.textContent = inProgressCount;
    if (completedEl) completedEl.textContent = completedCount;
    if (totalEl)     totalEl.textContent = totalCount;

    console.log("Stats updated");
}

// ---- RENDER TICKETS ----
function renderTickets(tickets) {
    const ticketsList = document.getElementById("ticketsList");
    if (!ticketsList) return;

    const statusFilter      = document.getElementById("statusFilter")?.value || "";
    const associationFilter = document.getElementById("associationFilter")?.value || "";
    const priorityFilter    = document.getElementById("priorityFilter")?.value || "";
    const searchQuery       = (document.getElementById("searchInput")?.value || "").toLowerCase();

    let filteredTickets = tickets.filter(ticket => {
        if (statusFilter && ticket.status !== statusFilter) return false;
        if (associationFilter && ticket.association !== associationFilter) return false;
        if (priorityFilter && ticket.priority !== priorityFilter) return false;

        if (searchQuery) {
            const searchText = `${ticket.title} ${ticket.description} ${ticket.association}`.toLowerCase();
            if (!searchText.includes(searchQuery)) return false;
        }

        return true;
    });

    if (!filteredTickets.length) {
        ticketsList.innerHTML = '<div style="text-align:center; padding:40px; color:var(--text-secondary);">No tickets found</div>';
        updateStats();
        return;
    }

    ticketsList.innerHTML = filteredTickets
        .map(ticket => `
        <div class="ticket-card ${ticket.priority}" data-ticket-id="${ticket.id}">
            <div class="ticket-header">
                <h3>${ticket.title}</h3>
                <span class="badge ${ticket.status}">
                    ${ticket.status ? ticket.status.replace("-", " ").toUpperCase() : "OPEN"}
                </span>
            </div>
            <div class="ticket-info">
                <div class="ticket-meta">
                    <span class="badge priority-${ticket.priority}">
                        ${ticket.priority ? ticket.priority.toUpperCase() : "MEDIUM"}
                    </span>
                    <span>${ticket.association || ""}</span>
                </div>
                <p class="ticket-description">${ticket.description || "No description"}</p>
                <div class="ticket-footer">
                    <span>👤 ${ticket.assignedTo || "Unassigned"}</span>
                    <span>📅 ${ticket.createdDate ? new Date(ticket.createdDate).toLocaleDateString() : ""}</span>
                </div>
            </div>
        </div>
    `)
        .join("");

    updateStats();

    // Attach modal click listeners if defined
    if (typeof attachTicketClickListeners === "function") {
        attachTicketClickListeners();
    }
}

console.log("✅ app-professional-firebase.js loaded");
