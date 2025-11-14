// ============================================
// PDF GENERATOR WITH PREVIEW
// Generate PDFs for work orders and violations
// Requires jsPDF library
// ============================================

// Load jsPDF from CDN
const loadJsPDF = () => {
    return new Promise((resolve, reject) => {
        if (window.jspdf) {
            resolve(window.jspdf.jsPDF);
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
        script.onload = () => resolve(window.jspdf.jsPDF);
        script.onerror = reject;
        document.head.appendChild(script);
    });
};

// Generate Work Order PDF
async function generateWorkOrderPDF(workOrder) {
    try {
        const jsPDF = await loadJsPDF();
        const doc = new jsPDF();

        // Header
        doc.setFillColor(102, 126, 234);
        doc.rect(0, 0, 210, 40, 'F');
        
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(24);
        doc.text('LJ SERVICES GROUP', 105, 20, { align: 'center' });
        doc.setFontSize(12);
        doc.text('Professional Property Management', 105, 30, { align: 'center' });

        // Work Order Title
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(18);
        doc.text(`WORK ORDER: ${workOrder.id}`, 20, 55);

        // Work Order Details
        doc.setFontSize(11);
        let y = 70;

        const addLine = (label, value) => {
            doc.setFont(undefined, 'bold');
            doc.text(label + ':', 20, y);
            doc.setFont(undefined, 'normal');
            doc.text(String(value || 'N/A'), 80, y);
            y += 8;
        };

        addLine('Category', workOrder.category);
        addLine('Task', workOrder.task);
        addLine('Association', workOrder.association);
        addLine('Location', workOrder.location);
        addLine('Priority', workOrder.priority.toUpperCase());
        addLine('Status', workOrder.status.toUpperCase());
        
        if (workOrder.vendor) {
            addLine('Assigned Vendor', workOrder.vendor);
            if (workOrder.vendorEmail) {
                addLine('Vendor Email', workOrder.vendorEmail);
            }
        }
        
        if (workOrder.estimatedCost) {
            addLine('Estimated Cost', '$' + workOrder.estimatedCost);
        }

        addLine('Created Date', new Date(workOrder.createdDate).toLocaleString());
        addLine('Created By', workOrder.createdBy);

        // Description
        y += 5;
        doc.setFont(undefined, 'bold');
        doc.text('Description:', 20, y);
        y += 8;
        doc.setFont(undefined, 'normal');
        
        const description = workOrder.description || 'No description provided';
        const splitDescription = doc.splitTextToSize(description, 170);
        doc.text(splitDescription, 20, y);
        y += (splitDescription.length * 6) + 10;

        // Updates section
        if (workOrder.updates && workOrder.updates.length > 0) {
            doc.setFont(undefined, 'bold');
            doc.text('Updates:', 20, y);
            y += 8;
            doc.setFont(undefined, 'normal');

            workOrder.updates.forEach(update => {
                const updateText = `${new Date(update.date).toLocaleString()} - ${update.user}: ${update.text}`;
                const splitUpdate = doc.splitTextToSize(updateText, 170);
                doc.text(splitUpdate, 20, y);
                y += (splitUpdate.length * 6) + 5;
            });
        }

        // Footer
        const pageHeight = doc.internal.pageSize.height;
        doc.setFontSize(9);
        doc.setTextColor(128, 128, 128);
        doc.text('LJ Services Group | Miami, FL | Contact: kevin@ljservicesgroup.com', 105, pageHeight - 10, { align: 'center' });

        return doc;
    } catch (error) {
        console.error('Error generating PDF:', error);
        throw error;
    }
}

// Generate Violation PDF
async function generateViolationPDF(violation) {
    try {
        const jsPDF = await loadJsPDF();
        const doc = new jsPDF();

        // Header with warning color
        doc.setFillColor(250, 112, 154);
        doc.rect(0, 0, 210, 40, 'F');
        
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(24);
        doc.text('LJ SERVICES GROUP', 105, 20, { align: 'center' });
        doc.setFontSize(12);
        doc.text('Violation Notice', 105, 30, { align: 'center' });

        // Violation Title
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(18);
        doc.text(`VIOLATION: ${violation.id}`, 20, 55);

        // Violation Details
        doc.setFontSize(11);
        let y = 70;

        const addLine = (label, value) => {
            doc.setFont(undefined, 'bold');
            doc.text(label + ':', 20, y);
            doc.setFont(undefined, 'normal');
            doc.text(String(value || 'N/A'), 80, y);
            y += 8;
        };

        addLine('Category', violation.category);
        addLine('Rule Violated', violation.rule);
        addLine('Association', violation.association);
        addLine('Unit Number', violation.unitNumber);
        addLine('Resident Name', violation.residentName);
        addLine('Severity', violation.severity.toUpperCase());
        addLine('Status', violation.status.toUpperCase());
        addLine('Date Issued', new Date(violation.dateIssued).toLocaleString());
        addLine('Issued By', violation.issuedBy);

        // Description
        y += 5;
        doc.setFont(undefined, 'bold');
        doc.text('Violation Details:', 20, y);
        y += 8;
        doc.setFont(undefined, 'normal');
        
        const description = violation.description || 'No additional details provided';
        const splitDescription = doc.splitTextToSize(description, 170);
        doc.text(splitDescription, 20, y);
        y += (splitDescription.length * 6) + 10;

        // Required Action
        y += 5;
        doc.setFillColor(255, 245, 235);
        doc.rect(15, y - 5, 180, 20, 'F');
        doc.setFont(undefined, 'bold');
        doc.setTextColor(250, 112, 154);
        doc.text('REQUIRED ACTION:', 20, y);
        doc.setFont(undefined, 'normal');
        doc.setTextColor(0, 0, 0);
        y += 8;
        doc.text('Please remedy this violation within 7 days to avoid further action.', 20, y);

        // Footer
        const pageHeight = doc.internal.pageSize.height;
        doc.setFontSize(9);
        doc.setTextColor(128, 128, 128);
        doc.text('LJ Services Group | Miami, FL | Contact: kevin@ljservicesgroup.com', 105, pageHeight - 10, { align: 'center' });

        return doc;
    } catch (error) {
        console.error('Error generating PDF:', error);
        throw error;
    }
}

// Show PDF Preview Modal
function showPDFPreviewModal(pdfDoc, title, type, itemData) {
    // Create preview modal if it doesn't exist
    let modal = document.getElementById('pdfPreviewModal');
    
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'pdfPreviewModal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 800px;">
                <div class="modal-header">
                    <h2 id="pdfPreviewTitle">PDF Preview</h2>
                    <button class="modal-close" onclick="closePDFPreview()">&times;</button>
                </div>
                <div style="padding: 2rem;">
                    <div style="background: #f5f5f5; padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
                        <p style="margin: 0; color: #666;">Preview your PDF before sending to vendor and Linda Johnson</p>
                    </div>
                    <div id="pdfPreviewFrame" style="border: 1px solid #ddd; min-height: 600px; background: white;"></div>
                    <div class="modal-actions" style="margin-top: 1.5rem;">
                        <button class="btn-secondary" onclick="closePDFPreview()">Cancel</button>
                        <button class="btn-secondary" id="downloadPDFBtn">Download PDF</button>
                        <button class="btn-primary" id="sendPDFBtn">Send to Vendor & Linda</button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    // Update title
    document.getElementById('pdfPreviewTitle').textContent = title;

    // Generate PDF preview
    const pdfDataUri = pdfDoc.output('dataurlstring');
    const iframe = document.createElement('iframe');
    iframe.style.width = '100%';
    iframe.style.height = '600px';
    iframe.style.border = 'none';
    iframe.src = pdfDataUri;

    const previewFrame = document.getElementById('pdfPreviewFrame');
    previewFrame.innerHTML = '';
    previewFrame.appendChild(iframe);

    // Setup download button
    document.getElementById('downloadPDFBtn').onclick = () => {
        pdfDoc.save(`${type}-${itemData.id}.pdf`);
    };

    // Setup send button
    document.getElementById('sendPDFBtn').onclick = () => {
        sendPDFToRecipients(pdfDoc, type, itemData);
    };

    // Show modal
    modal.classList.add('active');
    modal.style.display = 'flex';
}

function closePDFPreview() {
    const modal = document.getElementById('pdfPreviewModal');
    if (modal) {
        modal.classList.remove('active');
        modal.style.display = 'none';
    }
}

// Send PDF to vendor and Linda Johnson
async function sendPDFToRecipients(pdfDoc, type, itemData) {
    const pdfBlob = pdfDoc.output('blob');
    const pdfBase64 = pdfDoc.output('datauristring').split(',')[1];

    const recipients = ['linda.johnson@ljservicesgroup.com'];
    
    if (type === 'work-order' && itemData.vendorEmail) {
        recipients.push(itemData.vendorEmail);
    }

    const subject = type === 'work-order' 
        ? `Work Order ${itemData.id} - ${itemData.task}`
        : `Violation Notice ${itemData.id} - ${itemData.category}`;

    const body = type === 'work-order'
        ? `Dear Team,

Please find attached Work Order ${itemData.id} for ${itemData.association}.

Task: ${itemData.task}
Location: ${itemData.location}
Priority: ${itemData.priority}

Please review and take necessary action.

Best regards,
LJ Services Group`
        : `Dear Resident,

Please find attached Violation Notice ${itemData.id} for Unit ${itemData.unitNumber}.

Category: ${itemData.category}
Rule: ${itemData.rule}

Please remedy this violation within 7 days.

Best regards,
LJ Services Group`;

    // Show sending notification
    if (typeof showNotification === 'function') {
        showNotification('Preparing to send email...', 'info');
    }

    // Prepare email data
    const emailData = {
        to: recipients,
        subject: subject,
        body: body,
        attachment: {
            filename: `${type}-${itemData.id}.pdf`,
            content: pdfBase64,
            contentType: 'application/pdf'
        }
    };

    console.log('Email data prepared:', emailData);

    // Close preview modal
    closePDFPreview();

    // Show success notification
    if (typeof showNotification === 'function') {
        showNotification(
            `PDF sent to ${recipients.join(', ')}! (In production, this would send via Microsoft Graph API)`,
            'success'
        );
    }

    // In production, you would call Microsoft Graph API here
    // await sendEmailWithMSAL(emailData);
}

// Work Order PDF Preview
async function showWorkOrderPDFPreview(workOrder) {
    try {
        const doc = await generateWorkOrderPDF(workOrder);
        showPDFPreviewModal(doc, `Work Order ${workOrder.id} - Preview`, 'work-order', workOrder);
    } catch (error) {
        console.error('Error showing work order PDF:', error);
        if (typeof showNotification === 'function') {
            showNotification('Error generating PDF preview', 'error');
        }
    }
}

// Violation PDF Preview
async function showViolationPDFPreview(violation) {
    try {
        const doc = await generateViolationPDF(violation);
        showPDFPreviewModal(doc, `Violation ${violation.id} - Preview`, 'violation', violation);
    } catch (error) {
        console.error('Error showing violation PDF:', error);
        if (typeof showNotification === 'function') {
            showNotification('Error generating PDF preview', 'error');
        }
    }
}

console.log('✅ PDF Generator module loaded');
