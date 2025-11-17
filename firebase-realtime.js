// ============================================
// LJ SERVICES GROUP - FIREBASE REAL-TIME LAYER
// Centralized Firebase init + listeners + CRUD
// ============================================

console.log("✅ Firebase real-time module loaded for LJ Services Group");

// ---- GLOBAL STATE ----
let firebaseDb = null;
let ticketsRef = null;
let workOrdersRef = null;
let violationsRef = null;

let ticketsCache = [];
let workOrdersCache = [];
let violationsCache = [];

// ---- FILL THIS WITH YOUR REAL CONFIG ----
const firebaseConfig = {
    apiKey: "YOUR_API_KEY_HERE",
    authDomain: "lj-services-group.firebaseapp.com",
    databaseURL: "https://lj-services-group-default-rtdb.firebaseio.com",
    projectId: "lj-services-group",
    storageBucket: "lj-services-group.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID_HERE",
    appId: "YOUR_APP_ID_HERE"
    // measurementId: "OPTIONAL"
};

// ---- INIT FIREBASE ----
function initFirebase() {
    console.log("🔥 Initializing Firebase for LJ Services Group...");

    if (typeof firebase === "undefined") {
        console.error("❌ Firebase SDK not loaded on page.");
        return;
    }

    try {
        // Initialize only once
        if (!firebase.apps || !firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
        }

        firebaseDb = firebase.database();
        window.firebaseDatabase = firebaseDb; // expose globally

        ticketsRef    = firebaseDb.ref("tickets");
        workOrdersRef = firebaseDb.ref("workOrders");
        violationsRef = firebaseDb.ref("violations");

        console.log("✅ Firebase initialized successfully!");
        console.log("📡 Connected to:", firebaseConfig.databaseURL);

        setupRealtimeListeners();
    } catch (err) {
        console.error("❌ Firebase init error:", err);
    }
}

// ---- REAL-TIME LISTENERS ----
function setupRealtimeListeners() {
    if (!ticketsRef || !workOrdersRef || !violationsRef) {
        console.warn("⚠️ Firebase refs not ready for real-time listeners.");
        return;
    }

    // Tickets
    ticketsRef.on("value", snapshot => {
        const data = snapshot.val() || {};
        ticketsCache = Object.entries(data).map(([id, value]) => ({
            id,
            ...value
        }));

        console.log("📡 Tickets updated from Firebase:", ticketsCache.length);

        if (typeof renderTickets === "function") {
            renderTickets(ticketsCache);
        }
        if (typeof updateStats === "function") {
            updateStats();
        }
    });

    // Work Orders
    workOrdersRef.on("value", snapshot => {
        const data = snapshot.val() || {};
        workOrdersCache = Object.entries(data).map(([id, value]) => ({
            id,
            ...value
        }));

        console.log("📡 Work orders updated from Firebase:", workOrdersCache.length);

        if (typeof renderWorkOrders === "function") {
            renderWorkOrders(workOrdersCache);
        } else {
            simpleRenderWorkOrders(workOrdersCache);
        }
    });

    // Violations
    violationsRef.on("value", snapshot => {
        const data = snapshot.val() || {};
        violationsCache = Object.entries(data).map(([id, value]) => ({
            id,
            ...value
        }));

        console.log("📡 Violations updated from Firebase:", violationsCache.length);

        if (typeof renderViolations === "function") {
            renderViolations(violationsCache);
        } else {
            simpleRenderViolations(violationsCache);
        }
    });
}

// ---- SIMPLE RENDERERS (fallbacks) ----
function simpleRenderWorkOrders(workOrders) {
    const list = document.getElementById("workOrdersList");
    if (!list) return;

    if (!workOrders.length) {
        list.innerHTML = '<div style="padding:30px; text-align:center; color:var(--text-secondary);">No work orders found</div>';
        return;
    }

    list.innerHTML = workOrders
        .map(w => `
        <div class="ticket-card workorder" data-workorder-id="${w.id}">
            <div class="ticket-header">
                <h3>${w.title || "Work Order"}</h3>
                <span class="badge ${w.status || "open"}">
                    ${(w.status || "open").toUpperCase()}
                </span>
            </div>
            <div class="ticket-info">
                <div class="ticket-meta">
                    <span>${w.association || "No association"}</span>
                    <span>${w.location || ""}</span>
                </div>
                <p class="ticket-description">${w.description || "No description"}</p>
                <div class="ticket-footer">
                    <span>👤 ${w.assignedTo || "Unassigned"}</span>
                    <span>📅 ${w.createdDate ? new Date(w.createdDate).toLocaleDateString() : ""}</span>
                </div>
            </div>
        </div>
    `)
        .join("");
}

function simpleRenderViolations(violations) {
    const list = document.getElementById("violationsList");
    if (!list) return;

    if (!violations.length) {
        list.innerHTML = '<div style="padding:30px; text-align:center; color:var(--text-secondary);">No violations found</div>';
        return;
    }

    list.innerHTML = violations
        .map(v => `
        <div class="ticket-card violation" data-violation-id="${v.id}">
            <div class="ticket-header">
                <h3>${v.rule || "Violation"}</h3>
                <span class="badge ${v.severity || "minor"}">
                    ${(v.severity || "minor").toUpperCase()}
                </span>
            </div>
            <div class="ticket-info">
                <div class="ticket-meta">
                    <span>${v.association || "No association"}</span>
                    <span>${v.unit || ""}</span>
                </div>
                <p class="ticket-description">${v.description || "No description"}</p>
                <div class="ticket-footer">
                    <span>👤 ${v.residentName || "Unknown resident"}</span>
                    <span>📅 ${v.createdDate ? new Date(v.createdDate).toLocaleDateString() : ""}</span>
                </div>
            </div>
        </div>
    `)
        .join("");
}

// ---- CRUD HELPERS (Tickets) ----
async function createTicketFirebase(ticketData) {
    if (!ticketsRef) throw new Error("Firebase not initialized (ticketsRef null).");
    const newRef = ticketsRef.push();
    await newRef.set(ticketData);
    return newRef.key;
}

async function updateTicketFirebase(ticketId, updates) {
    if (!ticketsRef) throw new Error("Firebase not initialized (ticketsRef null).");
    await ticketsRef.child(ticketId).update(updates);
}

async function deleteTicketFirebase(ticketId) {
    if (!ticketsRef) throw new Error("Firebase not initialized (ticketsRef null).");
    await ticketsRef.child(ticketId).remove();
}

// ---- EXPOSE GLOBAL HELPERS ----
window.createTicketFirebase = createTicketFirebase;
window.updateTicketFirebase = updateTicketFirebase;
window.deleteTicketFirebase = deleteTicketFirebase;
window.getTicketsCache = () => ticketsCache;
window.getWorkOrdersCache = () => workOrdersCache;
window.getViolationsCache = () => violationsCache;

// ---- AUTO-INIT ----
if (typeof firebase !== "undefined") {
    initFirebase();
} else {
    console.error("❌ Firebase SDK not found when trying to init.");
}
