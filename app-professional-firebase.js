// ============================================================================
// LJ SERVICES GROUP - PROFESSIONAL TICKETING SYSTEM
// Main Application Logic with Firebase Integration
// Version: 2.1 - WITH FULL EDITING CAPABILITIES
// ============================================================================

// CRITICAL: Wait for Firebase to be initialized before running
let firebaseReady = false;
let initQueue = [];

// Listen for Firebase ready event
window.addEventListener('firebaseInitialized', () => {
    console.log('✅ Firebase ready event received');
    firebaseReady = true;
    // Execute queued functions
    initQueue.forEach(fn => fn());
    initQueue = [];
});

// Queue function execution until Firebase is ready
function whenFirebaseReady(fn) {
    if (firebaseReady) {
        fn();
    } else {
        initQueue.push(fn);
    }
}

// ============================================================================
// GLOBAL STATE
// ============================================================================

let currentUser = null;
let tickets = [];
let workOrders = [];
let violations = [];

// Application settings with CORRECT 19 associations
const APP_SETTINGS = {
    appName: 'LJ Services Group',
    properties: [
        'Anthony Gardens',
        'Bayshore Treasure Condominium',
        'Cambridge',
        'Eastside Condominium',
        'Enclave Waterside Villas Condominium Association',
        'Futura Sansovino Condominium Association, Inc',
        'Island Point South',
        'Michelle Condominium',
        'Monterrey Condominium Property Association, Inc.',
        'Normandy Shores Condominium',
        'Oxford Gates',
        'Palms Of Sunset Condominium Association, Inc',
        'Patricia Condominium',
        'Ritz Royal',
        'Sage Condominium',
        'The Niche',
        'Tower Gates',
        'Vizcaya Villas Condominium',
        'Wilton Terrace Condominium'
    ],
    ticketCategories: ['Maintenance', 'Complaint', 'Request', 'Emergency'],
    priorities: ['Low', 'Medium', 'High', 'Urgent'],
    statuses: ['Open', 'In Progress', 'Resolved', 'Closed'],
    vendors: ['Plumbing', 'Electrical', 'HVAC', 'General Maintenance', 'Landscaping', 'Other']
};

// ============================================================================
// APPLICATION INITIALIZATION
// ============================================================================

function initApp() {
    console.log('🚀 Initializing LJ Services Ticketing System...');
    
    whenFirebaseReady(() => {
        console.log('✅ App initialized with Firebase ready');
        setupAuthListener();
        initializeUI();
        setupEventListeners();
    });
}

// ============================================================================
// AUTHENTICATION
// ============================================================================

function setupAuthListener() {
    const auth = window.firebaseAuth;
    if (!auth) {
        console.error('❌ Firebase Auth not available');
        return;
    }

    auth.onAuthStateChanged((user) => {
        if (user) {
            handleUserLogin(user);
        } else {
            handleUserLogout();
        }
    });
}

async function handleMicrosoftLogin() {
    try {
        const auth = window.firebaseAuth;
        const provider = window.microsoftProvider;
        
        if (!auth || !provider) {
            throw new Error('Firebase not initialized');
        }

        const result = await auth.signInWithPopup(provider);
        console.log('✅ Login successful:', result.user.displayName);
        handleUserLogin(result.user);
        
    } catch (error) {
        console.error('Login error:', error);
        showNotification('Login failed: ' + error.message, 'error');
    }
}

function handleUserLogin(user) {
    currentUser = user;
    
    // Hide login screen
    const loginScreen = document.getElementById('loginScreen');
    const mainApp = document.getElementById('mainApp');
    
    if (loginScreen && mainApp) {
        loginScreen.style.display = 'none';
        mainApp.style.display = 'flex';
    }
    
    // Update UI with user info
    const userNameEl = document.getElementById('userName');
    const userAvatarEl = document.getElementById('userAvatar');
    
    if (userNameEl) {
        userNameEl.textContent = user.displayName || user.email;
    }
    
    if (userAvatarEl && user.photoURL) {
        userAvatarEl.innerHTML = `<img src="${user.photoURL}" alt="User" style="width: 40px; height: 40px; border-radius: 50%;">`;
    }
    
    console.log('✅ User logged in:', user.displayName);
    
    // Load data
    loadAllData();
}

function handleUserLogout() {
    currentUser = null;
    
    // Show login screen
    const loginScreen = document.getElementById('loginScreen');
    const mainApp = document.getElementById('mainApp');
    
    if (loginScreen && mainApp) {
        loginScreen.style.display = 'flex';
        mainApp.style.display = 'none';
    }
    
    console.log('✅ User logged out');
}

async function handleLogout() {
    try {
        await window.firebaseAuth.signOut();
        showNotification('Logged out successfully', 'success');
    } catch (error) {
        console.error('Logout error:', error);
        showNotification('Logout failed', 'error');
    }
}

// ============================================================================
// DATA LOADING
// ============================================================================

async function loadAllData() {
    try {
        console.log('📡 Loading all data from Firebase...');
        
        // Subscribe to real-time updates
        const { subscribeToTickets, subscribeToWorkOrders, subscribeToViolations } = 
            await import('./firebase-realtime.js');
        
        subscribeToTickets((data) => {
            tickets = data;
            updateTicketsUI();
            updateStats();
        });
        
        subscribeToWorkOrders((data) => {
            workOrders = data;
            updateWorkOrdersUI();
            updateStats();
        });
        
        subscribeToViolations((data) => {
            violations = data;
            updateViolationsUI();
            updateStats();
        });
        
    } catch (error) {
        console.error('❌ Error loading data:', error);
        showNotification('Failed to load data', 'error');
    }
}

// ============================================================================
// UI INITIALIZATION
// ============================================================================

function initializeUI() {
    console.log('🎨 Initializing UI...');
    
    // Initialize property dropdowns
    initializePropertyDropdowns();
    
    // Set up initial dashboard
    showDashboard('dashboard');
}

function initializePropertyDropdowns() {
    const dropdowns = document.querySelectorAll('[id*="Property"], [id*="property"]');
    
    dropdowns.forEach(dropdown => {
        if (!dropdown) return;
        
        dropdown.innerHTML = '<option value="">Select Property...</option>';
        
        APP_SETTINGS.properties.forEach(property => {
            const option = document.createElement('option');
            option.value = property;
            option.textContent = property;
            dropdown.appendChild(option);
        });
    });
}

// ============================================================================
// NAVIGATION - FIXED!
// ============================================================================

function showDashboard(dashboardName) {
    console.log('🔄 Switching to dashboard:', dashboardName);
    
    // Hide all pages
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => {
        page.classList.remove('active');
        page.style.display = 'none';
    });
    
    // Show selected page
    const selectedPage = document.getElementById(`${dashboardName}Page`);
    if (selectedPage) {
        selectedPage.classList.add('active');
        selectedPage.style.display = 'block';
    } else {
        console.error('❌ Page not found:', `${dashboardName}Page`);
    }
    
    // Update navigation active state
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('data-page') === dashboardName) {
            item.classList.add('active');
        }
    });
    
    // Load appropriate data
    switch(dashboardName) {
        case 'dashboard':
            updateStats();
            break;
        case 'tickets':
            updateTicketsUI();
            break;
        case 'work-orders':
            updateWorkOrdersUI();
            break;
        case 'violations':
            updateViolationsUI();
            break;
    }
}

// Make showDashboard globally available
window.showDashboard = showDashboard;

// ============================================================================
// EVENT LISTENERS
// ============================================================================

function setupEventListeners() {
    // Login button
    const loginBtn = document.getElementById('microsoftLoginBtn');
    if (loginBtn) {
        loginBtn.addEventListener('click', handleMicrosoftLogin);
    }
    
    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    
    // Navigation items
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const page = item.getAttribute('data-page');
            if (page) {
                showDashboard(page);
            }
        });
    });
    
    // New ticket button
    const newTicketBtn = document.getElementById('newTicketBtn');
    if (newTicketBtn) {
        newTicketBtn.addEventListener('click', () => openTicketModal(null));
    }
    
    // New work order button
    const newWorkOrderBtn = document.getElementById('newWorkOrderBtn');
    if (newWorkOrderBtn) {
        newWorkOrderBtn.addEventListener('click', () => openWorkOrderModal(null));
    }
    
    // New violation button
    const newViolationBtn = document.getElementById('newViolationBtn');
    if (newViolationBtn) {
        newViolationBtn.addEventListener('click', () => openViolationModal(null));
    }
}

// ============================================================================
// TICKET FUNCTIONS WITH EDITING
// ============================================================================

function updateTicketsUI() {
    const ticketsList = document.getElementById('ticketsList');
    if (!ticketsList) return;
    
    ticketsList.innerHTML = '';
    
    if (tickets.length === 0) {
        ticketsList.innerHTML = '<div class="empty-state"><i class="fas fa-ticket-alt"></i><p>No tickets found</p><p style="font-size: 14px; margin-top: 10px;">Click "New Ticket" to create one</p></div>';
        return;
    }
    
    tickets.forEach(ticket => {
        const ticketCard = createTicketCard(ticket);
        ticketsList.appendChild(ticketCard);
    });
}

function createTicketCard(ticket) {
    const card = document.createElement('div');
    card.className = 'ticket-card';
    card.style.cursor = 'pointer';
    card.innerHTML = `
        <div class="ticket-header">
            <span class="ticket-id">#${ticket.id || 'N/A'}</span>
            <span class="badge badge-${(ticket.priority || 'low').toLowerCase()}">${ticket.priority || 'Low'}</span>
        </div>
        <h3>${ticket.title}</h3>
        <p>${ticket.description}</p>
        <div class="ticket-footer">
            <span class="ticket-property">${ticket.property}</span>
            <span class="ticket-status status-${(ticket.status || 'open').toLowerCase().replace(' ', '-')}">${ticket.status || 'Open'}</span>
        </div>
    `;
    
    // Click to edit
    card.addEventListener('click', () => openTicketModal(ticket));
    
    return card;
}

function openTicketModal(ticket) {
    const modal = document.getElementById('ticketDetailModal');
    if (!modal) return;
    
    const isEdit = ticket !== null;
    const title = isEdit ? 'Edit Ticket' : 'New Ticket';
    
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 600px; max-height: 90vh; overflow-y: auto;">
            <div class="modal-header" style="display: flex; justify-content: space-between; align-items: center; padding: 20px; border-bottom: 1px solid #e5e7eb;">
                <h2 style="margin: 0;">${title}</h2>
                <button class="modal-close" onclick="closeModal()" style="background: none; border: none; font-size: 24px; cursor: pointer; color: #6b7280;">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body" style="padding: 20px;">
                <form id="ticketModalForm" style="display: flex; flex-direction: column; gap: 15px;">
                    <div class="form-group">
                        <label style="display: block; margin-bottom: 5px; font-weight: 500;">Property *</label>
                        <select id="modalTicketProperty" required style="width: 100%; padding: 8px; border: 1px solid #d1d5db; border-radius: 6px;">
                            <option value="">Select Property...</option>
                            ${APP_SETTINGS.properties.map(p => 
                                `<option value="${p}" ${ticket?.property === p ? 'selected' : ''}>${p}</option>`
                            ).join('')}
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label style="display: block; margin-bottom: 5px; font-weight: 500;">Title *</label>
                        <input type="text" id="modalTicketTitle" value="${ticket?.title || ''}" required style="width: 100%; padding: 8px; border: 1px solid #d1d5db; border-radius: 6px;">
                    </div>
                    
                    <div class="form-group">
                        <label style="display: block; margin-bottom: 5px; font-weight: 500;">Description *</label>
                        <textarea id="modalTicketDescription" rows="4" required style="width: 100%; padding: 8px; border: 1px solid #d1d5db; border-radius: 6px; resize: vertical;">${ticket?.description || ''}</textarea>
                    </div>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                        <div class="form-group">
                            <label style="display: block; margin-bottom: 5px; font-weight: 500;">Category *</label>
                            <select id="modalTicketCategory" required style="width: 100%; padding: 8px; border: 1px solid #d1d5db; border-radius: 6px;">
                                ${APP_SETTINGS.ticketCategories.map(c => 
                                    `<option value="${c}" ${ticket?.category === c ? 'selected' : ''}>${c}</option>`
                                ).join('')}
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label style="display: block; margin-bottom: 5px; font-weight: 500;">Priority *</label>
                            <select id="modalTicketPriority" required style="width: 100%; padding: 8px; border: 1px solid #d1d5db; border-radius: 6px;">
                                ${APP_SETTINGS.priorities.map(p => 
                                    `<option value="${p}" ${ticket?.priority === p ? 'selected' : ''}>${p}</option>`
                                ).join('')}
                            </select>
                        </div>
                    </div>
                    
                    ${isEdit ? `
                        <div class="form-group">
                            <label style="display: block; margin-bottom: 5px; font-weight: 500;">Status *</label>
                            <select id="modalTicketStatus" required style="width: 100%; padding: 8px; border: 1px solid #d1d5db; border-radius: 6px;">
                                ${APP_SETTINGS.statuses.map(s => 
                                    `<option value="${s}" ${ticket?.status === s ? 'selected' : ''}>${s}</option>`
                                ).join('')}
                            </select>
                        </div>
                    ` : ''}
                    
                    <div class="modal-actions" style="display: flex; justify-content: space-between; margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                        ${isEdit ? `
                            <button type="button" class="btn-danger" onclick="deleteTicket('${ticket.id}')" style="background: #ef4444; color: white; padding: 10px 20px; border: none; border-radius: 6px; cursor: pointer;">
                                <i class="fas fa-trash"></i> Delete
                            </button>
                        ` : '<div></div>'}
                        <div style="display: flex; gap: 10px;">
                            <button type="button" class="btn-secondary" onclick="closeModal()" style="background: #6b7280; color: white; padding: 10px 20px; border: none; border-radius: 6px; cursor: pointer;">Cancel</button>
                            <button type="submit" class="btn-primary" style="background: #3b82f6; color: white; padding: 10px 20px; border: none; border-radius: 6px; cursor: pointer;">
                                <i class="fas fa-save"></i> ${isEdit ? 'Update' : 'Create'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    modal.style.display = 'flex';
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.backgroundColor = 'rgba(0,0,0,0.5)';
    modal.style.zIndex = '9999';
    modal.style.justifyContent = 'center';
    modal.style.alignItems = 'center';
    
    // Handle form submission
    const form = document.getElementById('ticketModalForm');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        saveTicketFromModal(ticket);
    });
}

async function saveTicketFromModal(existingTicket) {
    const ticketData = {
        property: document.getElementById('modalTicketProperty').value,
        title: document.getElementById('modalTicketTitle').value,
        description: document.getElementById('modalTicketDescription').value,
        category: document.getElementById('modalTicketCategory').value,
        priority: document.getElementById('modalTicketPriority').value,
        status: existingTicket ? document.getElementById('modalTicketStatus').value : 'Open',
        createdBy: currentUser.displayName || currentUser.email,
        updatedAt: new Date().toISOString()
    };
    
    if (!existingTicket) {
        ticketData.createdAt = new Date().toISOString();
    }
    
    try {
        const { saveTicket, updateTicket } = await import('./firebase-realtime.js');
        
        if (existingTicket) {
            await updateTicket(existingTicket.id, ticketData);
            showNotification('Ticket updated successfully', 'success');
        } else {
            await saveTicket(ticketData);
            showNotification('Ticket created successfully', 'success');
        }
        
        closeModal();
        
    } catch (error) {
        console.error('Error saving ticket:', error);
        showNotification('Failed to save ticket', 'error');
    }
}

async function deleteTicket(ticketId) {
    if (!confirm('Are you sure you want to delete this ticket?')) return;
    
    try {
        const { deleteTicket: deleteTicketFromDB } = await import('./firebase-realtime.js');
        await deleteTicketFromDB(ticketId);
        showNotification('Ticket deleted successfully', 'success');
        closeModal();
    } catch (error) {
        console.error('Error deleting ticket:', error);
        showNotification('Failed to delete ticket', 'error');
    }
}

// Make functions globally available
window.openTicketModal = openTicketModal;
window.deleteTicket = deleteTicket;

// ============================================================================
// WORK ORDER FUNCTIONS WITH EDITING
// ============================================================================

function updateWorkOrdersUI() {
    const workOrdersList = document.getElementById('workOrdersList');
    if (!workOrdersList) return;
    
    workOrdersList.innerHTML = '';
    
    if (workOrders.length === 0) {
        workOrdersList.innerHTML = '<div class="empty-state"><i class="fas fa-wrench"></i><p>No work orders found</p><p style="font-size: 14px; margin-top: 10px;">Click "New Work Order" to create one</p></div>';
        return;
    }
    
    workOrders.forEach(wo => {
        const woCard = createWorkOrderCard(wo);
        workOrdersList.appendChild(woCard);
    });
}

function createWorkOrderCard(workOrder) {
    const card = document.createElement('div');
    card.className = 'work-order-card';
    card.style.cursor = 'pointer';
    card.innerHTML = `
        <div class="work-order-header">
            <span class="work-order-id">#${workOrder.id || 'N/A'}</span>
            <span class="badge badge-${(workOrder.priority || 'low').toLowerCase()}">${workOrder.priority || 'Low'}</span>
        </div>
        <h3>${workOrder.title}</h3>
        <p>${workOrder.description}</p>
        <div class="work-order-footer">
            <span class="work-order-property">${workOrder.property}</span>
            <span class="work-order-vendor">${workOrder.vendor || 'No vendor'}</span>
        </div>
    `;
    
    card.addEventListener('click', () => openWorkOrderModal(workOrder));
    
    return card;
}

function openWorkOrderModal(workOrder) {
    const modal = document.getElementById('ticketDetailModal');
    if (!modal) return;
    
    const isEdit = workOrder !== null;
    const title = isEdit ? 'Edit Work Order' : 'New Work Order';
    
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 600px; max-height: 90vh; overflow-y: auto;">
            <div class="modal-header" style="display: flex; justify-content: space-between; align-items: center; padding: 20px; border-bottom: 1px solid #e5e7eb;">
                <h2 style="margin: 0;">${title}</h2>
                <button class="modal-close" onclick="closeModal()" style="background: none; border: none; font-size: 24px; cursor: pointer; color: #6b7280;">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body" style="padding: 20px;">
                <form id="workOrderModalForm" style="display: flex; flex-direction: column; gap: 15px;">
                    <div class="form-group">
                        <label style="display: block; margin-bottom: 5px; font-weight: 500;">Property *</label>
                        <select id="modalWorkOrderProperty" required style="width: 100%; padding: 8px; border: 1px solid #d1d5db; border-radius: 6px;">
                            <option value="">Select Property...</option>
                            ${APP_SETTINGS.properties.map(p => 
                                `<option value="${p}" ${workOrder?.property === p ? 'selected' : ''}>${p}</option>`
                            ).join('')}
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label style="display: block; margin-bottom: 5px; font-weight: 500;">Title *</label>
                        <input type="text" id="modalWorkOrderTitle" value="${workOrder?.title || ''}" required style="width: 100%; padding: 8px; border: 1px solid #d1d5db; border-radius: 6px;">
                    </div>
                    
                    <div class="form-group">
                        <label style="display: block; margin-bottom: 5px; font-weight: 500;">Description *</label>
                        <textarea id="modalWorkOrderDescription" rows="4" required style="width: 100%; padding: 8px; border: 1px solid #d1d5db; border-radius: 6px; resize: vertical;">${workOrder?.description || ''}</textarea>
                    </div>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                        <div class="form-group">
                            <label style="display: block; margin-bottom: 5px; font-weight: 500;">Vendor *</label>
                            <select id="modalWorkOrderVendor" required style="width: 100%; padding: 8px; border: 1px solid #d1d5db; border-radius: 6px;">
                                ${APP_SETTINGS.vendors.map(v => 
                                    `<option value="${v}" ${workOrder?.vendor === v ? 'selected' : ''}>${v}</option>`
                                ).join('')}
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label style="display: block; margin-bottom: 5px; font-weight: 500;">Priority *</label>
                            <select id="modalWorkOrderPriority" required style="width: 100%; padding: 8px; border: 1px solid #d1d5db; border-radius: 6px;">
                                ${APP_SETTINGS.priorities.map(p => 
                                    `<option value="${p}" ${workOrder?.priority === p ? 'selected' : ''}>${p}</option>`
                                ).join('')}
                            </select>
                        </div>
                    </div>
                    
                    ${isEdit ? `
                        <div class="form-group">
                            <label style="display: block; margin-bottom: 5px; font-weight: 500;">Status *</label>
                            <select id="modalWorkOrderStatus" required style="width: 100%; padding: 8px; border: 1px solid #d1d5db; border-radius: 6px;">
                                <option value="Pending" ${workOrder?.status === 'Pending' ? 'selected' : ''}>Pending</option>
                                <option value="In Progress" ${workOrder?.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
                                <option value="Completed" ${workOrder?.status === 'Completed' ? 'selected' : ''}>Completed</option>
                                <option value="Cancelled" ${workOrder?.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
                            </select>
                        </div>
                    ` : ''}
                    
                    <div class="modal-actions" style="display: flex; justify-content: space-between; margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                        ${isEdit ? `
                            <button type="button" class="btn-danger" onclick="deleteWorkOrder('${workOrder.id}')" style="background: #ef4444; color: white; padding: 10px 20px; border: none; border-radius: 6px; cursor: pointer;">
                                <i class="fas fa-trash"></i> Delete
                            </button>
                        ` : '<div></div>'}
                        <div style="display: flex; gap: 10px;">
                            <button type="button" class="btn-secondary" onclick="closeModal()" style="background: #6b7280; color: white; padding: 10px 20px; border: none; border-radius: 6px; cursor: pointer;">Cancel</button>
                            <button type="submit" class="btn-primary" style="background: #3b82f6; color: white; padding: 10px 20px; border: none; border-radius: 6px; cursor: pointer;">
                                <i class="fas fa-save"></i> ${isEdit ? 'Update' : 'Create'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    modal.style.display = 'flex';
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.backgroundColor = 'rgba(0,0,0,0.5)';
    modal.style.zIndex = '9999';
    modal.style.justifyContent = 'center';
    modal.style.alignItems = 'center';
    
    const form = document.getElementById('workOrderModalForm');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        saveWorkOrderFromModal(workOrder);
    });
}

async function saveWorkOrderFromModal(existingWorkOrder) {
    const workOrderData = {
        property: document.getElementById('modalWorkOrderProperty').value,
        title: document.getElementById('modalWorkOrderTitle').value,
        description: document.getElementById('modalWorkOrderDescription').value,
        vendor: document.getElementById('modalWorkOrderVendor').value,
        priority: document.getElementById('modalWorkOrderPriority').value,
        status: existingWorkOrder ? document.getElementById('modalWorkOrderStatus').value : 'Pending',
        createdBy: currentUser.displayName || currentUser.email,
        updatedAt: new Date().toISOString()
    };
    
    if (!existingWorkOrder) {
        workOrderData.createdAt = new Date().toISOString();
    }
    
    try {
        const { saveWorkOrder, updateWorkOrder } = await import('./firebase-realtime.js');
        
        if (existingWorkOrder) {
            await updateWorkOrder(existingWorkOrder.id, workOrderData);
            showNotification('Work order updated successfully', 'success');
        } else {
            await saveWorkOrder(workOrderData);
            showNotification('Work order created successfully', 'success');
        }
        
        closeModal();
        
    } catch (error) {
        console.error('Error saving work order:', error);
        showNotification('Failed to save work order', 'error');
    }
}

async function deleteWorkOrder(workOrderId) {
    if (!confirm('Are you sure you want to delete this work order?')) return;
    
    try {
        const { deleteWorkOrder: deleteWorkOrderFromDB } = await import('./firebase-realtime.js');
        await deleteWorkOrderFromDB(workOrderId);
        showNotification('Work order deleted successfully', 'success');
        closeModal();
    } catch (error) {
        console.error('Error deleting work order:', error);
        showNotification('Failed to delete work order', 'error');
    }
}

window.openWorkOrderModal = openWorkOrderModal;
window.deleteWorkOrder = deleteWorkOrder;

// ============================================================================
// VIOLATION FUNCTIONS WITH EDITING
// ============================================================================

function updateViolationsUI() {
    const violationsList = document.getElementById('violationsList');
    if (!violationsList) return;
    
    violationsList.innerHTML = '';
    
    if (violations.length === 0) {
        violationsList.innerHTML = '<div class="empty-state"><i class="fas fa-exclamation-triangle"></i><p>No violations found</p><p style="font-size: 14px; margin-top: 10px;">Click "New Violation" to create one</p></div>';
        return;
    }
    
    violations.forEach(violation => {
        const violationCard = createViolationCard(violation);
        violationsList.appendChild(violationCard);
    });
}

function createViolationCard(violation) {
    const card = document.createElement('div');
    card.className = 'violation-card';
    card.style.cursor = 'pointer';
    card.innerHTML = `
        <div class="violation-header">
            <span class="violation-id">#${violation.id || 'N/A'}</span>
            <span class="badge badge-warning">${violation.stage || '1st Notice'}</span>
        </div>
        <h3>${violation.violation}</h3>
        <p>${violation.description}</p>
        <div class="violation-footer">
            <span class="violation-property">${violation.property}</span>
            <span class="violation-unit">Unit ${violation.unit}</span>
        </div>
    `;
    
    card.addEventListener('click', () => openViolationModal(violation));
    
    return card;
}

function openViolationModal(violation) {
    const modal = document.getElementById('ticketDetailModal');
    if (!modal) return;
    
    const isEdit = violation !== null;
    const title = isEdit ? 'Edit Violation' : 'New Violation';
    
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 600px; max-height: 90vh; overflow-y: auto;">
            <div class="modal-header" style="display: flex; justify-content: space-between; align-items: center; padding: 20px; border-bottom: 1px solid #e5e7eb;">
                <h2 style="margin: 0;">${title}</h2>
                <button class="modal-close" onclick="closeModal()" style="background: none; border: none; font-size: 24px; cursor: pointer; color: #6b7280;">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body" style="padding: 20px;">
                <form id="violationModalForm" style="display: flex; flex-direction: column; gap: 15px;">
                    <div class="form-group">
                        <label style="display: block; margin-bottom: 5px; font-weight: 500;">Property *</label>
                        <select id="modalViolationProperty" required style="width: 100%; padding: 8px; border: 1px solid #d1d5db; border-radius: 6px;">
                            <option value="">Select Property...</option>
                            ${APP_SETTINGS.properties.map(p => 
                                `<option value="${p}" ${violation?.property === p ? 'selected' : ''}>${p}</option>`
                            ).join('')}
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label style="display: block; margin-bottom: 5px; font-weight: 500;">Unit Number *</label>
                        <input type="text" id="modalViolationUnit" value="${violation?.unit || ''}" required style="width: 100%; padding: 8px; border: 1px solid #d1d5db; border-radius: 6px;">
                    </div>
                    
                    <div class="form-group">
                        <label style="display: block; margin-bottom: 5px; font-weight: 500;">Violation Type *</label>
                        <input type="text" id="modalViolationTitle" value="${violation?.violation || ''}" required style="width: 100%; padding: 8px; border: 1px solid #d1d5db; border-radius: 6px;">
                    </div>
                    
                    <div class="form-group">
                        <label style="display: block; margin-bottom: 5px; font-weight: 500;">Description *</label>
                        <textarea id="modalViolationDescription" rows="4" required style="width: 100%; padding: 8px; border: 1px solid #d1d5db; border-radius: 6px; resize: vertical;">${violation?.description || ''}</textarea>
                    </div>
                    
                    ${isEdit ? `
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                            <div class="form-group">
                                <label style="display: block; margin-bottom: 5px; font-weight: 500;">Stage *</label>
                                <select id="modalViolationStage" required style="width: 100%; padding: 8px; border: 1px solid #d1d5db; border-radius: 6px;">
                                    <option value="1st Notice" ${violation?.stage === '1st Notice' ? 'selected' : ''}>1st Notice</option>
                                    <option value="2nd Notice" ${violation?.stage === '2nd Notice' ? 'selected' : ''}>2nd Notice</option>
                                    <option value="3rd Notice/Hearing" ${violation?.stage === '3rd Notice/Hearing' ? 'selected' : ''}>3rd Notice/Hearing</option>
                                    <option value="Fees" ${violation?.stage === 'Fees' ? 'selected' : ''}>Fees</option>
                                </select>
                            </div>
                            
                            <div class="form-group">
                                <label style="display: block; margin-bottom: 5px; font-weight: 500;">Status *</label>
                                <select id="modalViolationStatus" required style="width: 100%; padding: 8px; border: 1px solid #d1d5db; border-radius: 6px;">
                                    <option value="Open" ${violation?.status === 'Open' ? 'selected' : ''}>Open</option>
                                    <option value="In Progress" ${violation?.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
                                    <option value="Resolved" ${violation?.status === 'Resolved' ? 'selected' : ''}>Resolved</option>
                                    <option value="Closed" ${violation?.status === 'Closed' ? 'selected' : ''}>Closed</option>
                                </select>
                            </div>
                        </div>
                    ` : ''}
                    
                    <div class="modal-actions" style="display: flex; justify-content: space-between; margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                        ${isEdit ? `
                            <button type="button" class="btn-danger" onclick="deleteViolation('${violation.id}')" style="background: #ef4444; color: white; padding: 10px 20px; border: none; border-radius: 6px; cursor: pointer;">
                                <i class="fas fa-trash"></i> Delete
                            </button>
                        ` : '<div></div>'}
                        <div style="display: flex; gap: 10px;">
                            <button type="button" class="btn-secondary" onclick="closeModal()" style="background: #6b7280; color: white; padding: 10px 20px; border: none; border-radius: 6px; cursor: pointer;">Cancel</button>
                            <button type="submit" class="btn-primary" style="background: #3b82f6; color: white; padding: 10px 20px; border: none; border-radius: 6px; cursor: pointer;">
                                <i class="fas fa-save"></i> ${isEdit ? 'Update' : 'Create'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    modal.style.display = 'flex';
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.backgroundColor = 'rgba(0,0,0,0.5)';
    modal.style.zIndex = '9999';
    modal.style.justifyContent = 'center';
    modal.style.alignItems = 'center';
    
    const form = document.getElementById('violationModalForm');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        saveViolationFromModal(violation);
    });
}

async function saveViolationFromModal(existingViolation) {
    const violationData = {
        property: document.getElementById('modalViolationProperty').value,
        unit: document.getElementById('modalViolationUnit').value,
        violation: document.getElementById('modalViolationTitle').value,
        description: document.getElementById('modalViolationDescription').value,
        stage: existingViolation ? document.getElementById('modalViolationStage').value : '1st Notice',
        status: existingViolation ? document.getElementById('modalViolationStatus').value : 'Open',
        createdBy: currentUser.displayName || currentUser.email,
        updatedAt: new Date().toISOString()
    };
    
    if (!existingViolation) {
        violationData.createdAt = new Date().toISOString();
    }
    
    try {
        const { saveViolation, updateViolation } = await import('./firebase-realtime.js');
        
        if (existingViolation) {
            await updateViolation(existingViolation.id, violationData);
            showNotification('Violation updated successfully', 'success');
        } else {
            await saveViolation(violationData);
            showNotification('Violation created successfully', 'success');
        }
        
        closeModal();
        
    } catch (error) {
        console.error('Error saving violation:', error);
        showNotification('Failed to save violation', 'error');
    }
}

async function deleteViolation(violationId) {
    if (!confirm('Are you sure you want to delete this violation?')) return;
    
    try {
        const { deleteViolation: deleteViolationFromDB } = await import('./firebase-realtime.js');
        await deleteViolationFromDB(violationId);
        showNotification('Violation deleted successfully', 'success');
        closeModal();
    } catch (error) {
        console.error('Error deleting violation:', error);
        showNotification('Failed to delete violation', 'error');
    }
}

window.openViolationModal = openViolationModal;
window.deleteViolation = deleteViolation;

// ============================================================================
// MODAL FUNCTIONS
// ============================================================================

function closeModal() {
    const modal = document.getElementById('ticketDetailModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

window.closeModal = closeModal;

// ============================================================================
// STATS UPDATE
// ============================================================================

function updateStats() {
    const statTickets = document.getElementById('statTickets');
    const statWorkOrders = document.getElementById('statWorkOrders');
    const statViolations = document.getElementById('statViolations');
    const ticketBadge = document.getElementById('ticketBadge');
    const workOrderBadge = document.getElementById('workOrderBadge');
    const violationBadge = document.getElementById('violationBadge');
    
    if (statTickets) statTickets.textContent = tickets.length;
    if (statWorkOrders) statWorkOrders.textContent = workOrders.length;
    if (statViolations) statViolations.textContent = violations.length;
    if (ticketBadge) ticketBadge.textContent = tickets.length;
    if (workOrderBadge) workOrderBadge.textContent = workOrders.length;
    if (violationBadge) violationBadge.textContent = violations.length;
    
    console.log('✅ Stats updated');
}

// ============================================================================
// NOTIFICATIONS
// ============================================================================

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
        animation: slideIn 0.3s ease-out;
        display: flex;
        align-items: center;
        gap: 10px;
    `;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ============================================================================
// INITIALIZE ON PAGE LOAD
// ============================================================================

document.addEventListener('DOMContentLoaded', initApp);

console.log('✅ app-professional-firebase.js loaded (v2.1 - WITH FULL EDITING)');
