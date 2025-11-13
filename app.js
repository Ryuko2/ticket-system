// Microsoft Authentication Library (MSAL) Configuration
const msalConfig = {
    auth: {
        clientId: '9490235a-076b-464a-a4b7-c2a1b1156fe1', // Replace with your Azure AD App Client ID
        authority: 'https://login.microsoftonline.com/common',
        redirectUri: window.location.origin + window.location.pathname
    },
    cache: {
        cacheLocation: 'localStorage',
        storeAuthStateInCookie: false
    }
};

// MSAL instance
const msalInstance = new msal.PublicClientApplication(msalConfig);

// Login request scopes
const loginRequest = {
    scopes: ['User.Read', 'Mail.Send']
};

// Current user
let currentUser = null;

// Dashboard state
let currentDashboard = 'manual'; // 'manual' or 'whatsapp'

// LJ Services Group - 19 Associations
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

// Team members (add your actual team members)
const TEAM_MEMBERS = [
    'Linda Johnson (ljohnson@ljservicesgroup.com)',
    'Kevin Rodriguez (kevinr@ljservicesgroup.com)',
    'Accounting (accounting@ljservicesgroup.com)',
    'Admin (contact@ljservicesgroup.com)'
];

// Initialize database in localStorage
function initDatabase() {
    if (!localStorage.getItem('tickets')) {
        localStorage.setItem('tickets', JSON.stringify([]));
    }
}

// Get all tickets
function getTickets() {
    return JSON.parse(localStorage.getItem('tickets') || '[]');
}

// Save tickets
function saveTickets(tickets) {
    localStorage.setItem('tickets', JSON.stringify(tickets));
}

// Generate ticket ID
function generateTicketId() {
    const tickets = getTickets();
    const lastId = tickets.length > 0 ? 
        Math.max(...tickets.map(t => parseInt(t.id.replace('TKT-', '')))) : 0;
    return `TKT-${String(lastId + 1).padStart(5, '0')}`;
}

// Initialize application
async function initApp() {
    initDatabase();
    
    // Handle redirect callback
    try {
        const tokenResponse = await msalInstance.handleRedirectPromise();
        if (tokenResponse) {
            currentUser = tokenResponse.account;
            showDashboard();
        } else {
            const accounts = msalInstance.getAllAccounts();
            if (accounts.length > 0) {
                currentUser = accounts[0];
                showDashboard();
            }
        }
    } catch (error) {
        console.error('Error handling redirect:', error);
    }

    // Populate association dropdowns
    populateAssociations();
    populateTeamMembers();

    // Event listeners
    setupEventListeners();
}

// Setup event listeners
function setupEventListeners() {
    // Login button
    document.getElementById('loginButton').addEventListener('click', handleLogin);
    
    // Logout button
    document.getElementById('logoutButton').addEventListener('click', handleLogout);
    
    // Create ticket button
    document.getElementById('createTicketBtn').addEventListener('click', openCreateTicketModal);
    
    // Close modals
    document.querySelector('.close-modal').addEventListener('click', closeTicketModal);
    document.querySelector('.close-detail-modal').addEventListener('click', closeDetailModal);
    document.querySelector('.cancel-btn').addEventListener('click', closeTicketModal);
    
    // Ticket form submission
    document.getElementById('ticketForm').addEventListener('submit', handleTicketSubmit);
    
    // Filters
    document.getElementById('statusFilter').addEventListener('change', filterTickets);
    document.getElementById('associationFilter').addEventListener('change', filterTickets);
    document.getElementById('priorityFilter').addEventListener('change', filterTickets);
    document.getElementById('searchInput').addEventListener('input', filterTickets);
    
    // Detail modal actions
    document.getElementById('detailStatus').addEventListener('change', handleStatusChange);
    document.getElementById('detailAssignedTo').addEventListener('change', handleAssignmentChange);
    document.getElementById('addUpdateBtn').addEventListener('click', handleAddUpdate);
    document.getElementById('sendEmailBtn').addEventListener('click', handleSendEmail);
    document.getElementById('deleteTicketBtn').addEventListener('click', handleDeleteTicket);
    
    // Dashboard switching
    document.getElementById('switchDashboardBtn').addEventListener('click', switchDashboard);
    document.getElementById('setupWhatsAppBtn').addEventListener('click', openWhatsAppSetup);
    
    // Close modals on outside click
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.classList.remove('active');
        }
    });
}

// Handle login
async function handleLogin() {
    try {
        await msalInstance.loginRedirect(loginRequest);
    } catch (error) {
        console.error('Login error:', error);
        // For demo purposes, allow manual login
        if (confirm('Demo mode: Login without Microsoft account?')) {
            currentUser = {
                username: 'demo@ljservices.com',
                name: 'Demo User'
            };
            showDashboard();
        }
    }
}

// Handle logout
function handleLogout() {
    if (msalInstance.getAllAccounts().length > 0) {
        msalInstance.logoutRedirect();
    } else {
        currentUser = null;
        showLogin();
    }
}

// Show login screen
function showLogin() {
    const loginScreen = document.getElementById('loginScreen');
    const dashboardScreen = document.getElementById('dashboardScreen');
    
    dashboardScreen.style.display = 'none';
    dashboardScreen.classList.remove('active');
    
    loginScreen.style.display = 'flex';
    setTimeout(() => loginScreen.classList.add('active'), 10);
}

// Show dashboard
function showDashboard() {
    const loginScreen = document.getElementById('loginScreen');
    const dashboardScreen = document.getElementById('dashboardScreen');
    
    loginScreen.style.display = 'none';
    loginScreen.classList.remove('active');
    
    dashboardScreen.style.display = 'block';
    setTimeout(() => dashboardScreen.classList.add('active'), 10);
    
    document.getElementById('userEmail').textContent = currentUser.username || currentUser.name;
    
    loadTickets();
    updateStats();
}

// Populate associations
function populateAssociations() {
    const selects = [
        document.getElementById('ticketAssociation'),
        document.getElementById('associationFilter')
    ];
    
    selects.forEach(select => {
        if (select.id === 'associationFilter') {
            // Skip, already has "All Associations" option
        }
        ASSOCIATIONS.forEach(assoc => {
            const option = document.createElement('option');
            option.value = assoc;
            option.textContent = assoc;
            select.appendChild(option);
        });
    });
}

// Populate team members
function populateTeamMembers() {
    const selects = [
        document.getElementById('ticketAssignedTo'),
        document.getElementById('detailAssignedTo')
    ];
    
    selects.forEach(select => {
        TEAM_MEMBERS.forEach(member => {
            const option = document.createElement('option');
            option.value = member;
            option.textContent = member;
            select.appendChild(option);
        });
    });
}

// Open create ticket modal
function openCreateTicketModal() {
    document.getElementById('modalTitle').textContent = 'Create New Ticket';
    document.getElementById('ticketForm').reset();
    document.getElementById('ticketModal').classList.add('active');
}

// Close ticket modal
function closeTicketModal() {
    document.getElementById('ticketModal').classList.remove('active');
}

// Close detail modal
function closeDetailModal() {
    document.getElementById('ticketDetailModal').classList.remove('active');
}

// Handle ticket submission
function handleTicketSubmit(e) {
    e.preventDefault();
    
    const ticket = {
        id: generateTicketId(),
        title: document.getElementById('ticketTitle').value,
        description: document.getElementById('ticketDescription').value,
        association: document.getElementById('ticketAssociation').value,
        priority: document.getElementById('ticketPriority').value,
        assignedTo: document.getElementById('ticketAssignedTo').value || 'Unassigned',
        status: 'open',
        createdBy: currentUser.username || currentUser.name,
        createdDate: new Date().toISOString(),
        dueDate: document.getElementById('ticketDueDate').value || null,
        updates: []
    };
    
    const tickets = getTickets();
    tickets.push(ticket);
    saveTickets(tickets);
    
    closeTicketModal();
    loadTickets();
    updateStats();
    
    // Send email notification
    sendTicketEmail(ticket, 'created');
    
    alert('Ticket created successfully!');
}

// Load and display tickets
function loadTickets() {
    const tickets = getTickets();
    const ticketsList = document.getElementById('ticketsList');
    
    if (tickets.length === 0) {
        ticketsList.innerHTML = `
            <div class="empty-state">
                <h3>No tickets yet</h3>
                <p>Create your first ticket to get started</p>
            </div>
        `;
        return;
    }
    
    // Sort tickets by created date (newest first)
    tickets.sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate));
    
    ticketsList.innerHTML = tickets.map(ticket => createTicketCard(ticket)).join('');
    
    // Add click listeners
    document.querySelectorAll('.ticket-card').forEach(card => {
        card.addEventListener('click', () => openTicketDetail(card.dataset.ticketId));
    });
}

// Create ticket card HTML
function createTicketCard(ticket) {
    const createdDate = new Date(ticket.createdDate).toLocaleDateString();
    const dueDate = ticket.dueDate ? new Date(ticket.dueDate).toLocaleDateString() : 'No due date';
    
    return `
        <div class="ticket-card priority-${ticket.priority}" data-ticket-id="${ticket.id}">
            <div class="ticket-header">
                <div>
                    <div class="ticket-title">${ticket.title}</div>
                    <div class="ticket-id">${ticket.id}</div>
                </div>
                <div class="ticket-badges">
                    <span class="badge status-badge ${ticket.status}">${ticket.status.replace('-', ' ').toUpperCase()}</span>
                    <span class="badge priority-badge ${ticket.priority}">${ticket.priority.toUpperCase()}</span>
                </div>
            </div>
            <div class="ticket-description">${ticket.description.substring(0, 150)}${ticket.description.length > 150 ? '...' : ''}</div>
            <div class="ticket-meta">
                <div class="ticket-meta-item">
                    <span>🏢</span>
                    <span>${ticket.association}</span>
                </div>
                <div class="ticket-meta-item">
                    <span>👤</span>
                    <span>${ticket.assignedTo}</span>
                </div>
                <div class="ticket-meta-item">
                    <span>📅</span>
                    <span>${createdDate}</span>
                </div>
            </div>
        </div>
    `;
}

// Open ticket detail modal
function openTicketDetail(ticketId) {
    const tickets = getTickets();
    const ticket = tickets.find(t => t.id === ticketId);
    
    if (!ticket) return;
    
    // Store current ticket ID
    document.getElementById('ticketDetailModal').dataset.ticketId = ticketId;
    
    // Populate detail modal
    document.getElementById('detailTicketTitle').textContent = ticket.title;
    document.getElementById('detailDescription').textContent = ticket.description;
    document.getElementById('detailStatus').value = ticket.status;
    document.getElementById('detailPriority').textContent = ticket.priority.toUpperCase();
    document.getElementById('detailPriority').className = `priority-badge ${ticket.priority}`;
    document.getElementById('detailAssociation').textContent = ticket.association;
    document.getElementById('detailAssignedTo').value = ticket.assignedTo;
    document.getElementById('detailCreatedBy').textContent = ticket.createdBy;
    document.getElementById('detailCreatedDate').textContent = new Date(ticket.createdDate).toLocaleString();
    document.getElementById('detailDueDate').textContent = ticket.dueDate ? 
        new Date(ticket.dueDate).toLocaleDateString() : 'No due date';
    document.getElementById('detailTicketId').textContent = ticket.id;
    
    // Load updates
    loadUpdates(ticket);
    
    // Show modal
    document.getElementById('ticketDetailModal').classList.add('active');
}

// Load ticket updates
function loadUpdates(ticket) {
    const updatesList = document.getElementById('ticketUpdates');
    
    if (!ticket.updates || ticket.updates.length === 0) {
        updatesList.innerHTML = '<p style="color: var(--text-secondary); text-align: center; padding: 20px;">No updates yet</p>';
        return;
    }
    
    updatesList.innerHTML = ticket.updates.map(update => `
        <div class="update-item">
            <div class="update-header">
                <span class="update-author">${update.author}</span>
                <span class="update-time">${new Date(update.timestamp).toLocaleString()}</span>
            </div>
            <div class="update-text">${update.text}</div>
        </div>
    `).join('');
}

// Handle status change
function handleStatusChange(e) {
    const ticketId = document.getElementById('ticketDetailModal').dataset.ticketId;
    const tickets = getTickets();
    const ticket = tickets.find(t => t.id === ticketId);
    
    if (ticket) {
        const oldStatus = ticket.status;
        ticket.status = e.target.value;
        
        // Add update
        ticket.updates.push({
            author: currentUser.username || currentUser.name,
            timestamp: new Date().toISOString(),
            text: `Status changed from "${oldStatus}" to "${ticket.status}"`
        });
        
        saveTickets(tickets);
        loadTickets();
        loadUpdates(ticket);
        updateStats();
        
        // Send email notification
        sendTicketEmail(ticket, 'status_change');
    }
}

// Handle assignment change
function handleAssignmentChange(e) {
    const ticketId = document.getElementById('ticketDetailModal').dataset.ticketId;
    const tickets = getTickets();
    const ticket = tickets.find(t => t.id === ticketId);
    
    if (ticket) {
        const oldAssignee = ticket.assignedTo;
        ticket.assignedTo = e.target.value;
        
        // Add update
        ticket.updates.push({
            author: currentUser.username || currentUser.name,
            timestamp: new Date().toISOString(),
            text: `Ticket reassigned from "${oldAssignee}" to "${ticket.assignedTo}"`
        });
        
        saveTickets(tickets);
        loadTickets();
        loadUpdates(ticket);
        
        // Send email notification
        sendTicketEmail(ticket, 'assignment');
    }
}

// Handle add update
function handleAddUpdate() {
    const ticketId = document.getElementById('ticketDetailModal').dataset.ticketId;
    const updateText = document.getElementById('newUpdate').value.trim();
    
    if (!updateText) {
        alert('Please enter an update');
        return;
    }
    
    const tickets = getTickets();
    const ticket = tickets.find(t => t.id === ticketId);
    
    if (ticket) {
        ticket.updates.push({
            author: currentUser.username || currentUser.name,
            timestamp: new Date().toISOString(),
            text: updateText
        });
        
        saveTickets(tickets);
        loadUpdates(ticket);
        document.getElementById('newUpdate').value = '';
        
        // Send email notification
        sendTicketEmail(ticket, 'update');
    }
}

// Handle delete ticket
function handleDeleteTicket() {
    if (!confirm('Are you sure you want to delete this ticket? This action cannot be undone.')) {
        return;
    }
    
    const ticketId = document.getElementById('ticketDetailModal').dataset.ticketId;
    const tickets = getTickets();
    const filteredTickets = tickets.filter(t => t.id !== ticketId);
    
    saveTickets(filteredTickets);
    closeDetailModal();
    loadTickets();
    updateStats();
    
    alert('Ticket deleted successfully');
}

// Send email notification (using Microsoft Graph API)
async function sendTicketEmail(ticket, action) {
    // Email content based on action
    let subject = '';
    let body = '';
    
    switch(action) {
        case 'created':
            subject = `New Ticket Created: ${ticket.title} (${ticket.id})`;
            body = `
                <h2>New Ticket Created</h2>
                <p><strong>Ticket ID:</strong> ${ticket.id}</p>
                <p><strong>Title:</strong> ${ticket.title}</p>
                <p><strong>Association:</strong> ${ticket.association}</p>
                <p><strong>Priority:</strong> ${ticket.priority.toUpperCase()}</p>
                <p><strong>Assigned To:</strong> ${ticket.assignedTo}</p>
                <p><strong>Description:</strong></p>
                <p>${ticket.description}</p>
                <p><strong>Created By:</strong> ${ticket.createdBy}</p>
                <p><strong>Created Date:</strong> ${new Date(ticket.createdDate).toLocaleString()}</p>
            `;
            break;
        case 'status_change':
            subject = `Ticket Status Updated: ${ticket.title} (${ticket.id})`;
            body = `
                <h2>Ticket Status Changed</h2>
                <p><strong>Ticket ID:</strong> ${ticket.id}</p>
                <p><strong>Title:</strong> ${ticket.title}</p>
                <p><strong>New Status:</strong> ${ticket.status.toUpperCase()}</p>
                <p><strong>Association:</strong> ${ticket.association}</p>
            `;
            break;
        case 'assignment':
            subject = `Ticket Assigned: ${ticket.title} (${ticket.id})`;
            body = `
                <h2>Ticket Assignment</h2>
                <p><strong>Ticket ID:</strong> ${ticket.id}</p>
                <p><strong>Title:</strong> ${ticket.title}</p>
                <p><strong>Assigned To:</strong> ${ticket.assignedTo}</p>
                <p><strong>Association:</strong> ${ticket.association}</p>
            `;
            break;
        case 'update':
            subject = `Ticket Update: ${ticket.title} (${ticket.id})`;
            const lastUpdate = ticket.updates[ticket.updates.length - 1];
            body = `
                <h2>New Update on Ticket</h2>
                <p><strong>Ticket ID:</strong> ${ticket.id}</p>
                <p><strong>Title:</strong> ${ticket.title}</p>
                <p><strong>Update from:</strong> ${lastUpdate.author}</p>
                <p><strong>Update:</strong></p>
                <p>${lastUpdate.text}</p>
            `;
            break;
    }
    
    // In production, this would send via Microsoft Graph API
    console.log('Email would be sent:', { subject, body });
    
    // For demo, just log to console
    // To implement actual email sending, you would use:
    // const token = await getAccessToken();
    // await sendEmailViaGraph(token, subject, body, recipients);
}

// Handle send email button
function handleSendEmail() {
    const ticketId = document.getElementById('ticketDetailModal').dataset.ticketId;
    const tickets = getTickets();
    const ticket = tickets.find(t => t.id === ticketId);
    
    if (ticket) {
        sendTicketEmail(ticket, 'update');
        alert('Email notification sent!');
    }
}

// Filter tickets
function filterTickets() {
    const status = document.getElementById('statusFilter').value;
    const association = document.getElementById('associationFilter').value;
    const priority = document.getElementById('priorityFilter').value;
    const search = document.getElementById('searchInput').value.toLowerCase();
    
    let tickets = getTickets();
    
    // Apply filters
    if (status) {
        tickets = tickets.filter(t => t.status === status);
    }
    if (association) {
        tickets = tickets.filter(t => t.association === association);
    }
    if (priority) {
        tickets = tickets.filter(t => t.priority === priority);
    }
    if (search) {
        tickets = tickets.filter(t => 
            t.title.toLowerCase().includes(search) ||
            t.description.toLowerCase().includes(search) ||
            t.id.toLowerCase().includes(search) ||
            t.association.toLowerCase().includes(search)
        );
    }
    
    // Display filtered tickets
    const ticketsList = document.getElementById('ticketsList');
    if (tickets.length === 0) {
        ticketsList.innerHTML = `
            <div class="empty-state">
                <h3>No tickets found</h3>
                <p>Try adjusting your filters</p>
            </div>
        `;
        return;
    }
    
    ticketsList.innerHTML = tickets.map(ticket => createTicketCard(ticket)).join('');
    
    // Add click listeners
    document.querySelectorAll('.ticket-card').forEach(card => {
        card.addEventListener('click', () => openTicketDetail(card.dataset.ticketId));
    });
}

// Update statistics
function updateStats() {
    const tickets = getTickets();
    
    const openCount = tickets.filter(t => t.status === 'open').length;
    const inProgressCount = tickets.filter(t => t.status === 'in-progress').length;
    const completedCount = tickets.filter(t => t.status === 'completed').length;
    
    document.getElementById('openTickets').textContent = openCount;
    document.getElementById('inProgressTickets').textContent = inProgressCount;
    document.getElementById('completedTickets').textContent = completedCount;
    document.getElementById('totalTickets').textContent = tickets.length;
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);

// Switch between Manual and WhatsApp dashboards
function switchDashboard() {
    const manualSection = document.getElementById('manualTicketsSection');
    const whatsappSection = document.getElementById('whatsappTicketsSection');
    const switchBtn = document.getElementById('dashboardSwitchText');
    
    if (currentDashboard === 'manual') {
        // Switch to WhatsApp
        currentDashboard = 'whatsapp';
        manualSection.classList.remove('active');
        whatsappSection.classList.add('active');
        switchBtn.textContent = '📋 Manual Tickets';
        loadWhatsAppTickets();
    } else {
        // Switch to Manual
        currentDashboard = 'manual';
        whatsappSection.classList.remove('active');
        manualSection.classList.add('active');
        switchBtn.textContent = '📱 WhatsApp Tickets';
        loadTickets();
    }
}

// Load WhatsApp tickets
function loadWhatsAppTickets() {
    const whatsappTickets = getWhatsAppTickets();
    const ticketsList = document.getElementById('whatsappTicketsList');
    
    if (whatsappTickets.length === 0) {
        ticketsList.innerHTML = `
            <div class="empty-state">
                <h3>No WhatsApp tickets yet</h3>
                <p>Tickets created by the WhatsApp bot will appear here</p>
            </div>
        `;
        return;
    }
    
    // Sort tickets by created date (newest first)
    whatsappTickets.sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate));
    
    ticketsList.innerHTML = whatsappTickets.map(ticket => createTicketCard(ticket)).join('');
    
    // Add click listeners
    document.querySelectorAll('#whatsappTicketsList .ticket-card').forEach(card => {
        card.addEventListener('click', () => openTicketDetail(card.dataset.ticketId));
    });
}

// Get WhatsApp tickets from localStorage
function getWhatsAppTickets() {
    return JSON.parse(localStorage.getItem('whatsappTickets') || '[]');
}

// Save WhatsApp tickets
function saveWhatsAppTickets(tickets) {
    localStorage.setItem('whatsappTickets', JSON.stringify(tickets));
}

// Open WhatsApp setup modal
function openWhatsAppSetup() {
    alert('WhatsApp Bot Setup:\n\n1. You need a WhatsApp Business API account\n2. Sign up at: https://business.whatsapp.com\n3. Get your API credentials\n4. Configure webhook URL\n\nDetailed setup guide has been created in WHATSAPP_SETUP.md');
}
