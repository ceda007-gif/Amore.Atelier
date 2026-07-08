/* Amore Atelier — image slot store + widget.
   Photos live in Firebase Storage; their download URL and crop position are
   kept in a single Firestore doc (images/site) so every visitor sees the
   same set. Only a signed-in admin (see js/app.js) gets the drag-to-upload
   and drag-to-reposition affordances — everyone else can still click a
   photo to view it full-size. */
(function () {
  const MAX_DIM = 1200;
  let cache = {};
  const listeners = {}; // id -> Set of callbacks

  function subscribe(id, cb) {
    (listeners[id] || (listeners[id] = new Set())).add(cb);
    return () => listeners[id].delete(cb);
  }
  function notify(id) {
    (listeners[id] || []).forEach((cb) => cb());
  }
  function notifyAll() {
    Object.keys(listeners).forEach(notify);
  }
  function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

  const ready = window.AA_DB.collection('images').doc('site').get()
    .then((doc) => { if (doc.exists) cache = doc.data() || {}; })
    .catch((e) => { console.error('Amore Atelier: no se pudieron cargar las imágenes.', e); })
    .then(notifyAll);

  function getSrc(id) {
    if (cache[id]) return cache[id];
    const def = (window.AA_IMAGE_SLOTS[id] || {}).defaultSrc;
    return def ? (window.AA_ASSET_BASE || '') + def : null;
  }
  function hasCustom(id) {
    return !!cache[id];
  }
  function getPos(id) {
    return cache[id + '_pos'] || '50% 50%';
  }
  let posTimers = {};
  function savePos(id, posStr) {
    cache[id + '_pos'] = posStr;
    notify(id);
    clearTimeout(posTimers[id]);
    posTimers[id] = setTimeout(() => {
      window.AA_DB.collection('images').doc('site').set({ [id + '_pos']: posStr }, { merge: true })
        .catch((e) => console.error('Amore Atelier: no se pudo guardar la posición de la imagen.', e));
    }, 400);
  }

  function fileToBlob(file, done) {
    const img = new Image();
    const reader = new FileReader();
    reader.onload = () => {
      img.onload = () => {
        const scale = Math.min(1, MAX_DIM / Math.max(img.width, img.height));
        const w = Math.round(img.width * scale), h = Math.round(img.height * scale);
        const canvas = document.createElement('canvas');
        canvas.width = w; canvas.height = h;
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);
        canvas.toBlob((blob) => done(blob || null), 'image/webp', 0.78);
      };
      img.onerror = () => done(null);
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  }

  function setSrc(id, file) {
    if (!window.AAIsAdminAuthed || !window.AAIsAdminAuthed()) return Promise.reject(new Error('not authenticated'));
    return new Promise((resolve, reject) => {
      fileToBlob(file, (blob) => {
        if (!blob) { reject(new Error('image processing failed')); return; }
        const ref = window.AA_STORAGE.ref().child('images/' + id + '.webp');
        ref.put(blob, { contentType: 'image/webp' })
          .then(() => ref.getDownloadURL())
          .then((url) => window.AA_DB.collection('images').doc('site').set({ [id]: url, [id + '_pos']: '50% 50%' }, { merge: true }).then(() => url))
          .then((url) => { cache[id] = url; cache[id + '_pos'] = '50% 50%'; notify(id); resolve(url); })
          .catch(reject);
      });
    });
  }

  function clearSrc(id) {
    if (!window.AAIsAdminAuthed || !window.AAIsAdminAuthed()) return Promise.reject(new Error('not authenticated'));
    const ref = window.AA_STORAGE.ref().child('images/' + id + '.webp');
    return ref.delete()
      .catch((e) => { if (e && e.code !== 'storage/object-not-found') throw e; })
      .then(() => window.AA_DB.collection('images').doc('site').set({
        [id]: firebase.firestore.FieldValue.delete(),
        [id + '_pos']: firebase.firestore.FieldValue.delete()
      }, { merge: true }))
      .then(() => { delete cache[id]; delete cache[id + '_pos']; notify(id); });
  }

  /* ---------------- shared lightbox ---------------- */
  let lightboxEl = null;
  function ensureLightbox() {
    if (lightboxEl) return lightboxEl;
    lightboxEl = document.createElement('div');
    lightboxEl.className = 'aa-lightbox';
    lightboxEl.innerHTML = '<button type="button" class="aa-lightbox-close" aria-label="Cerrar">&times;</button><img alt="">';
    lightboxEl.addEventListener('click', (e) => {
      if (e.target === lightboxEl || e.target.closest('.aa-lightbox-close')) closeLightbox();
    });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeLightbox(); });
    document.body.appendChild(lightboxEl);
    return lightboxEl;
  }
  function openLightbox(src, alt) {
    const el = ensureLightbox();
    const img = el.querySelector('img');
    img.src = src;
    img.alt = alt || '';
    el.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }
  function closeLightbox() {
    if (!lightboxEl) return;
    lightboxEl.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  /**
   * Builds a self-updating image slot element.
   * @param {string} id - slot id, must exist in window.AA_IMAGE_SLOTS
   * @param {object} opts - { placeholder: string, className: string }
   */
  function createImageSlot(id, opts) {
    opts = opts || {};
    const cfg = window.AA_IMAGE_SLOTS[id] || {};
    const editable = !!(window.AAIsAdminAuthed && window.AAIsAdminAuthed());
    const repositionable = editable && cfg.fit !== 'contain';
    const el = document.createElement('div');
    el.className = 'aa-imgslot' + (cfg.fit === 'contain' ? ' aa-fit-contain' : '') + (opts.className ? ' ' + opts.className : '') + (editable ? ' is-editable' : '');
    el.setAttribute('data-slot-id', id);

    const img = document.createElement('img');
    img.alt = opts.placeholder || '';
    img.draggable = false;
    img.loading = opts.eager ? 'eager' : 'lazy';
    img.decoding = 'async';

    const placeholder = document.createElement('div');
    placeholder.className = 'aa-imgslot-placeholder';
    placeholder.textContent = opts.placeholder || '';

    el.appendChild(img);
    el.appendChild(placeholder);

    function refresh() {
      const src = getSrc(id);
      img.style.objectPosition = getPos(id);
      if (src) {
        img.src = src;
        img.style.display = 'block';
        placeholder.style.display = 'none';
        el.classList.add('has-image');
        el.setAttribute('aria-label', 'Ver imagen completa');
      } else {
        img.style.display = 'none';
        placeholder.style.display = 'flex';
        el.classList.remove('has-image');
        if (editable) el.setAttribute('aria-label', 'Subir imagen');
        else el.removeAttribute('aria-label');
      }
      if (src || editable) {
        el.setAttribute('role', 'button');
        el.setAttribute('tabindex', '0');
      } else {
        el.removeAttribute('role');
        el.removeAttribute('tabindex');
      }
    }
    refresh();
    const unsubscribe = subscribe(id, refresh);
    el._aaUnsubscribe = unsubscribe;

    let input = null;
    let dragMoved = false;
    el.addEventListener('click', (e) => {
      // Some slots (e.g. the home services cards) sit inside another
      // clickable element; stop the click reaching it once we've acted
      // on it ourselves, so it doesn't also navigate away.
      if (dragMoved) { dragMoved = false; e.stopPropagation(); return; }
      const src = getSrc(id);
      if (src) { e.stopPropagation(); openLightbox(src, opts.placeholder); return; }
      if (editable && input) { e.stopPropagation(); input.click(); }
    });
    el.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      const src = getSrc(id);
      if (src) { e.preventDefault(); e.stopPropagation(); openLightbox(src, opts.placeholder); return; }
      if (editable && input) { e.preventDefault(); e.stopPropagation(); input.click(); }
    });

    if (editable) {
      const dropzone = document.createElement('div');
      dropzone.className = 'aa-imgslot-dropzone';
      dropzone.textContent = 'Suelta la foto aquí';
      el.appendChild(dropzone);

      input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      el.appendChild(input);

      let uploading = false;
      function handleFile(file) {
        if (!file || file.type.indexOf('image/') !== 0 || uploading) return;
        uploading = true;
        el.classList.add('is-uploading');
        setSrc(id, file)
          .catch((e) => console.error('Amore Atelier: no se pudo subir la imagen.', e))
          .then(() => { uploading = false; el.classList.remove('is-uploading'); });
      }
      input.addEventListener('change', () => { if (input.files[0]) handleFile(input.files[0]); input.value = ''; });
      el.addEventListener('dragover', (e) => { e.preventDefault(); el.classList.add('is-dragover'); });
      el.addEventListener('dragleave', () => el.classList.remove('is-dragover'));
      el.addEventListener('drop', (e) => {
        e.preventDefault();
        el.classList.remove('is-dragover');
        const file = e.dataTransfer.files && e.dataTransfer.files[0];
        handleFile(file);
      });

      if (repositionable) {
        let dragging = false, startX = 0, startY = 0, startPos = { x: 50, y: 50 }, overflowX = 0, overflowY = 0, pendingPos = null;
        el.addEventListener('pointerdown', (e) => {
          if (e.button !== 0 || !getSrc(id) || !img.naturalWidth || !img.naturalHeight) return;
          dragging = true;
          dragMoved = false;
          startX = e.clientX; startY = e.clientY;
          const rect = el.getBoundingClientRect();
          const scale = Math.max(rect.width / img.naturalWidth, rect.height / img.naturalHeight) || 1;
          overflowX = Math.max(0, img.naturalWidth * scale - rect.width);
          overflowY = Math.max(0, img.naturalHeight * scale - rect.height);
          const parts = getPos(id).split(' ').map(parseFloat);
          startPos = { x: isNaN(parts[0]) ? 50 : parts[0], y: isNaN(parts[1]) ? 50 : parts[1] };
          el.setPointerCapture(e.pointerId);
          el.classList.add('is-repositioning');
        });
        el.addEventListener('pointermove', (e) => {
          if (!dragging) return;
          const dx = e.clientX - startX, dy = e.clientY - startY;
          if (Math.abs(dx) > 3 || Math.abs(dy) > 3) dragMoved = true;
          const newX = overflowX > 0 ? clamp(startPos.x - (dx / overflowX) * 100, 0, 100) : startPos.x;
          const newY = overflowY > 0 ? clamp(startPos.y - (dy / overflowY) * 100, 0, 100) : startPos.y;
          pendingPos = newX.toFixed(1) + '% ' + newY.toFixed(1) + '%';
          img.style.objectPosition = pendingPos;
        });
        function endDrag() {
          if (!dragging) return;
          dragging = false;
          el.classList.remove('is-repositioning');
          if (pendingPos) { savePos(id, pendingPos); pendingPos = null; }
        }
        el.addEventListener('pointerup', endDrag);
        el.addEventListener('pointercancel', endDrag);
      }
    }

    return el;
  }

  window.AAImageStore = { getSrc, hasCustom, subscribe, clearSrc, ready };
  window.AACreateImageSlot = createImageSlot;
})();
