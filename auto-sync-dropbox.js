// ============================================
// AUTO DROPBOX SYNC
// Automatically sync data every 30 seconds
// ============================================

class AutoDropboxSync {
    constructor() {
        this.syncInterval = null;
        this.syncFrequency = 30000; // 30 seconds
        this.isSyncing = false;
        this.lastSync = null;
    }

    start() {
        if (this.syncInterval) {
            console.log('Auto-sync already running');
            return;
        }

        // Check if Dropbox is connected
        if (!dropboxStorage || !dropboxStorage.isAuthenticated()) {
            console.log('Dropbox not connected - auto-sync disabled');
            if (typeof showNotification === 'function') {
                showNotification('Connect Dropbox to enable auto-sync', 'info');
            }
            return;
        }

        console.log('✅ Auto-sync started (every 30 seconds)');
        
        // Initial sync
        this.performSync();

        // Set up interval
        this.syncInterval = setInterval(() => {
            this.performSync();
        }, this.syncFrequency);

        if (typeof showNotification === 'function') {
            showNotification('Auto-sync enabled! Data will sync every 30 seconds', 'success');
        }
    }

    stop() {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
            this.syncInterval = null;
            console.log('Auto-sync stopped');
            
            if (typeof showNotification === 'function') {
                showNotification('Auto-sync disabled', 'info');
            }
        }
    }

    async performSync() {
        // Don't sync if already syncing
        if (this.isSyncing) {
            console.log('Sync already in progress, skipping...');
            return;
        }

        // Don't sync if Dropbox not connected
        if (!dropboxStorage || !dropboxStorage.isAuthenticated()) {
            console.log('Dropbox not authenticated, stopping auto-sync');
            this.stop();
            return;
        }

        this.isSyncing = true;
        
        try {
            console.log('🔄 Auto-syncing to Dropbox...');
            
            // Update UI
            updateSyncStatus('⟳ Syncing...', 'syncing');

            // Get all local data
            const tickets = getTickets();
            const violations = typeof getViolations === 'function' ? getViolations() : [];
            const workOrders = typeof getWorkOrders === 'function' ? getWorkOrders() : [];

            // Prepare data package
            const dataPackage = {
                tickets: tickets,
                violations: violations,
                workOrders: workOrders,
                lastSync: new Date().toISOString(),
                syncedBy: currentUser?.username || currentUser?.name || 'System'
            };

            // Upload to Dropbox
            await this.uploadToDropbox(dataPackage);

            this.lastSync = new Date();
            updateSyncStatus('✓ Auto-synced', 'success');
            
            console.log('✅ Auto-sync completed successfully');
            
        } catch (error) {
            console.error('Auto-sync error:', error);
            updateSyncStatus('✗ Sync failed', 'error');
            
            // If error persists, stop auto-sync
            if (error.message && error.message.includes('401')) {
                this.stop();
                if (typeof showNotification === 'function') {
                    showNotification('Dropbox connection lost. Please reconnect.', 'error');
                }
            }
        } finally {
            this.isSyncing = false;
        }
    }

    async uploadToDropbox(dataPackage) {
        if (!dropboxStorage.accessToken) {
            throw new Error('Not authenticated with Dropbox');
        }

        const path = `${DROPBOX_CONFIG.folderPath}/complete-data.json`;
        const content = JSON.stringify(dataPackage, null, 2);

        const response = await fetch('https://content.dropboxapi.com/2/files/upload', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${dropboxStorage.accessToken}`,
                'Dropbox-API-Arg': JSON.stringify({
                    path,
                    mode: 'overwrite',
                    autorename: false,
                    mute: true // Don't notify on every sync
                }),
                'Content-Type': 'application/octet-stream'
            },
            body: content
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Dropbox upload failed: ${response.status} - ${errorText}`);
        }

        return await response.json();
    }

    getStatus() {
        return {
            isRunning: !!this.syncInterval,
            isSyncing: this.isSyncing,
            lastSync: this.lastSync,
            frequency: this.syncFrequency
        };
    }
}

// Create global instance
let autoSync = null;

// Initialize auto-sync when user logs in with Dropbox
function initializeAutoSync() {
    if (!autoSync) {
        autoSync = new AutoDropboxSync();
    }

    // Start if Dropbox is connected
    if (dropboxStorage && dropboxStorage.isAuthenticated()) {
        autoSync.start();
    }
}

// Add to login handlers
const originalHandleDropboxLogin = handleDropboxLogin;
handleDropboxLogin = function() {
    originalHandleDropboxLogin();
    // Auto-sync will start after redirect when Dropbox token is detected
};

// Check on page load
document.addEventListener('DOMContentLoaded', () => {
    // Wait a bit for dropboxStorage to initialize
    setTimeout(() => {
        if (dropboxStorage && dropboxStorage.isAuthenticated()) {
            initializeAutoSync();
        }
    }, 1000);

    // Add toggle button to sidebar if needed
    const syncBtn = document.getElementById('syncDropboxBtn');
    if (syncBtn) {
        const originalText = syncBtn.innerHTML;
        
        syncBtn.addEventListener('click', () => {
            if (!autoSync) {
                initializeAutoSync();
            } else if (autoSync.getStatus().isRunning) {
                autoSync.stop();
                syncBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /><path stroke-linecap="round" stroke-linejoin="round" d="M9 9.563C9 9.252 9.252 9 9.563 9h4.874c.311 0 .563.252.563.563v4.874c0 .311-.252.563-.563.563H9.564A.562.562 0 019 14.437V9.564z" /></svg><span>Enable Auto-Sync</span>';
            } else {
                autoSync.start();
                syncBtn.innerHTML = originalText;
            }
        });
    }

    console.log('✅ Auto-sync module loaded');
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (autoSync) {
        autoSync.stop();
    }
});

console.log('✅ Auto Dropbox Sync module initialized');
