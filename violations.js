// ============================================
// VIOLATIONS MANAGEMENT - FIXED VERSION
// Fixed: Modal not appearing + improved UI
// ============================================

// Violation Categories and Rules
const VIOLATION_CATEGORIES = {
    parking: {
        name: 'Parking Violations',
        rules: [
            'Unauthorized vehicle in reserved spot',
            'Parking in fire lane',
            'Expired vehicle registration',
            'Commercial vehicle in residential area',
            'Blocking driveway or walkway',
            'Oversized vehicle violation'
        ]
    },
    noise: {
        name: 'Noise Violations',
        rules: [
            'Loud music after quiet hours (10 PM - 8 AM)',
            'Construction noise during restricted hours',
            'Excessive pet noise',
            'Party disturbance'
        ]
    },
    property: {
        name: 'Property Maintenance',
        rules: [
            'Trash left outside designated areas',
            'Unsightly exterior modifications',
            'Balcony storage violations',
            'Unapproved modifications',
            'Pool furniture in common areas'
        ]
    },
    pets: {
        name: 'Pet Violations',
        rules: [
            'Unleashed pet in common areas',
            'Pet waste not cleaned',
            'Unauthorized pet size/breed',
            'Excessive barking/noise'
        ]
    },
    common: {
        name: 'Common Area Violations',
        rules: [
            'Unauthorized use of amenities',
            'Pool rules violation',
            'Gym equipment misuse',
            'Smoking in prohibited areas'
        ]
    }
};

// Get violations from localStorage
function getViolations() {
    return JSON.parse(localStorage.getItem('violations') || '[]');
}

// Save violations to localStorage
function saveViolations(violations) {
    localStorage.setItem('violations', JSON.stringify(violations));
}

// Generate violation ID
function generateViolationId() {
    const violations = getViolations();
    const lastNumeric = violations.length
        ? Math.max(...violations.map(v => parseInt(String(v.id).replace('VIO-', '')) || 0))
        : 0;
    const next = lastNumeric + 1;
    return `VIO-${String(next).padStart(5, '0')}`;
}

// Load violations into the dashboard
function loadViolations() {
    const violations = getViolations();
    const violationsList = document.getElementById('violationsList');
    
    if (!violationsList) {
        console.error('Violations list element not found!');
        return;
    }

    if (violations.length === 0) {
        violationsList.innerHTML = `
            <div class="empty-state">
                <h3>No violations recorded</h3>
                <p>Create your first violation to get started</p>
            </div>
        `;
        updateViolationStats();
        return;
    }

    violations.sort((a, b) => new Date(b.dateIssued) - new Date(a.dateIssued));

    violationsList.innerHTML = violations.map(createViolationCard).join('');

    // Attach click listeners
    document.querySelectorAll('.violation-card').forEach(card => {
        card.addEventListener('click', () => openViolationDetail(card.dataset.violationId));
    });

    updateViolationStats();
}

// Create violation card HTML
function createViolationCard(violation) {
    const dateIssued = new Date(violation.dateIssued).toLocaleDateString();
    const statusClass = violation.status.replace(' ', '-').toLowerCase();
    
    return `
        <div class="violation-card" data-violation-id="${violation.id}">
            <div class="violation-header">
                <h3>${violation.category} - ${violation.rule}</h3>
                <span class="badge status-badge ${statusClass}">
                    ${violation.status.toUpperCase()}
                </span>
            </div>
            <p class="violation-description">${violation.description || 'No description provided'}</p>
            <div class="violation-meta">
                <span class="violation-id">${violation.id}</span>
                <span class="violation-association">🏢 ${violation.association}</span>
                <span class="violation-unit">🚪 Unit ${violation.unitNumber}</span>
                <span class="violation-date">📅 ${dateIssued}</span>
            </div>
        </div>
    `;
}

// Update violation statistics
function updateViolationStats() {
    const violations = getViolations();
    const open = violations.filter(v => v.status === 'open').length;
    const inProgress = violations.filter(v => v.status === 'in progress').length;
    const resolved = violations.filter(v => v.status === 'resolved').length;
    const total = violations.length;

    const openEl = document.getElementById('openViolations');
    const progressEl = document.getElementById('inProgressViolations');
    const resolvedEl = document.getElementById('resolvedViolations');
    const totalEl = document.getElementById('totalViolations');

    if (openEl) openEl.textContent = open;
    if (progressEl) progressEl.textContent = inProgress;
    if (resolvedEl) resolvedEl.textContent = resolved;
    if (totalEl) totalEl.textContent = total;
}

// Open create violation modal - FIXED!
function openCreateViolationModal() {
    console.log('Opening violation modal...');
    
    const modal = document.getElementById('violationModal');
    
    if (!modal) {
        console.error('Violation modal not found!');
        alert('Error: Violation modal not found. Please check your HTML.');
        return;
    }

    // Reset form
    const form = document.getElementById('violationForm');
    if (form) {
        form.reset();
    }

    // Set modal title
    const modalTitle = document.getElementById('violationModalTitle');
    if (modalTitle) {
        modalTitle.textContent = 'Create New Violation';
    }

    // Populate category dropdown
    populateViolationCategories();

    // Show modal
    modal.classList.add('active');
    modal.style.display = 'flex';
    
    console.log('Modal opened successfully!');
}

// Close violation modal
function closeViolationModal() {
    const modal = document.getElementById('violationModal');
    if (modal) {
        modal.classList.remove('active');
        modal.style.display = 'none';
    }
}

// Populate violation categories dropdown
function populateViolationCategories() {
    const categorySelect = document.getElementById('violationCategory');
    if (!categorySelect) return;

    categorySelect.innerHTML = '<option value="">Select Category</option>';
    
    Object.keys(VIOLATION_CATEGORIES).forEach(key => {
        const option = document.createElement('option');
        option.value = key;
        option.textContent = VIOLATION_CATEGORIES[key].name;
        categorySelect.appendChild(option);
    });
}

// Update rules dropdown based on selected category
function updateViolationRules(category) {
    const rulesSelect = document.getElementById('violationRule');
    if (!rulesSelect) return;

    rulesSelect.innerHTML = '<option value="">Select Rule</option>';

    if (!category || !VIOLATION_CATEGORIES[category]) {
        rulesSelect.disabled = true;
        return;
    }

    rulesSelect.disabled = false;
    VIOLATION_CATEGORIES[category].rules.forEach(rule => {
        const option = document.createElement('option');
        option.value = rule;
        option.textContent = rule;
        rulesSelect.appendChild(option);
    });
}

// Handle violation form submission
function handleViolationSubmit(e) {
    e.preventDefault();

    const category = document.getElementById('violationCategory').value;
    const rule = document.getElementById('violationRule').value;
    const association = document.getElementById('violationAssociation').value;
    const unitNumber = document.getElementById('violationUnit').value;
    const residentName = document.getElementById('residentName').value;
    const description = document.getElementById('violationDescription').value;
    const severity = document.getElementById('violationSeverity').value;

    // Validation
    if (!category || !rule || !association || !unitNumber) {
        alert('Please fill in all required fields!');
        return;
    }

    const now = new Date().toISOString();

    const violation = {
        id: generateViolationId(),
        category: VIOLATION_CATEGORIES[category].name,
        rule: rule,
        association: association,
        unitNumber: unitNumber,
        residentName: residentName || 'Not provided',
        description: description || '',
        severity: severity,
        status: 'open',
        dateIssued: now,
        issuedBy: currentUser?.username || currentUser?.name || 'System',
        updates: [],
        images: []
    };

    const violations = getViolations();
    violations.push(violation);
    saveViolations(violations);

    closeViolationModal();
    loadViolations();
    
    showNotification('Violation created successfully!', 'success');
}

// Open violation detail modal
function openViolationDetail(violationId) {
    const violations = getViolations();
    const violation = violations.find(v => v.id === violationId);
    
    if (!violation) return;

    const modal = document.getElementById('violationDetailModal');
    if (!modal) return;

    modal.dataset.violationId = violationId;

    // Populate details
    document.getElementById('detailViolationId').textContent = violation.id;
    document.getElementById('detailViolationCategory').textContent = violation.category;
    document.getElementById('detailViolationRule').textContent = violation.rule;
    document.getElementById('detailViolationAssociation').textContent = violation.association;
    document.getElementById('detailViolationUnit').textContent = violation.unitNumber;
    document.getElementById('detailViolationResident').textContent = violation.residentName;
    document.getElementById('detailViolationDescription').textContent = violation.description || 'No description';
    document.getElementById('detailViolationSeverity').textContent = violation.severity;
    document.getElementById('detailViolationStatus').value = violation.status;
    document.getElementById('detailViolationIssued').textContent = new Date(violation.dateIssued).toLocaleString();
    document.getElementById('detailViolationIssuedBy').textContent = violation.issuedBy;

    loadViolationUpdates(violation);

    modal.classList.add('active');
    modal.style.display = 'flex';
}

// Close violation detail modal
function closeViolationDetailModal() {
    const modal = document.getElementById('violationDetailModal');
    if (modal) {
        modal.classList.remove('active');
        modal.style.display = 'none';
    }
}

// Load violation updates
function loadViolationUpdates(violation) {
    const updatesList = document.getElementById('violationUpdates');
    if (!updatesList) return;

    if (!violation.updates || violation.updates.length === 0) {
        updatesList.innerHTML = '<p class="no-updates">No updates yet</p>';
        return;
    }

    updatesList.innerHTML = violation.updates.map(update => `
        <div class="update-item">
            <div class="update-header">
                <strong>${update.user}</strong>
                <span class="update-date">${new Date(update.date).toLocaleString()}</span>
            </div>
            <p class="update-text">${update.text}</p>
        </div>
    `).join('');
}

// Add violation update
function addViolationUpdate() {
    const violationId = document.getElementById('violationDetailModal').dataset.violationId;
    const text = document.getElementById('newViolationUpdate').value.trim();
    
    if (!text) return;

    const violations = getViolations();
    const violation = violations.find(v => v.id === violationId);
    
    if (!violation) return;

    const now = new Date().toISOString();

    violation.updates.push({
        user: currentUser?.username || currentUser?.name || 'System',
        date: now,
        text: text
    });

    saveViolations(violations);
    loadViolationUpdates(violation);
    document.getElementById('newViolationUpdate').value = '';
    
    showNotification('Update added successfully!', 'success');
}

// Update violation status
function updateViolationStatus(e) {
    const newStatus = e.target.value;
    const violationId = document.getElementById('violationDetailModal').dataset.violationId;

    const violations = getViolations();
    const violation = violations.find(v => v.id === violationId);
    
    if (!violation) return;

    const now = new Date().toISOString();
    violation.status = newStatus;
    
    violation.updates.push({
        user: currentUser?.username || currentUser?.name || 'System',
        date: now,
        text: `Status changed to: ${newStatus.toUpperCase()}`
    });

    saveViolations(violations);
    loadViolationUpdates(violation);
    loadViolations();
    
    showNotification('Status updated successfully!', 'success');
}

// Delete violation
function deleteViolation() {
    if (!confirm('Are you sure you want to delete this violation?')) return;

    const violationId = document.getElementById('violationDetailModal').dataset.violationId;
    let violations = getViolations();
    violations = violations.filter(v => v.id !== violationId);
    saveViolations(violations);

    closeViolationDetailModal();
    loadViolations();
    
    showNotification('Violation deleted successfully!', 'success');
}

// Populate violation filters
function populateViolationFilters() {
    // Populate association filter
    const assocFilter = document.getElementById('violationAssociationFilter');
    if (assocFilter && typeof ASSOCIATIONS !== 'undefined') {
        assocFilter.innerHTML = '<option value="">All Associations</option>';
        ASSOCIATIONS.forEach(assoc => {
            const option = document.createElement('option');
            option.value = assoc;
            option.textContent = assoc;
            assocFilter.appendChild(option);
        });
    }

    // Populate category filter
    const catFilter = document.getElementById('violationCategoryFilter');
    if (catFilter) {
        catFilter.innerHTML = '<option value="">All Categories</option>';
        Object.keys(VIOLATION_CATEGORIES).forEach(key => {
            const option = document.createElement('option');
            option.value = key;
            option.textContent = VIOLATION_CATEGORIES[key].name;
            catFilter.appendChild(option);
        });
    }
}

// Apply violation filters
function applyViolationFilters() {
    const statusFilter = document.getElementById('violationStatusFilter')?.value || '';
    const assocFilter = document.getElementById('violationAssociationFilter')?.value || '';
    const categoryFilter = document.getElementById('violationCategoryFilter')?.value || '';
    const searchText = document.getElementById('violationSearchInput')?.value.toLowerCase() || '';

    let violations = getViolations();

    if (statusFilter) {
        violations = violations.filter(v => v.status === statusFilter);
    }
    if (assocFilter) {
        violations = violations.filter(v => v.association === assocFilter);
    }
    if (categoryFilter) {
        const categoryName = VIOLATION_CATEGORIES[categoryFilter]?.name;
        if (categoryName) {
            violations = violations.filter(v => v.category === categoryName);
        }
    }
    if (searchText) {
        violations = violations.filter(v =>
            v.rule.toLowerCase().includes(searchText) ||
            v.unitNumber.toLowerCase().includes(searchText) ||
            v.residentName.toLowerCase().includes(searchText) ||
            String(v.id).toLowerCase().includes(searchText)
        );
    }

    const violationsList = document.getElementById('violationsList');
    if (!violationsList) return;

    if (violations.length === 0) {
        violationsList.innerHTML = `
            <div class="empty-state">
                <h3>No violations found</h3>
                <p>Try adjusting your filters</p>
            </div>
        `;
        return;
    }

    violations.sort((a, b) => new Date(b.dateIssued) - new Date(a.dateIssued));
    violationsList.innerHTML = violations.map(createViolationCard).join('');

    document.querySelectorAll('.violation-card').forEach(card => {
        card.addEventListener('click', () => openViolationDetail(card.dataset.violationId));
    });
}

// Rules management modal
function openRulesModal() {
    alert('Rules Management:\n\nComing soon! You will be able to:\n- Add custom rules\n- Edit existing rules\n- Organize by category\n- Set severity levels');
}

// CINC sync modal
function openCincSyncModal() {
    alert('CINC Sync:\n\nComing soon! You will be able to:\n- Sync violations with CINC system\n- Import resident data\n- Export violation reports\n- Configure auto-sync');
}

// Initialize violations when DOM loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('Violations module loaded');
    
    // Setup event listeners
    const createBtn = document.getElementById('createViolationBtn');
    if (createBtn) {
        createBtn.addEventListener('click', openCreateViolationModal);
        console.log('Create violation button listener attached');
    } else {
        console.warn('Create violation button not found');
    }

    const violationForm = document.getElementById('violationForm');
    if (violationForm) {
        violationForm.addEventListener('submit', handleViolationSubmit);
    }

    const categorySelect = document.getElementById('violationCategory');
    if (categorySelect) {
        categorySelect.addEventListener('change', (e) => updateViolationRules(e.target.value));
    }

    const closeModalBtn = document.querySelector('.close-violation-modal');
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeViolationModal);
    }

    const cancelBtn = document.querySelector('.violation-cancel-btn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', closeViolationModal);
    }

    const closeDetailBtn = document.querySelector('.close-violation-detail-modal');
    if (closeDetailBtn) {
        closeDetailBtn.addEventListener('click', closeViolationDetailModal);
    }

    const addUpdateBtn = document.getElementById('addViolationUpdateBtn');
    if (addUpdateBtn) {
        addUpdateBtn.addEventListener('click', addViolationUpdate);
    }

    const statusSelect = document.getElementById('detailViolationStatus');
    if (statusSelect) {
        statusSelect.addEventListener('change', updateViolationStatus);
    }

    const deleteBtn = document.getElementById('deleteViolationBtn');
    if (deleteBtn) {
        deleteBtn.addEventListener('click', deleteViolation);
    }

    // Filter listeners
    document.getElementById('violationStatusFilter')?.addEventListener('change', applyViolationFilters);
    document.getElementById('violationAssociationFilter')?.addEventListener('change', applyViolationFilters);
    document.getElementById('violationCategoryFilter')?.addEventListener('change', applyViolationFilters);
    document.getElementById('violationSearchInput')?.addEventListener('input', applyViolationFilters);

    // Rules and CINC buttons
    document.getElementById('manageRulesBtn')?.addEventListener('click', openRulesModal);
    document.getElementById('cincSyncBtn')?.addEventListener('click', openCincSyncModal);

    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.classList.remove('active');
            e.target.style.display = 'none';
        }
    });
});

console.log('Violations module initialized');
