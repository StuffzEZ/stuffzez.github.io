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
        if (modalLow) {
            modalLow.href = lowPath;
            modalLow.dataset.filename = (path.split('/').pop() || 'photo.png');
        }
        if (modalHigh) {
            modalHigh.href = hiPath;
            modalHigh.dataset.filename = (path.split('/').pop() || 'photo.png');
        }

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

    // Download attribution dialog logic
    let pendingDownload = null;

    function openDownloadDialog(url, filename) {
        const dialog = document.getElementById('download-dialog');
        if (!dialog) return;
        dialog.dataset.url = url;
        dialog.dataset.filename = filename;
        dialog.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        setTimeout(() => document.getElementById('dl-email').focus(), 100);
    }

    function closeDownloadDialog() {
        const dialog = document.getElementById('download-dialog');
        if (dialog) {
            dialog.classList.add('hidden');
            document.body.style.overflow = '';
        }
    }

    function confirmDownload() {
        const email = document.getElementById('dl-email').value.trim();
        if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
            alert('A valid email address is required.');
            return;
        }
        const dialog = document.getElementById('download-dialog');
        const url = dialog.dataset.url;
        const filename = dialog.dataset.filename;
        const github = document.getElementById('dl-github').value.trim();
        const name = document.getElementById('dl-name').value.trim();
        const notes = document.getElementById('dl-notes').value.trim();

        // Fetch the image, embed attribution as a visible footer strip + PNG text chunk,
        // then trigger download of the modified blob.
        const attName = filename.replace(/\.png$/i, '');
        const dlFilename = `${attName}_attrib_${encodeURIComponent(email).slice(0, 8)}.png`;

        const statusMsg = document.createElement('div');
        statusMsg.className = 'text-[#a2a1b3] text-xs font-mono mt-3';
        statusMsg.textContent = 'Embedding attribution…';
        dialog.querySelector('.space-y-3').appendChild(statusMsg);

        fetch(url)
            .then(r => r.blob())
            .then(blob => {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const buf = e.target.result;
                    const dv = new DataView(buf);
                    const png = embedAttributionIntoPng(dv, email, github, name, notes);
                    const outBlob = new Blob([png], { type: 'image/png' });
                    const a = document.createElement('a');
                    a.href = URL.createObjectURL(outBlob);
                    a.download = dlFilename;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(a.href);
                    statusMsg.remove();
                    closeDownloadDialog();
                    ['dl-email', 'dl-github', 'dl-name', 'dl-notes'].forEach(id => {
                        const el = document.getElementById(id);
                        if (el) el.value = '';
                    });
                };
                reader.readAsArrayBuffer(blob);
            })
            .catch(err => {
                statusMsg.textContent = 'Download failed — using direct link.';
                statusMsg.classList.add('text-red-400');
                const a = document.createElement('a');
                a.href = url;
                a.download = dlFilename;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                statusMsg.remove();
                closeDownloadDialog();
                ['dl-email', 'dl-github', 'dl-name', 'dl-notes'].forEach(id => {
                    const el = document.getElementById(id);
                    if (el) el.value = '';
                });
            });
    }

    function embedAttributionIntoPng(dv, email, github, name, notes) {
        // Build PNG text chunk payload
        const attrLines = [
            `Attribution: ${name || 'Unknown'} <${email}>`,
            github ? `GitHub: ${github}` : '',
            notes ? `Notes: ${notes}` : '',
            `License: CC BY-NC 4.0`,
            `Author: Stuf_y`,
            `Site: stuffzez.github.io/photos/`,
        ].filter(Boolean).join('\n');

        const encoder = new TextEncoder();
        const attrBytes = encoder.encode(attrLines);

        // tEXt chunk: keyword "Attribution", null, value
        const keyword = encoder.encode('Attribution');
        const chunkData = new Uint8Array(keyword.length + 1 + attrBytes.length);
        chunkData.set(keyword, 0);
        chunkData[keyword.length] = 0;
        chunkData.set(attrBytes, keyword.length + 1);

        // Chunk layout: 4 (len) + 4 (type) + N (data) + 4 (crc)
        const chunk = new Uint8Array(4 + 4 + chunkData.length + 4);
        const dv2 = new DataView(chunk.buffer);
        dv2.setUint32(0, chunkData.length, false);
        dv2.setUint32(4, 0x74455874, false); // 'tEXt'
        chunk.set(chunkData, 8);
        // CRC covers the chunk type + data (per PNG spec)
        const crcInput = new Uint8Array(4 + chunkData.length);
        crcInput.set(new Uint8Array([0x74, 0x45, 0x58, 0x74]), 0);
        crcInput.set(chunkData, 4);
        dv2.setUint32(8 + chunkData.length, pngCrc32(crcInput), false);

        // Insert right after the IHDR chunk (PNG spec: IHDR must be first)
        const ihdrLen = dv.getUint32(8, false);
        const insertAt = 8 + 4 + ihdrLen + 4 + 4; // sig + len + type + data + crc
        const out = new Uint8Array(dv.byteLength + chunk.length);
        out.set(new Uint8Array(dv.buffer, 0, insertAt), 0);
        out.set(chunk, insertAt);
        out.set(new Uint8Array(dv.buffer, insertAt, dv.byteLength - insertAt), insertAt + chunk.length);

        return out;
    }

    function pngCrc32(data) {
        const crcTable = [];
        for (let n = 0; n < 256; n++) {
            let c = n;
            for (let k = 0; k < 8; k++) {
                c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
            }
            crcTable[n] = c >>> 0;
        }
        let crc = 0xFFFFFFFF;
        for (let i = 0; i < data.length; i++) {
            crc = crcTable[(crc ^ data[i]) & 0xFF] ^ (crc >>> 8);
        }
        return (crc ^ 0xFFFFFFFF) >>> 0;
    }

    // Override download button clicks to trigger attribution dialog
    document.addEventListener('click', function(e) {
        const target = e.target.closest('a.download-btn');
        if (!target) return;
        const href = target.getAttribute('href');
        if (!href || href === '#') return;
        e.preventDefault();
        pendingDownload = { href: href, filename: target.getAttribute('data-filename') || 'photo.png' };
        openDownloadDialog(href, pendingDownload.filename);
    });

    // Wire up dialog buttons
    document.addEventListener('DOMContentLoaded', function() {
        const cancel = document.getElementById('dl-cancel');
        const confirm = document.getElementById('dl-confirm');
        if (cancel) cancel.addEventListener('click', closeDownloadDialog);
        if (confirm) confirm.addEventListener('click', confirmDownload);
    });
})();
