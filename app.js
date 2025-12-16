// ============================================
// LJ SERVICES GROUP - PROFESSIONAL CRM
// Enhanced with Bulk Actions & Advanced Features
// ============================================

console.log("🚀 Loading Professional CRM with Bulk Actions...");

const LJ_STATE = {
  db: null,
  currentUser: null,
  tickets: {},
  workOrders: {},
  violations: {},
  currentItem: null,
  searchQuery: "",
  filterStatus: "all",
  attachments: {},
  emailConfig: {
    notifyOnComment: true,
    notifyOnStatusChange: true,
    notifyEmail: "",
  },
  // Bulk Actions State
  selectedItems: new Set(),
  bulkActionsActive: false,
  associations: [
    "Anthony Gardens (ANT)",
    "Bayshore Treasure Condominium (BTC)",
    "Cambridge (CAM)",
    "Eastside Condominium (EAST)",
    "Enclave Waterside Villas Condominium Association (EWVCA)",
    "Futura Sansovino Condominium Association, Inc (FSCA)",
    "Island Point South (IPSCA)",
    "Michelle Condominium (MICH)",
    "Monterrey Condominium Property Association, Inc. (MTC)",
    "Normandy Shores Condominium (NORM)",
    "Oxford Gates (OX)",
    "Palms Of Sunset Condominium Association, Inc (POSS)",
    "Patricia Condominium (PAT)",
    "Ritz Royal (RITZ)",
    "Sage Condominium (SAGE)",
    "The Niche (NICHE)",
    "Tower Gates (TWG)",
    "Vizcaya Villas Condominium (VVC)",
    "Wilton Terrace Condominium (WTC)"
  ].sort(),
  teamMembers: [
    { name: "Linda Johnson", email: "ljohnson@ljservicesgroup.com" },
    { name: "Kevin Rodriguez", email: "kevinr@ljservicesgroup.com" },
    { name: "Accounting", email: "accounting@ljservicesgroup.com" },
    { name: "Admin", email: "admin@ljservicesgroup.com" }
  ]
};

// Registration State
const REGISTRATION_STATE = {
  vehicles: [],
  boats: [],
  pets: [],
  loading: false,
  lastUpdate: null,
  sheetConfigs: {
    vehicles: {
      sheetId: '1VmOzpbum_cs57nSFVpeBBC5VPTW9y74z_ocE8fvuA04',
      gid: '0',
      name: 'Vehicle Registration'
    },
    boats: {
      sheetId: '1ftrWNofz2v0ZxB0y0QKioIsN9gb9dKvr63zDpM-4xSA',
      gid: '0',
      name: 'Boat Registration'
    },
    pets: {
      sheetId: '1msMnNnKMz-RkT_3Tf-jocpoA5Nf8tuJz8W8wn42avps',
      gid: '0',
      name: 'Pet Registration'
    }
  }
};

// --- SKIP Authentication for now (will add later) ---
// Just set a mock user for testing
LJ_STATE.currentUser = {
  email: "kevinr@ljservicesgroup.com",
  uid: "kevin-test-user",
  role: "admin"
};
console.log("👤 Using test user:", LJ_STATE.currentUser.email);

// ---------- Initialization ----------

document.addEventListener("DOMContentLoaded", () => {
  try {
    initFirebaseBinding();
    initUserProfile();
    initDashboardNavigation();
    initDrawers();
    initModal();
    initSearch();
    initFilters();
    initFileUpload();
    initExport();
    initBulkActions();
    initRealtimeListeners();
    initLogoutButton();
    console.log("✅ Professional CRM initialized with Bulk Actions!");
  } catch (err) {
    console.error("❌ Error initializing app:", err);
  }
});

function initFirebaseBinding() {
  if (!window.firebase || !firebase.apps.length) {
    console.error("Firebase is not initialized.");
    return;
  }
  LJ_STATE.db = firebase.database();
  console.log("🔥 Firebase ready:", LJ_STATE.db.ref().toString());

  const dbUrlLabel = document.getElementById("dbUrlLabel");
  if (dbUrlLabel && firebase.apps[0].options.databaseURL) {
    dbUrlLabel.textContent = firebase.apps[0].options.databaseURL;
  }
}

function initUserProfile() {
  const nameEl = document.getElementById("userName");
  const emailEl = document.getElementById("userEmail");
  const user = LJ_STATE.currentUser;
  
  if (user) {
    if (nameEl) nameEl.textContent = user.displayName || user.email;
    if (emailEl) emailEl.textContent = user.email;
    console.log("✅ User:", user.email);
  }
}

function initLogoutButton() {
  const btn = document.getElementById("logoutBtn");
  if (btn) {
    btn.addEventListener("click", () => {
      firebase.auth().signOut().then(() => {
        window.location.href = 'login.html';
      });
    });
  }
}

// ---------- Dashboard Navigation ----------

function initDashboardNavigation() {
  const tabButtons = document.querySelectorAll(".dashboard-tab");
  const views = document.querySelectorAll("[data-dashboard-view]");
  const mobileSelect = document.getElementById("mobileDashboardSelect");
  const titleEl = document.getElementById("dashboardTitle");
  const subtitleEl = document.getElementById("dashboardSubtitle");

  function switchDashboard(type) {
    // Remove active class from all tabs
    tabButtons.forEach(b => {
      b.classList.remove("text-indigo-700", "bg-indigo-50");
      b.classList.add("text-slate-600");
    });

    // Add active class to selected tab
    const activeBtn = document.querySelector(`[data-dashboard="${type}"]`);
    if (activeBtn) {
      activeBtn.classList.add("text-indigo-700", "bg-indigo-50");
      activeBtn.classList.remove("text-slate-600");
    }

    // Hide all dashboard views
    views.forEach(v => v.classList.add("hidden"));

    // Show selected view
    const activeView = document.querySelector(`[data-dashboard-view="${type}"]`);
    if (activeView) {
      activeView.classList.remove("hidden");
    }

    // Update titles and load data based on dashboard type
    if (type === "registrations") {
      if (titleEl) titleEl.textContent = "Registrations Dashboard";
      if (subtitleEl) subtitleEl.textContent = "View all vehicle, boat, and pet registrations";
      
      // Load registration data if not already loaded
      if (!REGISTRATION_STATE.lastUpdate) {
        loadRegistrationsData();
      }
    }
    else if (type === "main") {
      if (titleEl) titleEl.textContent = "Overview";
      if (subtitleEl) subtitleEl.textContent = "High-level activity across all items.";
      clearBulkSelection();
      renderCurrentView();
    }
    else if (type === "tickets") {
      if (titleEl) titleEl.textContent = "Tickets Dashboard";
      if (subtitleEl) subtitleEl.textContent = "General tickets and internal tasks.";
      clearBulkSelection();
      renderCurrentView();
    }
    else if (type === "workOrders") {
      if (titleEl) titleEl.textContent = "Work Orders Dashboard";
      if (subtitleEl) subtitleEl.textContent = "Vendor work and maintenance.";
      clearBulkSelection();
      renderCurrentView();
    }
    else if (type === "whatsapp") {
      if (titleEl) titleEl.textContent = "WhatsApp Conversations";
      if (subtitleEl) subtitleEl.textContent = "Conversations from WhatsApp.";
      loadWhatsAppConversations();
    }
    else if (type === "violations") {
      if (titleEl) titleEl.textContent = "Violations Dashboard";
      if (subtitleEl) subtitleEl.textContent = "CC&R enforcement.";
      clearBulkSelection();
      renderCurrentView();
    }
    
    // Update mobile select
    if (mobileSelect) mobileSelect.value = type;
  }

  // Attach click handlers to tab buttons
  tabButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const dashboardType = btn.getAttribute("data-dashboard");
      switchDashboard(dashboardType);
    });
  });

  // Mobile select handler
  if (mobileSelect) {
    mobileSelect.addEventListener("change", (e) => {
      switchDashboard(e.target.value);
    });
  }

  // Set default dashboard
  switchDashboard("main");
  
  // Initialize registrations dashboard
  console.log("✅ Registrations dashboard initialized");

  // Role-based dashboard visibility
  if (LJ_STATE.currentUser && LJ_STATE.currentUser.role === "client") {
    // Hide specific dashboards for clients
    document.querySelector('[data-dashboard="workOrders"]').classList.add('hidden');
    document.querySelector('[data-dashboard="violations"]').classList.add('hidden');
    document.querySelector('[data-dashboard="registrations"]').classList.add('hidden');
    document.querySelectorAll('[data-dashboard="whatsapp"]').forEach(el => el.classList.add('hidden')); // There are two whatsapp buttons
    
    // Hide these options from the mobile select as well
    const mobileSelect = document.getElementById("mobileDashboardSelect");
    if (mobileSelect) {
      mobileSelect.querySelector('option[value="workOrders"]')?.remove();
      mobileSelect.querySelector('option[value="violations"]')?.remove();
      mobileSelect.querySelector('option[value="registrations"]')?.remove();
      mobileSelect.querySelector('option[value="whatsapp"]')?.remove();
    }
  }
}

// ---------- Drawers (Ticket, Work Order, Violation) ----------

function initDrawers() {
  // Populate associations
  populateAssociationSelects();

  // Open drawer buttons
  document.querySelectorAll("[data-open-drawer]").forEach((btn) => {
    if (LJ_STATE.currentUser.role === "client") {
      const drawerType = btn.dataset.openDrawer;
      if (drawerType === "workOrder" || drawerType === "violation") {
        btn.classList.add("hidden"); // Hide button for clients
        return;
      }
    }
    btn.addEventListener("click", () => {
      const drawerType = btn.dataset.openDrawer;
      openDrawer(`drawer${capitalize(drawerType)}`);
    });
  });

  // Form submissions
  document.getElementById("ticketForm").addEventListener("submit", handleCreateTicket);
  document.getElementById("workOrderForm").addEventListener("submit", handleCreateWorkOrder);
  document.getElementById("violationForm").addEventListener("submit", handleCreateViolation);
}

function populateAssociationSelects() {
  const selects = [
    ...document.querySelectorAll("#ticketForm select[name='association']"),
    ...document.querySelectorAll("#workOrderForm select[name='association']"),
    ...document.querySelectorAll("#violationForm select[name='association']"),
  ];

  selects.forEach(select => {
    select.innerHTML = '<option value="">Select...</option>';
    LJ_STATE.associations.forEach(assoc => {
      const opt = document.createElement("option");
      opt.value = assoc;
      opt.textContent = assoc;
      select.appendChild(opt);
    });
  });

  // Also populate bulk association select
  const bulkSelect = document.getElementById("bulkAssociationSelect");
  if (bulkSelect) {
    bulkSelect.innerHTML = '<option value="">Change Association...</option>';
    LJ_STATE.associations.forEach(assoc => {
      const opt = document.createElement("option");
      opt.value = assoc;
      opt.textContent = assoc;
      bulkSelect.appendChild(opt);
    });
  }
}

function openDrawer(id) {
  const drawer = document.getElementById(id);
  if (!drawer) return;
  drawer.style.display = "block";
  setTimeout(() => {
    const content = drawer.querySelector(".drawer-content");
    if (content) {
      content.classList.remove("drawer-enter");
      content.classList.add("drawer-open");
    }
  }, 10);
}

function closeDrawer(id) {
  const drawer = document.getElementById(id);
  if (!drawer) return;
  const content = drawer.querySelector(".drawer-content");
  if (content) {
    content.classList.remove("drawer-open");
    content.classList.add("drawer-enter");
  }
  setTimeout(() => {
    drawer.style.display = "none";
  }, 200);
}

// Make closeDrawer global for onclick
window.closeDrawer = closeDrawer;

function handleCreateTicket(e) {
  e.preventDefault();
  const form = e.target;
  const data = {
    type: "ticket",
    title: form.title.value,
    association: form.association.value,
    status: form.status.value,
    priority: form.priority.value,
    description: form.description.value || "",
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
    referenceNumber: generateReferenceNumber("TKT"),
    createdBy: LJ_STATE.currentUser.uid,
  };

  LJ_STATE.db.ref("tickets").push(data)
    .then(() => {
      showToast("Ticket created successfully!", "success");
      form.reset();
      closeDrawer("drawerTicket");
    })
    .catch(err => {
      console.error("Error creating ticket:", err);
      showToast("Error creating ticket", "error");
    });
}

function handleCreateWorkOrder(e) {
  e.preventDefault();
  const form = e.target;
  const data = {
    type: "workOrder",
    title: form.title.value,
    association: form.association.value,
    vendor: form.vendor.value,
    estimatedCost: form.estimatedCost.value ? parseFloat(form.estimatedCost.value) : 0,
    status: form.status.value,
    description: form.description.value || "",
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
    referenceNumber: generateReferenceNumber("WO"),
    createdBy: LJ_STATE.currentUser.uid,
  };

  LJ_STATE.db.ref("workOrders").push(data)
    .then(() => {
      showToast("Work Order created successfully!", "success");
      form.reset();
      closeDrawer("drawerWorkOrder");
    })
    .catch(err => {
      console.error("Error creating work order:", err);
      showToast("Error creating work order", "error");
    });
}

function handleCreateViolation(e) {
  e.preventDefault();
  const form = e.target;
  const letterHTMLContent = document.getElementById("violationLetterHTML").value;
  const data = {
    type: "violation",
    title: form.title.value,
    association: form.association.value,
    ruleBroken: form.ruleBroken.value,
    noticeStep: form.noticeStep.value,
    status: form.status.value,
    description: form.description.value || "",
    letterHTML: letterHTMLContent || null,
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
    referenceNumber: generateReferenceNumber("VIO"),
    createdBy: LJ_STATE.currentUser.uid,
  };

  LJ_STATE.db.ref("violations").push(data)
    .then(() => {
      showToast("Violation created successfully!", "success");
      form.reset();
      closeDrawer("drawerViolation");
    })
    .catch(err => {
      console.error("Error creating violation:", err);
      showToast("Error creating violation", "error");
    });
}

function generateReferenceNumber(prefix) {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, "0");
  return `${prefix}-${timestamp}${random}`;
}

// ---------- Modal ----------

function initModal() {
  const closeBtn = document.getElementById("closeItemBtn");
  const deleteBtn = document.getElementById("deleteItemBtn");
  const exportBtn = document.getElementById("exportCsvBtn");
  const commentForm = document.getElementById("commentForm");
  const generateLetterBtn = document.getElementById("generateLetterBtn");

  if (closeBtn) closeBtn.addEventListener("click", handleCloseItem);
  if (deleteBtn) deleteBtn.addEventListener("click", handleDeleteItem);
  if (exportBtn) exportBtn.addEventListener("click", handleExportItem);
  if (commentForm) commentForm.addEventListener("submit", handleAddComment);
  if (generateLetterBtn) generateLetterBtn.addEventListener("click", () => openPdfModal(LJ_STATE.currentItem));
}

function openModal(itemType, itemKey) {
  const modal = document.getElementById("itemModal");
  if (!modal) return;

  let item;
  if (itemType === "ticket") item = LJ_STATE.tickets[itemKey];
  else if (itemType === "workOrder") item = LJ_STATE.workOrders[itemKey];
  else if (itemType === "violation") item = LJ_STATE.violations[itemKey];

  if (!item) return;

  LJ_STATE.currentItem = { type: itemType, key: itemKey, data: item };

  // Update modal content
  document.getElementById("modalTitle").textContent = item.title || "N/A";
  document.getElementById("modalReferenceNumber").textContent = item.referenceNumber || "N/A";
  document.getElementById("modalAssociation").textContent = item.association || "N/A";
  document.getElementById("modalCreated").textContent = formatDate(item.created);
  document.getElementById("modalUpdated").textContent = formatDate(item.updated);
  document.getElementById("modalDescription").textContent = item.description || "No description provided";

  // Status badge
  const statusEl = document.getElementById("modalStatus");
  statusEl.innerHTML = getStatusBadge(item.status);

  // Type-specific sections
  const vendorSection = document.getElementById("modalVendorSection");
  const violationSection = document.getElementById("modalViolationSection");
  
  vendorSection.classList.add("hidden");
  violationSection.classList.add("hidden");

  if (itemType === "workOrder") {
    vendorSection.classList.remove("hidden");
    document.getElementById("modalVendor").textContent = item.vendor || "N/A";
    document.getElementById("modalEstimatedCost").textContent = item.estimatedCost 
      ? `$${parseFloat(item.estimatedCost).toLocaleString()}` 
      : "N/A";
  } else if (itemType === "violation") {
    violationSection.classList.remove("hidden");
    document.getElementById("modalRuleBroken").textContent = item.ruleBroken || "N/A";
    document.getElementById("modalNoticeStep").textContent = item.noticeStep || "N/A";
  }

  // Type icon
  const iconEl = document.getElementById("modalTypeIcon");
  if (itemType === "ticket") {
    iconEl.textContent = "T";
    iconEl.className = "inline-flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white text-sm font-semibold";
  } else if (itemType === "workOrder") {
    iconEl.textContent = "WO";
    iconEl.className = "inline-flex h-10 w-10 items-center justify-center rounded-xl bg-amber-600 text-white text-sm font-semibold";
  } else {
    iconEl.textContent = "V";
    iconEl.className = "inline-flex h-10 w-10 items-center justify-center rounded-xl bg-rose-600 text-white text-sm font-semibold";
  }

  // Load comments and attachments
  loadComments(itemType, itemKey);
  loadAttachments(itemType, itemKey);
  loadHistory(itemType, itemKey);

  // Show modal
  modal.style.display = "block";
  setTimeout(() => {
    const content = modal.querySelector(".modal-content");
    if (content) {
      content.classList.remove("modal-enter");
      content.classList.add("modal-open");
    }
  }, 10);
}

function closeModal() {
  const modal = document.getElementById("itemModal");
  if (!modal) return;
  const content = modal.querySelector(".modal-content");
  if (content) {
    content.classList.remove("modal-open");
    content.classList.add("modal-enter");
  }
  setTimeout(() => {
    modal.style.display = "none";
    LJ_STATE.currentItem = null;
  }, 200);
}

// Make closeModal global
window.closeModal = closeModal;

function handleCloseItem() {
  if (!LJ_STATE.currentItem) return;

  if (LJ_STATE.currentItem.data.createdBy !== LJ_STATE.currentUser.uid) {
    showToast("You can only close items that you have created.", "error");
    return;
  }
  
  if (confirm("Mark this item as closed?")) {
    const { type, key } = LJ_STATE.currentItem;
    const path = type === "ticket" ? "tickets" : type === "workOrder" ? "workOrders" : "violations";
    
    LJ_STATE.db.ref(`${path}/${key}/status`).set("closed")
      .then(() => {
        showToast("Item marked as closed", "success");
        closeModal();
      })
      .catch(err => {
        console.error("Error closing item:", err);
        showToast("Error closing item", "error");
      });
  }
}

function handleDeleteItem() {
  if (!LJ_STATE.currentItem) return;

  if (LJ_STATE.currentItem.data.createdBy !== LJ_STATE.currentUser.uid) {
    showToast("You can only delete items that you have created.", "error");
    return;
  }
  
  if (confirm("Are you sure you want to delete this item? This action cannot be undone.")) {
    const { type, key } = LJ_STATE.currentItem;
    const path = type === "ticket" ? "tickets" : type === "workOrder" ? "workOrders" : "violations";
    
    LJ_STATE.db.ref(`${path}/${key}`).remove()
      .then(() => {
        showToast("Item deleted successfully", "success");
        closeModal();
      })
      .catch(err => {
        console.error("Error deleting item:", err);
        showToast("Error deleting item", "error");
      });
  }
}

function handleExportItem() {
  if (!LJ_STATE.currentItem) return;
  const { data } = LJ_STATE.currentItem;
  exportToCSV([data], `item_${data.referenceNumber}.csv`);
}

function handleAddComment(e) {
  e.preventDefault();
  if (!LJ_STATE.currentItem) return;

  const input = document.getElementById("commentInput");
  const text = input.value.trim();
  if (!text) return;

  const { type, key } = LJ_STATE.currentItem;
  const path = type === "ticket" ? "tickets" : type === "workOrder" ? "workOrders" : "violations";

  const comment = {
    text,
    author: LJ_STATE.currentUser.email,
    authorId: LJ_STATE.currentUser.uid,
    timestamp: new Date().toISOString(),
  };

  LJ_STATE.db.ref(`${path}/${key}/comments`).push(comment)
    .then(() => {
      input.value = "";
      loadComments(type, key);
      showToast("Comment added", "success");
    })
    .catch(err => {
      console.error("Error adding comment:", err);
      showToast("Error adding comment", "error");
    });
}

function loadComments(itemType, itemKey) {
  const path = itemType === "ticket" ? "tickets" : itemType === "workOrder" ? "workOrders" : "violations";
  const commentsList = document.getElementById("commentsList");
  
  LJ_STATE.db.ref(`${path}/${itemKey}/comments`).once("value", snapshot => {
    if (!snapshot.exists()) {
      commentsList.innerHTML = '<p class="text-xs text-slate-400 text-center py-4">No comments yet</p>';
      return;
    }

    const comments = [];
    snapshot.forEach(child => {
      comments.push({ key: child.key, ...child.val() });
    });

    commentsList.innerHTML = comments.map(c => `
      <div class="border-l-2 border-slate-200 pl-3">
        <div class="flex items-center justify-between mb-1">
          <span class="text-xs font-medium text-slate-900">${c.author}</span>
          <span class="text-[10px] text-slate-400">${formatDate(c.timestamp)}</span>
        </div>
        <p class="text-xs text-slate-600">${c.text}</p>
      </div>
    `).join("");
  });
}

function loadAttachments(itemType, itemKey) {
  const attachmentsList = document.getElementById("attachmentsList");
  attachmentsList.innerHTML = '<p class="text-xs text-slate-400 text-center py-4">No attachments yet</p>';
}

function loadHistory(itemType, itemKey) {
  const historyList = document.getElementById("historyList");
  const path = itemType === "ticket" ? "tickets" : itemType === "workOrder" ? "workOrders" : "violations";
  
  LJ_STATE.db.ref(`${path}/${itemKey}`).once("value", snapshot => {
    const item = snapshot.val();
    if (!item) return;

    const history = [];
    
    // Created event
    history.push({
      timestamp: item.created,
      event: "Item created",
      icon: "plus"
    });

    // Status changes (if history exists)
    if (item.statusHistory) {
      Object.values(item.statusHistory).forEach(h => {
        history.push({
          timestamp: h.timestamp,
          event: `Status changed to ${h.status}`,
          icon: "refresh"
        });
      });
    }

    // Sort by timestamp
    history.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    historyList.innerHTML = history.map(h => `
      <div class="flex gap-2">
        <div class="flex-shrink-0 w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center">
          <svg class="w-3 h-3 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            ${h.icon === "plus" 
              ? '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />'
              : '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />'
            }
          </svg>
        </div>
        <div class="flex-1">
          <p class="text-slate-900">${h.event}</p>
          <p class="text-slate-400">${formatDate(h.timestamp)}</p>
        </div>
      </div>
    `).join("");
  });
}

// ---------- File Upload ----------

function initFileUpload() {
  const fileInput = document.getElementById("fileInput");
  if (fileInput) {
    fileInput.addEventListener("change", handleFileUpload);
  }
}

function handleFileUpload(e) {
  const files = Array.from(e.target.files);
  if (!files.length || !LJ_STATE.currentItem) return;

  // Simple file size validation
  const maxSize = 5 * 1024 * 1024; // 5MB
  const validFiles = files.filter(f => f.size <= maxSize);
  
  if (validFiles.length !== files.length) {
    showToast("Some files were too large (max 5MB)", "error");
  }

  // In a real app, you'd upload to Firebase Storage here
  showToast(`${validFiles.length} file(s) ready to upload`, "success");
  e.target.value = ""; // Clear input
}

// ---------- Search & Filters ----------

function initSearch() {
  const searchInput = document.getElementById("globalSearch");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      LJ_STATE.searchQuery = e.target.value.toLowerCase();
      renderCurrentView();
    });
  }
}

function initFilters() {
  const filterButtons = document.querySelectorAll("[data-filter-status]");
  filterButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      LJ_STATE.filterStatus = btn.dataset.filterStatus;
      
      // Update button styles
      filterButtons.forEach(b => {
        const isActive = b.dataset.filterStatus === LJ_STATE.filterStatus;
        b.classList.toggle("bg-indigo-100", isActive);
        b.classList.toggle("text-indigo-700", isActive);
        b.classList.toggle("bg-slate-100", !isActive);
        b.classList.toggle("text-slate-600", !isActive);
      });

      renderCurrentView();
    });
  });
}

// ---------- Bulk Actions ----------

function initBulkActions() {
  // Select All buttons (one for each table)
  document.getElementById("selectAllOverview")?.addEventListener("change", (e) => {
    handleSelectAll(e.target.checked, "overview");
  });
  document.getElementById("selectAllTickets")?.addEventListener("change", (e) => {
    handleSelectAll(e.target.checked, "tickets");
  });
  document.getElementById("selectAllWorkOrders")?.addEventListener("change", (e) => {
    handleSelectAll(e.target.checked, "workOrders");
  });
  document.getElementById("selectAllViolations")?.addEventListener("change", (e) => {
    handleSelectAll(e.target.checked, "violations");
  });

  // Bulk action buttons
  document.getElementById("selectAllBtn")?.addEventListener("click", () => {
    const activeView = getCurrentActiveView();
    handleSelectAll(true, activeView);
  });

  document.getElementById("clearSelectionBtn")?.addEventListener("click", clearBulkSelection);
  document.getElementById("closeBulkActionsBtn")?.addEventListener("click", clearBulkSelection);

  // Apply changes button
  document.getElementById("bulkAssignBtn")?.addEventListener("click", applyBulkChanges);
  
  // Export selected
  document.getElementById("bulkExportBtn")?.addEventListener("click", exportSelectedItems);
  
  // Delete selected
  document.getElementById("bulkDeleteBtn")?.addEventListener("click", deleteSelectedItems);

  // Status select change
  document.getElementById("bulkStatusSelect")?.addEventListener("change", (e) => {
    if (e.target.value) {
      applyBulkChanges();
    }
  });

  // Priority select change
  document.getElementById("bulkPrioritySelect")?.addEventListener("change", (e) => {
    if (e.target.value) {
      applyBulkChanges();
    }
  });

  // Association select change
  document.getElementById("bulkAssociationSelect")?.addEventListener("change", (e) => {
    if (e.target.value) {
      applyBulkChanges();
    }
  });
}

function handleItemCheckboxChange(checkbox, itemId) {
  if (checkbox.checked) {
    LJ_STATE.selectedItems.add(itemId);
  } else {
    LJ_STATE.selectedItems.delete(itemId);
  }
  updateBulkActionsBar();
}

function handleSelectAll(checked, viewType) {
  const items = getFilteredItems();
  
  if (checked) {
    items.forEach(item => {
      LJ_STATE.selectedItems.add(item.id);
    });
  } else {
    items.forEach(item => {
      LJ_STATE.selectedItems.delete(item.id);
    });
  }
  
  renderCurrentView();
  updateBulkActionsBar();
}

function clearBulkSelection() {
  LJ_STATE.selectedItems.clear();
  renderCurrentView();
  updateBulkActionsBar();
}

function updateBulkActionsBar() {
  const count = LJ_STATE.selectedItems.size;
  const bar = document.getElementById("bulkActionsBar");
  const countEl = document.getElementById("bulkSelectedCount");
  const selectAllBtn = document.getElementById("selectAllBtn");
  const clearBtn = document.getElementById("clearSelectionBtn");

  if (countEl) {
    countEl.textContent = `${count} item${count !== 1 ? 's' : ''} selected`;
  }

  if (count > 0) {
    bar?.classList.add("active");
    selectAllBtn?.classList.remove("hidden");
    clearBtn?.classList.remove("hidden");
  } else {
    bar?.classList.remove("active");
    selectAllBtn?.classList.add("hidden");
    clearBtn?.classList.add("hidden");
  }
}

function applyBulkChanges() {
  if (LJ_STATE.selectedItems.size === 0) {
    showToast("No items selected", "error");
    return;
  }

  const statusSelect = document.getElementById("bulkStatusSelect");
  const prioritySelect = document.getElementById("bulkPrioritySelect");
  const associationSelect = document.getElementById("bulkAssociationSelect");
  const assignInput = document.getElementById("bulkAssignInput");

  const updates = {};
  let updateCount = 0;

  if (statusSelect?.value) {
    updates.status = statusSelect.value;
    updateCount++;
  }
  if (prioritySelect?.value) {
    updates.priority = prioritySelect.value;
    updateCount++;
  }
  if (associationSelect?.value) {
    updates.association = associationSelect.value;
    updateCount++;
  }
  if (assignInput?.value.trim()) {
    updates.assignedTo = assignInput.value.trim();
    updateCount++;
  }

  if (updateCount === 0) {
    showToast("Please select at least one change to apply", "error");
    return;
  }

  updates.updated = new Date().toISOString();

  const promises = [];
  LJ_STATE.selectedItems.forEach(itemId => {
    const [type, key] = itemId.split(":");
    const path = type === "ticket" ? "tickets" : type === "workOrder" ? "workOrders" : "violations";
    promises.push(LJ_STATE.db.ref(`${path}/${key}`).update(updates));
  });

  Promise.all(promises)
    .then(() => {
      showToast(`Updated ${LJ_STATE.selectedItems.size} items successfully!`, "success");
      
      // Reset selects
      if (statusSelect) statusSelect.value = "";
      if (prioritySelect) prioritySelect.value = "";
      if (associationSelect) associationSelect.value = "";
      if (assignInput) assignInput.value = "";
      
      clearBulkSelection();
    })
    .catch(err => {
      console.error("Error applying bulk changes:", err);
      showToast("Error updating items", "error");
    });
}

function exportSelectedItems() {
  if (LJ_STATE.selectedItems.size === 0) {
    showToast("No items selected", "error");
    return;
  }

  const selectedData = [];
  LJ_STATE.selectedItems.forEach(itemId => {
    const [type, key] = itemId.split(":");
    let item;
    if (type === "ticket") item = LJ_STATE.tickets[key];
    else if (type === "workOrder") item = LJ_STATE.workOrders[key];
    else if (type === "violation") item = LJ_STATE.violations[key];
    
    if (item) {
      selectedData.push({ ...item, type });
    }
  });

  exportToCSV(selectedData, `bulk_export_${Date.now()}.csv`);
  showToast(`Exported ${selectedData.length} items`, "success");
}

function deleteSelectedItems() {
  if (LJ_STATE.selectedItems.size === 0) {
    showToast("No items selected", "error");
    return;
  }

  if (!confirm(`Are you sure you want to delete ${LJ_STATE.selectedItems.size} items? This cannot be undone.`)) {
    return;
  }

  const promises = [];
  LJ_STATE.selectedItems.forEach(itemId => {
    const [type, key] = itemId.split(":");
    const path = type === "ticket" ? "tickets" : type === "workOrder" ? "workOrders" : "violations";
    promises.push(LJ_STATE.db.ref(`${path}/${key}`).remove());
  });

  Promise.all(promises)
    .then(() => {
      showToast(`Deleted ${LJ_STATE.selectedItems.size} items successfully!`, "success");
      clearBulkSelection();
    })
    .catch(err => {
      console.error("Error deleting items:", err);
      showToast("Error deleting items", "error");
    });
}

function getCurrentActiveView() {
  const views = document.querySelectorAll("[data-dashboard-view]");
  for (const view of views) {
    if (!view.classList.contains("hidden")) {
      return view.dataset.dashboardView;
    }
  }
  return "main";
}

// ---------- Export ----------

function initExport() {
  const exportBtn = document.getElementById("exportCurrentViewBtn");
  if (exportBtn) {
    exportBtn.addEventListener("click", handleExportCurrentView);
  }
}

function handleExportCurrentView() {
  const items = getFilteredItems();
  if (items.length === 0) {
    showToast("No items to export", "error");
    return;
  }

  const view = getCurrentActiveView();
  exportToCSV(items, `${view}_export_${Date.now()}.csv`);
  showToast(`Exported ${items.length} items`, "success");
}

function exportToCSV(items, filename) {
  if (!items.length) return;

  // Get all unique keys
  const keys = new Set();
  items.forEach(item => {
    Object.keys(item).forEach(key => {
      if (key !== "comments" && key !== "attachments" && key !== "history") {
        keys.add(key);
      }
    });
  });

  const headers = Array.from(keys);
  const rows = items.map(item => 
    headers.map(key => {
      const value = item[key];
      if (value === null || value === undefined) return "";
      if (typeof value === "string" && value.includes(",")) return `"${value}"`;
      return value;
    })
  );

  const csv = [
    headers.join(","),
    ...rows.map(row => row.join(","))
  ].join("\n");

  const blob = new Blob([csv], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
}

// ---------- Realtime Listeners ----------

function initRealtimeListeners() {
  LJ_STATE.db.ref("tickets").on("value", snapshot => {
    LJ_STATE.tickets = snapshot.val() || {};
    renderCurrentView();
    updateStats();
  });

  LJ_STATE.db.ref("workOrders").on("value", snapshot => {
    LJ_STATE.workOrders = snapshot.val() || {};
    renderCurrentView();
    updateStats();
  });

  LJ_STATE.db.ref("violations").on("value", snapshot => {
    LJ_STATE.violations = snapshot.val() || {};
    renderCurrentView();
    updateStats();
  });
}

// ---------- Rendering ----------

function loadWhatsAppConversations() {
  const whatsappRef = LJ_STATE.db.ref('whatsapp_conversations');
  const ticketsRef = LJ_STATE.db.ref('tickets');

  whatsappRef.on('value', async (snapshot) => {
    const conversations = snapshot.val() || {};
    const ticketsSnapshot = await ticketsRef.once('value');
    const tickets = ticketsSnapshot.val() || {};

    const conversationsArray = Object.entries(conversations).map(([phone, data]) => {
      const relatedTickets = Object.values(tickets).filter(t => 
        t.reporterPhone === phone && t.source === 'whatsapp'
      );

      return {
        phone: phone,
        ...data,
        ticketCount: relatedTickets.length,
        latestTicket: relatedTickets.length > 0 ? relatedTickets[0] : null
      };
    });

    conversationsArray.sort((a, b) => 
      new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt)
    );

    const total = conversationsArray.length;
    const withTickets = conversationsArray.filter(c => c.ticketCount > 0).length;
    const active = conversationsArray.filter(c => c.status === 'active').length;
    const conversionRate = total > 0 ? Math.round((withTickets / total) * 100) : 0;

    document.getElementById('whatsappTotalConversations').textContent = total;
    document.getElementById('whatsappTicketsCreated').textContent = withTickets;
    document.getElementById('whatsappActiveChats').textContent = active;
    document.getElementById('whatsappConversionRate').textContent = conversionRate + '%';

    const tbody = document.getElementById('whatsappTableBody');
    if (conversationsArray.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" class="px-4 py-8 text-center text-slate-400">No WhatsApp conversations yet</td></tr>';
      return;
    }

    tbody.innerHTML = conversationsArray.map(conv => {
      const lastMessage = conv.messages && conv.messages.length > 0 
        ? conv.messages[conv.messages.length - 1].content 
        : 'No messages';
      const messageCount = conv.messages ? conv.messages.length : 0;
      const date = new Date(conv.updatedAt || conv.createdAt).toLocaleString();
      
      const statusColor = conv.status === 'active' ? '#4CAF50' : '#999';
      const ticketLink = conv.latestTicket 
        ? `<a href="#" onclick="openModal('ticket', '${conv.latestTicket.id}'); return false;" style="color: #2196F3; text-decoration: none; font-weight: 500;">${conv.latestTicket.id}</a>`
        : '<span style="color: #999;">None</span>';

      return `
        <tr class="hover:bg-slate-50">
          <td class="px-4 py-3"><strong>${conv.profileName || 'Unknown'}</strong></td>
          <td class="px-4 py-3 text-slate-600">${conv.phoneNumber}</td>
          <td class="px-4 py-3 text-slate-600" style="max-width: 300px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${lastMessage}</td>
          <td class="px-4 py-3 text-slate-900">${messageCount}</td>
          <td class="px-4 py-3"><span style="color: ${statusColor}; font-weight: 500;">●</span> ${conv.status}</td>
          <td class="px-4 py-3">${ticketLink}</td>
          <td class="px-4 py-3 text-slate-500">${date}</td>
        </tr>
      `;
    }).join('');
  });
}

      

function renderCurrentView() {
  const activeView = getCurrentActiveView();
  
  if (activeView === "main") renderOverview();
  else if (activeView === "tickets") renderTicketsDashboard();
  else if (activeView === "workOrders") renderWorkOrdersDashboard();
  else if (activeView === "violations") renderViolationsDashboard();
  // Note: registrations dashboard renders itself
  
  updateSearchResults();
}

function getFilteredItems() {
  let allItems = [];
  
  // Collect all items
  Object.entries(LJ_STATE.tickets).forEach(([key, item]) => {
    allItems.push({ ...item, id: `ticket:${key}`, key, type: "ticket" });
  });
  Object.entries(LJ_STATE.workOrders).forEach(([key, item]) => {
    allItems.push({ ...item, id: `workOrder:${key}`, key, type: "workOrder" });
  });
  Object.entries(LJ_STATE.violations).forEach(([key, item]) => {
    allItems.push({ ...item, id: `violation:${key}`, key, type: "violation" });
  });

  // Apply status filter
  if (LJ_STATE.filterStatus !== "all") {
    allItems = allItems.filter(item => 
      item.status?.toLowerCase() === LJ_STATE.filterStatus.toLowerCase()
    );
  }

  // Apply search filter
  if (LJ_STATE.searchQuery) {
    allItems = allItems.filter(item => {
      const searchStr = [
        item.title,
        item.association,
        item.vendor,
        item.referenceNumber,
        item.description,
        item.ruleBroken
      ].filter(Boolean).join(" ").toLowerCase();
      
      return searchStr.includes(LJ_STATE.searchQuery);
    });
  }

  return allItems;
}

function renderOverview() {
  const tbody = document.getElementById("overviewTableBody");
  if (!tbody) return;

  const items = getFilteredItems();
  items.sort((a, b) => new Date(b.created) - new Date(a.created));

  if (items.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" class="px-4 py-8 text-center text-slate-400">
          No items found matching your filters.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = items.map(item => {
    const isSelected = LJ_STATE.selectedItems.has(item.id);
    return `
      <tr class="item-row hover:bg-slate-50 cursor-pointer ${isSelected ? 'selected' : ''}" data-item-id="${item.id}">
        <td class="px-4 py-3" onclick="event.stopPropagation()">
          <input 
            type="checkbox" 
            class="item-checkbox rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" 
            data-item-id="${item.id}"
            ${isSelected ? 'checked' : ''}
          />
        </td>
        <td class="px-4 py-3">
          ${getTypeBadge(item.type)}
        </td>
        <td class="px-4 py-3 font-medium text-slate-900">${item.title}</td>
        <td class="px-4 py-3 text-slate-600">${item.association}</td>
        <td class="px-4 py-3">${getStatusBadge(item.status)}</td>
        <td class="px-4 py-3 text-slate-500">${formatDate(item.created)}</td>
      </tr>
    `;
  }).join("");

  // Add click handlers
  attachTableRowHandlers("overviewTableBody", items);
}

function renderTicketsDashboard() {
  const tbody = document.getElementById("ticketsTableBody");
  if (!tbody) return;

  const tickets = Object.entries(LJ_STATE.tickets)
    .map(([key, item]) => ({ ...item, id: `ticket:${key}`, key, type: "ticket" }))
    .filter(item => matchesFilters(item));

  tickets.sort((a, b) => new Date(b.created) - new Date(a.created));

  if (tickets.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" class="px-4 py-8 text-center text-slate-400">
          No tickets found.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = tickets.map(item => {
    const isSelected = LJ_STATE.selectedItems.has(item.id);
    return `
      <tr class="item-row hover:bg-slate-50 cursor-pointer ${isSelected ? 'selected' : ''}" data-item-id="${item.id}">
        <td class="px-4 py-3" onclick="event.stopPropagation()">
          <input 
            type="checkbox" 
            class="item-checkbox rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" 
            data-item-id="${item.id}"
            ${isSelected ? 'checked' : ''}
          />
        </td>
        <td class="px-4 py-3 font-medium text-slate-900">${item.title}</td>
        <td class="px-4 py-3 text-slate-600">${item.association}</td>
        <td class="px-4 py-3">${getStatusBadge(item.status)}</td>
        <td class="px-4 py-3">${getPriorityBadge(item.priority)}</td>
        <td class="px-4 py-3 text-slate-500">${formatDate(item.created)}</td>
      </tr>
    `;
  }).join("");

  attachTableRowHandlers("ticketsTableBody", tickets);
}

function renderWorkOrdersDashboard() {
  const tbody = document.getElementById("workOrdersTableBody");
  if (!tbody) return;

  const workOrders = Object.entries(LJ_STATE.workOrders)
    .map(([key, item]) => ({ ...item, id: `workOrder:${key}`, key, type: "workOrder" }))
    .filter(item => matchesFilters(item));

  workOrders.sort((a, b) => new Date(b.created) - new Date(a.created));

  if (workOrders.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="px-4 py-8 text-center text-slate-400">
          No work orders found.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = workOrders.map(item => {
    const isSelected = LJ_STATE.selectedItems.has(item.id);
    return `
      <tr class="item-row hover:bg-slate-50 cursor-pointer ${isSelected ? 'selected' : ''}" data-item-id="${item.id}">
        <td class="px-4 py-3" onclick="event.stopPropagation()">
          <input 
            type="checkbox" 
            class="item-checkbox rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" 
            data-item-id="${item.id}"
            ${isSelected ? 'checked' : ''}
          />
        </td>
        <td class="px-4 py-3 font-medium text-slate-900">${item.title}</td>
        <td class="px-4 py-3 text-slate-600">${item.association}</td>
        <td class="px-4 py-3 text-slate-600">${item.vendor || "N/A"}</td>
        <td class="px-4 py-3">${getStatusBadge(item.status)}</td>
        <td class="px-4 py-3 text-slate-900">${item.estimatedCost ? "$" + parseFloat(item.estimatedCost).toLocaleString() : "N/A"}</td>
        <td class="px-4 py-3 text-slate-500">${formatDate(item.created)}</td>
      </tr>
    `;
  }).join("");

  attachTableRowHandlers("workOrdersTableBody", workOrders);
}

function renderViolationsDashboard() {
  const tbody = document.getElementById("violationsTableBody");
  if (!tbody) return;

  const violations = Object.entries(LJ_STATE.violations)
    .map(([key, item]) => ({ ...item, id: `violation:${key}`, key, type: "violation" }))
    .filter(item => matchesFilters(item));

  violations.sort((a, b) => new Date(b.created) - new Date(a.created));

  if (violations.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="px-4 py-8 text-center text-slate-400">
          No violations found.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = violations.map(item => {
    const isSelected = LJ_STATE.selectedItems.has(item.id);
    return `
      <tr class="item-row hover:bg-slate-50 cursor-pointer ${isSelected ? 'selected' : ''}" data-item-id="${item.id}">
        <td class="px-4 py-3" onclick="event.stopPropagation()">
          <input 
            type="checkbox" 
            class="item-checkbox rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" 
            data-item-id="${item.id}"
            ${isSelected ? 'checked' : ''}
          />
        </td>
        <td class="px-4 py-3 font-medium text-slate-900">${item.title}</td>
        <td class="px-4 py-3 text-slate-600">${item.association}</td>
        <td class="px-4 py-3 text-slate-600">${item.ruleBroken || "N/A"}</td>
        <td class="px-4 py-3">${getNoticeBadge(item.noticeStep)}</td>
        <td class="px-4 py-3">${getStatusBadge(item.status)}</td>
        <td class="px-4 py-3 text-slate-500">${formatDate(item.created)}</td>
      </tr>
    `;
  }).join("");

  attachTableRowHandlers("violationsTableBody", violations);
}

function attachTableRowHandlers(tbodyId, items) {
  const tbody = document.getElementById(tbodyId);
  if (!tbody) return;

  // Row click to open modal
  const rows = tbody.querySelectorAll("tr[data-item-id]");
  rows.forEach(row => {
    row.addEventListener("click", (e) => {
      if (e.target.type === "checkbox") return;
      const itemId = row.dataset.itemId;
      const [type, key] = itemId.split(":");
      openModal(type, key);
    });
  });

  // Checkbox change
  const checkboxes = tbody.querySelectorAll("input[type='checkbox'].item-checkbox");
  checkboxes.forEach(cb => {
    cb.addEventListener("change", (e) => {
      handleItemCheckboxChange(e.target, e.target.dataset.itemId);
    });
  });
}

function matchesFilters(item) {
  // Status filter
  if (LJ_STATE.filterStatus !== "all" && item.status?.toLowerCase() !== LJ_STATE.filterStatus.toLowerCase()) {
    return false;
  }

  // Search filter
  if (LJ_STATE.searchQuery) {
    const searchStr = [
      item.title,
      item.association,
      item.vendor,
      item.referenceNumber,
      item.description,
      item.ruleBroken
    ].filter(Boolean).join(" ").toLowerCase();
    
    if (!searchStr.includes(LJ_STATE.searchQuery)) {
      return false;
    }
  }

  return true;
}

function updateStats() {
  const allItems = [
    ...Object.values(LJ_STATE.tickets),
    ...Object.values(LJ_STATE.workOrders),
    ...Object.values(LJ_STATE.violations)
  ];

  const total = allItems.length;
  const open = allItems.filter(i => i.status === "open").length;
  const inProgress = allItems.filter(i => i.status === "in progress").length;
  const closed = allItems.filter(i => i.status === "closed").length;

  document.getElementById("statTotal").textContent = total;
  document.getElementById("statOpen").textContent = open;
  document.getElementById("statInProgress").textContent = inProgress;
  document.getElementById("statClosed").textContent = closed;
}

function updateSearchResults() {
  const resultEl = document.getElementById("searchResults");
  if (!resultEl) return;

  const items = getFilteredItems();
  const total = Object.keys(LJ_STATE.tickets).length + 
                Object.keys(LJ_STATE.workOrders).length + 
                Object.keys(LJ_STATE.violations).length;

  if (LJ_STATE.searchQuery || LJ_STATE.filterStatus !== "all") {
    resultEl.textContent = `Showing ${items.length} of ${total} items`;
  } else {
    resultEl.textContent = `${total} total items`;
  }
}

// ---------- UI Helper Functions ----------

function getTypeBadge(type) {
  const badges = {
    ticket: '<span class="inline-flex items-center px-2 py-1 rounded-full text-[10px] font-medium bg-indigo-100 text-indigo-700">Ticket</span>',
    workOrder: '<span class="inline-flex items-center px-2 py-1 rounded-full text-[10px] font-medium bg-amber-100 text-amber-700">Work Order</span>',
    violation: '<span class="inline-flex items-center px-2 py-1 rounded-full text-[10px] font-medium bg-rose-100 text-rose-700">Violation</span>',
  };
  return badges[type] || "";
}

function getStatusBadge(status) {
  const badges = {
    open: '<span class="inline-flex items-center px-2 py-1 rounded-full text-[10px] font-medium bg-amber-100 text-amber-700">Open</span>',
    "in progress": '<span class="inline-flex items-center px-2 py-1 rounded-full text-[10px] font-medium bg-blue-100 text-blue-700">In Progress</span>',
    closed: '<span class="inline-flex items-center px-2 py-1 rounded-full text-[10px] font-medium bg-emerald-100 text-emerald-700">Closed</span>',
  };
  return badges[status?.toLowerCase()] || '<span class="inline-flex items-center px-2 py-1 rounded-full text-[10px] font-medium bg-slate-100 text-slate-700">Unknown</span>';
}

function getPriorityBadge(priority) {
  const badges = {
    low: '<span class="inline-flex items-center px-2 py-1 rounded-full text-[10px] font-medium bg-slate-100 text-slate-700">Low</span>',
    medium: '<span class="inline-flex items-center px-2 py-1 rounded-full text-[10px] font-medium bg-blue-100 text-blue-700">Medium</span>',
    high: '<span class="inline-flex items-center px-2 py-1 rounded-full text-[10px] font-medium bg-orange-100 text-orange-700">High</span>',
    urgent: '<span class="inline-flex items-center px-2 py-1 rounded-full text-[10px] font-medium bg-rose-100 text-rose-700">Urgent</span>',
  };
  return badges[priority?.toLowerCase()] || "";
}

function getNoticeBadge(step) {
  const badges = {
    "1st Notice": '<span class="inline-flex items-center px-2 py-1 rounded-full text-[10px] font-medium bg-yellow-100 text-yellow-700">1st Notice</span>',
    "2nd Notice": '<span class="inline-flex items-center px-2 py-1 rounded-full text-[10px] font-medium bg-orange-100 text-orange-700">2nd Notice</span>',
    "3rd Notice": '<span class="inline-flex items-center px-2 py-1 rounded-full text-[10px] font-medium bg-red-100 text-red-700">3rd Notice</span>',
    "Final Notice": '<span class="inline-flex items-center px-2 py-1 rounded-full text-[10px] font-medium bg-rose-100 text-rose-700">Final Notice</span>',
  };
  return badges[step] || "";
}

function formatDate(isoString) {
  if (!isoString) return "N/A";
  const date = new Date(isoString);
  const now = new Date();
  const diff = now - date;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  
  return date.toLocaleDateString();
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// ---------- Toast Notifications ----------

function showToast(message, type = "info") {
  const container = document.getElementById("toastContainer");
  if (!container) return;

  const colors = {
    success: "bg-emerald-500",
    error: "bg-rose-500",
    info: "bg-indigo-500",
  };

  const toast = document.createElement("div");
  toast.className = `${colors[type] || colors.info} text-white px-4 py-3 rounded-lg shadow-lg text-sm font-medium transform transition-all duration-300 translate-y-0 opacity-100`;
  toast.textContent = message;

  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("translate-y-2", "opacity-0");
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ============================================
// REGISTRATIONS DASHBOARD
// ============================================

// Fetch data from Google Sheets
async function fetchSheetData(config) {
  const url = `https://docs.google.com/spreadsheets/d/${config.sheetId}/export?format=csv&gid=${config.gid}`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    
    const csvText = await response.text();
    return parseCSV(csvText);
  } catch (error) {
    console.error(`Error fetching ${config.name}:`, error);
    return [];
  }
}

// Parse CSV data
function parseCSV(csvText) {
  const lines = csvText.split('\n');
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
  const data = [];
  
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() === '') continue;
    
    const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
    const row = {};
    
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    
    data.push(row);
  }
  
  return data;
}

// Load all registration data
async function loadRegistrationsData() {
  REGISTRATION_STATE.loading = true;
  showRegistrationsLoading();
  
  try {
    const [vehicles, boats, pets] = await Promise.all([
      fetchSheetData(REGISTRATION_STATE.sheetConfigs.vehicles),
      fetchSheetData(REGISTRATION_STATE.sheetConfigs.boats),
      fetchSheetData(REGISTRATION_STATE.sheetConfigs.pets)
    ]);
    
    REGISTRATION_STATE.vehicles = vehicles;
    REGISTRATION_STATE.boats = boats;
    REGISTRATION_STATE.pets = pets;
    REGISTRATION_STATE.lastUpdate = new Date();
    
    displayRegistrationsOverview();
    hideRegistrationsLoading();
  } catch (error) {
    console.error('Error loading registrations:', error);
    showRegistrationsError(error.message);
  } finally {
    REGISTRATION_STATE.loading = false;
  }
}

// Display registrations overview
function displayRegistrationsOverview() {
  const container = document.getElementById('registrationsContent');
  if (!container) return;
  
  const vehicleCount = REGISTRATION_STATE.vehicles.length;
  const boatCount = REGISTRATION_STATE.boats.length;
  const petCount = REGISTRATION_STATE.pets.length;
  
  container.innerHTML = `
    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      <!-- Vehicles -->
      <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer" onclick="showRegistrationsTab('vehicles')">
        <div class="flex items-center justify-between mb-4">
          <div class="text-4xl">🚗</div>
          <div class="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-bold">VEHICLES</div>
        </div>
        <h3 class="text-2xl font-bold text-slate-900 mb-1">${vehicleCount}</h3>
        <p class="text-sm text-slate-600">Total Registrations</p>
      </div>
      
      <!-- Boats -->
      <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer" onclick="showRegistrationsTab('boats')">
        <div class="flex items-center justify-between mb-4">
          <div class="text-4xl">🚤</div>
          <div class="bg-teal-100 text-teal-800 px-3 py-1 rounded-full text-xs font-bold">BOATS</div>
        </div>
        <h3 class="text-2xl font-bold text-slate-900 mb-1">${boatCount}</h3>
        <p class="text-sm text-slate-600">Total Registrations</p>
      </div>
      
      <!-- Pets -->
      <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer" onclick="showRegistrationsTab('pets')">
        <div class="flex items-center justify-between mb-4">
          <div class="text-4xl">🐾</div>
          <div class="bg-pink-100 text-pink-800 px-3 py-1 rounded-full text-xs font-bold">PETS</div>
        </div>
        <h3 class="text-2xl font-bold text-slate-900 mb-1">${petCount}</h3>
        <p class="text-sm text-slate-600">Total Registrations</p>
      </div>
    </div>
    
    <!-- Tabs -->
    <div class="bg-white rounded-xl border border-slate-200 shadow-sm mb-6">
      <div class="border-b border-slate-200 px-4">
        <nav class="flex gap-4">
          <button onclick="showRegistrationsTab('vehicles')" id="regTabVehicles" class="py-3 px-4 text-sm font-medium border-b-2 border-indigo-500 text-indigo-600">
            Vehicles (${vehicleCount})
          </button>
          <button onclick="showRegistrationsTab('boats')" id="regTabBoats" class="py-3 px-4 text-sm font-medium border-b-2 border-transparent text-slate-600 hover:text-slate-900">
            Boats (${boatCount})
          </button>
          <button onclick="showRegistrationsTab('pets')" id="regTabPets" class="py-3 px-4 text-sm font-medium border-b-2 border-transparent text-slate-600 hover:text-slate-900">
            Pets (${petCount})
          </button>
        </nav>
      </div>
    </div>
    
    <!-- Content Areas -->
    <div id="vehiclesRegContent">${renderVehiclesTable()}</div>
    <div id="boatsRegContent" class="hidden">${renderBoatsTable()}</div>
    <div id="petsRegContent" class="hidden">${renderPetsTable()}</div>
  `;
}

// Show registrations tab
function showRegistrationsTab(tab) {
  // Update tabs
  document.querySelectorAll('[id^="regTab"]').forEach(btn => {
    btn.classList.remove('border-indigo-500', 'text-indigo-600');
    btn.classList.add('border-transparent', 'text-slate-600');
  });
  
  const activeTab = document.getElementById(`regTab${tab.charAt(0).toUpperCase() + tab.slice(1)}`);
  if (activeTab) {
    activeTab.classList.add('border-indigo-500', 'text-indigo-600');
    activeTab.classList.remove('border-transparent', 'text-slate-600');
  }
  
  // Show/hide content
  document.getElementById('vehiclesRegContent').classList.toggle('hidden', tab !== 'vehicles');
  document.getElementById('boatsRegContent').classList.toggle('hidden', tab !== 'boats');
  document.getElementById('petsRegContent').classList.toggle('hidden', tab !== 'pets');
}

// Render vehicles table
function renderVehiclesTable() {
  if (REGISTRATION_STATE.vehicles.length === 0) {
    return '<div class="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500">No vehicle registrations found</div>';
  }
  
  let html = '<div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden"><table class="w-full"><thead class="bg-slate-50 border-b border-slate-200"><tr>';
  html += '<th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Timestamp</th>';
  html += '<th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Unit</th>';
  html += '<th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Resident</th>';
  html += '<th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Association</th>';
  html += '<th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Vehicles</th>';
  html += '</tr></thead><tbody class="divide-y divide-slate-200">';
  
  REGISTRATION_STATE.vehicles.forEach(row => {
    const vehicles = [];
    if (row['Vehicle 1 Make']) vehicles.push(`${row['Vehicle 1 Make']} ${row['Vehicle 1 Model']}`);
    if (row['Vehicle 2 Make']) vehicles.push(`${row['Vehicle 2 Make']} ${row['Vehicle 2 Model']}`);
    if (row['Vehicle 3 Make']) vehicles.push(`${row['Vehicle 3 Make']} ${row['Vehicle 3 Model']}`);
    
    html += `<tr class="hover:bg-slate-50">`;
    html += `<td class="px-6 py-4 text-sm text-slate-600">${formatRegistrationDate(row['Timestamp'])}</td>`;
    html += `<td class="px-6 py-4 text-sm font-medium text-slate-900">${row['Unit Number']}</td>`;
    html += `<td class="px-6 py-4 text-sm text-slate-600">${row['Resident Name']}</td>`;
    html += `<td class="px-6 py-4 text-sm text-slate-600">${row['Association Name']}</td>`;
    html += `<td class="px-6 py-4 text-sm text-slate-900">${vehicles.join(', ') || 'N/A'}</td>`;
    html += `</tr>`;
  });
  
  html += '</tbody></table></div>';
  return html;
}

// Render boats table
function renderBoatsTable() {
  if (REGISTRATION_STATE.boats.length === 0) {
    return '<div class="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500">No boat registrations found</div>';
  }
  
  let html = '<div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden"><table class="w-full"><thead class="bg-slate-50 border-b border-slate-200"><tr>';
  html += '<th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Timestamp</th>';
  html += '<th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Unit</th>';
  html += '<th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Owner</th>';
  html += '<th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Association</th>';
  html += '<th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Boat</th>';
  html += '</tr></thead><tbody class="divide-y divide-slate-200">';
  
  REGISTRATION_STATE.boats.forEach(row => {
    const boat = `${row['Manufacturer']} ${row['Model']} (${row['Year']})`;
    
    html += `<tr class="hover:bg-slate-50">`;
    html += `<td class="px-6 py-4 text-sm text-slate-600">${formatRegistrationDate(row['Timestamp'])}</td>`;
    html += `<td class="px-6 py-4 text-sm font-medium text-slate-900">${row['Unit Number']}</td>`;
    html += `<td class="px-6 py-4 text-sm text-slate-600">${row['Property Owner']}</td>`;
    html += `<td class="px-6 py-4 text-sm text-slate-600">${row['Association Name']}</td>`;
    html += `<td class="px-6 py-4 text-sm text-slate-900">${boat}</td>`;
    html += `</tr>`;
  });
  
  html += '</tbody></table></div>';
  return html;
}

// Render pets table
function renderPetsTable() {
  if (REGISTRATION_STATE.pets.length === 0) {
    return '<div class="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500">No pet registrations found</div>';
  }
  
  let html = '<div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden"><table class="w-full"><thead class="bg-slate-50 border-b border-slate-200"><tr>';
  html += '<th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Timestamp</th>';
  html += '<th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Unit</th>';
  html += '<th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Owner</th>';
  html += '<th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Association</th>';
  html += '<th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Pet</th>';
  html += '</tr></thead><tbody class="divide-y divide-slate-200">';
  
  REGISTRATION_STATE.pets.forEach(row => {
    const petName = row['Animal Name'] || row['Pet Name'] || 'N/A';
    const petBreed = row['Breed'] || row['Breed Description'] || '';
    
    html += `<tr class="hover:bg-slate-50">`;
    html += `<td class="px-6 py-4 text-sm text-slate-600">${formatRegistrationDate(row['Timestamp'])}</td>`;
    html += `<td class="px-6 py-4 text-sm font-medium text-slate-900">${row['Unit Number']}</td>`;
    html += `<td class="px-6 py-4 text-sm text-slate-600">${row['Owner Name']}</td>`;
    html += `<td class="px-6 py-4 text-sm text-slate-600">${row['Association Name']}</td>`;
    html += `<td class="px-6 py-4 text-sm text-slate-900">${petName} ${petBreed ? `(${petBreed})` : ''}</td>`;
    html += `</tr>`;
  });
  
  html += '</tbody></table></div>';
  return html;
}

// Helper functions for registrations
function formatRegistrationDate(dateString) {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  return date.toLocaleString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function showRegistrationsLoading() {
  const container = document.getElementById('registrationsContent');
  if (container) {
    container.innerHTML = '<div class="flex items-center justify-center py-20"><div class="text-center"><div class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent"></div><p class="mt-4 text-sm text-slate-600">Loading registration data...</p></div></div>';
  }
}

function hideRegistrationsLoading() {
  // Content is replaced by displayRegistrationsOverview()
}

function showRegistrationsError(message) {
  const container = document.getElementById('registrationsContent');
  if (container) {
    container.innerHTML = `<div class="bg-red-50 border border-red-200 rounded-xl p-6 text-center"><div class="text-red-800 font-medium mb-2">Error Loading Data</div><div class="text-sm text-red-600">${message}</div></div>`;
  }
}

// Export function to global scope
window.showRegistrationsTab = showRegistrationsTab;


function initPdfLetterGeneration() {
  const letterTypeSelect = document.getElementById("letterType");
  const ccCheckboxesDiv = document.getElementById("ccCheckboxes");

  // Populate Letter Types
  for (const itemType in LETTER_TEMPLATES) {
    for (const templateType in LETTER_TEMPLATES[itemType]) {
      const template = LETTER_TEMPLATES[itemType][templateType];
      const option = document.createElement("option");
      option.value = `${itemType}:${templateType}`;
      option.textContent = template.name;
      letterTypeSelect.appendChild(option);
    }
  }

  // Populate CC Team Members
  LJ_STATE.teamMembers.forEach(member => {
    const div = document.createElement("div");
    div.className = "flex items-center";
    div.innerHTML = `
      <input type="checkbox" id="cc-${member.name.replace(/\s/g, '-')}" value="${member.email}"
        class="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500">
      <label for="cc-${member.name.replace(/\s/g, '-')}" class="ml-2 text-sm text-slate-700">${member.name} (${member.email})</label>
    `;
    ccCheckboxesDiv.appendChild(div);
  });

  // Event Listeners
  letterTypeSelect.addEventListener("change", updateLetterPreview);
  document.getElementById("recipientName").addEventListener("input", updateLetterPreview);
  document.getElementById("recipientEmail").addEventListener("input", updateLetterPreview);
  document.getElementById("recipientAddress").addEventListener("input", updateLetterPreview);
  document.getElementById("customNotes").addEventListener("input", updateLetterPreview);
}

function openPdfModal(item) {
  if (!item) return;

  LJ_STATE.currentItem = { type: item.type, key: item.key, data: item.data };

  const modal = document.getElementById("pdfLetterModal");
  if (!modal) return;

  // Clear previous selections and input fields
  const letterTypeSelect = document.getElementById("letterType");
  const recipientNameInput = document.getElementById("recipientName");
  const recipientEmailInput = document.getElementById("recipientEmail");
  const recipientAddressTextarea = document.getElementById("recipientAddress");
  const additionalCCInput = document.getElementById("additionalCC");
  const customNotesTextarea = document.getElementById("customNotes");
  const letterPreviewDiv = document.getElementById("letterPreview");

  letterTypeSelect.value = "";
  recipientNameInput.value = "";
  recipientEmailInput.value = "";
  recipientAddressTextarea.value = "";
  additionalCCInput.value = "";
  customNotesTextarea.value = "";
  letterPreviewDiv.innerHTML = '<p class="text-slate-400 text-center py-8">Select a letter type to preview</p>';

  // Uncheck all CC checkboxes
  document.querySelectorAll('#ccCheckboxes input[type="checkbox"]').forEach(checkbox => {
    checkbox.checked = false;
  });

  // Try to pre-select a letter type based on the current item's type
  if (item.type === "workOrder" && LETTER_TEMPLATES.workOrder && LETTER_TEMPLATES.workOrder.completion) {
    letterTypeSelect.value = "workOrder:completion";
  } else if (item.type === "violation" && LETTER_TEMPLATES.violation && LETTER_TEMPLATES.violation.firstNotice) {
    letterTypeSelect.value = "violation:firstNotice";
  }
  // No default for 'ticket' as there isn't a generic template explicitly defined for it yet.

  modal.classList.remove("hidden");

  // If a default letter type was set, update the preview
  if (letterTypeSelect.value) {
    updateLetterPreview();
  }
}

function closePdfModal() {
  const modal = document.getElementById("pdfLetterModal");
  if (modal) {
    modal.classList.add("hidden");
  }
}

// Make closePdfModal global for onclick in HTML
window.closePdfModal = closePdfModal;

function updateLetterPreview() {
  const letterTypeSelect = document.getElementById("letterType");
  const letterPreviewDiv = document.getElementById("letterPreview");

  if (!letterTypeSelect.value) {
    letterPreviewDiv.innerHTML = '<p class="text-slate-400 text-center py-8">Select a letter type to preview</p>';
    return;
  }

  const [itemType, templateType] = letterTypeSelect.value.split(":");
  const template = LETTER_TEMPLATES[itemType]?.[templateType];

  if (!template || !LJ_STATE.currentItem) {
    letterPreviewDiv.innerHTML = '<p class="text-rose-500 text-center py-8">Error: Could not load template.</p>';
    return;
  }

  const recipientName = document.getElementById("recipientName").value;
  const recipientEmail = document.getElementById("recipientEmail").value;
  const recipientAddress = document.getElementById("recipientAddress").value;
  const customNotes = document.getElementById("customNotes").value;

  const data = {
    ...LJ_STATE.currentItem.data,
    referenceNumber: LJ_STATE.currentItem.data.referenceNumber || "N/A", // Ensure referenceNumber exists
    recipientName,
    recipientEmail,
    recipientAddress,
    customNotes,
  };

  letterPreviewDiv.innerHTML = template.generate(data);
}

function downloadPdfLetter() {
  if (!LJ_STATE.currentItem) {
    showToast("No item selected for letter generation.", "error");
    return;
  }

  const letterTypeSelect = document.getElementById("letterType");
  if (!letterTypeSelect.value) {
    showToast("Please select a letter type first.", "error");
    return;
  }

  const [itemType, templateType] = letterTypeSelect.value.split(":");
  const template = LETTER_TEMPLATES[itemType]?.[templateType];

  if (!template) {
    showToast("Invalid letter template selected.", "error");
    return;
  }

  const recipientName = document.getElementById("recipientName").value;
  const recipientAddress = document.getElementById("recipientAddress").value;
  const customNotes = document.getElementById("customNotes").value;

  const data = {
    ...LJ_STATE.currentItem.data,
    referenceNumber: LJ_STATE.currentItem.data.referenceNumber || "N/A",
    recipientName,
    recipientAddress,
    customNotes,
  };

  const filename = `${templateType}_${data.referenceNumber || "document"}.pdf`;

  // Get the HTML content to convert
  const element = document.getElementById('letterPreview');

  // html2pdf library options
  const opt = {
    margin: 1,
    filename: filename,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
  };

  html2pdf().from(element).set(opt).save();
  showToast("PDF downloaded successfully!", "success");
}

window.downloadPdfLetter = downloadPdfLetter; // Make global

function sendPdfLetter() {
  if (!LJ_STATE.currentItem) {
    showToast("No item selected for email.", "error");
    return;
  }

  const letterTypeSelect = document.getElementById("letterType");
  if (!letterTypeSelect.value) {
    showToast("Please select a letter type first.", "error");
    return;
  }

  const [itemType, templateType] = letterTypeSelect.value.split(":");
  const template = LETTER_TEMPLATES[itemType]?.[templateType];

  if (!template) {
    showToast("Invalid letter template selected.", "error");
    return;
  }

  const recipientEmail = document.getElementById("recipientEmail").value.trim();
  if (!recipientEmail) {
    showToast("Recipient email is required to send the letter.", "error");
    return;
  }

  const recipientName = document.getElementById("recipientName").value;
  const recipientAddress = document.getElementById("recipientAddress").value;
  const customNotes = document.getElementById("customNotes").value;
  const additionalCC = document.getElementById("additionalCC").value.trim();

  const ccEmails = [];
  document.querySelectorAll('#ccCheckboxes input[type="checkbox"]:checked').forEach(checkbox => {
    ccEmails.push(checkbox.value);
  });
  if (additionalCC) {
    additionalCC.split(',').forEach(email => {
      const trimmedEmail = email.trim();
      if (trimmedEmail) ccEmails.push(trimmedEmail);
    });
  }
  
  const data = {
    ...LJ_STATE.currentItem.data,
    referenceNumber: LJ_STATE.currentItem.data.referenceNumber || "N/A",
    recipientName,
    recipientEmail,
    recipientAddress,
    customNotes,
  };

  const subject = template.subject.replace("{referenceNumber}", data.referenceNumber);
  const body = `Dear ${recipientName},\n\nPlease find attached the ${template.name} regarding your item ${data.referenceNumber}.\n\n${customNotes}\n\nBest regards,\nLJ Services Group`;

  // Construct mailto link
  let mailtoLink = `mailto:${recipientEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  if (ccEmails.length > 0) {
    mailtoLink += `&cc=${encodeURIComponent(ccEmails.join(','))}`;
  }

  window.open(mailtoLink, '_blank');
  showToast("Email client opened with pre-filled details. Please attach the PDF manually.", "info");
  closePdfModal();
}

window.downloadPdfLetter = downloadPdfLetter; // Make global

function sendPdfLetter() {
  if (!LJ_STATE.currentItem) {
    showToast("No item selected for email.", "error");
    return;
  }

  const letterTypeSelect = document.getElementById("letterType");
  if (!letterTypeSelect.value) {
    showToast("Please select a letter type first.", "error");
    return;
  }

  const [itemType, templateType] = letterTypeSelect.value.split(":");
  const template = LETTER_TEMPLATES[itemType]?.[templateType];

  if (!template) {
    showToast("Invalid letter template selected.", "error");
    return;
  }

  const recipientEmail = document.getElementById("recipientEmail").value.trim();
  if (!recipientEmail) {
    showToast("Recipient email is required to send the letter.", "error");
    return;
  }

  const recipientName = document.getElementById("recipientName").value;
  const recipientAddress = document.getElementById("recipientAddress").value;
  const customNotes = document.getElementById("customNotes").value;
  const additionalCC = document.getElementById("additionalCC").value.trim();

  const ccEmails = [];
  document.querySelectorAll('#ccCheckboxes input[type="checkbox"]:checked').forEach(checkbox => {
    ccEmails.push(checkbox.value);
  });
  if (additionalCC) {
    additionalCC.split(',').forEach(email => {
      const trimmedEmail = email.trim();
      if (trimmedEmail) ccEmails.push(trimmedEmail);
    });
  }
  
  const data = {
    ...LJ_STATE.currentItem.data,
    referenceNumber: LJ_STATE.currentItem.data.referenceNumber || "N/A",
    recipientName,
    recipientEmail,
    recipientAddress,
    customNotes,
  };

  const subject = template.subject.replace("{referenceNumber}", data.referenceNumber);
  const body = `Dear ${recipientName},\n\nPlease find attached the ${template.name} regarding your item ${data.referenceNumber}.\n\n${customNotes}\n\nBest regards,\nLJ Services Group`;

  // Construct mailto link
  let mailtoLink = `mailto:${recipientEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  if (ccEmails.length > 0) {
    mailtoLink += `&cc=${encodeURIComponent(ccEmails.join(','))}`;
  }

  window.open(mailtoLink, '_blank');
  showToast("Email client opened with pre-filled details. Please attach the PDF manually.", "info");
  closePdfModal();
}

window.sendPdfLetter = sendPdfLetter; // Make global


// ==========================================
// PDF LETTER GENERATION SYSTEM
// Add this to your app.js file
// ==========================================

// Add this HTML to your index.html for the PDF modal
const PDF_MODAL_HTML = `
<div id="pdfLetterModal" class="hidden fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
  <div class="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
    
    <!-- Modal Header -->
    <div class="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
      <h2 class="text-lg font-semibold text-slate-900">Generate Letter</h2>
      <button onclick="closePdfModal()" class="text-slate-400 hover:text-slate-600">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <!-- Modal Body -->
    <div class="flex-1 overflow-y-auto p-6">
      
      <!-- Letter Type Selection -->
      <div class="mb-6">
        <label class="block text-sm font-medium text-slate-700 mb-2">Letter Type</label>
        <select id="letterType" class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
          <option value="">Select letter type...</option>
        </select>
      </div>

      <!-- Recipient Information -->
      <div class="mb-6">
        <h3 class="text-sm font-medium text-slate-900 mb-3">Recipient Information</h3>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-xs text-slate-600 mb-1">To (Name)*</label>
            <input type="text" id="recipientName" placeholder="John Doe" 
              class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
          </div>
          <div>
            <label class="block text-xs text-slate-600 mb-1">To (Email)*</label>
            <input type="email" id="recipientEmail" placeholder="john.doe@email.com" 
              class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
          </div>
          <div class="col-span-2">
            <label class="block text-xs text-slate-600 mb-1">Address</label>
            <textarea id="recipientAddress" rows="2" placeholder="123 Main St, Unit 101"
              class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"></textarea>
          </div>
        </div>
      </div>

      <!-- CC Team Members -->
      <div class="mb-6">
        <h3 class="text-sm font-medium text-slate-900 mb-3">CC Team Members</h3>
        <div class="space-y-2" id="ccCheckboxes">
          <!-- Will be populated dynamically -->
        </div>
      </div>

      <!-- Additional CC Emails -->
      <div class="mb-6">
        <label class="block text-sm font-medium text-slate-700 mb-2">Additional CC Emails</label>
        <input type="text" id="additionalCC" placeholder="email1@example.com, email2@example.com" 
          class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
        <p class="text-xs text-slate-500 mt-1">Separate multiple emails with commas</p>
      </div>

      <!-- Letter Preview -->
      <div class="mb-6">
        <h3 class="text-sm font-medium text-slate-900 mb-3">Letter Preview</h3>
        <div id="letterPreview" class="border border-slate-200 rounded-lg p-6 bg-white" style="min-height: 400px;">
          <!-- Letter content will appear here -->
        </div>
      </div>

      <!-- Custom Notes -->
      <div class="mb-6">
        <label class="block text-sm font-medium text-slate-700 mb-2">Additional Notes (Optional)</label>
        <textarea id="customNotes" rows="3" placeholder="Add any additional information to include in the letter..."
          class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"></textarea>
      </div>

    </div>

    <!-- Modal Footer -->
    <div class="px-6 py-4 border-t border-slate-200 flex items-center justify-between bg-slate-50">
      <button onclick="closePdfModal()" 
        class="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
        Cancel
      </button>
      <div class="flex gap-2">
        <button onclick="downloadPdfLetter()" 
          class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Download PDF
        </button>
        <button onclick="sendPdfLetter()" 
          class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          Send Email
        </button>
      </div>
    </div>

  </div>
</div>
`;

// ==========================================
// LETTER TEMPLATES
// ==========================================

const LETTER_TEMPLATES = {
  workOrder: {
    completion: {
      name: "Work Order Completion Notice",
      subject: "Work Order Completed - {referenceNumber}",
      generate: (data) => `
        <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #1e293b; margin-bottom: 5px;">LJ Services Group</h1>
            <p style="color: #64748b; margin: 0;">Professional Property Management</p>
          </div>

          <div style="margin-bottom: 20px;">
            <p style="margin: 0;"><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
            <p style="margin: 0;"><strong>Reference:</strong> ${data.referenceNumber}</p>
          </div>

          <div style="margin-bottom: 20px;">
            <p style="margin: 0;"><strong>To:</strong></p>
            <p style="margin: 0;">${data.recipientName}</p>
            ${data.recipientAddress ? `<p style="margin: 0;">${data.recipientAddress.replace(/\n/g, '<br>')}</p>` : ''}
            ${data.recipientEmail ? `<p style="margin: 0;">${data.recipientEmail}</p>` : ''}
          </div>

          <h2 style="color: #1e293b; margin-top: 30px;">Work Order Completion Notice</h2>

          <p>Dear ${data.recipientName},</p>

          <p>We are writing to inform you that the following work order has been completed:</p>

          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0;"><strong>Property:</strong> ${data.association}</p>
            <p style="margin: 0;"><strong>Work Order:</strong> ${data.title}</p>
            <p style="margin: 0;"><strong>Vendor:</strong> ${data.vendor || 'N/A'}</p>
            <p style="margin: 0;"><strong>Completed Date:</strong> ${new Date().toLocaleDateString()}</p>
            ${data.estimatedCost ? `<p style="margin: 0;"><strong>Total Cost:</strong> $${data.estimatedCost}</p>` : ''}
          </div>

          <p><strong>Work Performed:</strong></p>
          <p>${data.description || 'No description provided.'}</p>

          ${data.customNotes ? `
            <p><strong>Additional Notes:</strong></p>
            <p>${data.customNotes}</p>
          ` : ''}

          <p>If you have any questions or concerns regarding this work order, please do not hesitate to contact us.</p>

          <div style="margin-top: 40px;">
            <p style="margin: 0;">Best regards,</p>
            <p style="margin: 0;"><strong>LJ Services Group</strong></p>
            <p style="margin: 0; color: #64748b;">Property Management Team</p>
          </div>

          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #64748b; font-size: 12px;">
            <p style="margin: 0;">LJ Services Group</p>
            <p style="margin: 0;">Miami, FL</p>
            <p style="margin: 0;">Phone: [Your Phone]</p>
            <p style="margin: 0;">Email: info@ljservicesgroup.com</p>
          </div>
        </div>
      `
    },
    proposal: {
      name: "Work Order Proposal",
      subject: "Work Proposal - {referenceNumber}",
      generate: (data) => `
        <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #1e293b; margin-bottom: 5px;">LJ Services Group</h1>
            <p style="color: #64748b; margin: 0;">Professional Property Management</p>
          </div>

          <div style="margin-bottom: 20px;">
            <p style="margin: 0;"><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
            <p style="margin: 0;"><strong>Reference:</strong> ${data.referenceNumber}</p>
          </div>

          <div style="margin-bottom: 20px;">
            <p style="margin: 0;"><strong>To:</strong></p>
            <p style="margin: 0;">${data.recipientName}</p>
            ${data.recipientAddress ? `<p style="margin: 0;">${data.recipientAddress.replace(/\n/g, '<br>')}</p>` : ''}
            ${data.recipientEmail ? `<p style="margin: 0;">${data.recipientEmail}</p>` : ''}
          </div>

          <h2 style="color: #1e293b; margin-top: 30px;">Work Proposal</h2>

          <p>Dear ${data.recipientName},</p>

          <p>We are pleased to present the following work proposal for your property:</p>

          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0;"><strong>Property:</strong> ${data.association}</p>
            <p style="margin: 0;"><strong>Proposed Work:</strong> ${data.title}</p>
            <p style="margin: 0;"><strong>Vendor:</strong> ${data.vendor || 'TBD'}</p>
            ${data.estimatedCost ? `<p style="margin: 0;"><strong>Estimated Cost:</strong> $${data.estimatedCost}</p>` : ''}
          </div>

          <p><strong>Scope of Work:</strong></p>
          <p>${data.description || 'No description provided.'}</p>

          ${data.customNotes ? `
            <p><strong>Additional Information:</strong></p>
            <p>${data.customNotes}</p>
          ` : ''}

          <p>Please review this proposal and let us know if you have any questions or require any modifications.</p>

          <div style="margin-top: 40px;">
            <p style="margin: 0;">Best regards,</p>
            <p style="margin: 0;"><strong>LJ Services Group</strong></p>
            <p style="margin: 0; color: #64748b;">Property Management Team</p>
          </div>

          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #64748b; font-size: 12px;">
            <p style="margin: 0;">LJ Services Group</p>
            <p style="margin: 0;">Miami, FL</p>
            <p style="margin: 0;">Phone: [Your Phone]</p>
            <p style="margin: 0;">Email: info@ljservicesgroup.com</p>
          </div>
        </div>
      `
    }
  },
  violation: {
    firstNotice: {
      name: "1st Notice - Violation Warning",
      subject: "First Notice - CC&R Violation - {referenceNumber}",
      generate: (data) => `
        <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #1e293b; margin-bottom: 5px;">LJ Services Group</h1>
            <p style="color: #64748b; margin: 0;">Professional Property Management</p>
          </div>

          <div style="margin-bottom: 20px;">
            <p style="margin: 0;"><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
            <p style="margin: 0;"><strong>Reference:</strong> ${data.referenceNumber}</p>
          </div>

          <div style="margin-bottom: 20px;">
            <p style="margin: 0;"><strong>To:</strong></p>
            <p style="margin: 0;">${data.recipientName}</p>
            ${data.recipientAddress ? `<p style="margin: 0;">${data.recipientAddress.replace(/\n/g, '<br>')}</p>` : ''}
            ${data.recipientEmail ? `<p style="margin: 0;">${data.recipientEmail}</p>` : ''}
          </div>

          <h2 style="color: #dc2626; margin-top: 30px;">FIRST NOTICE - CC&R VIOLATION</h2>

          <p>Dear ${data.recipientName},</p>

          <p>This letter serves as a <strong>First Notice</strong> regarding a violation of the Covenants, Conditions, and Restrictions (CC&Rs) at your property.</p>

          <div style="background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 20px; margin: 20px 0;">
            <p style="margin: 0;"><strong>Property:</strong> ${data.association}</p>
            <p style="margin: 0;"><strong>Violation:</strong> ${data.title}</p>
            <p style="margin: 0;"><strong>Rule Violated:</strong> ${data.ruleBroken || 'See CC&Rs'}</p>
            <p style="margin: 0;"><strong>Notice Date:</strong> ${new Date().toLocaleDateString()}</p>
          </div>

          <p><strong>Violation Details:</strong></p>
          <p>${data.description || 'No description provided.'}</p>

          <p><strong>Required Action:</strong></p>
          <p>You are required to correct this violation within <strong>14 days</strong> from the date of this notice.</p>

          ${data.customNotes ? `
            <p><strong>Additional Information:</strong></p>
            <p>${data.customNotes}</p>
          ` : ''}

          <p>Failure to comply with this notice may result in further action, including additional notices and potential fines as outlined in your association's governing documents.</p>

          <p>If you have any questions or need clarification, please contact our office immediately.</p>

          <div style="margin-top: 40px;">
            <p style="margin: 0;">Sincerely,</p>
            <p style="margin: 0;"><strong>LJ Services Group</strong></p>
            <p style="margin: 0; color: #64748b;">Property Management Team</p>
          </div>

          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #64748b; font-size: 12px;">
            <p style="margin: 0;">LJ Services Group</p>
            <p style="margin: 0;">Miami, FL</p>
            <p style="margin: 0;">Phone: [Your Phone]</p>
            <p style="margin: 0;">Email: info@ljservicesgroup.com</p>
          </div>
        </div>
      `
    },
    secondNotice: {
      name: "2nd Notice - Final Warning",
      subject: "Second Notice - CC&R Violation - {referenceNumber}",
      generate: (data) => `
        <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #1e293b; margin-bottom: 5px;">LJ Services Group</h1>
            <p style="color: #64748b; margin: 0;">Professional Property Management</p>
          </div>

          <div style="margin-bottom: 20px;">
            <p style="margin: 0;"><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
            <p style="margin: 0;"><strong>Reference:</strong> ${data.referenceNumber}</p>
          </div>

          <div style="margin-bottom: 20px;">
            <p style="margin: 0;"><strong>To:</strong></p>
            <p style="margin: 0;">${data.recipientName}</p>
            ${data.recipientAddress ? `<p style="margin: 0;">${data.recipientAddress.replace(/\n/g, '<br>')}</p>` : ''}
            ${data.recipientEmail ? `<p style="margin: 0;">${data.recipientEmail}</p>` : ''}
          </div>

          <h2 style="color: #dc2626; margin-top: 30px;">SECOND NOTICE - FINAL WARNING</h2>

          <p>Dear ${data.recipientName},</p>

          <p>This letter serves as a <strong>Second and Final Notice</strong> regarding a continuing violation of the CC&Rs at your property.</p>

          <div style="background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 20px; margin: 20px 0;">
            <p style="margin: 0;"><strong>Property:</strong> ${data.association}</p>
            <p style="margin: 0;"><strong>Violation:</strong> ${data.title}</p>
            <p style="margin: 0;"><strong>Rule Violated:</strong> ${data.ruleBroken || 'See CC&Rs'}</p>
            <p style="margin: 0;"><strong>First Notice Date:</strong> [Date of First Notice]</p>
            <p style="margin: 0;"><strong>This Notice Date:</strong> ${new Date().toLocaleDateString()}</p>
          </div>

          <p><strong>Violation Details:</strong></p>
          <p>${data.description || 'No description provided.'}</p>

          <p style="color: #dc2626; font-weight: bold;">⚠️ URGENT ACTION REQUIRED:</p>
          <p>You must correct this violation within <strong>7 days</strong> from the date of this notice to avoid further action.</p>

          ${data.customNotes ? `
            <p><strong>Additional Information:</strong></p>
            <p>${data.customNotes}</p>
          ` : ''}

          <p><strong>Consequences of Non-Compliance:</strong></p>
          <p>Failure to comply with this notice will result in:</p>
          <ul>
            <li>Monetary fines as outlined in the governing documents</li>
            <li>Potential legal action</li>
            <li>Suspension of voting rights</li>
            <li>Other remedies available under Florida law and the association's governing documents</li>
          </ul>

          <p>Please contact our office immediately if you have any questions or need assistance in resolving this matter.</p>

          <div style="margin-top: 40px;">
            <p style="margin: 0;">Sincerely,</p>
            <p style="margin: 0;"><strong>LJ Services Group</strong></p>
            <p style="margin: 0; color: #64748b;">Property Management Team</p>
          </div>

          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #64748b; font-size: 12px;">
            <p style="margin: 0;">LJ Services Group</p>
            <p style="margin: 0;">Miami, FL</p>
            <p style="margin: 0;">Phone: [Your Phone]</p>
            <p style="margin: 0;">Email: info@ljservicesgroup.com</p>
          </div>
        </div>
      `
    },
    thirdNotice: {
      name: "3rd Notice - Pre-Fine Notice",
      subject: "Third Notice - Fine Pending - {referenceNumber}",
      generate: (data) => `
        <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #1e293b; margin-bottom: 5px;">LJ Services Group</h1>
            <p style="color: #64748b; margin: 0;">Professional Property Management</p>
          </div>

          <div style="margin-bottom: 20px;">
            <p style="margin: 0;"><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
            <p style="margin: 0;"><strong>Reference:</strong> ${data.referenceNumber}</p>
          </div>

          <div style="margin-bottom: 20px;">
            <p style="margin: 0;"><strong>To:</strong></p>
            <p style="margin: 0;">${data.recipientName}</p>
            ${data.recipientAddress ? `<p style="margin: 0;">${data.recipientAddress.replace(/\n/g, '<br>')}</p>` : ''}
            ${data.recipientEmail ? `<p style="margin: 0;">${data.recipientEmail}</p>` : ''}
          </div>

          <h2 style="color: #dc2626; margin-top: 30px;">THIRD NOTICE - FINES WILL BE ASSESSED</h2>

          <p>Dear ${data.recipientName},</p>

          <p>This is your <strong>Third Notice</strong> regarding an ongoing violation at your property. Despite previous notices, this violation remains uncorrected.</p>

          <div style="background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 20px; margin: 20px 0;">
            <p style="margin: 0;"><strong>Property:</strong> ${data.association}</p>
            <p style="margin: 0;"><strong>Violation:</strong> ${data.title}</p>
            <p style="margin: 0;"><strong>Rule Violated:</strong> ${data.ruleBroken || 'See CC&Rs'}</p>
            <p style="margin: 0;"><strong>First Notice:</strong> [Date]</p>
            <p style="margin: 0;"><strong>Second Notice:</strong> [Date]</p>
            <p style="margin: 0;"><strong>This Notice:</strong> ${new Date().toLocaleDateString()}</p>
          </div>

          <p><strong>Violation Details:</strong></p>
          <p>${data.description || 'No description provided.'}</p>

          <p style="color: #dc2626; font-weight: bold; font-size: 18px;">⚠️ IMMEDIATE ACTION REQUIRED</p>
          
          <p><strong>You have 5 days from the date of this letter to:</strong></p>
          <ol>
            <li>Correct the violation completely, OR</li>
            <li>Request a hearing before the Board of Directors</li>
          </ol>

          <div style="background-color: #fff7ed; border: 2px solid #f97316; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; font-weight: bold; color: #f97316;">⚠️ FINE SCHEDULE</p>
            <p style="margin: 10px 0 0 0;">If this violation is not corrected within 5 days:</p>
            <ul style="margin: 10px 0 0 0;">
              <li>Initial fine: $[Amount] per day</li>
              <li>Continuing fines until violation is corrected</li>
              <li>Legal fees and costs will be added</li>
            </ul>
          </div>

          ${data.customNotes ? `
            <p><strong>Additional Information:</strong></p>
            <p>${data.customNotes}</p>
          ` : ''}

          <p><strong>Right to Hearing:</strong></p>
          <p>You have the right to request a hearing before the Board of Directors. To request a hearing, you must contact our office in writing within 5 days of receiving this notice.</p>

          <p>This is your final opportunity to resolve this matter without financial penalties.</p>

          <div style="margin-top: 40px;">
            <p style="margin: 0;">Sincerely,</p>
            <p style="margin: 0;"><strong>LJ Services Group</strong></p>
            <p style="margin: 0; color: #64748b;">Property Management Team</p>
          </div>

          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #64748b; font-size: 12px;">
            <p style="margin: 0;">LJ Services Group</p>
            <p style="margin: 0;">Miami, FL</p>
            <p style="margin: 0;">Phone: [Your Phone]</p>
            <p style="margin: 0;">Email: info@ljservicesgroup.com</p>
          </div>
        </div>
      `
    },
    finalNotice: {
      name: "Final Notice - Fines Assessed",
      subject: "Final Notice - Fines Assessed - {referenceNumber}",
      generate: (data) => `
        <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #1e293b; margin-bottom: 5px;">LJ Services Group</h1>
            <p style="color: #64748b; margin: 0;">Professional Property Management</p>
          </div>

          <div style="margin-bottom: 20px;">
            <p style="margin: 0;"><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
            <p style="margin: 0;"><strong>Reference:</strong> ${data.referenceNumber}</p>
          </div>

          <div style="margin-bottom: 20px;">
            <p style="margin: 0;"><strong>To:</strong></p>
            <p style="margin: 0;">${data.recipientName}</p>
            ${data.recipientAddress ? `<p style="margin: 0;">${data.recipientAddress.replace(/\n/g, '<br>')}</p>` : ''}
            ${data.recipientEmail ? `<p style="margin: 0;">${data.recipientEmail}</p>` : ''}
          </div>

          <h2 style="color: #7f1d1d; margin-top: 30px;">FINAL NOTICE - FINES HAVE BEEN ASSESSED</h2>

          <p>Dear ${data.recipientName},</p>

          <p>This is your <strong>Final Notice</strong>. The Board of Directors has assessed fines for the continuing violation at your property.</p>

          <div style="background-color: #7f1d1d; color: white; padding: 20px; margin: 20px 0;">
            <p style="margin: 0; font-size: 18px; font-weight: bold;">FINES ASSESSED</p>
            <p style="margin: 10px 0 0 0;"><strong>Total Amount Due: $[Amount]</strong></p>
            <p style="margin: 5px 0 0 0;">Due Date: [Date]</p>
          </div>

          <div style="background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 20px; margin: 20px 0;">
            <p style="margin: 0;"><strong>Property:</strong> ${data.association}</p>
            <p style="margin: 0;"><strong>Violation:</strong> ${data.title}</p>
            <p style="margin: 0;"><strong>Rule Violated:</strong> ${data.ruleBroken || 'See CC&Rs'}</p>
            <p style="margin: 0;"><strong>Violation History:</strong></p>
            <ul style="margin: 5px 0 0 20px;">
              <li>First Notice: [Date]</li>
              <li>Second Notice: [Date]</li>
              <li>Third Notice: [Date]</li>
              <li>Final Notice: ${new Date().toLocaleDateString()}</li>
            </ul>
          </div>

          <p><strong>Violation Details:</strong></p>
          <p>${data.description || 'No description provided.'}</p>

          <p><strong>Fine Breakdown:</strong></p>
          <ul>
            <li>Daily fine: $[Amount] × [Days] = $[Subtotal]</li>
            <li>Administrative fees: $[Amount]</li>
            <li><strong>Total Due: $[Total Amount]</strong></li>
          </ul>

          <div style="background-color: #fff7ed; border: 2px solid #f97316; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; font-weight: bold;">⚠️ PAYMENT INSTRUCTIONS</p>
            <p style="margin: 10px 0 0 0;">Payment must be received by [Due Date].</p>
            <p style="margin: 5px 0 0 0;">Make check payable to: ${data.association}</p>
            <p style="margin: 5px 0 0 0;">Reference: ${data.referenceNumber}</p>
          </div>

          ${data.customNotes ? `
            <p><strong>Additional Information:</strong></p>
            <p>${data.customNotes}</p>
          ` : ''}

          <p><strong>Next Steps if Non-Payment:</strong></p>
          <ul>
            <li>Late fees will be added</li>
            <li>Account will be turned over to collections</li>
            <li>Legal action may be pursued</li>
            <li>Lien may be placed on property</li>
          </ul>

          <p>The violation must still be corrected in addition to paying the assessed fines. Continued non-compliance will result in additional daily fines.</p>

          <p>If you have questions or wish to discuss a payment plan, please contact our office immediately.</p>

          <div style="margin-top: 40px;">
            <p style="margin: 0;">Sincerely,</p>
            <p style="margin: 0;"><strong>LJ Services Group</strong></p>
            <p style="margin: 0; color: #64748b;">Property Management Team</p>
          </div>

          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #64748b; font-size: 12px;">
            <p style="margin: 0;">LJ Services Group</p>
            <p style="margin: 0;">Miami, FL</p>
            <p style="margin: 0;">Phone: [Your Phone]</p>
            <p style="margin: 0;">Email: info@ljservicesgroup.com</p>
            <p style="margin: 0; margin-top: 10px; font-style: italic;">This is an official notice from your Association's management company acting under the authority of the Board of Directors.</p>
          </div>
        </div>
      `
    }
  }
};

// ==========================================
// PDF GENERATION FUNCTIONS
// ==========================================

let currentPdfData = null;

function openPdfLetterModal(itemType, itemData) {
  // Store the current item data
  currentPdfData = {
    itemType: itemType,
    ...itemData
  };

  // Show the modal
  const modal = document.getElementById('pdfLetterModal');
  if (modal) {
    modal.classList.remove('hidden');
  }

  // Populate letter type dropdown
  populateLetterTypeDropdown(itemType);

  // Populate team member checkboxes
  populateTeamMemberCheckboxes();

  // Pre-fill some data if available
  if (itemData.association) {
    // Could pre-fill recipient info if available
  }
}

function populateLetterTypeDropdown(itemType) {
  const dropdown = document.getElementById('letterType');
  if (!dropdown) return;

  dropdown.innerHTML = '<option value="">Select letter type...</option>';

  const templates = LETTER_TEMPLATES[itemType];
  if (!templates) return;

  Object.entries(templates).forEach(([key, template]) => {
    const option = document.createElement('option');
    option.value = key;
    option.textContent = template.name;
    dropdown.appendChild(option);
  });

  // Listen for changes
  dropdown.addEventListener('change', updateLetterPreview);
}

function populateTeamMemberCheckboxes() {
  const container = document.getElementById('ccCheckboxes');
  if (!container) return;

  container.innerHTML = LJ_STATE.teamMembers.map((member, index) => `
    <label class="flex items-center gap-2 p-2 hover:bg-slate-50 rounded cursor-pointer">
      <input type="checkbox" value="${member.email}" class="cc-checkbox rounded border-slate-300 text-indigo-600 focus:ring-indigo-500">
      <span class="text-sm text-slate-700">${member.name} (${member.email})</span>
    </label>
  `).join('');
}

function updateLetterPreview() {
  const letterType = document.getElementById('letterType').value;
  const recipientName = document.getElementById('recipientName').value || '[Recipient Name]';
  const recipientEmail = document.getElementById('recipientEmail').value || '';
  const recipientAddress = document.getElementById('recipientAddress').value || '';
  const customNotes = document.getElementById('customNotes').value || '';

  const preview = document.getElementById('letterPreview');
  if (!preview || !letterType || !currentPdfData) return;

  const template = LETTER_TEMPLATES[currentPdfData.itemType][letterType];
  if (!template) return;

  const data = {
    ...currentPdfData,
    recipientName,
    recipientEmail,
    recipientAddress,
    customNotes
  };

  preview.innerHTML = template.generate(data);
}

// Update preview when inputs change
function initPdfModalListeners() {
  ['recipientName', 'recipientEmail', 'recipientAddress', 'customNotes'].forEach(id => {
    const input = document.getElementById(id);
    if (input) {
      input.addEventListener('input', updateLetterPreview);
    }
  });
}

function closePdfModal() {
  const modal = document.getElementById('pdfLetterModal');
  if (modal) {
    modal.classList.add('hidden');
  }
  currentPdfData = null;
}

async function downloadPdfLetter() {
  const letterType = document.getElementById('letterType').value;
  if (!letterType || !currentPdfData) {
    showToast('Please select a letter type', 'error');
    return;
  }

  const recipientName = document.getElementById('recipientName').value;
  if (!recipientName) {
    showToast('Please enter recipient name', 'error');
    return;
  }

  // Get the letter HTML
  const preview = document.getElementById('letterPreview');
  const letterHtml = preview.innerHTML;

  // Use html2pdf library (you'll need to include this in your HTML)
  try {
    const opt = {
      margin: 0.5,
      filename: `${currentPdfData.itemType}-${currentPdfData.referenceNumber}-${letterType}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    // Generate PDF
    await html2pdf().set(opt).from(letterHtml).save();
    
    showToast('PDF downloaded successfully!', 'success');
  } catch (error) {
    console.error('PDF generation error:', error);
    showToast('Failed to generate PDF. Please try again.', 'error');
  }
}

async function sendPdfLetter() {
  const letterType = document.getElementById('letterType').value;
  const recipientName = document.getElementById('recipientName').value;
  const recipientEmail = document.getElementById('recipientEmail').value;

  if (!letterType || !currentPdfData) {
    showToast('Please select a letter type', 'error');
    return;
  }

  if (!recipientName || !recipientEmail) {
    showToast('Please enter recipient name and email', 'error');
    return;
  }

  // Get CC emails
  const ccCheckboxes = document.querySelectorAll('.cc-checkbox:checked');
  const ccEmails = Array.from(ccCheckboxes).map(cb => cb.value);
  
  const additionalCC = document.getElementById('additionalCC').value;
  if (additionalCC) {
    const additionalEmails = additionalCC.split(',').map(e => e.trim()).filter(e => e);
    ccEmails.push(...additionalEmails);
  }

  // Get the letter HTML
  const preview = document.getElementById('letterPreview');
  const letterHtml = preview.innerHTML;

  // Get subject line
  const template = LETTER_TEMPLATES[currentPdfData.itemType][letterType];
  const subject = template.subject.replace('{referenceNumber}', currentPdfData.referenceNumber);

  // In a real implementation, you would send this via email API
  // For now, we'll show a confirmation
  const emailData = {
    to: recipientEmail,
    cc: ccEmails,
    subject: subject,
    html: letterHtml
  };

  console.log('Email data:', emailData);

  showToast(`Letter will be sent to ${recipientEmail} with ${ccEmails.length} CC recipients`, 'success');
  
  // TODO: Implement actual email sending via backend API
  // Example: await sendEmailViaAPI(emailData);

  closePdfModal();
}

// ==========================================
// ADD BUTTON TO WORK ORDER/VIOLATION DETAIL VIEW
// ==========================================

// Add this button HTML to your detail view for work orders and violations:
const PDF_BUTTON_HTML = `
  <button onclick="openPdfLetterModal('workOrder', currentItemData)" 
    class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
    Generate Letter
  </button>
`;

// For violations, use:
// onclick="openPdfLetterModal('violation', currentItemData)"

console.log('✅ PDF Letter Generation System Loaded!');

// ============================================
// WHATSAPP DASHBOARD MODULE
// ============================================
let whatsappConversations = [];

function initWhatsAppDashboard() {
  console.log('📱 Initializing WhatsApp Dashboard...');
  const whatsappRef = database.ref('whatsapp_conversations');
  whatsappRef.on('value', (snapshot) => {
    whatsappConversations = [];
    snapshot.forEach((childSnapshot) => {
      const conv = childSnapshot.val();
      conv.phoneNumber = childSnapshot.key;
      whatsappConversations.push(conv);
    });
    whatsappConversations.sort((a, b) => {
      const dateA = new Date(b.lastMessageAt || b.startedAt);
      const dateB = new Date(a.lastMessageAt || a.startedAt);
      return dateA - dateB;
    });
    console.log(`📱 Loaded ${whatsappConversations.length} WhatsApp conversations`);
    renderWhatsAppDashboard();
  });
}

function renderWhatsAppDashboard() {
  const total = whatsappConversations.length;
  const tickets = whatsappConversations.filter(c => c.ticketCreated).length;
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const active = whatsappConversations.filter(c => {
    const lastMsg = new Date(c.lastMessageAt || c.startedAt);
    return lastMsg > oneDayAgo;
  }).length;
  const rate = total > 0 ? Math.round((tickets / total) * 100) : 0;
  
  if (document.getElementById('whatsappStatTotal')) {
    document.getElementById('whatsappStatTotal').textContent = total;
    document.getElementById('whatsappStatTickets').textContent = tickets;
    document.getElementById('whatsappStatActive').textContent = active;
    document.getElementById('whatsappStatRate').textContent = `${rate}%`;
  }
  renderWhatsAppList();
}

function renderWhatsAppList() {
  const tbody = document.getElementById('whatsappConversationsList');
  if (!tbody) return;
  if (whatsappConversations.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="px-4 py-12 text-center text-slate-400"><div class="flex flex-col items-center gap-2"><svg class="w-12 h-12 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg><p class="text-sm">No conversations yet</p></div></td></tr>`;
    return;
  }
  tbody.innerHTML = whatsappConversations.map(conv => {
    const lastMsg = new Date(conv.lastMessageAt || conv.startedAt);
    const msgCount = conv.messages ? conv.messages.length : 0;
    const status = conv.ticketCreated ? 'Resolved' : 'Active';
    const statusClass = conv.ticketCreated ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700';
    let ticketRef = '-';
    if (conv.ticketKey) ticketRef = 'TKT';
    else if (conv.workOrderKey) ticketRef = 'WO';
    else if (conv.violationKey) ticketRef = 'VIO';
    const relTime = formatRelativeTime(lastMsg);
    return `<tr class="border-b border-slate-100 hover:bg-slate-50"><td class="px-4 py-3"><div class="flex items-center gap-2"><div class="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center"><span class="text-xs font-semibold text-green-700">${conv.homeownerName ? conv.homeownerName.charAt(0).toUpperCase() : '?'}</span></div><p class="font-medium text-slate-900 text-xs">${conv.homeownerName || 'Unknown'}</p></div></td><td class="px-4 py-3"><span class="font-mono text-xs text-slate-600">${conv.phoneNumber}</span></td><td class="px-4 py-3"><span class="text-xs text-slate-600">${msgCount}</span></td><td class="px-4 py-3 text-xs text-slate-600">${relTime}</td><td class="px-4 py-3">${conv.ticketCreated ? `<span class="inline-flex px-2 py-1 rounded-full bg-green-50 text-green-700 text-xs">✓ ${ticketRef}</span>` : `<span class="text-xs text-slate-400">-</span>`}</td><td class="px-4 py-3"><span class="inline-flex px-2 py-1 rounded-full text-xs font-medium ${statusClass}">${status}</span></td><td class="px-4 py-3 text-center"><span class="text-indigo-600 text-xs font-medium cursor-pointer">View →</span></td></tr>`;
  }).join('');
}

function formatRelativeTime(date) {
  const now = new Date();
  const diff = now - date;
  const mins = Math.floor(diff / 60000);
  const hrs = Math.floor(mins / 60);
  const days = Math.floor(hrs / 24);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  if (hrs < 24) return `${hrs}h ago`;
  return `${days}d ago`;
}

// NEW: HTML LETTER FEATURE
function toggleLetterHTMLSection() {
  const section = document.getElementById('letterHTMLSection');
  section.classList.toggle('hidden');
}

function showLetterPreview() {
  if (!LJ_STATE.currentItem?.data?.letterHTML) {
    showToast("No letter attached to this violation", "info");
    return;
  }
  
  const html = LJ_STATE.currentItem.data.letterHTML;
  displayLetterPreview(html);
}

function displayLetterPreview(htmlContent) {
  const previewModal = document.getElementById('letterPreviewModal');
  const previewContent = document.getElementById('letterPreviewContent');
  
  previewContent.innerHTML = ''; // Clear previous content
  
  // Create an iframe to render the HTML safely
  const iframe = document.createElement('iframe');
  iframe.style.width = '100%';
  iframe.style.height = '100%';
  iframe.style.border = 'none';
  previewContent.appendChild(iframe);
  
  iframe.contentWindow.document.open();
  iframe.contentWindow.document.write(htmlContent);
  iframe.contentWindow.document.close();
  
  previewModal.classList.remove('hidden');
}

function closeLetterPreviewModal() {
  const previewModal = document.getElementById('letterPreviewModal');
  previewModal.classList.add('hidden');
}

function copyLetterHTML() {
  const html = LJ_STATE.currentItem.data.letterHTML;
  navigator.clipboard.writeText(html);
  showToast("Letter HTML copied to clipboard", "success");
}

function downloadLetterHTML() {
  const html = LJ_STATE.currentItem.data.letterHTML;
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `violation_letter_${LJ_STATE.currentItem.key}.html`;
  a.click();
  URL.revokeObjectURL(url);
}

function openLetterInNewTab() {
  const html = LJ_STATE.currentItem.data.letterHTML;
  const newWindow = window.open();
  newWindow.document.write(html);
  newWindow.document.close();
}

function emailLetter() {
  if (!LJ_STATE.currentItem) {
    showToast("No item selected for email.", "error");
    return;
  }

  const subject = `Violation Letter for ${LJ_STATE.currentItem.data.title}`;
  const body = `Please find the attached violation letter.`;

  let mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  window.open(mailtoLink, '_blank');
}

function editLetter() {
  const editModal = document.getElementById('editLetterModal');
  const editTa = document.getElementById('editLetterTextarea');
  
  if (!LJ_STATE.currentItem?.data?.letterHTML) {
    showToast("No letter attached to this violation", "info");
    return;
  }

  editTa.value = LJ_STATE.currentItem.data.letterHTML;
  editModal.classList.remove('hidden');
}

function closeEditLetterModal() {
  const editModal = document.getElementById('editLetterModal');
  editModal.classList.add('hidden');
}

function saveEditedLetter() {
  const newHtml = document.getElementById('editLetterTextarea').value;
  const { type, key } = LJ_STATE.currentItem;
  const path = type === "ticket" ? "tickets" : type === "workOrder" ? "workOrders" : "violations";

  LJ_STATE.db.ref(`${path}/${key}/letterHTML`).set(newHtml)
    .then(() => {
      showToast("Letter updated successfully!", "success");
      LJ_STATE.currentItem.data.letterHTML = newHtml;
      closeEditLetterModal();
      // Also update the preview if it's open
      displayLetterPreview(newHtml);
    })
    .catch(err => {
      console.error("Error updating letter:", err);
      showToast("Error updating letter", "error");
    });
}
