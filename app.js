// Microsoft Authentication Configuration
const msalConfig = {
    auth: {
        clientId: "9490235a-076b-464a-a4b7-c2a1b1156fe1", // Replace with your Azure App Client ID
        authority: "https://login.microsoftonline.com/common",
        redirectUri: window.location.origin
    },
    cache: {
        cacheLocation: "localStorage",
        storeAuthStateInCookie: false
    }
};

const loginRequest = {
    scopes: ["User.Read", "Mail.Send"]
};

// Initialize MSAL
const msalInstance = new msal.PublicClientApplication(msalConfig);

// Current user
let currentUser = null;

// Dashboard state
let currentDashboard = 'manual'; // 'manual', 'whatsapp', or 'violations'

// Team members (can be expanded)
const TEAM_MEMBERS = [
    'Linda Johnson',
    'Kevin Rodriguez',
    'Assistant Manager',
    'Maintenance Team'
];

// All 19 associations
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
];

// Initialize app
async function initApp() {
    console.log('Initializing app...');
    
    // Check if user is already logged in
    const accounts = msalInstance.getAllAccounts();
    if (accounts.length > 0) {
        currentUser = accounts[0];
        showDashboard();
    }
    
    setupEventListeners();
    populateDropdowns();
}

// Setup all event listeners
function setupEventListeners() {
    // Login/Logout
    document.getElementById('loginButton').addEventListener('click', handleLogin);
    document.getElementById('logoutButton').addEventListener('click', handleLogout);
    
    // Ticket management
    document.getElementById('createTicketBtn').addEventListener('click', openCreateTicketModal);
    document.querySelector('.close-modal').addEventListener('click', closeTicketModal);
    document.querySelector('.cancel-btn').addEventListener('click', closeTicketModal);
    document.getElementById('ticketForm').addEventListener('submit', handleTicketSubmit);
    
    // Ticket detail
    document.querySelector('.close-detail-modal').addEventListener('click', closeTicketDetailModal);
    document.getElementById('addUpdateBtn').addEventListener('click', addTicketUpdate);
    document.getElementById('detailStatus').addEventListener('change', updateTicketStatus);
    document.getElementById('detailAssignedTo').addEventListener('change', updateTicketAssignment);
    document.getElementById('sendEmailBtn').addEventListener('click', sendEmailUpdate);
    document.getElementById('deleteTicketBtn').addEventListener('click', deleteTicket);
    
    // Filters
    document.getElementById('statusFilter').addEventListener('change', applyFilters);
    document.getElementById('associationFilter').addEventListener('change', applyFilters);
    document.getElementById('priorityFilter').addEventListener('change', applyFilters);
    document.getElementById('searchInput').addEventListener('input', applyFilters);
    
    // Dashboard switching
    const switchToViolationsBtn = document.getElementById('switchToViolationsBtn');
    const switchToWhatsAppBtn = document.getElementById('switchToWhatsAppBtn');
    const switchToTicketsBtn = document.getElementById('switchToTicketsBtn');
    const setupWhatsAppBtn = document.getElementById('setupWhatsAppBtn');
    
    if (switchToViolationsBtn) switchToViolationsBtn.addEventListener('click', () => switchToDashboard('violations'));
    if (switchToWhatsAppBtn) switchToWhatsAppBtn.addEventListener('click', () => switchToDashboard('whatsapp'));
    if (switchToTicketsBtn) switchToTicketsBtn.addEventListener('click', () => switchToDashboard('manual'));
    if (setupWhatsAppBtn) setupWhatsAppBtn.addEventListener('click', openWhatsAppSetup);
    
    // Violations
    const createViolationBtn = document.getElementById('createViolationBtn');
    const manageRulesBtn = document.getElementById('manageRulesBtn');
    const cincSyncBtn = document.getElementById('cincSyncBtn');
    
    if (createViolationBtn) createViolationBtn.addEventListener('click', openCreateViolationModal);
    if (manageRulesBtn) manageRulesBtn.addEventListener('click', openRulesModal);
    if (cincSyncBtn) cincSyncBtn.addEventListener('click', openCincSyncModal);
    
    // Close modals
    const closeViolationModal = document.querySelector('.close-violation-modal');
    const cancelViolationBtn = document.querySelector('.cancel-violation-btn');
    const closeRulesModal = document.querySelector('.close-rules-modal');
    const closeCincModal = document.querySelector('.close-cinc-modal');
    
    if (closeViolationModal) closeViolationModal.addEventListener('click', closeViolationModalFunc);
    if (cancelViolationBtn) cancelViolationBtn.addEventListener('click', closeViolationModalFunc);
    if (closeRulesModal) closeRulesModal.addEventListener('click', closeRulesModalFunc);
    if (closeCincModal) closeCincModal.addEventListener('click', closeCincModalFunc);
    
    // Forms
    const violationForm = document.getElementById('violationForm');
    if (violationForm) violationForm.addEventListener('submit', handleViolationSubmit);
    
    // Close modals on outside click
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.classList.remove('active');
        }
    });
}

// Modal close functions
function closeViolationModalFunc() {
    const modal = document.getElementById('violationModal');
    if (modal) modal.classList.remove('active');
}

function closeRulesModalFunc() {
    const modal = document.getElementById('rulesModal');
    if (modal) modal.classList.remove('active');
}

function closeCincModalFunc() {
    const modal = document.getElementById('cincSyncModal');
    if (modal) modal.classList.remove('active');
}

// Populate dropdowns
function populateDropdowns() {
    // Populate associations
    const associationSelects = [
        document.getElementById('ticketAssociation'),
        document.getElementById('associationFilter')
    ];
    
    associationSelects.forEach(select => {
        if (select && select.id !== 'associationFilter') {
            ASSOCIATIONS.forEach(assoc => {
                const option = document.createElement('option');
                option.value = assoc;
                option.textContent = assoc;
                select.appendChild(option);
            });
        } else if (select) {
            ASSOCIATIONS.forEach(assoc => {
                const option = document.createElement('option');
                option.value = assoc;
                option.textContent = assoc;
                select.appendChild(option);
            });
        }
    });
    
    // Populate team members
    const assignSelects = [
        document.getElementById('ticketAssignedTo'),
        document.getElementById('detailAssignedTo')
    ];
    
    assignSelects.forEach(select => {
        if (select) {
            TEAM_MEMBERS.forEach(member => {
                const option = document.createElement('option');
                option.value = member;
                option.textContent = member;
                select.appendChild(option);
            });
        }
    });
}

// Handle Microsoft Login
async function handleLogin() {
    try {
        const loginResponse = await msalInstance.loginPopup(loginRequest);
        currentUser = loginResponse.account;
        showDashboard();
    } catch (error) {
        console.error('Login error:', error);
        alert('Login failed. Please try again.');
    }
}

// Handle Logout
function handleLogout() {
    msalInstance.logoutPopup();
    currentUser = null;
    document.getElementById('dashboardScreen').classList.remove('active');
    document.getElementById('loginScreen').classList.add('active');
}

// Show Dashboard
function showDashboard() {
    document.getElementById('loginScreen').classList.remove('active');
    document.getElementById('dashboardScreen').classList.add('active');
    document.getElementById('userEmail').textContent = currentUser.username || currentUser.name;
    loadTickets();
    updateStats();
}

// Get tickets from localStorage
function getTickets() {
    return JSON.parse(localStorage.getItem('tickets') || '[]');
}

// Save tickets to localStorage
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

// Load tickets
function loadTickets() {
    const tickets = getTickets().filter(t => !t.fromWhatsApp);
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
    
    // Sort by date (newest first)
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
        <div class="ticket-card" data-ticket-id="${ticket.id}">
            <div class="ticket-header">
                <h3>${ticket.title}</h3>
                <div class="ticket-badges">
                    <span class="badge status-badge ${ticket.status}">${ticket.status.replace('-', ' ').toUpperCase()}</span>
                    <span class="badge priority-badge ${ticket.priority}">${ticket.priority.toUpperCase()}</span>
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

// Update statistics
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

// Open create ticket modal
function openCreateTicketModal() {
    document.getElementById('ticketModal').classList.add('active');
    document.getElementById('modalTitle').textContent = 'Create New Ticket';
    document.getElementById('ticketForm').reset();
}

// Close ticket modal
function closeTicketModal() {
    document.getElementById('ticketModal').classList.remove('active');
}

// Handle ticket form submission
function handleTicketSubmit(e) {
    e.preventDefault();
    
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
        createdDate: new Date().toISOString(),
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
// Open ticket detail
function openTicketDetail(ticketId) {
    const tickets = getTickets();
    const ticket = tickets.find(t => t.id === ticketId);
    
    if (!ticket) return;
    
    // Store current ticket ID for updates
    document.getElementById('ticketDetailModal').dataset.ticketId = ticketId;
    
    // Populate detail modal
    document.getElementById('detailTicketTitle').textContent = ticket.title;
    document.getElementById('detailDescription').textContent = ticket.description;
    document.getElementById('detailStatus').value = ticket.status;
    document.getElementById('detailPriority').textContent = ticket.priority.toUpperCase();
    document.getElementById('detailPriority').className = `priority-badge ${ticket.priority}`;
    document.getElementById('detailAssociation').textContent = ticket.association;
    document.getElementById('detailAssignedTo').value = ticket.assignedTo || '';
    document.getElementById('detailCreatedBy').textContent = ticket.createdBy;
    document.getElementById('detailCreatedDate').textContent = new Date(ticket.createdDate).toLocaleString();
    document.getElementById('detailDueDate').textContent = ticket.dueDate ? new Date(ticket.dueDate).toLocaleDateString() : 'No due date';
    document.getElementById('detailTicketId').textContent = ticket.id;
    
    // Load updates
    loadTicketUpdates(ticket);
    
    // Show modal
    document.getElementById('ticketDetailModal').classList.add('active');
}

// Close ticket detail modal
function closeTicketDetailModal() {
    document.getElementById('ticketDetailModal').classList.remove('active');
}

// Load ticket updates
function loadTicketUpdates(ticket) {
    const updatesList = document.getElementById('ticketUpdates');
    
    if (!ticket.updates || ticket.updates.length === 0) {
        updatesList.innerHTML = '<p class="no-updates">No updates yet</p>';
        return;
    }
    
    updatesList.innerHTML = ticket.updates.map(update => `
        <div class="update-item">
            <div class="update-header">
                <strong>${update.user}</strong>
                <span class="update-date">${new Date(update.date).toLocaleString()}</span>
            </div>
            <p class="update-text">${update.text}</p>
        </div>
    `).join('');
}

// Add ticket update
function addTicketUpdate() {
    const ticketId = document.getElementById('ticketDetailModal').dataset.ticketId;
    const updateText = document.getElementById('newUpdate').value.trim();
    
    if (!updateText) return;
    
    const tickets = getTickets();
    const ticket = tickets.find(t => t.id === ticketId);
    
    if (!ticket) return;
    
    const update = {
        user: currentUser.username || currentUser.name,
        date: new Date().toISOString(),
        text: updateText
    };
    
    ticket.updates.push(update);
    saveTickets(tickets);
    
    loadTicketUpdates(ticket);
    document.getElementById('newUpdate').value = '';
}

// Update ticket status
function updateTicketStatus(e) {
    const ticketId = document.getElementById('ticketDetailModal').dataset.ticketId;
    const newStatus = e.target.value;
    
    const tickets = getTickets();
    const ticket = tickets.find(t => t.id === ticketId);
    
    if (!ticket) return;
    
    ticket.status = newStatus;
    
    // Add automatic update
    const update = {
        user: currentUser.username || currentUser.name,
        date: new Date().toISOString(),
        text: `Status changed to: ${newStatus.replace('-', ' ').toUpperCase()}`
    };
    
    ticket.updates.push(update);
    saveTickets(tickets);
    
    loadTicketUpdates(ticket);
    loadTickets();
    updateStats();
}

// Update ticket assignment
function updateTicketAssignment(e) {
    const ticketId = document.getElementById('ticketDetailModal').dataset.ticketId;
    const newAssignee = e.target.value;
    
    const tickets = getTickets();
    const ticket = tickets.find(t => t.id === ticketId);
    
    if (!ticket) return;
    
    ticket.assignedTo = newAssignee;
    
    // Add automatic update
    const update = {
        user: currentUser.username || currentUser.name,
        date: new Date().toISOString(),
        text: newAssignee ? `Assigned to: ${newAssignee}` : 'Unassigned'
    };
    
    ticket.updates.push(update);
    saveTickets(tickets);
    
    loadTicketUpdates(ticket);
    loadTickets();
}

// Send email update (placeholder)
function sendEmailUpdate() {
    alert('Email functionality will be integrated with Microsoft Graph API');
}

// Delete ticket
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

// Apply filters
function applyFilters() {
    const statusFilter = document.getElementById('statusFilter').value;
    const associationFilter = document.getElementById('associationFilter').value;
    const priorityFilter = document.getElementById('priorityFilter').value;
    const searchText = document.getElementById('searchInput').value.toLowerCase();
    
    let tickets = getTickets().filter(t => !t.fromWhatsApp);
    
    if (statusFilter) {
        tickets = tickets.filter(t => t.status === statusFilter);
    }
    
    if (associationFilter) {
        tickets = tickets.filter(t => t.association === associationFilter);
    }
    
    if (priorityFilter) {
        tickets = tickets.filter(t => t.priority === priorityFilter);
    }
    
    if (searchText) {
        tickets = tickets.filter(t => 
            t.title.toLowerCase().includes(searchText) ||
            t.description.toLowerCase().includes(searchText) ||
            t.id.toLowerCase().includes(searchText)
        );
    }
    
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
    
    tickets.sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate));
    ticketsList.innerHTML = tickets.map(ticket => createTicketCard(ticket)).join('');
    
    document.querySelectorAll('.ticket-card').forEach(card => {
        card.addEventListener('click', () => openTicketDetail(card.dataset.ticketId));
    });
}

// WhatsApp Bot functionality
function loadWhatsAppTickets() {
    const tickets = getTickets().filter(t => t.fromWhatsApp);
    const ticketsList = document.getElementById('whatsappTicketsList');
    
    if (tickets.length === 0) {
        ticketsList.innerHTML = `
            <div class="empty-state">
                <h3>No WhatsApp tickets yet</h3>
                <p>Configure the WhatsApp bot to start receiving tickets</p>
            </div>
        `;
        return;
    }
    
    tickets.sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate));
    ticketsList.innerHTML = tickets.map(ticket => createTicketCard(ticket)).join('');
    
    document.querySelectorAll('.ticket-card').forEach(card => {
        card.addEventListener('click', () => openTicketDetail(card.dataset.ticketId));
    });
}

function openWhatsAppSetup() {
    alert('WhatsApp Bot Setup:\n\n1. Configure your WhatsApp Business API\n2. Set up webhook endpoint\n3. Connect to ticket system\n\nFull documentation coming soon!');
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);

// Switch between dashboards
function switchToDashboard(dashboard) {
    const manualSection = document.getElementById('manualTicketsSection');
    const whatsappSection = document.getElementById('whatsappTicketsSection');
    const violationsSection = document.getElementById('violationsSection');
    const dashboardTitle = document.getElementById('dashboardTitle');
    
    // Hide all sections
    manualSection.classList.remove('active');
    whatsappSection.classList.remove('active');
    violationsSection.classList.remove('active');
    
    // Hide all buttons
    document.getElementById('createTicketBtn').style.display = 'none';
    document.getElementById('createViolationBtn').style.display = 'none';
    document.getElementById('switchToTicketsBtn').style.display = 'none';
    
    currentDashboard = dashboard;
    
    switch(dashboard) {
        case 'manual':
            manualSection.classList.add('active');
            dashboardTitle.textContent = 'Ticket Dashboard';
            document.getElementById('createTicketBtn').style.display = 'inline-block';
            loadTickets();
            break;
            
        case 'whatsapp':
            whatsappSection.classList.add('active');
            dashboardTitle.textContent = 'WhatsApp Tickets Dashboard';
            document.getElementById('switchToTicketsBtn').style.display = 'inline-block';
            loadWhatsAppTickets();
            break;
            
        case 'violations':
            violationsSection.classList.add('active');
            dashboardTitle.textContent = 'Violations Management';
            document.getElementById('createViolationBtn').style.display = 'inline-block';
            document.getElementById('switchToTicketsBtn').style.display = 'inline-block';
            loadViolations();
            populateViolationFilters();
            break;
    }
}

// Populate violation filters
function populateViolationFilters() {
    const assocFilter = document.getElementById('violationAssociationFilter');
    const categoryFilter = document.getElementById('violationCategoryFilter');
    
    if (!assocFilter || !categoryFilter) return;
    
    // Clear existing options except first one
    assocFilter.innerHTML = '<option value="">All Associations</option>';
    categoryFilter.innerHTML = '<option value="">All Categories</option>';
    
    // Populate associations
    ASSOCIATIONS.forEach(assoc => {
        const option = document.createElement('option');
        option.value = assoc;
        option.textContent = assoc;
        assocFilter.appendChild(option);
    });
    
    // Populate categories
    if (typeof violationCategories !== 'undefined') {
        violationCategories.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat.id;
            option.textContent = cat.name;
            categoryFilter.appendChild(option);
        });
    }
}

// Open create violation modal
function openCreateViolationModal() {
    const modal = document.getElementById('violationModal');
    if (!modal) return;
    
    const form = document.getElementById('violationForm');
    form.reset();
    
    // Populate associations
    const assocSelect = document.getElementById('violationAssociation');
    assocSelect.innerHTML = '<option value="">Select Association</option>';
    ASSOCIATIONS.forEach(assoc => {
        const option = document.createElement('option');
        option.value = assoc;
        option.textContent = assoc;
        assocSelect.appendChild(option);
    });
    
    // Populate categories
    const categorySelect = document.getElementById('violationCategory');
    categorySelect.innerHTML = '<option value="">Select Category</option>';
    if (typeof violationCategories !== 'undefined') {
        violationCategories.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat.id;
            option.textContent = cat.name;
            categorySelect.appendChild(option);
        });
    }
    
    // Populate rules when category is selected
    categorySelect.addEventListener('change', function() {
        const rulesSelect = document.getElementById('violationRules');
        rulesSelect.innerHTML = '';
        
        if (typeof violationRules !== 'undefined') {
            const categoryRules = violationRules.filter(r => r.category === this.value);
            categoryRules.forEach(rule => {
                const option = document.createElement('option');
                option.value = rule.rule;
                option.textContent = rule.rule;
                rulesSelect.appendChild(option);
            });
        }
    });
    
    modal.classList.add('active');
}

// Handle violation form submission
async function handleViolationSubmit(e) {
    e.preventDefault();
    
    const selectedRules = Array.from(document.getElementById('violationRules').selectedOptions).map(opt => opt.value);
    
    const violation = {
        id: generateViolationId(),
        homeownerName: document.getElementById('violationHomeowner').value,
        unit: document.getElementById('violationUnit').value,
        email: document.getElementById('violationEmail').value,
        phone: document.getElementById('violationPhone').value || '',
        association: document.getElementById('violationAssociation').value,
        category: document.getElementById('violationCategory').value,
        rules: selectedRules,
        description: document.getElementById('violationDescription').value,
        dateObserved: document.getElementById('violationDate').value,
        status: document.getElementById('violationNoticeLevel').value,
        deadline: document.getElementById('violationDeadline').value,
        createdBy: currentUser.username || currentUser.name,
        createdDate: new Date().toISOString(),
        updates: []
    };
    
    const violations = getViolations();
    violations.push(violation);
    saveViolations(violations);
    
    closeViolationModalFunc();
    
    // Generate PDF
    await generateViolationPDF(violation);
    
    loadViolations();
    
    // Ask if they want to send email
    if (confirm('Violation created and PDF generated! Do you want to send it via email now?')) {
        sendViolationEmail(violation);
    }
}

// Send violation email
async function sendViolationEmail(violation) {
    // This would use Microsoft Graph API to send email
    alert(`Email functionality: Would send violation ${violation.id} to ${violation.email}\n\nIn production, this will automatically send the PDF via Outlook.`);
}

// Open rules management modal
function openRulesModal() {
    const modal = document.getElementById('rulesModal');
    if (!modal) return;
    loadRulesManager();
    modal.classList.add('active');
}

// Load rules manager
function loadRulesManager() {
    const categoriesList = document.getElementById('categoriesList');
    const rulesList = document.getElementById('rulesList');
    
    if (!categoriesList || !rulesList) return;
    
    if (typeof violationCategories === 'undefined') return;
    
    // Load categories
    categoriesList.innerHTML = violationCategories.map(cat => `
        <div class="category-item" data-category="${cat.id}">
            ${cat.name}
        </div>
    `).join('');
    
    // Add category click listeners
    document.querySelectorAll('.category-item').forEach(item => {
        item.addEventListener('click', function() {
            document.querySelectorAll('.category-item').forEach(i => i.classList.remove('active'));
            this.classList.add('active');
            loadCategoryRules(this.dataset.category);
        });
    });
    
    // Load first category by default
    if (violationCategories.length > 0) {
        document.querySelector('.category-item').click();
    }
}

// Load rules for a category
function loadCategoryRules(categoryId) {
    const rulesList = document.getElementById('rulesList');
    if (!rulesList || typeof violationRules === 'undefined') return;
    
    const categoryRules = violationRules.filter(r => r.category === categoryId);
    
    rulesList.innerHTML = categoryRules.map(rule => `
        <div class="rule-item">
            <div class="rule-content">
                <h4>${rule.rule}</h4>
                <p>${rule.description}</p>
            </div>
            <div class="rule-actions">
                <button class="btn-secondary btn-small">Edit</button>
                <button class="btn-danger btn-small">Delete</button>
            </div>
        </div>
    `).join('');
}

// Open CINC sync modal
function openCincSyncModal() {
    const modal = document.getElementById('cincSyncModal');
    if (!modal) return;
    modal.classList.add('active');
}
