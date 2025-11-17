// ============================================================================
// LJ SERVICES GROUP - FIXED LOGIN
// Microsoft Authentication that ACTUALLY WORKS
// ============================================================================

console.log('🚀 Loading LJ Services app...');

// ============================================================================
// WAIT FOR FIREBASE - BUT SET UP LOGIN IMMEDIATELY
// ============================================================================

let firebaseReady = false;
let currentUser = null;

// Set up login button AS SOON AS PAGE LOADS
document.addEventListener('DOMContentLoaded', () => {
    console.log('📱 DOM loaded, setting up login button...');
    
    const loginBtn = document.getElementById('microsoftLoginBtn');
    
    if (loginBtn) {
        console.log('✅ Login button found!');
        
        loginBtn.addEventListener('click', async () => {
            console.log('🔘 Login button clicked!');
            
            // Check if Firebase is ready
            if (!window.firebaseAuth || !window.microsoftProvider) {
                console.error('❌ Firebase not ready yet!');
                alert('Please wait a moment and try again...');
                return;
            }
            
            try {
                console.log('🔐 Starting Microsoft login...');
                
                const auth = window.firebaseAuth;
                const provider = window.microsoftProvider;
                
                // Try to login
                const result = await auth.signInWithPopup(provider);
                
                console.log('✅ Login successful!', result.user.email);
                
                // Hide login, show app
                document.getElementById('loginScreen').style.display = 'none';
                document.getElementById('mainApp').style.display = 'flex';
                
                // Update user info
                currentUser = result.user;
                document.getElementById('userName').textContent = result.user.displayName || result.user.email;
                
                if (result.user.photoURL) {
                    document.getElementById('userAvatar').innerHTML = 
                        `<img src="${result.user.photoURL}" style="width: 40px; height: 40px; border-radius: 50%;">`;
                }
                
                // Load data
                loadAllData();
                
            } catch (error) {
                console.error('❌ Login error:', error);
                alert('Login failed: ' + error.message);
            }
        });
        
        console.log('✅ Login button listener attached!');
    } else {
        console.error('❌ Login button NOT found!');
    }
    
    // Set up logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            await window.firebaseAuth.signOut();
            document.getElementById('loginScreen').style.display = 'flex';
            document.getElementById('mainApp').style.display = 'none';
        });
    }
    
    // Set up navigation
    setupNavigation();
});

// Listen for Firebase ready
window.addEventListener('firebaseInitialized', () => {
    console.log('✅ Firebase is ready!');
    firebaseReady = true;
});

// ============================================================================
// NAVIGATION
// ============================================================================

function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            
            const page = item.getAttribute('data-page');
            console.log('📄 Navigating to:', page);
            
            // Remove active from all
            navItems.forEach(nav => nav.classList.remove('active'));
            
            // Add active to clicked
            item.classList.add('active');
            
            // Show the page
            showPage(page);
        });
    });
}

function showPage(pageName) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
        page.style.display = 'none';
    });
    
    // Show selected page
    const selectedPage = document.getElementById(`${pageName}Page`);
    if (selectedPage) {
        selectedPage.classList.add('active');
        selectedPage.style.display = 'block';
        console.log('✅ Showing page:', pageName);
    } else {
        console.error('❌ Page not found:', pageName);
    }
}

// ============================================================================
// DATA LOADING
// ============================================================================

async function loadAllData() {
    console.log('📡 Loading data from Firebase...');
    
    try {
        const { subscribeToTickets, subscribeToWorkOrders, subscribeToViolations } = 
            await import('./firebase-realtime.js');
        
        // Subscribe to tickets
        subscribeToTickets((tickets) => {
            console.log('📋 Tickets loaded:', tickets.length);
            updateTicketsList(tickets);
            updateStats(tickets.length, 'ticketBadge');
            updateStats(tickets.length, 'statTickets');
        });
        
        // Subscribe to work orders
        subscribeToWorkOrders((workOrders) => {
            console.log('🔧 Work orders loaded:', workOrders.length);
            updateWorkOrdersList(workOrders);
            updateStats(workOrders.length, 'workOrderBadge');
            updateStats(workOrders.length, 'statWorkOrders');
        });
        
        // Subscribe to violations
        subscribeToViolations((violations) => {
            console.log('⚠️ Violations loaded:', violations.length);
            updateViolationsList(violations);
            updateStats(violations.length, 'violationBadge');
            updateStats(violations.length, 'statViolations');
        });
        
    } catch (error) {
        console.error('❌ Error loading data:', error);
    }
}

// ============================================================================
// UPDATE UI
// ============================================================================

function updateStats(count, elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = count;
    }
}

function updateTicketsList(tickets) {
    const list = document.getElementById('ticketsList');
    if (!list) return;
    
    if (tickets.length === 0) {
        list.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-ticket-alt"></i>
                <p>No tickets yet</p>
                <p style="font-size: 14px; margin-top: 10px;">Click "New Ticket" to create one</p>
            </div>
        `;
        return;
    }
    
    list.innerHTML = '';
    tickets.forEach(ticket => {
        const card = createTicketCard(ticket);
        list.appendChild(card);
    });
}

function createTicketCard(ticket) {
    const card = document.createElement('div');
    card.className = 'ticket-card';
    card.style.cursor = 'pointer';
    card.innerHTML = `
        <div class="ticket-header">
            <span class="ticket-id">#${ticket.id}</span>
            <span class="badge badge-${ticket.priority?.toLowerCase() || 'low'}">${ticket.priority || 'Low'}</span>
        </div>
        <h3>${ticket.title}</h3>
        <p>${ticket.description}</p>
        <div class="ticket-footer">
            <span>${ticket.property}</span>
            <span class="ticket-status status-${ticket.status?.toLowerCase().replace(' ', '-') || 'open'}">
                ${ticket.status || 'Open'}
            </span>
        </div>
    `;
    
    card.addEventListener('click', () => {
        console.log('Ticket clicked:', ticket.id);
        // TODO: Open edit modal
    });
    
    return card;
}

function updateWorkOrdersList(workOrders) {
    const list = document.getElementById('workOrdersList');
    if (!list) return;
    
    if (workOrders.length === 0) {
        list.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-wrench"></i>
                <p>No work orders yet</p>
            </div>
        `;
        return;
    }
    
    list.innerHTML = '';
    workOrders.forEach(wo => {
        const card = createWorkOrderCard(wo);
        list.appendChild(card);
    });
}

function createWorkOrderCard(workOrder) {
    const card = document.createElement('div');
    card.className = 'work-order-card';
    card.style.cursor = 'pointer';
    card.innerHTML = `
        <div class="work-order-header">
            <span>#${workOrder.id}</span>
            <span class="badge badge-${workOrder.priority?.toLowerCase() || 'low'}">${workOrder.priority || 'Low'}</span>
        </div>
        <h3>${workOrder.title}</h3>
        <p>${workOrder.description}</p>
        <div class="work-order-footer">
            <span>${workOrder.property}</span>
            <span>${workOrder.vendor || 'No vendor'}</span>
        </div>
    `;
    
    return card;
}

function updateViolationsList(violations) {
    const list = document.getElementById('violationsList');
    if (!list) return;
    
    if (violations.length === 0) {
        list.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-exclamation-triangle"></i>
                <p>No violations yet</p>
            </div>
        `;
        return;
    }
    
    list.innerHTML = '';
    violations.forEach(violation => {
        const card = createViolationCard(violation);
        list.appendChild(card);
    });
}

function createViolationCard(violation) {
    const card = document.createElement('div');
    card.className = 'violation-card';
    card.style.cursor = 'pointer';
    card.innerHTML = `
        <div class="violation-header">
            <span>#${violation.id}</span>
            <span class="badge badge-warning">${violation.stage || '1st Notice'}</span>
        </div>
        <h3>${violation.violation}</h3>
        <p>${violation.description}</p>
        <div class="violation-footer">
            <span>${violation.property}</span>
            <span>Unit ${violation.unit}</span>
        </div>
    `;
    
    return card;
}

// ============================================================================
// NEW TICKET BUTTON
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
    const newTicketBtn = document.getElementById('newTicketBtn');
    if (newTicketBtn) {
        newTicketBtn.addEventListener('click', () => {
            console.log('New ticket button clicked');
            alert('Create ticket modal - coming in step 3!');
        });
    }
});

console.log('✅ app-professional-firebase.js loaded (LOGIN FIXED VERSION)');
