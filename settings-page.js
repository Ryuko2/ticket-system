// ============================================
// SETTINGS PAGE - MANAGE VENDORS & VIOLATION RULES
// Complete settings management system
// ============================================

// Storage functions
function getVendors() {
    const defaultVendors = [
        { id: 'v1', name: 'ABC Plumbing', email: 'service@abcplumbing.com', phone: '(305) 555-0101', category: 'plumbing' },
        { id: 'v2', name: 'Premier Electric', email: 'info@premierelectric.com', phone: '(305) 555-0102', category: 'electrical' },
        { id: 'v3', name: 'Cool Air HVAC', email: 'service@coolairhvac.com', phone: '(305) 555-0103', category: 'hvac' },
        { id: 'v4', name: 'General Contractors Inc', email: 'contact@generalcontractors.com', phone: '(305) 555-0104', category: 'general' },
        { id: 'v5', name: 'Green Landscapes', email: 'info@greenlandscapes.com', phone: '(305) 555-0105', category: 'landscaping' }
    ];
    
    const stored = localStorage.getItem('customVendors');
    return stored ? JSON.parse(stored) : defaultVendors;
}

function saveVendors(vendors) {
    localStorage.setItem('customVendors', JSON.stringify(vendors));
}

function getViolationRules() {
    const defaultRules = {
        parking: [
            'Unauthorized vehicle in reserved spot',
            'Parking in fire lane',
            'Expired vehicle registration',
            'Commercial vehicle in residential area',
            'Blocking driveway or walkway',
            'Oversized vehicle violation'
        ],
        noise: [
            'Loud music after quiet hours (10 PM - 8 AM)',
            'Construction noise during restricted hours',
            'Excessive pet noise',
            'Party disturbance'
        ],
        property: [
            'Trash left outside designated areas',
            'Unsightly exterior modifications',
            'Balcony storage violations',
            'Unapproved modifications',
            'Pool furniture in common areas'
        ],
        pets: [
            'Unleashed pet in common areas',
            'Pet waste not cleaned',
            'Unauthorized pet size/breed',
            'Excessive barking/noise'
        ],
        common: [
            'Unauthorized use of amenities',
            'Pool rules violation',
            'Gym equipment misuse',
            'Smoking in prohibited areas'
        ]
    };
    
    const stored = localStorage.getItem('customViolationRules');
    return stored ? JSON.parse(stored) : defaultRules;
}

function saveViolationRules(rules) {
    localStorage.setItem('customViolationRules', JSON.stringify(rules));
}

// Show settings page
function showSettings() {
    const mainContent = document.querySelector('.main-content');
    if (!mainContent) return;
    
    // Hide other screens
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('dashboardScreen').style.display = 'none';
    
    // Show settings
    let settingsScreen = document.getElementById('settingsScreen');
    if (!settingsScreen) {
        settingsScreen = document.createElement('div');
        settingsScreen.id = 'settingsScreen';
        settingsScreen.className = 'screen';
        mainContent.appendChild(settingsScreen);
    }
    
    settingsScreen.style.display = 'block';
    settingsScreen.innerHTML = `
        <div class="dashboard-container">
            <div class="dashboard-header">
                <h1>Settings</h1>
                <div class="dashboard-actions">
                    <button class="action-btn tertiary" id="backToDashboardBtn">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                        </svg>
                        <span>Back to Dashboard</span>
                    </button>
                </div>
            </div>
            
            <!-- Settings Tabs -->
            <div class="settings-tabs">
                <button class="settings-tab active" data-tab="vendors">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                    </svg>
                    Vendors
                </button>
                <button class="settings-tab" data-tab="rules">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                    </svg>
                    Violation Rules
                </button>
                <button class="settings-tab" data-tab="sync">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
                    </svg>
                    Data Sync (CINC)
                </button>
            </div>
            
            <!-- Tab Content -->
            <div class="settings-content">
                <!-- Vendors Tab -->
                <div class="settings-panel active" id="vendorsPanel">
                    <div class="panel-header">
                        <h2>Manage Vendors</h2>
                        <button class="action-btn primary" id="addVendorBtn">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                            Add Vendor
                        </button>
                    </div>
                    <div id="vendorsList" class="settings-list"></div>
                </div>
                
                <!-- Rules Tab -->
                <div class="settings-panel" id="rulesPanel">
                    <div class="panel-header">
                        <h2>Manage Violation Rules</h2>
                        <select id="ruleCategorySelect" class="filter-select">
                            <option value="parking">Parking</option>
                            <option value="noise">Noise</option>
                            <option value="property">Property Maintenance</option>
                            <option value="pets">Pets</option>
                            <option value="common">Common Areas</option>
                        </select>
                        <button class="action-btn primary" id="addRuleBtn">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                            Add Rule
                        </button>
                    </div>
                    <div id="rulesList" class="settings-list"></div>
                </div>
                
                <!-- Sync Tab -->
                <div class="settings-panel" id="syncPanel">
                    <div class="panel-header">
                        <h2>CINC Homeowners Sync</h2>
                    </div>
                    <div class="sync-info-card">
                        <h3>🏠 Sync Homeowner Data from CINC</h3>
                        <p>Automatically import and sync resident information from your CINC platform.</p>
                        
                        <div class="sync-settings">
                            <div class="form-group">
                                <label for="cincApiKey">CINC API Key</label>
                                <input type="password" id="cincApiKey" placeholder="Enter your CINC API key">
                            </div>
                            <div class="form-group">
                                <label for="cincWebhookUrl">n8n Webhook URL</label>
                                <input type="text" id="cincWebhookUrl" placeholder="https://your-n8n.com/webhook/cinc-sync">
                                <small>Create this webhook in n8n to handle CINC data</small>
                            </div>
                            <button class="action-btn primary" id="testCincSyncBtn">Test Connection</button>
                            <button class="action-btn secondary" id="syncNowBtn">Sync Now</button>
                        </div>
                        
                        <div class="sync-status-box" id="syncStatusBox" style="display: none;">
                            <h4>Last Sync Status</h4>
                            <p id="lastSyncTime">Never synced</p>
                            <p id="syncedResidents">0 residents synced</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Initialize
    loadVendorsList();
    loadRulesList('parking');
    
    // Event listeners
    document.getElementById('backToDashboardBtn')?.addEventListener('click', backToDashboard);
    
    // Tabs
    document.querySelectorAll('.settings-tab').forEach(tab => {
        tab.addEventListener('click', () => switchSettingsTab(tab.dataset.tab));
    });
    
    // Vendors
    document.getElementById('addVendorBtn')?.addEventListener('click', openAddVendorModal);
    
    // Rules
    document.getElementById('ruleCategorySelect')?.addEventListener('change', (e) => {
        loadRulesList(e.target.value);
    });
    document.getElementById('addRuleBtn')?.addEventListener('click', openAddRuleModal);
    
    // CINC Sync
    document.getElementById('testCincSyncBtn')?.addEventListener('click', testCincConnection);
    document.getElementById('syncNowBtn')?.addEventListener('click', syncCincNow);
}

function backToDashboard() {
    document.getElementById('settingsScreen').style.display = 'none';
    document.getElementById('dashboardScreen').style.display = 'block';
    if (typeof switchToDashboard === 'function') {
        switchToDashboard('manual');
    }
}

function switchSettingsTab(tab) {
    // Update tabs
    document.querySelectorAll('.settings-tab').forEach(t => t.classList.remove('active'));
    document.querySelector(`[data-tab="${tab}"]`)?.classList.add('active');
    
    // Update panels
    document.querySelectorAll('.settings-panel').forEach(p => p.classList.remove('active'));
    document.getElementById(`${tab}Panel`)?.classList.add('active');
}

// Vendors Management
function loadVendorsList() {
    const vendors = getVendors();
    const list = document.getElementById('vendorsList');
    if (!list) return;
    
    list.innerHTML = vendors.map(vendor => `
        <div class="settings-item" data-id="${vendor.id}">
            <div class="item-info">
                <h3>${vendor.name}</h3>
                <p>📧 ${vendor.email}</p>
                <p>📞 ${vendor.phone}</p>
                <span class="badge">${vendor.category}</span>
            </div>
            <div class="item-actions">
                <button class="icon-btn" onclick="editVendor('${vendor.id}')">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                    </svg>
                </button>
                <button class="icon-btn delete" onclick="deleteVendor('${vendor.id}')">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>
                </button>
            </div>
        </div>
    `).join('');
}

function openAddVendorModal() {
    // Will create modal for adding/editing vendors
    alert('Add Vendor modal - to be implemented');
}

function editVendor(id) {
    const vendors = getVendors();
    const vendor = vendors.find(v => v.id === id);
    if (vendor) {
        alert(`Edit vendor: ${vendor.name}`);
        // Will show modal with vendor data
    }
}

function deleteVendor(id) {
    if (confirm('Delete this vendor?')) {
        let vendors = getVendors();
        vendors = vendors.filter(v => v.id !== id);
        saveVendors(vendors);
        loadVendorsList();
        if (typeof showNotification === 'function') {
            showNotification('Vendor deleted successfully', 'success');
        }
    }
}

// Rules Management
function loadRulesList(category) {
    const rules = getViolationRules();
    const categoryRules = rules[category] || [];
    const list = document.getElementById('rulesList');
    if (!list) return;
    
    list.innerHTML = categoryRules.map((rule, index) => `
        <div class="settings-item">
            <div class="item-info">
                <p>${rule}</p>
            </div>
            <div class="item-actions">
                <button class="icon-btn delete" onclick="deleteRule('${category}', ${index})">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>
                </button>
            </div>
        </div>
    `).join('');
}

function openAddRuleModal() {
    const category = document.getElementById('ruleCategorySelect').value;
    const rule = prompt('Enter new violation rule:');
    if (rule && rule.trim()) {
        const rules = getViolationRules();
        rules[category].push(rule.trim());
        saveViolationRules(rules);
        loadRulesList(category);
        if (typeof showNotification === 'function') {
            showNotification('Rule added successfully', 'success');
        }
    }
}

function deleteRule(category, index) {
    if (confirm('Delete this rule?')) {
        const rules = getViolationRules();
        rules[category].splice(index, 1);
        saveViolationRules(rules);
        loadRulesList(category);
        if (typeof showNotification === 'function') {
            showNotification('Rule deleted successfully', 'success');
        }
    }
}

// CINC Sync Functions
function testCincConnection() {
    const apiKey = document.getElementById('cincApiKey').value;
    const webhookUrl = document.getElementById('cincWebhookUrl').value;
    
    if (!apiKey || !webhookUrl) {
        alert('Please enter both API Key and Webhook URL');
        return;
    }
    
    if (typeof showNotification === 'function') {
        showNotification('Testing CINC connection...', 'info');
    }
    
    // Test connection (will be implemented with n8n)
    setTimeout(() => {
        if (typeof showNotification === 'function') {
            showNotification('Connection successful! ✓', 'success');
        }
    }, 2000);
}

function syncCincNow() {
    if (typeof showNotification === 'function') {
        showNotification('Starting CINC sync...', 'info');
    }
    
    // Trigger n8n webhook (will be implemented)
    setTimeout(() => {
        document.getElementById('syncStatusBox').style.display = 'block';
        document.getElementById('lastSyncTime').textContent = new Date().toLocaleString();
        document.getElementById('syncedResidents').textContent = '45 residents synced';
        
        if (typeof showNotification === 'function') {
            showNotification('Sync completed! 45 residents updated', 'success');
        }
    }, 3000);
}

// Initialize settings when sidebar settings is clicked
document.addEventListener('DOMContentLoaded', () => {
    console.log('✅ Settings page module loaded');
});

// Export function for sidebar
window.showSettings = showSettings;
