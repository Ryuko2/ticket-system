// ============================================
// LJ SERVICES GROUP - PROFESSIONAL CRM
// Enhanced with Bulk Actions & Advanced Features
// ============================================

console.log("🚀 Loading Professional CRM with Bulk Actions...");

const LJ_STATE = {
  db: null,
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
    "Aquarius at Brickell",
    "Bay Point Club",
    "Brickell Townhouse",
    "Bristol Tower",
    "Carriage Club North",
    "Carriage Club South",
    "Carriage Club West",
    "Casa Grande",
    "Colonnade on Williams Island",
    "Commodore Plaza West",
    "Cricket Club",
    "Eldorado Towers",
    "Flamingo South Beach",
    "Hamptons East",
    "Marenas Beach Resort",
    "Renaissance Towers",
    "Richmond Park",
    "Turnberry Village South",
    "Winston Towers"
  ]
};

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
  const user = window.currentUser || { name: "Kevin R", email: "kevinr@ljservicesgroup.com" };
  
  if (nameEl) nameEl.textContent = user.name || "User";
  if (emailEl) emailEl.textContent = user.email || "";
  console.log("✅ User:", user.email);
}

function initLogoutButton() {
  const btn = document.getElementById("logoutBtn");
  if (btn) {
    btn.addEventListener("click", () => alert("Logout logic here"));
  }
}

// ---------- Dashboard Navigation ----------

function initDashboardNavigation() {
  const tabButtons = document.querySelectorAll(".dashboard-tab");
  const views = document.querySelectorAll("[data-dashboard-view]");
  const mobileSelect = document.getElementById("mobileDashboardSelect");
  const titleEl = document.getElementById("dashboardTitle");
  const subtitleEl = document.getElementById("dashboardSubtitle");

  tabButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const dashboardType = btn.getAttribute("data-dashboard");
      switchDashboard(dashboardType);
    });
  });

  if (mobileSelect) {
    mobileSelect.addEventListener("change", (e) => {
      switchDashboard(e.target.value);
    });
  }

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

  // Update titles and load data
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
  }
  else if (type === "tickets") {
    if (titleEl) titleEl.textContent = "Tickets Dashboard";
    if (subtitleEl) subtitleEl.textContent = "View and manage all tickets.";
  }
  else if (type === "workOrders") {
    if (titleEl) titleEl.textContent = "Work Orders Dashboard";
    if (subtitleEl) subtitleEl.textContent = "View and manage all work orders.";
  }
  else if (type === "violations") {
    if (titleEl) titleEl.textContent = "Violations Dashboard";
    if (subtitleEl) subtitleEl.textContent = "View and manage all violations.";
  }
  
  // Clear bulk selections when switching
  clearBulkSelection();
  if (type !== "registrations") {
    renderCurrentView();
  }
}

  const LABELS = {
    main: { title: "Overview", subtitle: "High-level activity across all items." },
    tickets: { title: "Tickets Dashboard", subtitle: "General tickets and internal tasks." },
    workOrders: { title: "Work Orders Dashboard", subtitle: "Vendor work and maintenance." },
    violations: { title: "Violations Dashboard", subtitle: "CC&R enforcement." },
  };

  function setDashboard(id) {
    tabButtons.forEach((btn) => {
      const isActive = btn.dataset.dashboard === id;
      btn.classList.toggle("bg-indigo-50", isActive);
      btn.classList.toggle("text-indigo-700", isActive);
      btn.classList.toggle("text-slate-600", !isActive);
    });

    views.forEach((view) => {
      view.classList.toggle("hidden", view.dataset.dashboardView !== id);
    });

    if (titleEl && LABELS[id]) {
      titleEl.textContent = LABELS[id].title;
      subtitleEl.textContent = LABELS[id].subtitle;
    }

    if (mobileSelect) mobileSelect.value = id;
    
    // Clear bulk selections when switching dashboards
    clearBulkSelection();
    renderCurrentView();
  }

  tabButtons.forEach((btn) => {
    btn.addEventListener("click", () => setDashboard(btn.dataset.dashboard));
  });

  if (mobileSelect) {
    mobileSelect.addEventListener("change", (e) => setDashboard(e.target.value));
  }

  setDashboard("main");
}

// ---------- Drawers (Ticket, Work Order, Violation) ----------

function initDrawers() {
  // Populate associations
  populateAssociationSelects();

  // Open drawer buttons
  document.querySelectorAll("[data-open-drawer]").forEach((btn) => {
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
  const data = {
    type: "violation",
    title: form.title.value,
    association: form.association.value,
    ruleBroken: form.ruleBroken.value,
    noticeStep: form.noticeStep.value,
    status: form.status.value,
    description: form.description.value || "",
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
    referenceNumber: generateReferenceNumber("VIO"),
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

  if (closeBtn) closeBtn.addEventListener("click", handleCloseItem);
  if (deleteBtn) deleteBtn.addEventListener("click", handleDeleteItem);
  if (exportBtn) exportBtn.addEventListener("click", handleExportItem);
  if (commentForm) commentForm.addEventListener("submit", handleAddComment);
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
    author: window.currentUser?.name || "Kevin R",
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

function renderCurrentView() {
  const activeView = getCurrentActiveView();
  
  if (activeView === "main") renderOverview();
  else if (activeView === "tickets") renderTicketsDashboard();
  else if (activeView === "workOrders") renderWorkOrdersDashboard();
  else if (activeView === "violations") renderViolationsDashboard();
  
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

console.log("✅ LJ Services CRM with Bulk Actions loaded successfully!");
// ============================================
// REGISTRATIONS DASHBOARD ADDITION
// Add this to your existing app.js
// ============================================

// Add to LJ_STATE object (around line 8-25):
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

// Add to initDashboardNavigation() function:
function initRegistrationsDashboard() {
  const registrationsBtn = document.querySelector('[data-dashboard="registrations"]');
  if (registrationsBtn) {
    registrationsBtn.addEventListener('click', () => {
      loadRegistrationsData();
    });
  }
  console.log("✅ Registrations dashboard initialized");
}

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
    html += `<td class="px-6 py-4 text-sm text-slate-600">${formatDate(row['Timestamp'])}</td>`;
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
    html += `<td class="px-6 py-4 text-sm text-slate-600">${formatDate(row['Timestamp'])}</td>`;
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
    html += `<td class="px-6 py-4 text-sm text-slate-600">${formatDate(row['Timestamp'])}</td>`;
    html += `<td class="px-6 py-4 text-sm font-medium text-slate-900">${row['Unit Number']}</td>`;
    html += `<td class="px-6 py-4 text-sm text-slate-600">${row['Owner Name']}</td>`;
    html += `<td class="px-6 py-4 text-sm text-slate-600">${row['Association Name']}</td>`;
    html += `<td class="px-6 py-4 text-sm text-slate-900">${petName} ${petBreed ? `(${petBreed})` : ''}</td>`;
    html += `</tr>`;
  });
  
  html += '</tbody></table></div>';
  return html;
}

// Helper functions
function formatDate(dateString) {
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

console.log("✅ Registrations module loaded");

