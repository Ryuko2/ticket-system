// ============================================
// TICKET INTERACTIONS
// Click tickets to edit, change status, close
// ============================================

// Open ticket detail modal
function openTicketDetail(ticketId) {
    const tickets = getTickets();
    const ticket = tickets.find(t => t.id === ticketId);
    
    if (!ticket) return;
    
    // Create or get detail modal
    let modal = document.getElementById('ticketDetailModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'ticketDetailModal';
        modal.className = 'modal';
        document.body.appendChild(modal);
    }
    
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 700px;">
            <div class="modal-header">
                <h2>Ticket Details - ${ticket.id}</h2>
                <button class="modal-close" onclick="closeTicketDetail()">&times;</button>
            </div>
            <div style="padding: 2rem;">
                <div class="ticket-detail-header">
                    <h3>${ticket.title}</h3>
                    <div class="ticket-badges">
                        <span class="badge status-badge ${ticket.status}">${ticket.status.replace('-', ' ').toUpperCase()}</span>
                        <span class="badge priority-badge ${ticket.priority}">${ticket.priority.toUpperCase()}</span>
                    </div>
                </div>
                
                <div class="ticket-detail-info">
                    <div class="info-row">
                        <label>Association:</label>
                        <span>${ticket.association}</span>
                    </div>
                    <div class="info-row">
                        <label>Assigned To:</label>
                        <span>${ticket.assignedTo || 'Unassigned'}</span>
                    </div>
                    <div class="info-row">
                        <label>Created:</label>
                        <span>${new Date(ticket.createdDate).toLocaleString()}</span>
                    </div>
                    <div class="info-row">
                        <label>Created By:</label>
                        <span>${ticket.createdBy}</span>
                    </div>
                    ${ticket.dueDate ? `
                    <div class="info-row">
                        <label>Due Date:</label>
                        <span>${new Date(ticket.dueDate).toLocaleDateString()}</span>
                    </div>
                    ` : ''}
                </div>
                
                <div class="ticket-detail-description">
                    <h4>Description</h4>
                    <p>${ticket.description || 'No description provided'}</p>
                </div>
                
                <div class="ticket-actions-panel">
                    <h4>Actions</h4>
                    <div class="action-buttons">
                        <select id="updateStatus" class="filter-select">
                            <option value="open" ${ticket.status === 'open' ? 'selected' : ''}>Open</option>
                            <option value="in-progress" ${ticket.status === 'in-progress' ? 'selected' : ''}>In Progress</option>
                            <option value="completed" ${ticket.status === 'completed' ? 'selected' : ''}>Completed</option>
                        </select>
                        <button class="action-btn primary" onclick="updateTicketStatus('${ticket.id}')">
                            Update Status
                        </button>
                        <button class="action-btn secondary" onclick="editTicket('${ticket.id}')">
                            Edit Ticket
                        </button>
                        <button class="action-btn tertiary" onclick="deleteTicket('${ticket.id}')">
                            Delete Ticket
                        </button>
                    </div>
                </div>
                
                ${ticket.updates && ticket.updates.length > 0 ? `
                <div class="ticket-updates">
                    <h4>Updates History</h4>
                    ${ticket.updates.map(update => `
                        <div class="update-item">
                            <div class="update-header">
                                <strong>${update.user}</strong>
                                <span>${new Date(update.date).toLocaleString()}</span>
                            </div>
                            <p>${update.text}</p>
                        </div>
                    `).join('')}
                </div>
                ` : ''}
                
                <div class="add-update">
                    <h4>Add Update</h4>
                    <textarea id="newUpdate" rows="3" class="filter-input" placeholder="Add a comment or update..."></textarea>
                    <button class="action-btn primary" onclick="addTicketUpdate('${ticket.id}')">
                        Add Update
                    </button>
                </div>
            </div>
        </div>
    `;
    
    modal.classList.add('active');
    modal.style.display = 'flex';
}

function closeTicketDetail() {
    const modal = document.getElementById('ticketDetailModal');
    if (modal) {
        modal.classList.remove('active');
        modal.style.display = 'none';
    }
}

function updateTicketStatus(ticketId) {
    const newStatus = document.getElementById('updateStatus').value;
    const tickets = getTickets();
    const ticket = tickets.find(t => t.id === ticketId);
    
    if (ticket) {
        ticket.status = newStatus;
        ticket.updatedAt = new Date().toISOString();
        
        if (!ticket.updates) ticket.updates = [];
        ticket.updates.push({
            date: new Date().toISOString(),
            user: currentUser?.username || currentUser?.name || 'User',
            text: `Status changed to ${newStatus.replace('-', ' ')}`
        });
        
        saveTickets(tickets);
        loadTickets();
        updateStats();
        closeTicketDetail();
        
        if (typeof showNotification === 'function') {
            showNotification('Ticket status updated!', 'success');
        }
    }
}

function addTicketUpdate(ticketId) {
    const updateText = document.getElementById('newUpdate').value;
    
    if (!updateText.trim()) {
        alert('Please enter an update');
        return;
    }
    
    const tickets = getTickets();
    const ticket = tickets.find(t => t.id === ticketId);
    
    if (ticket) {
        if (!ticket.updates) ticket.updates = [];
        ticket.updates.push({
            date: new Date().toISOString(),
            user: currentUser?.username || currentUser?.name || 'User',
            text: updateText
        });
        
        ticket.updatedAt = new Date().toISOString();
        saveTickets(tickets);
        openTicketDetail(ticketId); // Refresh modal
        
        if (typeof showNotification === 'function') {
            showNotification('Update added successfully!', 'success');
        }
    }
}

function editTicket(ticketId) {
    const tickets = getTickets();
    const ticket = tickets.find(t => t.id === ticketId);
    
    if (!ticket) return;
    
    // Close detail modal
    closeTicketDetail();
    
    // Open edit modal
    const modal = document.getElementById('ticketModal');
    if (!modal) return;
    
    // Fill form with ticket data
    document.getElementById('modalTitle').textContent = 'Edit Ticket';
    document.getElementById('ticketTitle').value = ticket.title;
    document.getElementById('ticketAssociation').value = ticket.association;
    document.getElementById('ticketPriority').value = ticket.priority;
    document.getElementById('ticketAssignedTo').value = ticket.assignedTo || '';
    document.getElementById('ticketDescription').value = ticket.description || '';
    document.getElementById('ticketDueDate').value = ticket.dueDate || '';
    
    // Change form submit to update instead of create
    const form = document.getElementById('ticketForm');
    form.onsubmit = function(e) {
        e.preventDefault();
        
        ticket.title = document.getElementById('ticketTitle').value;
        ticket.association = document.getElementById('ticketAssociation').value;
        ticket.priority = document.getElementById('ticketPriority').value;
        ticket.assignedTo = document.getElementById('ticketAssignedTo').value || '';
        ticket.description = document.getElementById('ticketDescription').value;
        ticket.dueDate = document.getElementById('ticketDueDate').value || null;
        ticket.updatedAt = new Date().toISOString();
        
        if (!ticket.updates) ticket.updates = [];
        ticket.updates.push({
            date: new Date().toISOString(),
            user: currentUser?.username || currentUser?.name || 'User',
            text: 'Ticket details updated'
        });
        
        saveTickets(tickets);
        closeTicketModal();
        loadTickets();
        updateStats();
        
        if (typeof showNotification === 'function') {
            showNotification('Ticket updated successfully!', 'success');
        }
        
        // Reset form handler
        form.onsubmit = handleTicketSubmit;
    };
    
    modal.classList.add('active');
}

function deleteTicket(ticketId) {
    if (!confirm('Are you sure you want to delete this ticket?')) return;
    
    let tickets = getTickets();
    tickets = tickets.filter(t => t.id !== ticketId);
    saveTickets(tickets);
    
    closeTicketDetail();
    loadTickets();
    updateStats();
    
    if (typeof showNotification === 'function') {
        showNotification('Ticket deleted successfully!', 'success');
    }
}

// Add click listeners to ticket cards
function attachTicketClickListeners() {
    document.querySelectorAll('.ticket-card').forEach(card => {
        if (!card.dataset.listenerAttached) {
            card.addEventListener('click', function() {
                const ticketId = this.dataset.ticketId;
                if (ticketId) {
                    openTicketDetail(ticketId);
                }
            });
            card.dataset.listenerAttached = 'true';
            card.style.cursor = 'pointer';
        }
    });
}

// Update loadTickets to attach listeners
const originalLoadTickets = window.loadTickets || loadTickets;
window.loadTickets = function() {
    if (originalLoadTickets) originalLoadTickets();
    setTimeout(attachTicketClickListeners, 100);
};

console.log('✅ Ticket interactions loaded');
