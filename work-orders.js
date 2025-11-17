// ============================================
// WORK ORDERS SYSTEM
// Complete work order management with PDF generation
// ============================================

const WORK_ORDER_CATEGORIES = {
    plumbing: {
        name: 'Plumbing',
        tasks: [
            'Leak repair',
            'Pipe replacement',
            'Drain cleaning',
            'Water heater repair',
            'Toilet repair',
            'Faucet replacement'
        ]
    },
    electrical: {
        name: 'Electrical',
        tasks: [
            'Light fixture repair',
            'Outlet replacement',
            'Circuit breaker repair',
            'Wiring repair',
            'Panel upgrade',
            'Emergency electrical'
        ]
    },
    hvac: {
        name: 'HVAC',
        tasks: [
            'AC repair',
            'Heating repair',
            'Filter replacement',
            'Duct cleaning',
            'Thermostat repair',
            'System maintenance'
        ]
    },
    general: {
        name: 'General Maintenance',
        tasks: [
            'Door repair',
            'Window repair',
            'Drywall repair',
            'Painting',
            'Flooring repair',
            'Appliance repair'
        ]
    },
    landscaping: {
        name: 'Landscaping',
        tasks: [
            'Lawn maintenance',
            'Tree trimming',
            'Irrigation repair',
            'Pest control',
            'Pool maintenance',
            'Pressure washing'
        ]
    }
};

const VENDORS = [
    { name: 'ABC Plumbing', email: 'service@abcplumbing.com', category: 'plumbing' },
    { name: 'Premier Electric', email: 'info@premierelectric.com', category: 'electrical' },
    { name: 'Cool Air HVAC', email: 'service@coolairhvac.com', category: 'hvac' },
    { name: 'General Contractors Inc', email: 'contact@generalcontractors.com', category: 'general' },
    { name: 'Green Landscapes', email: 'info@greenlandscapes.com', category: 'landscaping' }
];

function getWorkOrders() {
    return JSON.parse(localStorage.getItem('workOrders') || '[]');
}

function saveWorkOrders(workOrders) {
    localStorage.setItem('workOrders', JSON.stringify(workOrders));
}

function generateWorkOrderId() {
    const workOrders = getWorkOrders();
    const lastNumeric = workOrders.length
        ? Math.max(...workOrders.map(w => parseInt(String(w.id).replace('WO-', '')) || 0))
        : 0;
    const next = lastNumeric + 1;
    return `WO-${String(next).padStart(5, '0')}`;
}

function loadWorkOrders() {
    const workOrders = getWorkOrders();
    const workOrdersList = document.getElementById('workOrdersList');
    
    if (!workOrdersList) return;

    if (workOrders.length === 0) {
        workOrdersList.innerHTML = `
            <div class="empty-state">
                <h3>No work orders yet</h3>
                <p>Create your first work order to get started</p>
            </div>
        `;
        updateWorkOrderStats();
        return;
    }

    workOrders.sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate));
    workOrdersList.innerHTML = workOrders.map(createWorkOrderCard).join('');
    
    // Attach click listeners
    document.querySelectorAll('.work-order-card').forEach(card => {
        card.addEventListener('click', () => openWorkOrderDetail(card.dataset.workOrderId));
    });

    updateWorkOrderStats();
}

function createWorkOrderCard(workOrder) {
    const createdDate = new Date(workOrder.createdDate).toLocaleDateString();
    const statusClass = workOrder.status.replace(' ', '-').toLowerCase();
    const priorityClass = workOrder.priority.toLowerCase();
    
    return `
        <div class="work-order-card ticket-card" data-work-order-id="${workOrder.id}">
            <div class="ticket-header">
                <h3>${workOrder.category} - ${workOrder.task}</h3>
                <div class="ticket-badges">
                    <span class="badge status-badge ${statusClass}">
                        ${workOrder.status.toUpperCase()}
                    </span>
                    <span class="badge priority-badge ${priorityClass}">
                        ${workOrder.priority.toUpperCase()}
                    </span>
                </div>
            </div>
            <p class="ticket-description">${workOrder.description || 'No description'}</p>
            <div class="ticket-meta">
                <span>${workOrder.id}</span>
                <span>🏢 ${workOrder.association}</span>
                <span>📍 Unit ${workOrder.location}</span>
                <span>👷 ${workOrder.vendor || 'No vendor assigned'}</span>
                <span>📅 ${createdDate}</span>
            </div>
        </div>
    `;
}

function updateWorkOrderStats() {
    const workOrders = getWorkOrders();
    const pending = workOrders.filter(w => w.status === 'pending').length;
    const assigned = workOrders.filter(w => w.status === 'assigned').length;
    const completed = workOrders.filter(w => w.status === 'completed').length;

    const pendingEl = document.getElementById('pendingWorkOrders');
    const assignedEl = document.getElementById('assignedWorkOrders');
    const completedWorkOrdersEl = document.getElementById('completedWorkOrders');
    const totalWorkOrdersEl = document.getElementById('totalWorkOrders');

    if (pendingEl) pendingEl.textContent = pending;
    if (assignedEl) assignedEl.textContent = assigned;
    if (completedWorkOrdersEl) completedWorkOrdersEl.textContent = completed;
    if (totalWorkOrdersEl) totalWorkOrdersEl.textContent = workOrders.length;
}

function openCreateWorkOrderModal() {
    const modal = document.getElementById('workOrderModal');
    if (!modal) {
        console.error('Work order modal not found!');
        return;
    }

    const form = document.getElementById('workOrderForm');
    if (form) form.reset();

    populateWorkOrderCategories();
    populateWorkOrderVendors();

    modal.classList.add('active');
    modal.style.display = 'flex';
}

function closeWorkOrderModal() {
    const modal = document.getElementById('workOrderModal');
    if (modal) {
        modal.classList.remove('active');
        modal.style.display = 'none';
    }
}

function populateWorkOrderCategories() {
    const categorySelect = document.getElementById('workOrderCategory');
    if (!categorySelect) return;

    categorySelect.innerHTML = '<option value="">Select Category</option>';
    
    Object.keys(WORK_ORDER_CATEGORIES).forEach(key => {
        const option = document.createElement('option');
        option.value = key;
        option.textContent = WORK_ORDER_CATEGORIES[key].name;
        categorySelect.appendChild(option);
    });

    // Populate associations
    const assocSelect = document.getElementById('workOrderAssociation');
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

function populateWorkOrderVendors() {
    const vendorSelect = document.getElementById('workOrderVendor');
    if (!vendorSelect) return;

    vendorSelect.innerHTML = '<option value="">Select Vendor (Optional)</option>';
    VENDORS.forEach(vendor => {
        const option = document.createElement('option');
        option.value = JSON.stringify(vendor);
        option.textContent = `${vendor.name} (${vendor.category})`;
        vendorSelect.appendChild(option);
    });
}

function updateWorkOrderTasks(category) {
    const taskSelect = document.getElementById('workOrderTask');
    if (!taskSelect) return;

    taskSelect.innerHTML = '<option value="">Select Task</option>';

    if (!category || !WORK_ORDER_CATEGORIES[category]) {
        taskSelect.disabled = true;
        return;
    }

    taskSelect.disabled = false;
    WORK_ORDER_CATEGORIES[category].tasks.forEach(task => {
        const option = document.createElement('option');
        option.value = task;
        option.textContent = task;
        taskSelect.appendChild(option);
    });
}

function handleWorkOrderSubmit(e) {
    e.preventDefault();

    const category = document.getElementById('workOrderCategory').value;
    const task = document.getElementById('workOrderTask').value;
    const association = document.getElementById('workOrderAssociation').value;
    const location = document.getElementById('workOrderLocation').value;
    const description = document.getElementById('workOrderDescription').value;
    const priority = document.getElementById('workOrderPriority').value;
    const vendorData = document.getElementById('workOrderVendor').value;

    if (!category || !task || !association || !location) {
        alert('Please fill in all required fields!');
        return;
    }

    const now = new Date().toISOString();
    let vendor = null;
    
    if (vendorData) {
        try {
            vendor = JSON.parse(vendorData);
        } catch (e) {
            console.error('Error parsing vendor data');
        }
    }

    const workOrder = {
        id: generateWorkOrderId(),
        category: WORK_ORDER_CATEGORIES[category].name,
        task: task,
        association: association,
        location: location,
        description: description || '',
        priority: priority,
        vendor: vendor ? vendor.name : null,
        vendorEmail: vendor ? vendor.email : null,
        status: 'pending',
        createdDate: now,
        createdBy: currentUser?.username || currentUser?.name || 'System',
        estimatedCost: document.getElementById('workOrderEstimatedCost')?.value || null,
        updates: []
    };

    const workOrders = getWorkOrders();
    workOrders.push(workOrder);
    saveWorkOrders(workOrders);

    closeWorkOrderModal();
    loadWorkOrders();
    
    // Show PDF preview option
    showWorkOrderPDFPreview(workOrder);
    
    if (typeof showNotification === 'function') {
        showNotification('Work order created! Preview PDF before sending.', 'success');
    }
}

function openWorkOrderDetail(workOrderId) {
    const workOrders = getWorkOrders();
    const workOrder = workOrders.find(w => w.id === workOrderId);
    
    if (!workOrder) return;

    // For now, show a simple alert with details
    // You can expand this to a full detail modal later
    const details = `
Work Order: ${workOrder.id}
Category: ${workOrder.category}
Task: ${workOrder.task}
Location: ${workOrder.location}
Status: ${workOrder.status}
Priority: ${workOrder.priority}
${workOrder.vendor ? `Vendor: ${workOrder.vendor}` : 'No vendor assigned'}

Description:
${workOrder.description}
    `;
    
    if (confirm(details + '\n\nGenerate PDF preview?')) {
        showWorkOrderPDFPreview(workOrder);
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    const createBtn = document.getElementById('createWorkOrderBtn');
    if (createBtn) {
        createBtn.addEventListener('click', openCreateWorkOrderModal);
    }

    const workOrderForm = document.getElementById('workOrderForm');
    if (workOrderForm) {
        workOrderForm.addEventListener('submit', handleWorkOrderSubmit);
    }

    const categorySelect = document.getElementById('workOrderCategory');
    if (categorySelect) {
        categorySelect.addEventListener('change', (e) => updateWorkOrderTasks(e.target.value));
    }

    const closeBtn = document.querySelector('.close-workorder-modal');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeWorkOrderModal);
    }

    const cancelBtn = document.querySelector('.workorder-cancel-btn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', closeWorkOrderModal);
    }

    console.log('✅ Work Orders module loaded');
});
