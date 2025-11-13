// Violations Management System

// Violation categories and rules database
let violationCategories = [];
let violationRules = [];

// Initialize default categories and rules
function initializeViolationRules() {
    const storedCategories = localStorage.getItem('violationCategories');
    const storedRules = localStorage.getItem('violationRules');
    
    if (!storedCategories) {
        violationCategories = [
            { id: 'parking', name: 'Parking Violations', color: '#ff8c00' },
            { id: 'pets', name: 'Pet Violations', color: '#8b4513' },
            { id: 'noise', name: 'Noise Violations', color: '#d13438' },
            { id: 'property', name: 'Property Maintenance', color: '#ffaa44' },
            { id: 'common-areas', name: 'Common Areas', color: '#0078d4' },
            { id: 'architectural', name: 'Architectural Modifications', color: '#107c10' },
            { id: 'garbage', name: 'Garbage/Trash', color: '#605e5c' },
            { id: 'other', name: 'Other Violations', color: '#50e6ff' }
        ];
        localStorage.setItem('violationCategories', JSON.stringify(violationCategories));
    } else {
        violationCategories = JSON.parse(storedCategories);
    }
    
    if (!storedRules) {
        violationRules = [
            // Parking
            { id: 'p1', category: 'parking', rule: 'Parking in fire lane', description: 'Vehicle parked in designated fire lane area' },
            { id: 'p2', category: 'parking', rule: 'Parking in reserved spot', description: 'Vehicle parked in reserved parking space without authorization' },
            { id: 'p3', category: 'parking', rule: 'Expired vehicle registration', description: 'Vehicle with expired registration tags displayed' },
            { id: 'p4', category: 'parking', rule: 'Unauthorized parking', description: 'Parking in areas not designated for parking' },
            { id: 'p5', category: 'parking', rule: 'Blocking driveway', description: 'Vehicle blocking access to driveways or garages' },
            
            // Pets
            { id: 'pet1', category: 'pets', rule: 'Unleashed pet in common area', description: 'Pet not on leash in common areas' },
            { id: 'pet2', category: 'pets', rule: 'Pet waste not cleaned', description: 'Failure to clean up after pet' },
            { id: 'pet3', category: 'pets', rule: 'Excessive pet noise', description: 'Pet creating excessive noise disturbance' },
            { id: 'pet4', category: 'pets', rule: 'Unauthorized pet', description: 'Pet kept without proper authorization or exceeds size/breed restrictions' },
            
            // Noise
            { id: 'n1', category: 'noise', rule: 'Excessive noise after quiet hours', description: 'Noise disturbance after designated quiet hours' },
            { id: 'n2', category: 'noise', rule: 'Construction noise violation', description: 'Construction or renovation work during restricted hours' },
            { id: 'n3', category: 'noise', rule: 'Loud music', description: 'Excessive volume from music or entertainment systems' },
            
            // Property Maintenance
            { id: 'pm1', category: 'property', rule: 'Unmaintained landscaping', description: 'Failure to maintain landscaping per community standards' },
            { id: 'pm2', category: 'property', rule: 'Exterior paint/condition', description: 'Deteriorated exterior paint or property condition' },
            { id: 'pm3', category: 'property', rule: 'Debris/clutter visible', description: 'Visible debris, clutter, or items stored inappropriately' },
            { id: 'pm4', category: 'property', rule: 'Fence/gate disrepair', description: 'Damaged or unmaintained fencing or gates' },
            
            // Common Areas
            { id: 'ca1', category: 'common-areas', rule: 'Items left in common area', description: 'Personal items left in hallways, lobbies, or other common areas' },
            { id: 'ca2', category: 'common-areas', rule: 'Misuse of amenities', description: 'Improper use of pool, gym, or other community amenities' },
            { id: 'ca3', category: 'common-areas', rule: 'Damage to common property', description: 'Damage to common area property or facilities' },
            
            // Architectural
            { id: 'arch1', category: 'architectural', rule: 'Unauthorized modification', description: 'Structural or exterior modification without HOA approval' },
            { id: 'arch2', category: 'architectural', rule: 'Unapproved paint color', description: 'Exterior paint color not approved by architectural committee' },
            { id: 'arch3', category: 'architectural', rule: 'Unauthorized signage', description: 'Signs, banners, or displays not in compliance with guidelines' },
            
            // Garbage
            { id: 'g1', category: 'garbage', rule: 'Trash cans visible', description: 'Trash containers visible from street on non-collection days' },
            { id: 'g2', category: 'garbage', rule: 'Improper waste disposal', description: 'Waste not properly contained or disposed of' },
            { id: 'g3', category: 'garbage', rule: 'Trash area misuse', description: 'Improper use of designated trash disposal areas' }
        ];
        localStorage.setItem('violationRules', JSON.stringify(violationRules));
    } else {
        violationRules = JSON.parse(storedRules);
    }
}

// Get violations from localStorage
function getViolations() {
    return JSON.parse(localStorage.getItem('violations') || '[]');
}

// Save violations
function saveViolations(violations) {
    localStorage.setItem('violations', JSON.stringify(violations));
}

// Generate violation ID
function generateViolationId() {
    const violations = getViolations();
    const lastId = violations.length > 0 ? 
        Math.max(...violations.map(v => parseInt(v.id.replace('VIO-', '')))) : 0;
    return `VIO-${String(lastId + 1).padStart(5, '0')}`;
}

// Load violations to dashboard
function loadViolations() {
    const violations = getViolations();
    const violationsList = document.getElementById('violationsList');
    
    if (!violationsList) return;
    
    if (violations.length === 0) {
        violationsList.innerHTML = `
            <div class="empty-state">
                <h3>No violations yet</h3>
                <p>Create your first violation notice to get started</p>
            </div>
        `;
        updateViolationStats();
        return;
    }
    
    // Sort by date (newest first)
    violations.sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate));
    
    violationsList.innerHTML = violations.map(violation => createViolationCard(violation)).join('');
    
    // Add click listeners
    document.querySelectorAll('.violation-card').forEach(card => {
        card.addEventListener('click', () => openViolationDetail(card.dataset.violationId));
    });
    
    updateViolationStats();
}

// Create violation card HTML
function createViolationCard(violation) {
    const statusClass = violation.status.replace('-notice', '-notice');
    const createdDate = new Date(violation.createdDate).toLocaleDateString();
    const deadline = new Date(violation.deadline);
    const now = new Date();
    const isOverdue = deadline < now && violation.status !== 'resolved';
    
    return `
        <div class="violation-card ${statusClass}" data-violation-id="${violation.id}">
            <div class="violation-header-row">
                <div class="violation-info">
                    <h3>${violation.homeownerName} - Unit ${violation.unit}</h3>
                    <p>${violation.association}</p>
                </div>
                <div class="violation-badges">
                    <span class="badge status-badge ${violation.status}">${violation.status.replace('-', ' ').toUpperCase()}</span>
                    <span class="badge priority-badge ${violation.category}">${violation.category}</span>
                </div>
            </div>
            
            <div class="violation-content">
                <p>${violation.description}</p>
                
                <div class="violation-rules">
                    <h4>Violated Rules:</h4>
                    <ul>
                        ${violation.rules.map(rule => `<li>${rule}</li>`).join('')}
                    </ul>
                </div>
            </div>
            
            <div class="violation-meta">
                <div class="violation-meta-item">
                    <span>📅</span>
                    <span>Created: ${createdDate}</span>
                </div>
                <div class="violation-meta-item">
                    <span>⏰</span>
                    <span>Deadline: ${deadline.toLocaleDateString()}</span>
                </div>
                ${isOverdue ? '<span class="deadline-badge overdue">OVERDUE</span>' : ''}
                <div class="violation-meta-item">
                    <span>📧</span>
                    <span>${violation.email}</span>
                </div>
            </div>
        </div>
    `;
}

// Update violation statistics
function updateViolationStats() {
    const violations = getViolations();
    
    const firstNotice = violations.filter(v => v.status === '1st-notice').length;
    const secondNotice = violations.filter(v => v.status === '2nd-notice').length;
    const thirdNotice = violations.filter(v => v.status === '3rd-notice').length;
    const fees = violations.filter(v => v.status === 'fees').length;
    const resolved = violations.filter(v => v.status === 'resolved').length;
    
    const firstEl = document.getElementById('firstNoticeCount');
    const secondEl = document.getElementById('secondNoticeCount');
    const thirdEl = document.getElementById('thirdNoticeCount');
    const feesEl = document.getElementById('feesCount');
    const resolvedEl = document.getElementById('resolvedViolationsCount');
    
    if (firstEl) firstEl.textContent = firstNotice;
    if (secondEl) secondEl.textContent = secondNotice;
    if (thirdEl) thirdEl.textContent = thirdNotice;
    if (feesEl) feesEl.textContent = fees;
    if (resolvedEl) resolvedEl.textContent = resolved;
}

// Open violation detail
function openViolationDetail(violationId) {
    alert(`Violation detail view coming soon! Violation ID: ${violationId}`);
}

// Generate PDF for violation
async function generateViolationPDF(violation) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Set up document
    const margin = 20;
    const pageWidth = doc.internal.pageSize.width;
    let yPos = margin;
    
    // Header - LJ Services Logo/Name
    doc.setFontSize(20);
    doc.setTextColor(0, 120, 212);
    doc.text('LJ SERVICES GROUP', margin, yPos);
    yPos += 10;
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text('Property Management Services', margin, yPos);
    yPos += 15;
    
    // Date
    doc.setTextColor(0);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, margin, yPos);
    yPos += 10;
    
    // Homeowner info
    doc.setFontSize(12);
    doc.text(`${violation.homeownerName}`, margin, yPos);
    yPos += 7;
    doc.text(`Unit: ${violation.unit}`, margin, yPos);
    yPos += 7;
    doc.text(`${violation.association}`, margin, yPos);
    yPos += 7;
    doc.text(`Email: ${violation.email}`, margin, yPos);
    yPos += 15;
    
    // Notice level title
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    let noticeTitle = '';
    switch(violation.status) {
    case '1st-notice':
        noticeTitle = 'FIRST NOTICE OF VIOLATION';
        break;
    case '2nd-notice':
        noticeTitle = 'SECOND NOTICE OF VIOLATION';
        break;
    case '3rd-notice':
        noticeTitle = 'FINAL NOTICE - HEARING REQUIRED';
        break;
    case 'fees':
        noticeTitle = 'NOTICE OF FEES - NON-COMPLIANCE';
        break;
}
    doc.text(noticeTitle, margin, yPos);
    yPos += 10;
    
    doc.setFont(undefined, 'normal');
    doc.setFontSize(11);
    
    // Violation ID
    doc.text(`Violation ID: ${violation.id}`, margin, yPos);
    yPos += 10;
    
    // Introduction
    const intro = `Dear ${violation.homeownerName},\n\nThis letter serves as ${violation.status === '3rd-notice' ? 'a final' : 'a'} notice regarding a violation of the community rules and regulations at ${violation.association}.`;
    const splitIntro = doc.splitTextToSize(intro, pageWidth - 2 * margin);
    doc.text(splitIntro, margin, yPos);
    yPos += splitIntro.length * 5 + 10;
    
    // Violation details
    doc.setFont(undefined, 'bold');
    doc.text('Violation Details:', margin, yPos);
    yPos += 7;
    doc.setFont(undefined, 'normal');
    
    doc.text(`Date Observed: ${new Date(violation.dateObserved).toLocaleDateString()}`, margin + 5, yPos);
    yPos += 7;
    doc.text(`Category: ${violation.category}`, margin + 5, yPos);
    yPos += 10;
    
    // Rules violated
    doc.setFont(undefined, 'bold');
    doc.text('Rules Violated:', margin, yPos);
    yPos += 7;
    doc.setFont(undefined, 'normal');
    
    violation.rules.forEach((rule, index) => {
        const ruleText = `${index + 1}. ${rule}`;
        const splitRule = doc.splitTextToSize(ruleText, pageWidth - 2 * margin - 10);
        doc.text(splitRule, margin + 5, yPos);
        yPos += splitRule.length * 5 + 2;
    });
    yPos += 5;
    
    // Description
    doc.setFont(undefined, 'bold');
    doc.text('Description:', margin, yPos);
    yPos += 7;
    doc.setFont(undefined, 'normal');
    
    const splitDesc = doc.splitTextToSize(violation.description, pageWidth - 2 * margin);
    doc.text(splitDesc, margin, yPos);
    yPos += splitDesc.length * 5 + 10;
    
    // Compliance deadline
    doc.setFont(undefined, 'bold');
    doc.text(`Compliance Deadline: ${new Date(violation.deadline).toLocaleDateString()}`, margin, yPos);
    yPos += 10;
    doc.setFont(undefined, 'normal');
    
    // Notice-specific content
    if (violation.status === '3rd-notice') {
        const hearingText = `As this is your third notice, you are required to attend a hearing with the Board of Directors. Failure to comply by the deadline will result in fines as specified in the community bylaws.`;
        const splitHearing = doc.splitTextToSize(hearingText, pageWidth - 2 * margin);
        doc.text(splitHearing, margin, yPos);
        yPos += splitHearing.length * 5 + 10;
        
        doc.setFont(undefined, 'bold');
        doc.text('FINES WILL BE IMPOSED IF NOT RESOLVED', margin, yPos);
        yPos += 10;
        doc.setFont(undefined, 'normal');
    }
    
    // Closing
    const closing = `Please address this matter by the compliance deadline. If you have any questions or need clarification, please contact our office.\n\nThank you for your cooperation in maintaining our community standards.`;
    const splitClosing = doc.splitTextToSize(closing, pageWidth - 2 * margin);
    doc.text(splitClosing, margin, yPos);
    yPos += splitClosing.length * 5 + 15;
    
    // Signature
    doc.text('Sincerely,', margin, yPos);
    yPos += 10;
    doc.setFont(undefined, 'bold');
    doc.text('LJ Services Group', margin, yPos);
    yPos += 5;
    doc.setFont(undefined, 'normal');
    doc.setFontSize(9);
    doc.text('Property Management', margin, yPos);
    
    // Save PDF
    const filename = `Violation_${violation.id}_${violation.homeownerName.replace(/\s+/g, '_')}.pdf`;
    doc.save(filename);
    
    return filename;
}

// Initialize violations system
initializeViolationRules();
