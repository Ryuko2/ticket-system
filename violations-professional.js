// ============================================
// VIOLATIONS MANAGEMENT - PROFESSIONAL
// Complete violations system
// ============================================

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

function getViolations() {
    return JSON.parse(localStorage.getItem('violations') || '[]');
}

function saveViolations(violations) {
    localStorage.setItem('violations', JSON.stringify(violations));
}

function generateViolationId() {
    const violations = getViolations();
    const lastNumeric = violations.length
        ? Math.max(...violations.map(v => parseInt(String(v.id).replace('VIO-', '')) || 0))
        : 0;
    const next = lastNumeric + 1;
    return `VIO-${String(next).padStart(5, '0')}`;
}

function loadViolations() {
    const violations = getViolations();
    const violationsList = document.getElementById('violationsList');
    
    if (!violationsList) return;

    if (violations.length === 0) {
        violationsList.innerHTML = `
            <div class="empty-state">
                <h3>No violations recorded</h3>
                <p>Create your first violation to get started</p>
            </div>
        `;
        return;
    }

    violations.sort((a, b) => new Date(b.dateIssued) - new Date(a.dateIssued));
    violationsList.innerHTML = violations.map(createViolationCard).join('');
}

function createViolationCard(violation) {
    const dateIssued = new Date(violation.dateIssued).toLocaleDateString();
    const statusClass = violation.status.replace(' ', '-').toLowerCase();
    
    return `
        <div class="violation-card ticket-card" data-violation-id="${violation.id}">
            <div class="ticket-header">
                <h3>${violation.category} - ${violation.rule}</h3>
                <span class="badge status-badge ${statusClass}">
                    ${violation.status.toUpperCase()}
                </span>
            </div>
            <p class="ticket-description">${violation.description || 'No description'}</p>
            <div class="ticket-meta">
                <span>${violation.id}</span>
                <span>🏢 ${violation.association}</span>
                <span>🚪 Unit ${violation.unitNumber}</span>
                <span>📅 ${dateIssued}</span>
            </div>
        </div>
    `;
}

function openCreateViolationModal() {
    const modal = document.getElementById('violationModal');
    if (!modal) {
        console.error('Violation modal not found!');
        return;
    }

    const form = document.getElementById('violationForm');
    if (form) form.reset();

    populateViolationCategories();

    modal.classList.add('active');
    modal.style.display = 'flex';
}

function closeViolationModal() {
    const modal = document.getElementById('violationModal');
    if (modal) {
        modal.classList.remove('active');
        modal.style.display = 'none';
    }
}

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

    // Populate associations
    const assocSelect = document.getElementById('violationAssociation');
    if (assocSelect && typeof ASSOCIATIONS !== 'undefined') {
        assocSelect.innerHTML = '<option value="">Select Association</option>';
        ASSOCIATIONS.forEach(assoc => {
            const option = document.createElement('option');
            option.value = assoc;
            option.textContent = assoc;
            assocSelect.appendChild(option);
        });
    }
}

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

function handleViolationSubmit(e) {
    e.preventDefault();

    const category = document.getElementById('violationCategory').value;
    const rule = document.getElementById('violationRule').value;
    const association = document.getElementById('violationAssociation').value;
    const unitNumber = document.getElementById('violationUnit').value;
    const residentName = document.getElementById('residentName').value;
    const description = document.getElementById('violationDescription').value;
    const severity = document.getElementById('violationSeverity').value;

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
    
    if (typeof showNotification === 'function') {
        showNotification('Violation created successfully!', 'success');
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    const createBtn = document.getElementById('createViolationBtn');
    if (createBtn) {
        createBtn.addEventListener('click', openCreateViolationModal);
    }

    const violationForm = document.getElementById('violationForm');
    if (violationForm) {
        violationForm.addEventListener('submit', handleViolationSubmit);
    }

    const categorySelect = document.getElementById('violationCategory');
    if (categorySelect) {
        categorySelect.addEventListener('change', (e) => updateViolationRules(e.target.value));
    }

    const closeBtn = document.querySelector('.close-violation-modal');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeViolationModal);
    }

    const cancelBtn = document.querySelector('.violation-cancel-btn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', closeViolationModal);
    }

    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.classList.remove('active');
            e.target.style.display = 'none';
        }
    });

    console.log('✅ Violations module loaded');
});
