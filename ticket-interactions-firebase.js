// Ticket Interactions (Firebase) for LJ Services Group
console.log('✅ Ticket interactions (Firebase) loaded');

// Open ticket detail modal
function openTicketDetail(ticketId) {
    const modal = document.getElementById('ticketDetailModal');
    if (!modal) {
        console.error('❌ Modal not found');
        return;
    }

    // Get ticket from Firebase
    const ticketsRef = window.firebaseDatabase ? 
        window.firebase.database().ref('tickets/' + ticketId) : null;
    
    if (!ticketsRef) {
        console.error('❌ Firebase not initialized');
        return;
    }

    ticketsRef.once('value').then((snapshot) => {
        const ticket = snapshot.val();
        if (!ticket) {
            console.error('❌ Ticket not found:', ticketId);
            return;
        }

        // Add ID to ticket object
        ticket.id = ticketId;

        // Render modal content
        renderTicketModal(modal, ticket);

        // Show modal with animation
        modal.style.display = 'flex';
        setTimeout(() => {
            modal.classList.add('active');
            modal.querySelector('.modal-content').classList.add('scale-100', 'opacity-100');
        }, 10);
    }).catch((error) => {
        console.error('❌ Error fetching ticket:', error);
    });
}

// Render ticket modal content
function renderTicketModal(modal, ticket) {
    const updates = ticket.updates || [];
    const statusColors = {
        'open': 'bg-blue-100 text-blue-800',
        'in-progress': 'bg-yellow-100 text-yellow-800',
        'completed': 'bg-green-100 text-green-800',
        'closed': 'bg-gray-100 text-gray-800'
    };

    const priorityColors = {
        'high': 'bg-red-100 text-red-800',
        'medium': 'bg-yellow-100 text-yellow-800',
        'low': 'bg-green-100 text-green-800'
    };

    const modalContent = modal.querySelector('.modal-content');
    modalContent.innerHTML = `
        <div class="modal-header">
            <div>
                <h2 class="modal-title transition-colors duration-300">${ticket.title || 'Untitled Ticket'}</h2>
                <div class="modal-badges" style="margin-top: 0.5rem;">
                    <span class="badge ${statusColors[ticket.status] || statusColors['open']} transition-all duration-300 hover:scale-105">
                        ${(ticket.status || 'open').replace('-', ' ').toUpperCase()}
                    </span>
                    <span class="badge ${priorityColors[ticket.priority] || priorityColors['low']} transition-all duration-300 hover:scale-105">
                        ${(ticket.priority || 'low').toUpperCase()} Priority
                    </span>
                </div>
            </div>
            <button class="modal-close transition-all duration-300 hover:bg-gray-100 hover:rotate-90 active:scale-95" onclick="closeTicketDetail()">
                <i class="fas fa-times"></i>
            </button>
        </div>
        
        <div class="modal-body">
            <div class="ticket-info-grid">
                <div class="info-item">
                    <label><i class="fas fa-building"></i> Property</label>
                    <p>${ticket.property || 'N/A'}</p>
                </div>
                <div class="info-item">
                    <label><i class="fas fa-door-open"></i> Unit</label>
                    <p>${ticket.unit || 'N/A'}</p>
                </div>
                <div class="info-item">
                    <label><i class="fas fa-tag"></i> Category</label>
                    <p>${ticket.category || 'N/A'}</p>
                </div>
                <div class="info-item">
                    <label><i class="fas fa-user"></i> Assigned To</label>
                    <p>${ticket.assignedTo || 'Unassigned'}</p>
                </div>
                <div class="info-item">
                    <label><i class="fas fa-calendar"></i> Created</label>
                    <p>${ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString() : 'N/A'}</p>
                </div>
                <div class="info-item">
                    <label><i class="fas fa-user-circle"></i> Created By</label>
                    <p>${ticket.createdBy || 'Unknown'}</p>
                </div>
            </div>
            
            <div class="ticket-description">
                <h4><i class="fas fa-align-left"></i> Description</h4>
                <p>${ticket.description || 'No description provided'}</p>
            </div>
            
            <div class="ticket-actions">
                <h4><i class="fas fa-tasks"></i> Actions</h4>
                <div class="action-buttons">
                    <select id="updateStatus-${ticket.id}" class="status-select transition-all duration-300 focus:ring-2 focus:ring-blue-500">
                        <option value="open" ${ticket.status === 'open' ? 'selected' : ''}>Open</option>
                        <option value="in-progress" ${ticket.status === 'in-progress' ? 'selected' : ''}>In Progress</option>
                        <option value="completed" ${ticket.status === 'completed' ? 'selected' : ''}>Completed</option>
                        <option value="closed" ${ticket.status === 'closed' ? 'selected' : ''}>Closed</option>
                    </select>
                    <button class="action-btn primary transition-all duration-300 hover:shadow-lg hover:scale-105 active:scale-95" onclick="updateTicketStatusClick('${ticket.id}')">
                        <i class="fas fa-sync-alt"></i> Update Status
                    </button>
                    <button class="action-btn danger transition-all duration-300 hover:shadow-lg hover:scale-105 active:scale-95" onclick="deleteTicketClick('${ticket.id}')">
                        <i class="fas fa-trash"></i> Delete Ticket
                    </button>
                </div>
            </div>
            
            ${updates.length > 0 ? `
            <div class="ticket-updates">
                <h4><i class="fas fa-comments"></i> Update History (${updates.length})</h4>
                <div class="updates-list">
                    ${updates.map((update, index) => `
                        <div class="update-item transition-all duration-300 hover:shadow-md hover:translate-x-1" style="animation: slideIn 0.3s ease-out ${index * 0.1}s both;">
                            <div class="update-header">
                                <div class="update-user">
                                    <i class="fas fa-user-circle"></i>
                                    <strong>${update.user || 'Unknown'}</strong>
                                </div>
                                <span class="update-time">${update.date ? new Date(update.date).toLocaleString() : 'Unknown time'}</span>
                            </div>
                            <p class="update-text">${update.text || ''}</p>
                        </div>
                    `).join('')}
                </div>
            </div>
            ` : '<p style="color: #6b7280; margin: 1rem 0; font-style: italic;">No updates yet. Be the first to add a comment!</p>'}
            
            <div class="add-update">
                <h4><i class="fas fa-comment-medical"></i> Add Comment/Update</h4>
                <textarea 
                    id="newUpdate-${ticket.id}" 
                    rows="3" 
                    class="comment-input transition-all duration-300 focus:ring-2 focus:ring-blue-500 focus:shadow-lg" 
                    placeholder="Add a comment, update, or note about this ticket..."></textarea>
                <button class="action-btn primary transition-all duration-300 hover:shadow-lg hover:scale-105 active:scale-95" onclick="addTicketUpdateClick('${ticket.id}')">
                    <i class="fas fa-paper-plane"></i> Add Comment
                </button>
            </div>
        </div>
        
        <style>
            @keyframes slideIn {
                from {
                    opacity: 0;
                    transform: translateX(-10px);
                }
                to {
                    opacity: 1;
                    transform: translateX(0);
                }
            }
        </style>
    `;
}

// Close ticket detail modal
function closeTicketDetail() {
    const modal = document.getElementById('ticketDetailModal');
    if (!modal) return;

    // Animate out
    modal.classList.remove('active');
    modal.querySelector('.modal-content').classList.remove('scale-100', 'opacity-100');
    
    setTimeout(() => {
        modal.style.display = 'none';
    }, 300);
}

// Update ticket status
async function updateTicketStatusClick(ticketId) {
    const select = document.getElementById(`updateStatus-${ticketId}`);
    if (!select) {
        console.error('❌ Status select not found');
        return;
    }

    const newStatus = select.value;
    const userName = window.currentUser?.name || window.currentUser?.email || 'User';

    // Disable button during update
    const btn = event.target;
    const originalHTML = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Updating...';

    try {
        await updateTicketStatusFirebase(ticketId, newStatus, userName);
        
        // Success feedback
        btn.innerHTML = '<i class="fas fa-check"></i> Updated!';
        btn.classList.add('bg-green-500');
        
        setTimeout(() => {
            closeTicketDetail();
        }, 1000);
    } catch (error) {
        console.error('❌ Error updating status:', error);
        alert('Error updating ticket status. Please try again.');
        btn.disabled = false;
        btn.innerHTML = originalHTML;
    }
}

// Update ticket status in Firebase
async function updateTicketStatusFirebase(ticketId, newStatus, userName) {
    const ticketRef = window.firebase.database().ref('tickets/' + ticketId);
    
    // Get current ticket
    const snapshot = await ticketRef.once('value');
    const ticket = snapshot.val();
    
    if (!ticket) {
        throw new Error('Ticket not found');
    }

    // Update status and add update entry
    const updates = ticket.updates || [];
    updates.push({
        date: new Date().toISOString(),
        user: userName,
        text: `Status changed to ${newStatus.replace('-', ' ').toUpperCase()}`
    });

    await ticketRef.update({
        status: newStatus,
        updatedAt: new Date().toISOString(),
        updates: updates
    });

    console.log('✅ Ticket status updated:', ticketId, newStatus);
}

// Add comment/update to ticket
async function addTicketUpdateClick(ticketId) {
    const textarea = document.getElementById(`newUpdate-${ticketId}`);
    if (!textarea) {
        console.error('❌ Textarea not found');
        return;
    }

    const updateText = textarea.value.trim();
    if (!updateText) {
        alert('Please enter a comment before adding.');
        return;
    }

    const userName = window.currentUser?.name || window.currentUser?.email || 'User';

    // Disable button during update
    const btn = event.target;
    const originalHTML = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Adding...';

    try {
        const ticketRef = window.firebase.database().ref('tickets/' + ticketId);
        
        // Get current ticket
        const snapshot = await ticketRef.once('value');
        const ticket = snapshot.val();
        
        if (!ticket) {
            throw new Error('Ticket not found');
        }

        // Add new update
        const updates = ticket.updates || [];
        updates.push({
            date: new Date().toISOString(),
            user: userName,
            text: updateText
        });

        await ticketRef.update({
            updates: updates,
            updatedAt: new Date().toISOString()
        });

        console.log('✅ Comment added to ticket:', ticketId);

        // Clear textarea
        textarea.value = '';

        // Success feedback
        btn.innerHTML = '<i class="fas fa-check"></i> Added!';
        btn.classList.add('bg-green-500');
        
        // Refresh modal content
        setTimeout(() => {
            openTicketDetail(ticketId);
        }, 500);

    } catch (error) {
        console.error('❌ Error adding comment:', error);
        alert('Error adding comment. Please try again.');
        btn.disabled = false;
        btn.innerHTML = originalHTML;
    }
}

// Delete ticket
async function deleteTicketClick(ticketId) {
    const confirmed = confirm('Are you sure you want to delete this ticket? This action cannot be undone.');
    
    if (!confirmed) return;

    // Disable button during delete
    const btn = event.target;
    const originalHTML = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Deleting...';

    try {
        const ticketRef = window.firebase.database().ref('tickets/' + ticketId);
        await ticketRef.remove();

        console.log('✅ Ticket deleted:', ticketId);

        // Close modal
        closeTicketDetail();

        // Reload tickets list
        if (window.loadTickets) {
            window.loadTickets();
        }

    } catch (error) {
        console.error('❌ Error deleting ticket:', error);
        alert('Error deleting ticket. Please try again.');
        btn.disabled = false;
        btn.innerHTML = originalHTML;
    }
}

// Close modal when clicking outside
document.addEventListener('click', function(e) {
    const modal = document.getElementById('ticketDetailModal');
    if (e.target === modal) {
        closeTicketDetail();
    }
});

// Close modal with Escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeTicketDetail();
    }
});

// Make functions globally available
window.openTicketDetail = openTicketDetail;
window.closeTicketDetail = closeTicketDetail;
window.updateTicketStatusClick = updateTicketStatusClick;
window.addTicketUpdateClick = addTicketUpdateClick;
window.deleteTicketClick = deleteTicketClick;

console.log('✅ Ticket interactions initialized with smooth animations');
