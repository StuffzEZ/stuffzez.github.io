// Photo Gallery - Static Site
(function() {
    'use strict';

    // SVG icons
    const icons = {
        folder: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5"><path d="M2 6a2 2 0 012-2h5l2 2h9a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"/></svg>`,
        download: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>`
    };

    // Render breadcrumb
    function renderBreadcrumb(currentPath, rootPath) {
        const bc = document.getElementById('breadcrumb');
        if (!currentPath) {
            bc.innerHTML = `<a href="#" class="breadcrumb-item" data-path="">all folders</a>`;
            return;
        }
        let html = `<a href="#" class="breadcrumb-item" data-path="">all folders</a>`;
        const parts = currentPath.split('/');
        let accumulated = '';
        for (let i = 0; i < parts.length; i++) {
            accumulated += (accumulated ? '/' : '') + parts[i];
            html += ` <span class="breadcrumb-sep">&rsaquo;</span> <a href="#" class="breadcrumb-item" data-path="${accumulated}">${parts[i]}</a>`;
        }
        bc.innerHTML = html;
    }

    // Get display name from path (last segment)
    function getNameFromPath(path) {
        return path.split('/').pop();
    }

    // Render folder card
    function renderFolderCard(node, path, depth) {
        const indent = depth * 16;
        const folderName = getNameFromPath(path);
        const childCount = Object.keys(node.children).length;
        
        return `
            <div class="folder-card" data-path="${path}" style="padding-left: ${16 + indent}px">
                <div class="flex items-center gap-3">
                    <span class="text-[#e8a040]">${icons.folder}</span>
                    <span class="font-karla text-sm text-[#c3c2cf]">${folderName}</span>
                    <span class="text-xs text-[#585860] ml-auto">${childCount} photo${childCount !== 1 ? 's' : ''}</span>
                </div>
            </div>
        `;
    }

    // Get folder path from full path
    function getFolderPath(fullPath) {
        const parts = fullPath.split('/');
        parts.pop(); // remove filename
        return parts.join('/');
    }

    // Get readable folder name
    function getFolderName(folderPath) {
        if (!folderPath) return 'root';
        return folderPath.split('/').pop();
    }

    // Render photo card
    function renderPhotoCard(path, folderPath) {
        const filename = getNameFromPath(path);
        const thumbPath = path.replace('.png', '_thumb.png');
        const lowPath = path.replace('.png', '_low.png');
        const hiPath = path;
        const folderName = getFolderName(folderPath);
        
        return `
            <div class="photo-card cursor-pointer" onclick="openModal('${path}', '${lowPath}', '${hiPath}', '${folderName}')" title="Click to view and download">
                <img src="${thumbPath}" alt="${folderName} - ${filename}" class="photo-thumb" loading="lazy">
                <div class="photo-caption">
                    <div class="photo-title">${folderName}</div>
                    <div class="photo-dimensions">${filename.replace('.png', '.png')} &bull; click to view</div>
                </div>
            </div>
        `;
    }

    // Navigate to folder
    function navigateTo(node, currentPath) {
        const gallery = document.getElementById('gallery');
        const emptyState = document.getElementById('empty-state');
        
        // Show loading
        gallery.innerHTML = '<div class="loading">loading</div>';
        
        // Build sections after a brief delay for UX
        setTimeout(() => {
            const folders = [];
            const files = [];
            
            for (const [key, value] of Object.entries(node)) {
                if (value.type === 'folder') {
                    folders.push(renderFolderCard(value, currentPath ? `${currentPath}/${key}` : key, folders.length));
                } else {
                    const folderPath = currentPath ? `${currentPath}/${key}` : key;
                    files.push(renderPhotoCard(value.path, folderPath));
                }
            }

            let html = '';
            
            // Folders section
            if (folders.length > 0) {
                html += `<div class="section-title">Folders (${folders.length})</div>`;
                html += folders.join('');
            }
            
            // Photos section
            if (files.length > 0) {
                if (folders.length > 0) {
                    html += `<div class="section-title" style="margin-top: 20px;">Photos (${files.length})</div>`;
                }
                html += files.map(f => `<div class="photos-grid">${f}</div>`).join('');
            }

            if (!html) {
                emptyState.classList.remove('hidden');
            } else {
                emptyState.classList.add('hidden');
                gallery.innerHTML = html;
            }

            renderBreadcrumb(currentPath);
            
            // Attach click handlers for folders
            gallery.querySelectorAll('.folder-card').forEach(card => {
                card.addEventListener('click', (e) => {
                    e.preventDefault();
                    const newPath = card.dataset.path;
                    navigateTo(buildSubTree(GALLERY_DATA, newPath), newPath);
                });
            });
            
            // Attach click handlers for breadcrumbs
            gallery.querySelectorAll('.breadcrumb-item').forEach(item => {
                item.addEventListener('click', (e) => {
                    e.preventDefault();
                    const path = item.dataset.path;
                    navigateTo(path ? buildSubTree(GALLERY_DATA, path) : GALLERY_DATA, path);
                });
            });
        }, 100);
    }

    // Build subtree from path
    function buildSubTree(node, path) {
        if (!path) return node;
        const parts = path.split('/');
        let current = node;
        for (const part of parts) {
            if (current[part] && current[part].type === 'folder') {
                current = current[part].children;
            } else {
                return null;
            }
        }
        return current;
    }

    // Close modal on ESC key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeModal();
        }
    });

    // Modal functions
    window.openModal = function(path, lowPath, hiPath, folderName) {
        const modal = document.getElementById('photo-modal');
        if (!modal) return;
        
        modal.dataset.path = path;
        modal.dataset.low = lowPath;
        modal.dataset.high = hiPath;
        modal.dataset.folder = folderName;
        
        const modalImg = modal.querySelector('#modal-img');
        const modalFolder = modal.querySelector('#modal-folder');
        const modalFilename = modal.querySelector('#modal-filename');
        const modalLow = modal.querySelector('#modal-low');
        const modalHigh = modal.querySelector('#modal-high');
        
        modalImg.src = path;
        modalImg.alt = `${folderName} - ${path.split('/').pop()}`;
        modalFolder.textContent = folderName;
        modalFilename.textContent = path.split('/').pop().replace('.png', '');
        
        // Set download links
        if (modalLow) modalLow.href = lowPath;
        if (modalHigh) modalHigh.href = hiPath;
        
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    };

    window.closeModal = function() {
        const modal = document.getElementById('photo-modal');
        if (modal) {
            modal.classList.add('hidden');
            document.body.style.overflow = '';
        }
    };

    // Initialize gallery
    function init() {
        if (typeof GALLERY_DATA === 'undefined') {
            console.error('Gallery data not loaded - check gallery-data.js');
            return;
        }
        
        const emptyState = document.getElementById('empty-state');
        emptyState.classList.add('hidden');
        
        navigateTo(GALLERY_DATA, '');
    }

    // Start when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
