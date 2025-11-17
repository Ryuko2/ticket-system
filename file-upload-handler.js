// ============================================
// FILE UPLOAD HANDLER
// Image & File Attachments for Tickets
// ============================================

class FileUploadHandler {
    constructor() {
        this.maxFileSize = 5 * 1024 * 1024; // 5MB
        this.allowedImageTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'];
        this.allowedFileTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'text/plain'
        ];
    }
    
    // Convert file to base64
    fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
            reader.readAsDataURL(file);
        });
    }
    
    // Validate file
    validateFile(file, type = 'image') {
        const allowedTypes = type === 'image' ? this.allowedImageTypes : this.allowedFileTypes;
        
        if (!allowedTypes.includes(file.type)) {
            throw new Error(`Invalid file type. Allowed: ${allowedTypes.join(', ')}`);
        }
        
        if (file.size > this.maxFileSize) {
            throw new Error(`File too large. Max size: ${this.maxFileSize / 1024 / 1024}MB`);
        }
        
        return true;
    }
    
    // Compress image
    async compressImage(file, maxWidth = 800, maxHeight = 800) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;
                    
                    // Calculate new dimensions
                    if (width > height) {
                        if (width > maxWidth) {
                            height *= maxWidth / width;
                            width = maxWidth;
                        }
                    } else {
                        if (height > maxHeight) {
                            width *= maxHeight / height;
                            height = maxHeight;
                        }
                    }
                    
                    canvas.width = width;
                    canvas.height = height;
                    
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);
                    
                    canvas.toBlob((blob) => {
                        resolve(blob);
                    }, 'image/jpeg', 0.85);
                };
                img.onerror = reject;
                img.src = e.target.result;
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }
    
    // Upload image
    async uploadImage(file) {
        try {
            this.validateFile(file, 'image');
            
            // Compress image
            const compressedBlob = await this.compressImage(file);
            const compressedFile = new File([compressedBlob], file.name, { type: 'image/jpeg' });
            
            // Convert to base64
            const base64 = await this.fileToBase64(compressedFile);
            
            return {
                url: base64,
                name: file.name,
                size: compressedFile.size,
                type: 'image'
            };
        } catch (error) {
            console.error('Error uploading image:', error);
            throw error;
        }
    }
    
    // Upload file
    async uploadFile(file) {
        try {
            this.validateFile(file, 'file');
            
            // Convert to base64
            const base64 = await this.fileToBase64(file);
            
            return {
                url: base64,
                name: file.name,
                size: file.size,
                type: file.type
            };
        } catch (error) {
            console.error('Error uploading file:', error);
            throw error;
        }
    }
    
    // Create file input UI
    createFileInput(containerId, type = 'image') {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        const inputHTML = `
            <div class="file-upload-section" style="margin: 1rem 0;">
                <label style="display: block; font-weight: 500; margin-bottom: 0.5rem;">
                    ${type === 'image' ? 'Attach Image' : 'Attach File'}
                </label>
                <input 
                    type="file" 
                    accept="${type === 'image' ? 'image/*' : '.pdf,.doc,.docx,.xls,.xlsx,.txt'}" 
                    class="file-input" 
                    style="display: none;"
                    data-type="${type}"
                />
                <button type="button" class="file-upload-btn" style="padding: 0.5rem 1rem; border: 2px dashed #ccc; border-radius: 8px; background: #f9fafb; cursor: pointer; width: 100%;">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" style="width: 20px; height: 20px; display: inline-block; vertical-align: middle;">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                    </svg>
                    <span style="margin-left: 0.5rem;">Choose ${type === 'image' ? 'Image' : 'File'}</span>
                </button>
                <div class="file-preview" style="margin-top: 1rem;"></div>
            </div>
        `;
        
        container.insertAdjacentHTML('beforeend', inputHTML);
        
        const btn = container.querySelector('.file-upload-btn');
        const input = container.querySelector('.file-input');
        const preview = container.querySelector('.file-preview');
        
        btn.addEventListener('click', () => input.click());
        
        input.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            try {
                btn.disabled = true;
                btn.textContent = 'Uploading...';
                
                let result;
                if (type === 'image') {
                    result = await this.uploadImage(file);
                    preview.innerHTML = `
                        <img src="${result.url}" style="max-width: 200px; border-radius: 8px; border: 1px solid #e5e7eb;">
                        <p style="font-size: 0.875rem; color: #6b7280; margin-top: 0.5rem;">${result.name} (${(result.size / 1024).toFixed(2)} KB)</p>
                    `;
                } else {
                    result = await this.uploadFile(file);
                    preview.innerHTML = `
                        <div style="padding: 1rem; background: #f3f4f6; border-radius: 8px;">
                            <p style="font-weight: 500;">${result.name}</p>
                            <p style="font-size: 0.875rem; color: #6b7280;">${(result.size / 1024).toFixed(2)} KB</p>
                        </div>
                    `;
                }
                
                // Store in form data
                container.dataset.fileData = JSON.stringify(result);
                
                btn.textContent = '✓ Uploaded';
                btn.style.borderColor = '#10b981';
                btn.style.background = '#d1fae5';
                
            } catch (error) {
                alert(error.message);
                btn.disabled = false;
                btn.innerHTML = '<span style="margin-left: 0.5rem;">Choose ' + (type === 'image' ? 'Image' : 'File') + '</span>';
            }
        });
    }
}

// Initialize
const fileUploader = new FileUploadHandler();
window.fileUploader = fileUploader;

console.log('✅ File upload handler loaded');
