// PDF Generator for LJ Services Group
console.log('✅ PDF Generator loaded');

// Use external logo URL instead of base64 to avoid syntax errors
const LJ_LOGO_URL = 'https://i.imgur.com/placeholder-logo.png'; // Replace with actual hosted logo

// Generate Ticket PDF
function generateTicketPDF(ticket) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Add logo
    // doc.addImage(LJ_LOGO_URL, 'PNG', 15, 10, 30, 30);
    
    // Header
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('LJ Services Group', 105, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('Professional Property Management', 105, 27, { align: 'center' });
    
    // Ticket Title
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(`Ticket #${ticket.id}`, 15, 50);
    
    // Ticket Details
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    
    const details = [
        ['Property:', ticket.property || 'N/A'],
        ['Unit:', ticket.unit || 'N/A'],
        ['Category:', ticket.category || 'N/A'],
        ['Priority:', ticket.priority || 'Normal'],
        ['Status:', ticket.status || 'Open'],
        ['Created:', ticket.createdAt ? new Date(ticket.createdAt).toLocaleString() : 'N/A'],
        ['Created By:', ticket.createdBy || 'N/A']
    ];
    
    let yPos = 65;
    details.forEach(([label, value]) => {
        doc.setFont('helvetica', 'bold');
        doc.text(label, 15, yPos);
        doc.setFont('helvetica', 'normal');
        doc.text(value, 60, yPos);
        yPos += 7;
    });
    
    // Description
    yPos += 5;
    doc.setFont('helvetica', 'bold');
    doc.text('Description:', 15, yPos);
    yPos += 7;
    doc.setFont('helvetica', 'normal');
    
    const description = ticket.description || 'No description provided';
    const splitDescription = doc.splitTextToSize(description, 180);
    doc.text(splitDescription, 15, yPos);
    
    yPos += splitDescription.length * 7 + 10;
    
    // Notes
    if (ticket.notes && ticket.notes.length > 0) {
        doc.setFont('helvetica', 'bold');
        doc.text('Notes:', 15, yPos);
        yPos += 7;
        
        ticket.notes.forEach((note, index) => {
            doc.setFont('helvetica', 'normal');
            const noteText = `${index + 1}. ${note.text} - ${note.author} (${new Date(note.timestamp).toLocaleDateString()})`;
            const splitNote = doc.splitTextToSize(noteText, 180);
            doc.text(splitNote, 15, yPos);
            yPos += splitNote.length * 7 + 3;
            
            if (yPos > 270) {
                doc.addPage();
                yPos = 20;
            }
        });
    }
    
    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.text(`Generated: ${new Date().toLocaleString()}`, 15, 285);
        doc.text(`Page ${i} of ${pageCount}`, 195, 285, { align: 'right' });
    }
    
    // Save PDF
    const fileName = `Ticket_${ticket.id}_${Date.now()}.pdf`;
    doc.save(fileName);
    
    console.log(`✅ PDF generated: ${fileName}`);
}

// Generate Work Order PDF
function generateWorkOrderPDF(workOrder) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('LJ Services Group', 105, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('Work Order', 105, 27, { align: 'center' });
    
    // Work Order Title
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(`Work Order #${workOrder.id}`, 15, 50);
    
    // Details
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    
    const details = [
        ['Property:', workOrder.property || 'N/A'],
        ['Unit:', workOrder.unit || 'N/A'],
        ['Category:', workOrder.category || 'N/A'],
        ['Priority:', workOrder.priority || 'Normal'],
        ['Status:', workOrder.status || 'Pending'],
        ['Assigned To:', workOrder.assignedTo || 'Unassigned'],
        ['Created:', workOrder.createdAt ? new Date(workOrder.createdAt).toLocaleString() : 'N/A'],
        ['Due Date:', workOrder.dueDate ? new Date(workOrder.dueDate).toLocaleDateString() : 'N/A']
    ];
    
    let yPos = 65;
    details.forEach(([label, value]) => {
        doc.setFont('helvetica', 'bold');
        doc.text(label, 15, yPos);
        doc.setFont('helvetica', 'normal');
        doc.text(value, 60, yPos);
        yPos += 7;
    });
    
    // Description
    yPos += 5;
    doc.setFont('helvetica', 'bold');
    doc.text('Description:', 15, yPos);
    yPos += 7;
    doc.setFont('helvetica', 'normal');
    
    const description = workOrder.description || 'No description provided';
    const splitDescription = doc.splitTextToSize(description, 180);
    doc.text(splitDescription, 15, yPos);
    
    // Footer
    doc.setFontSize(9);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 15, 285);
    doc.text('Page 1 of 1', 195, 285, { align: 'right' });
    
    // Save PDF
    const fileName = `WorkOrder_${workOrder.id}_${Date.now()}.pdf`;
    doc.save(fileName);
    
    console.log(`✅ Work Order PDF generated: ${fileName}`);
}

// Generate Violation Notice PDF
function generateViolationPDF(violation) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('LJ Services Group', 105, 20, { align: 'center' });
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.text('VIOLATION NOTICE', 105, 30, { align: 'center' });
    
    // Violation Details
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    
    const details = [
        ['Violation ID:', violation.id || 'N/A'],
        ['Property:', violation.property || 'N/A'],
        ['Unit:', violation.unit || 'N/A'],
        ['Resident:', violation.resident || 'N/A'],
        ['Violation Type:', violation.type || 'N/A'],
        ['Date Issued:', violation.dateIssued ? new Date(violation.dateIssued).toLocaleDateString() : 'N/A'],
        ['Notice Step:', `Step ${violation.noticeStep || 1} of 4`],
        ['Status:', violation.status || 'Open']
    ];
    
    let yPos = 50;
    details.forEach(([label, value]) => {
        doc.setFont('helvetica', 'bold');
        doc.text(label, 15, yPos);
        doc.setFont('helvetica', 'normal');
        doc.text(value, 70, yPos);
        yPos += 7;
    });
    
    // Description
    yPos += 5;
    doc.setFont('helvetica', 'bold');
    doc.text('Violation Description:', 15, yPos);
    yPos += 7;
    doc.setFont('helvetica', 'normal');
    
    const description = violation.description || 'No description provided';
    const splitDescription = doc.splitTextToSize(description, 180);
    doc.text(splitDescription, 15, yPos);
    
    yPos += splitDescription.length * 7 + 10;
    
    // Action Required
    doc.setFont('helvetica', 'bold');
    doc.text('Action Required:', 15, yPos);
    yPos += 7;
    doc.setFont('helvetica', 'normal');
    
    const action = violation.actionRequired || 'Please correct this violation within 7 days.';
    const splitAction = doc.splitTextToSize(action, 180);
    doc.text(splitAction, 15, yPos);
    
    // Warning Box
    yPos += splitAction.length * 7 + 10;
    if (violation.noticeStep >= 3) {
        doc.setDrawColor(255, 0, 0);
        doc.setLineWidth(0.5);
        doc.rect(15, yPos, 180, 20);
        
        doc.setTextColor(255, 0, 0);
        doc.setFont('helvetica', 'bold');
        doc.text('WARNING: Failure to comply may result in fines or legal action.', 105, yPos + 10, { align: 'center' });
        doc.setTextColor(0, 0, 0);
    }
    
    // Footer
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated: ${new Date().toLocaleString()}`, 15, 285);
    doc.text('Page 1 of 1', 195, 285, { align: 'right' });
    
    // Save PDF
    const fileName = `Violation_${violation.id}_Step${violation.noticeStep}_${Date.now()}.pdf`;
    doc.save(fileName);
    
    console.log(`✅ Violation PDF generated: ${fileName}`);
}

// Make functions globally available
window.generateTicketPDF = generateTicketPDF;
window.generateWorkOrderPDF = generateWorkOrderPDF;
window.generateViolationPDF = generateViolationPDF;
