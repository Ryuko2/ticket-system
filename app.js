// ============================================
// LJ Services Group - Ticketing System
// Microsoft Login + Dropbox Sync + WhatsApp + Violations
// CLEAN VERSION - NO DUPLICATES
// ============================================

// -------------------------
// Basic Configuration
// -------------------------

const ASSOCIATIONS = [
    'Anthony Gardens (ANT)',
    'Bayshore Treasure Condominium (BTC)',
    'Brickell Courts (BRC)',
    'Cambridge (CAM)',
    'Century Bay (CEB)',
    'Doubletree (DBT)',
    'Everglades (EVE)',
    'Imperial at Brickell (IMP)',
    'Key Colony (KEY)',
    'Mark 2000 (MRK)',
    'Mid Town (MID)',
    'Nautica (NAU)',
    'One Tequesta Point (OTP)',
    'Plaza on Brickell (PLZ)',
    'Porto Bellagio 1 (PB1)',
    'Porto Bellagio 2 (PB2)',
    'Porto Bellagio 4 (PB4)',
    'Renaissance (REN)',
    'Yacht Club at Brickell (YCB)'
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
        redirectUri: "https://ryuko2.github.io/ticket-system/"
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
        updateSyncStatus('✓ Synced to Dropbox', 'success');
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
        updateSyncStatus('✓ Synced from Dropbox', 'success');
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

    getDropboxFolderUrl() {
        return `https://www.dropbox.com/home${DROPBOX_CONFIG.folderPath}`;
    }
}

const dropboxStorage = new DropboxStorage();

// -------------------------
// Utility: local tickets
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
    // Clear any stuck auth states
    isAuthInProgress = false;
    
    // Initialize MSAL
    try {
        if (typeof msal !== 'undefined') {
            msalInstance = new msal.PublicClientApplication(msalConfig);
            await msalInstance.initialize();
            
            // Clear any pending MSAL interactions
            try {
                await msalInstance.handleRedirectPromise();
            } catch (e) {
                console.log('Cleared pending MSAL interaction:', e);
            }
        } else {
            console.warn('MSAL library not loaded. Microsoft login will not work.');
        }
    } catch (error) {
        console.error('MSAL initialization error:', error);
    }
    
    // Handle Dropbox redirect (access_token in hash)
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

    // Check if we have a saved user session
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

    // Show dashboard if user logged in OR just connected Dropbox
    if (currentUser || justConnectedDropbox) {
        // If just connected Dropbox but no user, create auto-login
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

    // Initial sync status UI
    if (dropboxStorage.isAuthenticated()) {
        updateSyncStatus('Dropbox connected', 'success');
    } else {
        updateSyncStatus('Dropbox not connected', 'info');
    }
}

// -------------------------
// Event Listeners
// -------------------------

function setupEventListeners() {
    const loginButton = document.getElementById('loginButton');
    const dropboxLoginBtn = document.getElementById('dropboxLoginBtn');
    const demoLoginBtn = document.getElementById('demoLoginBtn');
    const logoutButton = document.getElementById('logoutButton');

    if (loginButton) loginButton.addEventListener('click', handleLogin);
    if (dropboxLoginBtn) dropboxLoginBtn.addEventListener('click', handleDropboxLogin);
    if (demoLoginBtn) demoLoginBtn.addEventListener('click', handleDemoLogin);
    if (logoutButton) logoutButton.addEventListener('click', handleLogout);

    document.getElementById('createTicketBtn')?.addEventListener('click', openCreateTicketModal);
    document.querySelector('.close-modal')?.addEventListener('click', closeTicketModal);
    document.querySelector('.cancel-btn')?.addEventListener('click', closeTicketModal);
    document.getElementById('ticketForm')?.addEventListener('submit', handleTicketSubmit);

    document.querySelector('.close-detail-modal')?.addEventListener('click', closeTicketDetailModal);
    document.getElementById('addUpdateBtn')?.addEventListener('click', addTicketUpdate);
    document.getElementById('detailStatus')?.addEventListener('change', onDetailStatusChange);
    document.getElementById('detailAssignedTo')?.addEventListener('change', onDetailAssignChange);
    document.getElementById('sendEmailBtn')?.addEventListener('click', sendEmailUpdate);
    document.getElementById('deleteTicketBtn')?.addEventListener('click', deleteTicket);

    document.getElementById('statusFilter')?.addEventListener('change', applyFilters);
    document.getElementById('associationFilter')?.addEventListener('change', applyFilters);
    document.getElementById('priorityFilter')?.addEventListener('change', applyFilters);
    document.getElementById('searchInput')?.addEventListener('input', applyFilters);

    document.getElementById('switchToViolationsBtn')?.addEventListener('click', () => switchToDashboard('violations'));
    document.getElementById('switchToWhatsAppBtn')?.addEventListener('click', () => switchToDashboard('whatsapp'));
    document.getElementById('switchToTicketsBtn')?.addEventListener('click', () => switchToDashboard('manual'));
    document.getElementById('setupWhatsAppBtn')?.addEventListener('click', openWhatsAppSetup);

    document.getElementById('createViolationBtn')?.addEventListener('click', () => {
        if (typeof openCreateViolationModal === 'function') openCreateViolationModal();
    });
    document.getElementById('manageRulesBtn')?.addEventListener('click', () => {
        if (typeof openRulesModal === 'function') openRulesModal();
    });
    document.getElementById('cincSyncBtn')?.addEventListener('click', () => {
        if (typeof openCincSyncModal === 'function') openCincSyncModal();
    });

    document.getElementById('syncDropboxBtn')?.addEventListener('click', handleManualSync);
    document.getElementById('viewDropboxBtn')?.addEventListener('click', () => {
        window.open(dropboxStorage.getDropboxFolderUrl(), '_blank');
    });
    document.getElementById('exportBtn')?.addEventListener('click', exportToExcel);

    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.classList.remove('active');
        }
    });
}

// -------------------------
// Auth Handlers
// -------------------------

async function handleLogin() {
    if (!msalInstance) {
        alert('Microsoft login is not available. Please use Demo Mode or Dropbox login.');
        return;
    }

    if (isAuthInProgress) {
        console.log('Login already in progress...');
        return;
    }

    try {
        isAuthInProgress = true;
        
        await msalInstance.handleRedirectPromise();
        
        const response = await msalInstance.loginPopup(loginRequest);
        currentUser = response.account;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        showDashboard();
    } catch (err) {
        console.error('Login error:', err);
        
        if (err.errorCode === 'interaction_in_progress') {
            alert('A login window is already open. Please complete or close it first.');
        } else if (err.errorCode === 'user_cancelled') {
            console.log('User cancelled login');
        } else {
            alert('Login failed. Please try Demo Mode or Dropbox login instead.');
        }
    } finally {
        isAuthInProgress = false;
    }
}

function handleLogout() {
    if (msalInstance && msalInstance.getAllAccounts().length > 0) {
        msalInstance.logoutPopup();
    }
    currentUser = null;
    localStorage.removeItem('currentUser');
    document.getElementById('dashboardScreen').classList.remove('active');
    document.getElementById('loginScreen').classList.add('active');
}

function handleDropboxLogin() {
    if (isAuthInProgress) {
        console.log('Authentication already in progress...');
        return;
    }
    
    isAuthInProgress = true;
    dropboxStorage.authenticate();
}

function handleDemoLogin() {
    if (isAuthInProgress) {
        console.log('Authentication already in progress...');
        return;
    }
    
    isAuthInProgress = true;
    
    currentUser = {
        username: 'demo@ljservicesgroup.com',
        name: 'Demo User'
    };
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    showDashboard();
    
    isAuthInProgress = false;
}

// -------------------------
// Dashboard UI
// -------------------------

function showDashboard() {
    document.getElementById('loginScreen').classList.remove('active');
    document.getElementById('dashboardScreen').classList.add('active');

    const emailLabel = document.getElementById('userEmail');
    if (emailLabel) {
        emailLabel.textContent = currentUser.username || currentUser.name || 'User';
    }

    const syncStatus = document.getElementById('syncStatus');
    if (dropboxStorage.isAuthenticated()) {
        updateSyncStatus('Dropbox connected', 'success');
        if (syncStatus) syncStatus.style.display = 'inline-block';
    } else {
        updateSyncStatus('Dropbox not connected', 'info');
    }

    loadTickets();
    updateStats();
}

// -------------------------
// Tickets: load / render
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

    document.querySelectorAll('.ticket-card').forEach(card => {
        card.addEventListener('click', () => openTicketDetail(card.dataset.ticketId));
    });
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
            <p class="ticket-description">${ticket.description}</p>
            <div class="ticket-meta">
                <span class="ticket-id">${ticket.id}</span>
                <span class="ticket-association">🏢 ${ticket.association}</span>
                <span class="ticket-date">📅 ${createdDate}</span>
                <span class="ticket-assigned">👤 ${ticket.assignedTo || 'Unassigned'}</span>
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
// Ticket creation / editing
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
}

// -------------------------
// Ticket detail modal
// -------------------------

function openTicketDetail(ticketId) {
    const tickets = getTickets();
    const ticket = tickets.find(t => t.id === ticketId);
    if (!ticket) return;

    const modal = document.getElementById('ticketDetailModal');
    modal.dataset.ticketId = ticketId;

    document.getElementById('detailTicketTitle').textContent = ticket.title;
    document.getElementById('detailDescription').textContent = ticket.description;
    document.getElementById('detailStatus').value = ticket.status;

    const priorityElem = document.getElementById('detailPriority');
    priorityElem.textContent = ticket.priority.toUpperCase();
    priorityElem.className = `priority-badge ${ticket.priority}`;

    document.getElementById('detailAssociation').textContent = ticket.association;
    document.getElementById('detailAssignedTo').value = ticket.assignedTo || '';
    document.getElementById('detailCreatedBy').textContent = ticket.createdBy;
    document.getElementById('detailCreatedDate').textContent = new Date(ticket.createdDate).toLocaleString();
    document.getElementById('detailDueDate').textContent = ticket.dueDate
        ? new Date(ticket.dueDate).toLocaleDateString()
        : 'No due date';
    document.getElementById('detailTicketId').textContent = ticket.id;

    loadTicketUpdates(ticket);

    modal.classList.add('active');
}

function closeTicketDetailModal() {
    document.getElementById('ticketDetailModal').classList.remove('active');
}

function loadTicketUpdates(ticket) {
    const updatesList = document.getElementById('ticketUpdates');

    if (!ticket.updates || ticket.updates.length === 0) {
        updatesList.innerHTML = '<p class="no-updates">No updates yet</p>';
        return;
    }

    updatesList.innerHTML = ticket.updates
        .map(
            (u) => `
        <div class="update-item">
            <div class="update-header">
                <strong>${u.user}</strong>
                <span class="update-date">${new Date(u.date).toLocaleString()}</span>
            </div>
            <p class="update-text">${u.text}</p>
        </div>
    `
        )
        .join('');
}

function addTicketUpdate() {
    const ticketId = document.getElementById('ticketDetailModal').dataset.ticketId;
    const text = document.getElementById('newUpdate').value.trim();
    if (!text) return;

    const tickets = getTickets();
    const ticket = tickets.find(t => t.id === ticketId);
    if (!ticket) return;

    const now = new Date().toISOString();

    ticket.updates.push({
        user: currentUser.username || currentUser.name,
        date: now,
        text
    });
    ticket.updatedAt = now;

    saveTickets(tickets);
    loadTicketUpdates(ticket);
    document.getElementById('newUpdate').value = '';
}

function onDetailStatusChange(e) {
    const newStatus = e.target.value;
    const ticketId = document.getElementById('ticketDetailModal').dataset.ticketId;

    const tickets = getTickets();
    const ticket = tickets.find(t => t.id === ticketId);
    if (!ticket) return;

    const now = new Date().toISOString();
    ticket.status = newStatus;
    ticket.updatedAt = now;
    ticket.updates.push({
        user: currentUser.username || currentUser.name,
        date: now,
        text: `Status changed to: ${newStatus.replace('-', ' ').toUpperCase()}`
    });

    saveTickets(tickets);
    loadTicketUpdates(ticket);
    loadTickets();
    updateStats();
}

function onDetailAssignChange(e) {
    const newAssignee = e.target.value;
    const ticketId = document.getElementById('ticketDetailModal').dataset.ticketId;

    const tickets = getTickets();
    const ticket = tickets.find(t => t.id === ticketId);
    if (!ticket) return;

    const now = new Date().toISOString();
    ticket.assignedTo = newAssignee;
    ticket.updatedAt = now;
    ticket.updates.push({
        user: currentUser.username || currentUser.name,
        date: now,
        text: newAssignee ? `Assigned to: ${newAssignee}` : 'Unassigned'
    });

    saveTickets(tickets);
    loadTicketUpdates(ticket);
    loadTickets();
}

function sendEmailUpdate() {
    alert('Email functionality will be integrated with Microsoft Graph API later.');
}

function deleteTicket() {
    if (!confirm('Are you sure you want to delete this ticket?')) return;

    const ticketId = document.getElementById('ticketDetailModal').dataset.ticketId;
    let tickets = getTickets();
    tickets = tickets.filter(t => t.id !== ticketId);
    saveTickets(tickets);

    closeTicketDetailModal();
    loadTickets();
    updateStats();
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
        tickets = tickets.filter(
            t =>
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

    document.querySelectorAll('.ticket-card').forEach(card => {
        card.addEventListener('click', () => openTicketDetail(card.dataset.ticketId));
    });
}

// -------------------------
// WhatsApp tickets
// -------------------------

function loadWhatsAppTickets() {
    const tickets = getTickets().filter(t => t.fromWhatsApp);
    const list = document.getElementById('whatsappTicketsList');
    if (!list) return;

    if (tickets.length === 0) {
        list.innerHTML = `
            <div class="empty-state">
                <h3>No WhatsApp tickets yet</h3>
                <p>Configure the WhatsApp bot to start receiving tickets</p>
            </div>
        `;
        return;
    }

    tickets.sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate));
    list.innerHTML = tickets.map(createTicketCard).join('');

    document.querySelectorAll('.ticket-card').forEach(card => {
        card.addEventListener('click', () => openTicketDetail(card.dataset.ticketId));
    });
}

function openWhatsAppSetup() {
    alert(
        'WhatsApp Bot Setup:\n\n' +
            '1. Configure your WhatsApp Business API\n' +
            '2. Set up webhook endpoint\n' +
            '3. Connect to ticket system\n\n' +
            'Full documentation coming soon!'
    );
}

// -------------------------
// Dashboard switching
// -------------------------

function switchToDashboard(dashboard) {
    const manualSection = document.getElementById('manualTicketsSection');
    const whatsappSection = document.getElementById('whatsappTicketsSection');
    const violationsSection = document.getElementById('violationsSection');
    const title = document.getElementById('dashboardTitle');

    manualSection.classList.remove('active');
    whatsappSection.classList.remove('active');
    violationsSection.classList.remove('active');

    document.getElementById('createTicketBtn').style.display = 'none';
    document.getElementById('createViolationBtn').style.display = 'none';
    document.getElementById('switchToTicketsBtn').style.display = 'none';

    currentDashboard = dashboard;

    switch (dashboard) {
        case 'manual':
            manualSection.classList.add('active');
            title.textContent = 'Ticket Dashboard';
            document.getElementById('createTicketBtn').style.display = 'inline-block';
            loadTickets();
            break;

        case 'whatsapp':
            whatsappSection.classList.add('active');
            title.textContent = 'WhatsApp Tickets Dashboard';
            document.getElementById('switchToTicketsBtn').style.display = 'inline-block';
            loadWhatsAppTickets();
            break;

        case 'violations':
            violationsSection.classList.add('active');
            title.textContent = 'Violations Management';
            document.getElementById('createViolationBtn').style.display = 'inline-block';
            document.getElementById('switchToTicketsBtn').style.display = 'inline-block';
            if (typeof loadViolations === 'function') loadViolations();
            if (typeof populateViolationFilters === 'function') populateViolationFilters();
            break;
    }
}

// -------------------------
// Dropdown population
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
        document.getElementById('ticketAssignedTo'),
        document.getElementById('detailAssignedTo')
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
// Dropbox sync UI + Export
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
        showNotification('Sync completed successfully!', 'success');
    } catch (err) {
        console.error('Sync error:', err);
        showNotification('Sync failed. Check connection.', 'error');
    }
}

function exportToExcel() {
    const tickets = getTickets();
    if (!tickets.length) {
        showNotification('No tickets to export.', 'info');
        return;
    }

    const headers = [
        'ID',
        'Title',
        'Description',
        'Association',
        'Status',
        'Priority',
        'Assigned To',
        'Due Date',
        'Created By',
        'Created Date',
        'Updated At'
    ];

    const rows = tickets.map(t => [
        t.id,
        t.title,
        t.description,
        t.association,
        t.status,
        t.priority,
        t.assignedTo || '',
        t.dueDate || '',
        t.createdBy || '',
        t.createdDate || '',
        t.updatedAt || ''
    ]);

    const csvContent = [
        headers.join(','),
        ...rows.map(row =>
            row
                .map(cell => `"${String(cell ?? '').replace(/"/g, '""')}"`)
                .join(',')
        )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tickets_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    showNotification('Exported to CSV!', 'success');
}

function updateSyncStatus(message, type) {
    const el = document.getElementById('syncStatus');
    if (!el) return;
    el.textContent = message;
    el.className = `sync-status sync-${type}`;
}

function showNotification(message, type = 'info') {
    const n = document.createElement('div');
    n.className = `notification notification-${type}`;
    n.textContent = message;
    document.body.appendChild(n);

    setTimeout(() => n.classList.add('show'), 10);

    setTimeout(() => {
        n.classList.remove('show');
        setTimeout(() => n.remove(), 300);
    }, 3000);
}
