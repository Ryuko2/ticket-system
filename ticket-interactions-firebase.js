// ============================================
// TICKET INTERACTIONS WITH FIREBASE
// Click tickets to view, edit, comment, close
// ============================================

// Open ticket detail modal
async function openTicketDetail(ticketId) {
    const ticket = await getTicketFirebase(ticketId);
    
    if (!ticket) {
        alert('Ticket not found');
        return;
    }
    
    // Create or get detail modal
    let modal = document.getElementById('ticketDetailModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'ticketDetailModal';
        modal.className = 'modal';
        document.body.appendChild(modal);
    }
    
    const updates = ticket.updates || [];
    
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 800px;">
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
                        <span>${ticket.createdDate ? new Date(ticket.createdDate).toLocaleString() : 'N/A'}</span>
                    </div>
                    <div class="info-row">
                        <label>Created By:</label>
                        <span>${ticket.createdBy || 'Unknown'}</span>
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
                    <h4>Quick Actions</h4>
                    <div class="action-buttons">
                        <select id="updateStatus-${ticket.id}" class="filter-select">
                            <option value="open" ${ticket.status === 'open' ? 'selected' : ''}>Open</option>
                            <option value="in-progress" ${ticket.status === 'in-progress' ? 'selected' : ''}>In Progress</option>
                            <option value="completed" ${ticket.status === 'completed' ? 'selected' : ''}>Completed</option>
                        </select>
                        <button class="action-btn primary" onclick="updateTicketStatusClick('${ticket.id}')">
                            Update Status
                        </button>
                        <button class="action-btn tertiary" onclick="deleteTicketClick('${ticket.id}')">
                            Delete Ticket
                        </button>
                    </div>
                </div>
                
                ${updates.length > 0 ? `
                <div class="ticket-updates">
                    <h4>Update History (${updates.length})</h4>
                    ${updates.map(update => `
                        <div class="update-item">
                            <div class="update-header">
                                <strong>${update.user}</strong>
                                <span>${new Date(update.date).toLocaleString()}</span>
                            </div>
                            <p>${update.text}</p>
                        </div>
                    `).join('')}
                </div>
                ` : '<p style="color: var(--text-secondary); margin: 1rem 0;">No updates yet</p>'}
                
                <div class="add-update">
                    <h4>Add Comment/Update</h4>
                    <textarea id="newUpdate-${ticket.id}" rows="3" class="filter-input" placeholder="Add a comment or update..."></textarea>
                    <button class="action-btn primary" onclick="addTicketUpdateClick('${ticket.id}')">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" style="width: 20px; height: 20px;">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                        Add Comment
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

async function updateTicketStatusClick(ticketId) {
    const select = document.getElementById(`updateStatus-${ticketId}`);
    if (!select) return;
    
    const newStatus = select.value;
    const userName = window.currentUser?.name || window.currentUser?.email || 'User';
    
    try {
        await updateTicketStatusFirebase(ticketId, newStatus, userName);
        closeTicketDetail();
    } catch (error) {
        console.error('Error updating status:', error);
        alert('Error updating ticket status. Please try again.');
    }
}

async function addTicketUpdateClick(ticketId) {
    const textarea = document.getElementById(`newUpdate-${ticketId}`);
    if (!textarea) return;
    
    const updateText = textarea.value.trim();
    
    if (!updateText) {
        alert('Please enter a comment');
        return;
    }
    
    const userName = window.currentUser?.name || window.currentUser?.email || 'User';
    
    try {
        await addTicketUpdateFirebase(ticketId, updateText, userName);
        
        // Refresh the modal
        setTimeout(() => {
            openTicketDetail(ticketId);
        }, 500);
    } catch (error) {
        console.error('Error adding update:', error);
        alert('Error adding comment. Please try again.');
    }
}

async function deleteTicketClick(ticketId) {
    if (!confirm('Are you sure you want to delete this ticket? This cannot be undone.')) {
        return;
    }
    
    try {
        await deleteTicketFirebase(ticketId);
        closeTicketDetail();
    } catch (error) {
        console.error('Error deleting ticket:', error);
        alert('Error deleting ticket. Please try again.');
    }
}

// Make ticket cards clickable
function attachTicketClickListeners() {
    document.querySelectorAll('.ticket-card').forEach(card => {
        if (!card.dataset.listenerAttached) {
            card.addEventListener('click', function(e) {
                // Don't trigger if clicking a button inside the card
                if (e.target.tagName === 'BUTTON') return;
                
                const ticketId = this.dataset.ticketId;
                if (ticketId) {
                    openTicketDetail(ticketId);
                }
            });
            card.dataset.listenerAttached = 'true';
            card.style.cursor = 'pointer';
            card.style.transition = 'all 0.2s ease';
            
            // Add hover effect
            card.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-4px)';
                this.style.boxShadow = '0 8px 16px rgba(0,0,0,0.1)';
            });
            
            card.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0)';
                this.style.boxShadow = '';
            });
        }
    });
}

// Auto-attach listeners when tickets are rendered
const observer = new MutationObserver(() => {
    attachTicketClickListeners();
});

document.addEventListener('DOMContentLoaded', () => {
    const ticketsList = document.getElementById('ticketsList');
    if (ticketsList) {
        observer.observe(ticketsList, { childList: true, subtree: true });
    }
    
    // Initial attach
    attachTicketClickListeners();
});

console.log('✅ Ticket interactions (Firebase) loaded');
