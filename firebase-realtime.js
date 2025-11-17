// ============================================
// FIREBASE REAL-TIME DATABASE
// Multi-device ticket synchronization
// LJ Services Group - Kevin's Configuration
// ============================================

// Firebase Configuration - YOUR ACTUAL CREDENTIALS
const firebaseConfig = {
    apiKey: "AIzaSyBVVBJ4RyLwN5pHmggd7aXKhVD-R9cIh7M",
    authDomain: "lj-services-group.firebaseapp.com",
    databaseURL: "https://lj-services-group-default-rtdb.firebaseio.com",
    projectId: "lj-services-group",
    storageBucket: "lj-services-group.firebasestorage.app",
    messagingSenderId: "697032093546",
    appId: "1:697032093546:web:96dd395f0846c65a9eff13",
    measurementId: "G-179WM33MCX"
};

// Initialize Firebase (will be done after Firebase SDK loads)
let database = null;
let ticketsRef = null;
let workOrdersRef = null;
let violationsRef = null;

function initFirebase() {
    if (typeof firebase === 'undefined') {
        console.error('Firebase not loaded');
        return false;
    }
    
    try {
        firebase.initializeApp(firebaseConfig);
        database = firebase.database();
        
        // Database references
        ticketsRef = database.ref('tickets');
        workOrdersRef = database.ref('workOrders');
        violationsRef = database.ref('violations');
        
        console.log('✅ Firebase initialized successfully!');
        console.log('📡 Connected to:', firebaseConfig.databaseURL);
        
        // Setup real-time listeners
        setupRealtimeListeners();
        
        return true;
    } catch (error) {
        console.error('Firebase init error:', error);
        return false;
    }
}

// Setup real-time listeners for live updates
function setupRealtimeListeners() {
    // Listen for ticket changes
    ticketsRef.on('value', (snapshot) => {
        const tickets = [];
        snapshot.forEach((childSnapshot) => {
            tickets.push({
                id: childSnapshot.key,
                ...childSnapshot.val()
            });
        });
        
        // Update UI
        if (typeof renderTickets === 'function') {
            renderTickets(tickets);
        }
        if (typeof updateStats === 'function') {
            updateStats();
        }
        
        console.log('📡 Tickets updated from Firebase:', tickets.length);
    });
    
    // Listen for work order changes
    workOrdersRef.on('value', (snapshot) => {
        const workOrders = [];
        snapshot.forEach((childSnapshot) => {
            workOrders.push({
                id: childSnapshot.key,
                ...childSnapshot.val()
            });
        });
        
        if (typeof renderWorkOrders === 'function') {
            renderWorkOrders(workOrders);
        }
        
        console.log('📡 Work orders updated from Firebase:', workOrders.length);
    });
    
    // Listen for violation changes
    violationsRef.on('value', (snapshot) => {
        const violations = [];
        snapshot.forEach((childSnapshot) => {
            violations.push({
                id: childSnapshot.key,
                ...childSnapshot.val()
            });
        });
        
        if (typeof renderViolations === 'function') {
            renderViolations(violations);
        }
        
        console.log('📡 Violations updated from Firebase:', violations.length);
    });
}

// CREATE - Add new ticket
async function createTicketFirebase(ticketData) {
    try {
        const newTicketRef = ticketsRef.push();
        const ticketId = 'TKT-' + String(Date.now()).slice(-5);
        
        const ticket = {
            id: ticketId,
            ...ticketData,
            createdAt: firebase.database.ServerValue.TIMESTAMP,
            updatedAt: firebase.database.ServerValue.TIMESTAMP,
            updates: []
        };
        
        await newTicketRef.set(ticket);
        console.log('✅ Ticket created:', ticketId);
        
        if (typeof showNotification === 'function') {
            showNotification('Ticket created successfully!', 'success');
        }
        
        return ticketId;
    } catch (error) {
        console.error('Error creating ticket:', error);
        if (typeof showNotification === 'function') {
            showNotification('Error creating ticket', 'error');
        }
        throw error;
    }
}

// READ - Get all tickets
async function getTicketsFirebase() {
    try {
        const snapshot = await ticketsRef.once('value');
        const tickets = [];
        
        snapshot.forEach((childSnapshot) => {
            tickets.push({
                id: childSnapshot.key,
                ...childSnapshot.val()
            });
        });
        
        return tickets;
    } catch (error) {
        console.error('Error getting tickets:', error);
        return [];
    }
}

// READ - Get single ticket
async function getTicketFirebase(ticketId) {
    try {
        const snapshot = await ticketsRef.orderByChild('id').equalTo(ticketId).once('value');
        let ticket = null;
        
        snapshot.forEach((childSnapshot) => {
            ticket = {
                firebaseKey: childSnapshot.key,
                ...childSnapshot.val()
            };
        });
        
        return ticket;
    } catch (error) {
        console.error('Error getting ticket:', error);
        return null;
    }
}

// UPDATE - Update ticket
async function updateTicketFirebase(ticketId, updates) {
    try {
        const ticket = await getTicketFirebase(ticketId);
        if (!ticket) {
            throw new Error('Ticket not found');
        }
        
        const updateData = {
            ...updates,
            updatedAt: firebase.database.ServerValue.TIMESTAMP
        };
        
        await database.ref('tickets/' + ticket.firebaseKey).update(updateData);
        console.log('✅ Ticket updated:', ticketId);
        
        if (typeof showNotification === 'function') {
            showNotification('Ticket updated successfully!', 'success');
        }
        
        return true;
    } catch (error) {
        console.error('Error updating ticket:', error);
        if (typeof showNotification === 'function') {
            showNotification('Error updating ticket', 'error');
        }
        throw error;
    }
}

// UPDATE - Add comment/update to ticket
async function addTicketUpdateFirebase(ticketId, updateText, userName) {
    try {
        const ticket = await getTicketFirebase(ticketId);
        if (!ticket) {
            throw new Error('Ticket not found');
        }
        
        const updates = ticket.updates || [];
        updates.push({
            date: new Date().toISOString(),
            user: userName,
            text: updateText
        });
        
        await database.ref('tickets/' + ticket.firebaseKey).update({
            updates: updates,
            updatedAt: firebase.database.ServerValue.TIMESTAMP
        });
        
        console.log('✅ Update added to ticket:', ticketId);
        
        if (typeof showNotification === 'function') {
            showNotification('Comment added successfully!', 'success');
        }
        
        return true;
    } catch (error) {
        console.error('Error adding update:', error);
        if (typeof showNotification === 'function') {
            showNotification('Error adding comment', 'error');
        }
        throw error;
    }
}

// UPDATE - Change ticket status
async function updateTicketStatusFirebase(ticketId, newStatus, userName) {
    try {
        const ticket = await getTicketFirebase(ticketId);
        if (!ticket) {
            throw new Error('Ticket not found');
        }
        
        const updates = ticket.updates || [];
        updates.push({
            date: new Date().toISOString(),
            user: userName,
            text: `Status changed to ${newStatus.replace('-', ' ')}`
        });
        
        await database.ref('tickets/' + ticket.firebaseKey).update({
            status: newStatus,
            updates: updates,
            updatedAt: firebase.database.ServerValue.TIMESTAMP
        });
        
        console.log('✅ Ticket status updated:', ticketId);
        
        if (typeof showNotification === 'function') {
            showNotification('Status updated successfully!', 'success');
        }
        
        return true;
    } catch (error) {
        console.error('Error updating status:', error);
        if (typeof showNotification === 'function') {
            showNotification('Error updating status', 'error');
        }
        throw error;
    }
}

// DELETE - Delete ticket
async function deleteTicketFirebase(ticketId) {
    try {
        const ticket = await getTicketFirebase(ticketId);
        if (!ticket) {
            throw new Error('Ticket not found');
        }
        
        await database.ref('tickets/' + ticket.firebaseKey).remove();
        console.log('✅ Ticket deleted:', ticketId);
        
        if (typeof showNotification === 'function') {
            showNotification('Ticket deleted successfully!', 'success');
        }
        
        return true;
    } catch (error) {
        console.error('Error deleting ticket:', error);
        if (typeof showNotification === 'function') {
            showNotification('Error deleting ticket', 'error');
        }
        throw error;
    }
}

// Work Orders functions
async function createWorkOrderFirebase(workOrderData) {
    try {
        const newRef = workOrdersRef.push();
        const id = 'WO-' + String(Date.now()).slice(-5);
        
        await newRef.set({
            id: id,
            ...workOrderData,
            createdAt: firebase.database.ServerValue.TIMESTAMP
        });
        
        console.log('✅ Work order created:', id);
        return id;
    } catch (error) {
        console.error('Error creating work order:', error);
        throw error;
    }
}

// Violations functions
async function createViolationFirebase(violationData) {
    try {
        const newRef = violationsRef.push();
        const id = 'VIO-' + String(Date.now()).slice(-5);
        
        await newRef.set({
            id: id,
            ...violationData,
            createdAt: firebase.database.ServerValue.TIMESTAMP
        });
        
        console.log('✅ Violation created:', id);
        return id;
    } catch (error) {
        console.error('Error creating violation:', error);
        throw error;
    }
}

// Initialize Firebase when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('🔥 Initializing Firebase for LJ Services Group...');
    
    // Wait for Firebase SDK to load
    const checkFirebase = setInterval(() => {
        if (typeof firebase !== 'undefined') {
            clearInterval(checkFirebase);
            initFirebase();
        }
    }, 100);
    
    // Timeout after 5 seconds
    setTimeout(() => {
        clearInterval(checkFirebase);
        if (typeof firebase === 'undefined') {
            console.error('❌ Firebase SDK failed to load');
            alert('Firebase SDK failed to load. Check your internet connection.');
        }
    }, 5000);
});

console.log('✅ Firebase real-time module loaded for LJ Services Group');
