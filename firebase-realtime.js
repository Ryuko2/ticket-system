// ============================================
// FIREBASE REAL-TIME DATABASE OPERATIONS
// Works with Firebase initialized in index.html
// NO duplicate initialization!
// ============================================

import { getDatabase, ref, set, push, onValue, update, remove, get } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js';

// Get database from global window object (initialized in index.html)
const database = window.firebaseDatabase;

if (!database) {
    console.error('❌ Firebase database not available! Make sure index.html initializes Firebase first.');
}

// ============================================================================
// TICKETS OPERATIONS
// ============================================================================

// Subscribe to tickets real-time updates
export function subscribeToTickets(callback) {
    if (!database) {
        console.error('Database not initialized');
        return;
    }
    
    const ticketsRef = ref(database, 'tickets');
    
    onValue(ticketsRef, (snapshot) => {
        const tickets = [];
        snapshot.forEach((childSnapshot) => {
            tickets.push({
                firebaseKey: childSnapshot.key,
                ...childSnapshot.val()
            });
        });
        
        console.log('📡 Tickets updated:', tickets.length);
        callback(tickets);
    });
}

// Save new ticket
export async function saveTicket(ticketData) {
    if (!database) throw new Error('Database not initialized');
    
    const ticketsRef = ref(database, 'tickets');
    const newTicketRef = push(ticketsRef);
    
    const ticket = {
        id: `TKT-${Date.now()}`,
        ...ticketData,
        createdAt: new Date().toISOString()
    };
    
    await set(newTicketRef, ticket);
    console.log('✅ Ticket saved:', ticket.id);
    return ticket.id;
}

// Update ticket
export async function updateTicket(ticketId, updates) {
    if (!database) throw new Error('Database not initialized');
    
    // Find ticket by ID
    const ticketsRef = ref(database, 'tickets');
    const snapshot = await get(ticketsRef);
    
    let ticketKey = null;
    snapshot.forEach((childSnapshot) => {
        if (childSnapshot.val().id === ticketId) {
            ticketKey = childSnapshot.key;
        }
    });
    
    if (!ticketKey) throw new Error('Ticket not found');
    
    const ticketRef = ref(database, `tickets/${ticketKey}`);
    await update(ticketRef, {
        ...updates,
        updatedAt: new Date().toISOString()
    });
    
    console.log('✅ Ticket updated:', ticketId);
}

// Delete ticket
export async function deleteTicket(ticketId) {
    if (!database) throw new Error('Database not initialized');
    
    // Find ticket by ID
    const ticketsRef = ref(database, 'tickets');
    const snapshot = await get(ticketsRef);
    
    let ticketKey = null;
    snapshot.forEach((childSnapshot) => {
        if (childSnapshot.val().id === ticketId) {
            ticketKey = childSnapshot.key;
        }
    });
    
    if (!ticketKey) throw new Error('Ticket not found');
    
    const ticketRef = ref(database, `tickets/${ticketKey}`);
    await remove(ticketRef);
    
    console.log('✅ Ticket deleted:', ticketId);
}

// ============================================================================
// WORK ORDERS OPERATIONS
// ============================================================================

// Subscribe to work orders real-time updates
export function subscribeToWorkOrders(callback) {
    if (!database) {
        console.error('Database not initialized');
        return;
    }
    
    const workOrdersRef = ref(database, 'workOrders');
    
    onValue(workOrdersRef, (snapshot) => {
        const workOrders = [];
        snapshot.forEach((childSnapshot) => {
            workOrders.push({
                firebaseKey: childSnapshot.key,
                ...childSnapshot.val()
            });
        });
        
        console.log('📡 Work orders updated:', workOrders.length);
        callback(workOrders);
    });
}

// Save new work order
export async function saveWorkOrder(workOrderData) {
    if (!database) throw new Error('Database not initialized');
    
    const workOrdersRef = ref(database, 'workOrders');
    const newWorkOrderRef = push(workOrdersRef);
    
    const workOrder = {
        id: `WO-${Date.now()}`,
        ...workOrderData,
        createdAt: new Date().toISOString()
    };
    
    await set(newWorkOrderRef, workOrder);
    console.log('✅ Work order saved:', workOrder.id);
    return workOrder.id;
}

// Update work order
export async function updateWorkOrder(workOrderId, updates) {
    if (!database) throw new Error('Database not initialized');
    
    // Find work order by ID
    const workOrdersRef = ref(database, 'workOrders');
    const snapshot = await get(workOrdersRef);
    
    let workOrderKey = null;
    snapshot.forEach((childSnapshot) => {
        if (childSnapshot.val().id === workOrderId) {
            workOrderKey = childSnapshot.key;
        }
    });
    
    if (!workOrderKey) throw new Error('Work order not found');
    
    const workOrderRef = ref(database, `workOrders/${workOrderKey}`);
    await update(workOrderRef, {
        ...updates,
        updatedAt: new Date().toISOString()
    });
    
    console.log('✅ Work order updated:', workOrderId);
}

// Delete work order
export async function deleteWorkOrder(workOrderId) {
    if (!database) throw new Error('Database not initialized');
    
    // Find work order by ID
    const workOrdersRef = ref(database, 'workOrders');
    const snapshot = await get(workOrdersRef);
    
    let workOrderKey = null;
    snapshot.forEach((childSnapshot) => {
        if (childSnapshot.val().id === workOrderId) {
            workOrderKey = childSnapshot.key;
        }
    });
    
    if (!workOrderKey) throw new Error('Work order not found');
    
    const workOrderRef = ref(database, `workOrders/${workOrderKey}`);
    await remove(workOrderRef);
    
    console.log('✅ Work order deleted:', workOrderId);
}

// ============================================================================
// VIOLATIONS OPERATIONS
// ============================================================================

// Subscribe to violations real-time updates
export function subscribeToViolations(callback) {
    if (!database) {
        console.error('Database not initialized');
        return;
    }
    
    const violationsRef = ref(database, 'violations');
    
    onValue(violationsRef, (snapshot) => {
        const violations = [];
        snapshot.forEach((childSnapshot) => {
            violations.push({
                firebaseKey: childSnapshot.key,
                ...childSnapshot.val()
            });
        });
        
        console.log('📡 Violations updated:', violations.length);
        callback(violations);
    });
}

// Save new violation
export async function saveViolation(violationData) {
    if (!database) throw new Error('Database not initialized');
    
    const violationsRef = ref(database, 'violations');
    const newViolationRef = push(violationsRef);
    
    const violation = {
        id: `VIO-${Date.now()}`,
        ...violationData,
        createdAt: new Date().toISOString()
    };
    
    await set(newViolationRef, violation);
    console.log('✅ Violation saved:', violation.id);
    return violation.id;
}

// Update violation
export async function updateViolation(violationId, updates) {
    if (!database) throw new Error('Database not initialized');
    
    // Find violation by ID
    const violationsRef = ref(database, 'violations');
    const snapshot = await get(violationsRef);
    
    let violationKey = null;
    snapshot.forEach((childSnapshot) => {
        if (childSnapshot.val().id === violationId) {
            violationKey = childSnapshot.key;
        }
    });
    
    if (!violationKey) throw new Error('Violation not found');
    
    const violationRef = ref(database, `violations/${violationKey}`);
    await update(violationRef, {
        ...updates,
        updatedAt: new Date().toISOString()
    });
    
    console.log('✅ Violation updated:', violationId);
}

// Delete violation
export async function deleteViolation(violationId) {
    if (!database) throw new Error('Database not initialized');
    
    // Find violation by ID
    const violationsRef = ref(database, 'violations');
    const snapshot = await get(violationsRef);
    
    let violationKey = null;
    snapshot.forEach((childSnapshot) => {
        if (childSnapshot.val().id === violationId) {
            violationKey = childSnapshot.key;
        }
    });
    
    if (!violationKey) throw new Error('Violation not found');
    
    const violationRef = ref(database, `violations/${violationKey}`);
    await remove(violationRef);
    
    console.log('✅ Violation deleted:', violationId);
}

console.log('✅ Firebase real-time module loaded (using Firebase from index.html)');
