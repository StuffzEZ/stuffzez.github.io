// Photo Gallery - Static Site
(function() {
    'use strict';

    // SVG icons
    const icons = {
        folder: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5"><path d="M2 6a2 2 0 012-2h5l2 2h9a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"/></svg>`,
        download: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>`
    };

    // Get display name from path (last segment, strip _done marker)
    function getNameFromPath(path) {
        const raw = path.split('/').pop();
        return raw.replace(/_done(?=\.(png|jpg|jpeg)$)/i, '');
    }

    // Get readable folder name
    function getFolderName(folderPath) {
        if (!folderPath) return 'root';
        return folderPath.split('/').pop();
    }

    // Render folder card
    function renderFolderCard(node, path) {
        const folderName = getNameFromPath(path);
        const childCount = Object.keys(node.children).length;

        return `
            <div class="folder-card" data-path="${path}">
                <div class="flex items-center gap-3">
                    <span class="text-[#a2a1b3]">${icons.folder}</span>
                    <span class="font-karla text-sm text-[#c3c2cf]">${folderName}</span>
                    <span class="text-xs text-[#585860] ml-auto">${childCount} item${childCount !== 1 ? 's' : ''}</span>
                </div>
            </div>
        `;
    }

    // Prefix asset paths so they resolve from the gallery HTML page
    const ASSET_PREFIX = 'assets/';

    function assetPath(p) {
        return ASSET_PREFIX + p;
    }

    // Extract base name without _done or extension (e.g. "foo_done.png" -> "foo")
    function getBaseName(filePath) {
        const fn = filePath.split('/').pop();
        return fn.replace(/_done(\.(png|jpg))$/, '').replace(/\.(png|jpg)$/, '');
    }
    // Build thumb/low paths from a _done source path: dir/foo_done.png -> dir/foo_done_thumb.png
    function buildVariants(path) {
        const idx = path.lastIndexOf('.');
        const base = path.substring(0, idx);
        const ext  = path.substring(idx);
        return {
            thumb: assetPath(base + '_thumb' + ext),
            low:   assetPath(base + '_low'  + ext),
            hi:    assetPath(path),
        };
    }

    // Render photo card
    function renderPhotoCard(path, currentPath) {
        const filename = getNameFromPath(path);
        const v = buildVariants(path);
        const thumbPath = v.thumb;
        const lowPath   = v.low;
        const hiPath    = v.hi;
        const folderName = currentPath ? getFolderName(currentPath) : 'root';

        return `
            <div class="photo-card cursor-pointer" onclick="openModal('${hiPath}', '${lowPath}', '${hiPath}', '${folderName}')" title="Click to view and download">
                <img src="${thumbPath}" alt="${folderName} - ${filename}" class="photo-thumb" loading="lazy">
                <div class="photo-caption">
                    <div class="photo-title">${folderName}</div>
                    <div class="photo-dimensions">${filename} &bull; click to view</div>
                </div>
            </div>
        `;
    }

    // Render breadcrumb as tabs
    function renderBreadcrumb(currentPath) {
        const bc = document.getElementById('breadcrumb');
        const parts = currentPath ? currentPath.split('/') : [];

        let html = `<a href="#" class="breadcrumb-item" data-path="">all folders</a>`;

        let accumulated = '';
        for (let i = 0; i < parts.length; i++) {
            accumulated += (accumulated ? '/' : '') + parts[i];
            const isLast = i === parts.length - 1;
            html += ` <span class="breadcrumb-sep">/</span> `;
            html += `<a href="#" class="breadcrumb-item ${isLast ? 'breadcrumb-current' : ''}" data-path="${accumulated}">${parts[i]}</a>`;
        }

        bc.innerHTML = html;
    }

    // Build subtree from path
    function buildSubTree(path) {
        if (!path) {
            // Root: return assets children (real, rendered, etc.)
            return GALLERY_DATA.assets ? GALLERY_DATA.assets.children : GALLERY_DATA;
        }
        const parts = path.split('/');
        let current = GALLERY_DATA.assets ? GALLERY_DATA.assets.children : GALLERY_DATA;
        for (const part of parts) {
            if (current[part] && current[part].type === 'folder') {
                current = current[part].children;
            } else {
                return null;
            }
        }
        return current;
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
                    const folderPath = currentPath ? `${currentPath}/${key}` : key;
                    folders.push(renderFolderCard(value, folderPath));
                } else {
                    files.push(renderPhotoCard(value.path, currentPath));
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
                html += `<div class="photos-grid">${files.join('')}</div>`;
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
                    const subTree = buildSubTree(newPath);
                    if (subTree) navigateTo(subTree, newPath);
                });
            });

            // Attach click handlers for breadcrumbs
            document.querySelectorAll('#breadcrumb .breadcrumb-item').forEach(item => {
                item.addEventListener('click', (e) => {
                    e.preventDefault();
                    const path = item.dataset.path;
                    const subTree = buildSubTree(path);
                    if (subTree) navigateTo(subTree, path);
                });
            });
        }, 100);
    }

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
        modalFilename.textContent = path.split('/').pop().replace(/\.png$/, '').replace(/_done$/, '');

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

    // Close modal on ESC key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeModal();
        }
    });

    // Initialize gallery - poll until GALLERY_DATA is available
    function init() {
        function start() {
            if (typeof GALLERY_DATA !== 'undefined') {
                const emptyState = document.getElementById('empty-state');
                emptyState.classList.add('hidden');

                // Start at assets folder level (show real/rendered directly)
                const assetsNode = GALLERY_DATA.assets ? GALLERY_DATA.assets.children : GALLERY_DATA;
                navigateTo(assetsNode, '');
            } else {
                setTimeout(start, 100);
            }
        }
        start();
    }
    document.addEventListener('DOMContentLoaded', init);

    // Start the gallery when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
