// ============================================
// LJ SERVICES GROUP - MAIN APPLICATION
// Firebase-Integrated Multi-Device System
// ============================================

// MSAL Configuration
const msalConfig = {
    auth: {
        clientId: "9490235a-076b-464a-a4b7-c2a1b1156fe1",
        authority: "https://login.microsoftonline.com/common",
        redirectUri: window.location.origin
    }
};

let msalInstance;
let currentUser = { name: "Demo User", email: "demo@ljservices.com" };
window.currentUser = currentUser;

// Initialize MSAL
try {
    msalInstance = new msal.PublicClientApplication(msalConfig);
} catch (error) {
    console.error("MSAL initialization error:", error);
}

// Associations list - Managed in Settings
let associations = [
    'Anthony Gardens (ANT)',
    'Bayshore Treasure Condominium (BTC)',
    'Cambridge (CAM)',
    'Eastside Condominium (EAST)',
    'Enclave Waterside Villas Condominium Association (EWVCA)',
    'Futura Sansovino Condominium Association, Inc (FSCA)',
    'Island Point South (IPSCA)',
    'Michelle Condominium (MICH)',
    'Monterrey Condominium Property Association, Inc. (MTC)',
    'Normandy Shores Condominium (NORM)',
    'Oxford Gates (OX)',
    'Palms Of Sunset Condominium Association, Inc (POSS)',
    'Patricia Condominium (PAT)',
    'Ritz Royal (RITZ)',
    'Sage Condominium (SAGE)',
    'The Niche (NICHE)',
    'Vizcaya Villas Condominium (VVC)',
    'Tower Gates (TWG)',
    'Wilton Terrace Condominium (WTC)'
];

// Staff members - Managed in Settings
let staffMembers = [
    "Linda Johnson", "Kevin", "Maintenance Team", "Accounting", "Management"
];

// Initialize app
document.addEventListener('DOMContentLoaded', initApp);

function initApp() {
    console.log('🚀 Initializing LJ Services Ticketing System...');

    // Load settings from Firebase
    loadSettingsFromFirebase();

    // Setup event listeners
    setupEventListeners();

    // Populate dropdowns
    populateAssociationDropdowns();
    populateStaffDropdowns();

    // Check authentication
    checkAuthentication();

    console.log('✅ App initialized');
}

// Load settings from Firebase
async function loadSettingsFromFirebase() {
    // ✅ FIXED: Wait for Firebase app to be initialized
    if (
        typeof firebase === 'undefined' ||
        !firebase.apps ||
        !firebase.apps.length ||
        !firebase.database
    ) {
        console.log('⏳ Waiting for Firebase app initialization...');
        setTimeout(loadSettingsFromFirebase, 500);
        return;
    }

    try {
        const settingsRef = firebase.database().ref('settings');
        const snapshot = await settingsRef.once('value');
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
            // Initialize default settings
            await settingsRef.set({
                associations: associations,
                staffMembers: staffMembers,
                vendors: [],
                violationRules: {}
            });
        }

        console.log('✅ Settings loaded from Firebase');
    } catch (error) {
        console.error('Error loading settings:', error);
    }
}

// Setup all event listeners
function setupEventListeners() {
    // Login buttons
    document.getElementById('loginButton')?.addEventListener('click', handleMicrosoftLogin);
    document.getElementById('demoLoginBtn')?.addEventListener('click', handleDemoLogin);
    document.getElementById('logoutButton')?.addEventListener('click', handleLogout);

    // Create ticket button
    const createTicketBtn = document.getElementById('createTicketBtn');
    if (createTicketBtn) {
        createTicketBtn.addEventListener('click', openCreateTicketModal);
    }

    // Ticket form
    const ticketForm = document.getElementById('ticketForm');
    if (ticketForm) {
        ticketForm.addEventListener('submit', handleCreateTicket);
    }

    // Modal close buttons
    document.querySelectorAll('.modal-close, .cancel-btn').forEach(btn => {
        btn.addEventListener('click', closeAllModals);
    });

    // Filters
    document.getElementById('statusFilter')?.addEventListener('change', applyFilters);
    document.getElementById('associationFilter')?.addEventListener('change', applyFilters);
    document.getElementById('priorityFilter')?.addEventListener('change', applyFilters);
    document.getElementById('searchInput')?.addEventListener('input', applyFilters);
}

// Check authentication
function checkAuthentication() {
    const isAuthenticated = sessionStorage.getItem('isAuthenticated');
    if (isAuthenticated) {
        const userData = JSON.parse(sessionStorage.getItem('userData') || '{}');
        currentUser = userData;
        window.currentUser = userData;
        showDashboard();
    }
}

// Microsoft Login
async function handleMicrosoftLogin() {
    try {
        const loginResponse = await msalInstance.loginPopup({
            scopes: ["user.read"]
        });

        currentUser = {
            name: loginResponse.account.name,
            email: loginResponse.account.username
        };
        window.currentUser = currentUser;

        sessionStorage.setItem('isAuthenticated', 'true');
        sessionStorage.setItem('userData', JSON.stringify(currentUser));

        showDashboard();
    } catch (error) {
        console.error('Login error:', error);
        alert('Login failed. Please try again.');
    }
}

// Demo Login
function handleDemoLogin() {
    currentUser = {
        name: "Demo User",
        email: "demo@ljservices.com"
    };
    window.currentUser = currentUser;

    sessionStorage.setItem('isAuthenticated', 'true');
    sessionStorage.setItem('userData', JSON.stringify(currentUser));

    showDashboard();
}

// Logout
function handleLogout() {
    sessionStorage.clear();
    window.location.reload();
}

// Show dashboard
function showDashboard() {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('dashboardScreen').style.display = 'block';
    document.getElementById('userEmail').textContent = currentUser.name || currentUser.email;
    document.getElementById('logoutButton').style.display = 'block';

    // Wait for Firebase to be ready
    waitForFirebase();
}

// Wait for Firebase to initialize
function waitForFirebase() {
    // ✅ FIXED: Wait for Firebase app initialization
    if (
        typeof firebase === 'undefined' ||
        !firebase.apps ||
        !firebase.apps.length ||
        !firebase.database
    ) {
        console.log('⏳ Waiting for Firebase in dashboard...');
        setTimeout(waitForFirebase, 500);
        return;
    }

    console.log('✅ Firebase ready, loading tickets...');
    // Tickets will load automatically via Firebase listeners
}

// Populate association dropdowns
function populateAssociationDropdowns() {
    const selects = [
        document.getElementById('ticketAssociation'),
        document.getElementById('associationFilter'),
        document.getElementById('violationAssociation'),
        document.getElementById('workOrderAssociation')
    ];

    selects.forEach(select => {
        if (!select) return;

        const currentValue = select.value;

        if (select.id === 'associationFilter') {
            select.innerHTML = '<option value="">All Associations</option>';
        } else {
            select.innerHTML = '<option value="">Select Association</option>';
        }

        associations.sort().forEach(assoc => {
            const option = document.createElement('option');
            option.value = assoc;
            option.textContent = assoc;
            select.appendChild(option);
        });

        if (currentValue && associations.includes(currentValue)) {
            select.value = currentValue;
        }
    });
}

// Populate staff dropdowns
function populateStaffDropdowns() {
    const select = document.getElementById('ticketAssignedTo');
    if (!select) return;

    const currentValue = select.value;
    select.innerHTML = '<option value="">Unassigned</option>';

    staffMembers.sort().forEach(staff => {
        const option = document.createElement('option');
        option.value = staff;
        option.textContent = staff;
        select.appendChild(option);
    });

    if (currentValue && staffMembers.includes(currentValue)) {
        select.value = currentValue;
    }
}

// Open create ticket modal
function openCreateTicketModal() {
    const modal = document.getElementById('ticketModal');
    if (!modal) return;

    document.getElementById('ticketForm').reset();
    document.getElementById('modalTitle').textContent = 'Create New Ticket';

    modal.classList.add('active');
    modal.style.display = 'flex';
}

// Handle create ticket
async function handleCreateTicket(e) {
    e.preventDefault();

    const title = document.getElementById('ticketTitle').value.trim();
    const association = document.getElementById('ticketAssociation').value;
    const priority = document.getElementById('ticketPriority').value;
    const assignedTo = document.getElementById('ticketAssignedTo').value;
    const description = document.getElementById('ticketDescription').value.trim();
    const dueDate = document.getElementById('ticketDueDate').value;

    if (!title || !association || !priority) {
        alert('Please fill in all required fields');
        return;
    }

    const ticketData = {
        title: title,
        association: association,
        priority: priority,
        status: 'open',
        assignedTo: assignedTo || 'Unassigned',
        description: description,
        dueDate: dueDate,
        createdBy: currentUser.name || currentUser.email,
        createdDate: new Date().toISOString(),
        source: 'manual',
        updates: []
    };

    try {
        if (typeof createTicketFirebase === 'function') {
            await createTicketFirebase(ticketData);
        }

        closeAllModals();
        document.getElementById('ticketForm').reset();
        showNotification('Ticket created successfully!', 'success');

    } catch (error) {
        console.error('Error creating ticket:', error);
        showNotification('Error creating ticket. Please try again.', 'error');
    }
}

// Close all modals
function closeAllModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.remove('active');
        modal.style.display = 'none';
    });
}

// Apply filters
function applyFilters() {
    console.log('Filters updated');
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add CSS for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Update stats
function updateStats() {
    console.log('Stats updated');
}

// Render tickets
function renderTickets(tickets) {
    const ticketsList = document.getElementById('ticketsList');
    if (!ticketsList) return;

    const statusFilter = document.getElementById('statusFilter')?.value || '';
    const associationFilter = document.getElementById('associationFilter')?.value || '';
    const priorityFilter = document.getElementById('priorityFilter')?.value || '';
    const searchQuery = document.getElementById('searchInput')?.value.toLowerCase() || '';

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

    const openCount = tickets.filter(t => t.status === 'open').length;
    const inProgressCount = tickets.filter(t => t.status === 'in-progress').length;
    const completedCount = tickets.filter(t => t.status === 'completed').length;

    document.getElementById('openTickets').textContent = openCount;
    document.getElementById('inProgressTickets').textContent = inProgressCount;
    document.getElementById('completedTickets').textContent = completedCount;
    document.getElementById('totalTickets').textContent = tickets.length;

    if (filteredTickets.length === 0) {
        ticketsList.innerHTML = '<div style="text-align: center; padding: 40px; color: var(--text-secondary);">No tickets found</div>';
        return;
    }

    ticketsList.innerHTML = filteredTickets.map(ticket => `
        <div class="ticket-card ${ticket.priority}" data-ticket-id="${ticket.id}" onclick="if(typeof openTicketDetail === 'function') openTicketDetail('${ticket.id}')">
            <div class="ticket-header">
                <h3>${ticket.title}</h3>
                <span class="badge ${ticket.status}">${ticket.status.replace('-', ' ').toUpperCase()}</span>
            </div>
            <div class="ticket-info">
                <div class="ticket-meta">
                    <span class="badge priority-${ticket.priority}">${ticket.priority.toUpperCase()}</span>
                    <span>${ticket.association}</span>
                </div>
                <p class="ticket-description">${ticket.description || 'No description'}</p>
                <div class="ticket-footer">
                    <span>👤 ${ticket.assignedTo || 'Unassigned'}</span>
                    <span>📅 ${new Date(ticket.createdDate).toLocaleDateString()}</span>
                </div>
            </div>
        </div>
    `).join('');
}

console.log('✅ app-professional-firebase.js loaded');
