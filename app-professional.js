// ============================================
// LJ SERVICES GROUP - PROFESSIONAL APP
// Complete system with Dropbox integration
// ============================================

// -------------------------
// CORRECT 19 Associations
// -------------------------
const ASSOCIATIONS = [
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
].sort();

const TEAM_MEMBERS = [
    'Linda Johnson',
    'Kevin Rodriguez',
    'Assistant Manager',
    'Maintenance Team'
].sort();

let currentDashboard = 'manual';
let currentUser = null;
let isAuthInProgress = false;

// -------------------------
// Microsoft Authentication
// -------------------------
const msalConfig = {
    auth: {
        clientId: "9490235a-076b-464a-a4b7-c2a1b1156fe1",
        authority: "https://login.microsoftonline.com/common",
        redirectUri: window.location.origin + window.location.pathname
    },
    cache: {
        cacheLocation: "localStorage",
        storeAuthStateInCookie: false
    }
};

const loginRequest = {
    scopes: ["User.Read", "Mail.Send"]
};

let msalInstance = null;

// -------------------------
// Dropbox Configuration
// -------------------------
const DROPBOX_CLIENT_ID = 'gazrj3d6rgyf6eb';
const DROPBOX_CONFIG = {
    accessToken: null,
    folderPath: '/LJ_Services_Ticketing',
    fileName: 'tickets.json'
};

class DropboxStorage {
    constructor() {
        this.accessToken = localStorage.getItem('dropbox_token') || null;
        this.lastSync = localStorage.getItem('last_sync') || null;
        if (this.accessToken) {
            DROPBOX_CONFIG.accessToken = this.accessToken;
        }
    }

    isAuthenticated() {
        return !!this.accessToken;
    }

    authenticate() {
        const redirectUri = window.location.origin + window.location.pathname;
        const authUrl = `https://www.dropbox.com/oauth2/authorize?response_type=token&client_id=${encodeURIComponent(
            DROPBOX_CLIENT_ID
        )}&redirect_uri=${encodeURIComponent(redirectUri)}`;
        window.location.href = authUrl;
    }

    async uploadTickets(ticketsData) {
        if (!this.accessToken) throw new Error('Not authenticated with Dropbox');

        const path = `${DROPBOX_CONFIG.folderPath}/${DROPBOX_CONFIG.fileName}`;
        const content = JSON.stringify(ticketsData, null, 2);

        const response = await fetch('https://content.dropboxapi.com/2/files/upload', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.accessToken}`,
                'Dropbox-API-Arg': JSON.stringify({
                    path,
                    mode: 'overwrite',
                    autorename: false,
                    mute: false
                }),
                'Content-Type': 'application/octet-stream'
            },
            body: content
        });

        if (!response.ok) {
            throw new Error(`Dropbox upload failed: ${response.status}`);
        }

        this.lastSync = new Date().toISOString();
        localStorage.setItem('last_sync', this.lastSync);
        updateSyncStatus('✓ Synced', 'success');
    }

    async downloadTickets() {
        if (!this.accessToken) throw new Error('Not authenticated with Dropbox');

        const path = `${DROPBOX_CONFIG.folderPath}/${DROPBOX_CONFIG.fileName}`;

        const response = await fetch('https://content.dropboxapi.com/2/files/download', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.accessToken}`,
                'Dropbox-API-Arg': JSON.stringify({ path })
            }
        });

        if (response.status === 409) {
            return { tickets: [] };
        }

        if (!response.ok) {
            throw new Error(`Dropbox download failed: ${response.status}`);
        }

        const text = await response.text();
        const data = JSON.parse(text);
        this.lastSync = new Date().toISOString();
        localStorage.setItem('last_sync', this.lastSync);
        updateSyncStatus('✓ Synced', 'success');
        return data;
    }

    mergeTickets(localTickets, remoteTickets) {
        const map = new Map();

        const ensureUpdatedAt = (t) => t.updatedAt || t.createdDate || new Date().toISOString();

        localTickets.forEach(t => {
            const copy = { ...t };
            copy.updatedAt = ensureUpdatedAt(copy);
            map.set(copy.id, copy);
        });

        remoteTickets.forEach(t => {
            const copy = { ...t };
            copy.updatedAt = ensureUpdatedAt(copy);
            const existing = map.get(copy.id);
            if (!existing || new Date(copy.updatedAt) > new Date(existing.updatedAt)) {
                map.set(copy.id, copy);
            }
        });

        return Array.from(map.values());
    }

    async syncTickets(localTickets) {
        if (!this.accessToken) throw new Error('Not authenticated with Dropbox');

        updateSyncStatus('⟳ Syncing...', 'syncing');

        const remoteData = await this.downloadTickets();
        const remoteTickets = remoteData.tickets || [];

        const merged = this.mergeTickets(localTickets, remoteTickets);

        await this.uploadTickets({
            tickets: merged,
            lastSync: new Date().toISOString(),
            syncedBy: currentUser?.username || currentUser?.name || 'unknown'
        });

        return merged;
    }
}

const dropboxStorage = new DropboxStorage();

// -------------------------
// Storage Functions
// -------------------------
function getTickets() {
    return JSON.parse(localStorage.getItem('tickets') || '[]');
}

function saveTickets(tickets) {
    localStorage.setItem('tickets', JSON.stringify(tickets));
}

function generateTicketId() {
    const tickets = getTickets();
    const lastNumeric = tickets.length
        ? Math.max(...tickets.map(t => parseInt(String(t.id).replace('TKT-', '')) || 0))
        : 0;
    const next = lastNumeric + 1;
    return `TKT-${String(next).padStart(5, '0')}`;
}

// -------------------------
// Initialization
// -------------------------
document.addEventListener('DOMContentLoaded', initApp);

async function initApp() {
    isAuthInProgress = false;
    
    // Initialize MSAL
    try {
        if (typeof msal !== 'undefined') {
            msalInstance = new msal.PublicClientApplication(msalConfig);
            await msalInstance.initialize();
            
            try {
                await msalInstance.handleRedirectPromise();
            } catch (e) {
                console.log('Cleared pending MSAL interaction:', e);
            }
        }
    } catch (error) {
        console.error('MSAL initialization error:', error);
    }
    
    // Handle Dropbox redirect
    let justConnectedDropbox = false;
    if (window.location.hash.includes('access_token')) {
        const params = new URLSearchParams(window.location.hash.substring(1));
        const token = params.get('access_token');
        if (token) {
            localStorage.setItem('dropbox_token', token);
            dropboxStorage.accessToken = token;
            DROPBOX_CONFIG.accessToken = token;
            justConnectedDropbox = true;
            window.history.replaceState({}, document.title, window.location.pathname);
            showNotification('Dropbox connected successfully!', 'success');
        }
    }

    // Try MSAL silent login
    if (msalInstance) {
        const accounts = msalInstance.getAllAccounts();
        if (accounts.length > 0) {
            currentUser = accounts[0];
        }
    }

    // Check saved user session
    const savedUser = localStorage.getItem('currentUser');
    if (!currentUser && savedUser) {
        try {
            currentUser = JSON.parse(savedUser);
        } catch (e) {
            localStorage.removeItem('currentUser');
        }
    }

    setupEventListeners();
    populateDropdowns();

    if (currentUser || justConnectedDropbox) {
        if (justConnectedDropbox && !currentUser) {
            currentUser = {
                username: 'dropbox-user@ljservicesgroup.com',
                name: 'Dropbox User'
            };
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
        }
        showDashboard();
    } else {
        document.getElementById('loginScreen').classList.add('active');
    }

    if (dropboxStorage.isAuthenticated()) {
        updateSyncStatus('Dropbox connected', 'success');
    }
    
    console.log('✅ App initialized with correct 19 associations');
}

// -------------------------
// Event Listeners
// -------------------------
function setupEventListeners() {
    document.getElementById('loginButton')?.addEventListener('click', handleLogin);
    document.getElementById('dropboxLoginBtn')?.addEventListener('click', handleDropboxLogin);
    document.getElementById('demoLoginBtn')?.addEventListener('click', handleDemoLogin);
    document.getElementById('logoutButton')?.addEventListener('click', handleLogout);

    document.getElementById('createTicketBtn')?.addEventListener('click', openCreateTicketModal);
    document.querySelector('.close-modal')?.addEventListener('click', closeTicketModal);
    document.querySelector('.cancel-btn')?.addEventListener('click', closeTicketModal);
    document.getElementById('ticketForm')?.addEventListener('submit', handleTicketSubmit);

    document.getElementById('statusFilter')?.addEventListener('change', applyFilters);
    document.getElementById('associationFilter')?.addEventListener('change', applyFilters);
    document.getElementById('priorityFilter')?.addEventListener('change', applyFilters);
    document.getElementById('searchInput')?.addEventListener('input', applyFilters);

    document.getElementById('switchToViolationsBtn')?.addEventListener('click', () => switchToDashboard('violations'));
    document.getElementById('switchToWhatsAppBtn')?.addEventListener('click', () => switchToDashboard('whatsapp'));
    document.getElementById('switchToTicketsBtn')?.addEventListener('click', () => switchToDashboard('manual'));

    document.getElementById('createViolationBtn')?.addEventListener('click', () => {
        if (typeof openCreateViolationModal === 'function') openCreateViolationModal();
    });

    document.getElementById('syncDropboxBtn')?.addEventListener('click', handleManualSync);
}

// -------------------------
// Auth Handlers
// -------------------------
async function handleLogin() {
    if (!msalInstance) {
        alert('Microsoft login not available. Use Demo Mode or Dropbox.');
        return;
    }

    if (isAuthInProgress) return;

    try {
        isAuthInProgress = true;
        await msalInstance.handleRedirectPromise();
        const response = await msalInstance.loginPopup(loginRequest);
        currentUser = response.account;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        showDashboard();
    } catch (err) {
        console.error('Login error:', err);
        if (err.errorCode === 'user_cancelled') {
            console.log('User cancelled login');
        } else {
            alert('Login failed. Try Demo Mode.');
        }
    } finally {
        isAuthInProgress = false;
    }
}

function handleDropboxLogin() {
    if (isAuthInProgress) return;
    isAuthInProgress = true;
    dropboxStorage.authenticate();
}

function handleDemoLogin() {
    if (isAuthInProgress) return;
    isAuthInProgress = true;
    
    currentUser = {
        username: 'demo@ljservicesgroup.com',
        name: 'Demo User'
    };
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    showDashboard();
    isAuthInProgress = false;
}

function handleLogout() {
    if (msalInstance && msalInstance.getAllAccounts().length > 0) {
        msalInstance.logoutPopup();
    }
    currentUser = null;
    localStorage.removeItem('currentUser');
    document.getElementById('dashboardScreen').style.display = 'none';
    document.getElementById('loginScreen').style.display = 'block';
}

// -------------------------
// Dashboard
// -------------------------
function showDashboard() {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('dashboardScreen').style.display = 'block';
    document.getElementById('logoutButton').style.display = 'inline-block';

    const emailLabel = document.getElementById('userEmail');
    if (emailLabel) {
        emailLabel.textContent = currentUser.username || currentUser.name || 'User';
    }

    loadTickets();
    updateStats();
}

// -------------------------
// Tickets
// -------------------------
function loadTickets() {
    const tickets = getTickets().filter(t => !t.fromWhatsApp);
    const ticketsList = document.getElementById('ticketsList');

    if (!ticketsList) return;

    if (tickets.length === 0) {
        ticketsList.innerHTML = `
            <div class="empty-state">
                <h3>No tickets yet</h3>
                <p>Create your first ticket to get started</p>
            </div>
        `;
        return;
    }

    tickets.sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate));
    ticketsList.innerHTML = tickets.map(createTicketCard).join('');
}

function createTicketCard(ticket) {
    const createdDate = new Date(ticket.createdDate).toLocaleDateString();
    return `
        <div class="ticket-card" data-ticket-id="${ticket.id}">
            <div class="ticket-header">
                <h3>${ticket.title}</h3>
                <div class="ticket-badges">
                    <span class="badge status-badge ${ticket.status}">
                        ${ticket.status.replace('-', ' ').toUpperCase()}
                    </span>
                    <span class="badge priority-badge ${ticket.priority}">
                        ${ticket.priority.toUpperCase()}
                    </span>
                </div>
            </div>
            <p class="ticket-description">${ticket.description || 'No description'}</p>
            <div class="ticket-meta">
                <span class="ticket-id">${ticket.id}</span>
                <span>🏢 ${ticket.association}</span>
                <span>📅 ${createdDate}</span>
                <span>👤 ${ticket.assignedTo || 'Unassigned'}</span>
            </div>
        </div>
    `;
}

function updateStats() {
    const tickets = getTickets().filter(t => !t.fromWhatsApp);
    const open = tickets.filter(t => t.status === 'open').length;
    const inProgress = tickets.filter(t => t.status === 'in-progress').length;
    const completed = tickets.filter(t => t.status === 'completed').length;

    document.getElementById('openTickets').textContent = open;
    document.getElementById('inProgressTickets').textContent = inProgress;
    document.getElementById('completedTickets').textContent = completed;
    document.getElementById('totalTickets').textContent = tickets.length;
}

// -------------------------
// Ticket Creation
// -------------------------
function openCreateTicketModal() {
    document.getElementById('ticketModal').classList.add('active');
    document.getElementById('modalTitle').textContent = 'Create New Ticket';
    document.getElementById('ticketForm').reset();
}

function closeTicketModal() {
    document.getElementById('ticketModal').classList.remove('active');
}

function handleTicketSubmit(e) {
    e.preventDefault();

    const now = new Date().toISOString();

    const ticket = {
        id: generateTicketId(),
        title: document.getElementById('ticketTitle').value,
        association: document.getElementById('ticketAssociation').value,
        priority: document.getElementById('ticketPriority').value,
        assignedTo: document.getElementById('ticketAssignedTo').value || '',
        description: document.getElementById('ticketDescription').value,
        dueDate: document.getElementById('ticketDueDate').value || null,
        status: 'open',
        createdBy: currentUser.username || currentUser.name,
        createdDate: now,
        updatedAt: now,
        updates: [],
        fromWhatsApp: false
    };

    const tickets = getTickets();
    tickets.push(ticket);
    saveTickets(tickets);

    closeTicketModal();
    loadTickets();
    updateStats();
    showNotification('Ticket created successfully!', 'success');
}

// -------------------------
// Filters
// -------------------------
function applyFilters() {
    const statusFilter = document.getElementById('statusFilter').value;
    const associationFilter = document.getElementById('associationFilter').value;
    const priorityFilter = document.getElementById('priorityFilter').value;
    const searchText = document.getElementById('searchInput').value.toLowerCase();

    let tickets = getTickets().filter(t => !t.fromWhatsApp);

    if (statusFilter) tickets = tickets.filter(t => t.status === statusFilter);
    if (associationFilter) tickets = tickets.filter(t => t.association === associationFilter);
    if (priorityFilter) tickets = tickets.filter(t => t.priority === priorityFilter);
    if (searchText) {
        tickets = tickets.filter(t =>
            t.title.toLowerCase().includes(searchText) ||
            t.description.toLowerCase().includes(searchText) ||
            String(t.id).toLowerCase().includes(searchText)
        );
    }

    const ticketsList = document.getElementById('ticketsList');
    if (!ticketsList) return;

    if (tickets.length === 0) {
        ticketsList.innerHTML = `
            <div class="empty-state">
                <h3>No tickets found</h3>
                <p>Try adjusting your filters</p>
            </div>
        `;
        return;
    }

    tickets.sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate));
    ticketsList.innerHTML = tickets.map(createTicketCard).join('');
}

// -------------------------
// Dashboard Switching
// -------------------------
function switchToDashboard(dashboard) {
    const manualSection = document.getElementById('manualTicketsSection');
    const whatsappSection = document.getElementById('whatsappTicketsSection');
    const violationsSection = document.getElementById('violationsSection');
    const workOrdersSection = document.getElementById('workOrdersSection');
    const title = document.getElementById('dashboardTitle');

    manualSection.classList.remove('active');
    whatsappSection.classList.remove('active');
    violationsSection.classList.remove('active');
    if (workOrdersSection) workOrdersSection.classList.remove('active');

    document.getElementById('createTicketBtn').style.display = 'none';
    document.getElementById('createViolationBtn').style.display = 'none';
    document.getElementById('createWorkOrderBtn').style.display = 'none';
    document.getElementById('switchToTicketsBtn').style.display = 'none';

    currentDashboard = dashboard;

    switch (dashboard) {
        case 'manual':
            manualSection.classList.add('active');
            title.textContent = 'Ticket Dashboard';
            document.getElementById('createTicketBtn').style.display = 'flex';
            loadTickets();
            break;

        case 'whatsapp':
            whatsappSection.classList.add('active');
            title.textContent = 'WhatsApp Tickets';
            document.getElementById('switchToTicketsBtn').style.display = 'flex';
            break;

        case 'violations':
            violationsSection.classList.add('active');
            title.textContent = 'Violations Management';
            document.getElementById('createViolationBtn').style.display = 'flex';
            document.getElementById('switchToTicketsBtn').style.display = 'flex';
            if (typeof loadViolations === 'function') loadViolations();
            break;

        case 'workorders':
            if (workOrdersSection) {
                workOrdersSection.classList.add('active');
            }
            title.textContent = 'Work Orders';
            document.getElementById('createWorkOrderBtn').style.display = 'flex';
            document.getElementById('switchToTicketsBtn').style.display = 'flex';
            if (typeof loadWorkOrders === 'function') loadWorkOrders();
            break;
    }
}

// -------------------------
// Dropdowns
// -------------------------
function populateDropdowns() {
    const associationSelects = [
        document.getElementById('ticketAssociation'),
        document.getElementById('associationFilter')
    ];

    associationSelects.forEach(select => {
        if (!select) return;
        if (select.id === 'associationFilter') {
            ASSOCIATIONS.forEach(assoc => {
                const option = document.createElement('option');
                option.value = assoc;
                option.textContent = assoc;
                select.appendChild(option);
            });
        } else {
            ASSOCIATIONS.forEach(assoc => {
                const option = document.createElement('option');
                option.value = assoc;
                option.textContent = assoc;
                select.appendChild(option);
            });
        }
    });

    const assignSelects = [
        document.getElementById('ticketAssignedTo')
    ];
    assignSelects.forEach(select => {
        if (!select) return;
        TEAM_MEMBERS.forEach(member => {
            const option = document.createElement('option');
            option.value = member;
            option.textContent = member;
            select.appendChild(option);
        });
    });
}

// -------------------------
// Dropbox Sync
// -------------------------
async function handleManualSync() {
    if (!dropboxStorage.isAuthenticated()) {
        alert('Connect Dropbox first.');
        return;
    }

    try {
        const local = getTickets();
        const merged = await dropboxStorage.syncTickets(local);
        saveTickets(merged);
        loadTickets();
        updateStats();
        showNotification('Sync completed!', 'success');
    } catch (err) {
        console.error('Sync error:', err);
        showNotification('Sync failed.', 'error');
    }
}

function updateSyncStatus(message, type) {
    const el = document.getElementById('syncStatus');
    if (!el) return;
    el.textContent = message;
}

function showNotification(message, type = 'info') {
    const n = document.createElement('div');
    n.className = `notification notification-${type}`;
    n.textContent = message;
    document.body.appendChild(n);

    setTimeout(() => {
        n.classList.add('show');
    }, 10);

    setTimeout(() => {
        n.remove();
    }, 3000);
}

console.log('✅ App loaded with Dropbox integration');
