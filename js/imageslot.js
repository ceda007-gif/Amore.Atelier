/* Amore Atelier — image slot store + widget.
   Photos live in Firebase Storage; their download URLs are kept in a single
   Firestore doc (images/site) so every visitor sees the same set. Only a
   signed-in admin (see js/app.js) gets the click/drag-to-upload affordance —
   everyone else sees a plain, read-only image. */
(function () {
  const MAX_DIM = 1400;
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

  const ready = window.AA_DB.collection('images').doc('site').get()
    .then((doc) => { if (doc.exists) cache = doc.data() || {}; })
    .catch((e) => { console.error('Amore Atelier: no se pudieron cargar las imágenes.', e); })
    .then(notifyAll);

  function getSrc(id) {
    if (cache[id]) return cache[id];
    const def = (window.AA_IMAGE_SLOTS[id] || {}).defaultSrc;
    return def || null;
  }
  function hasCustom(id) {
    return !!cache[id];
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
        canvas.toBlob((blob) => done(blob || null), 'image/webp', 0.85);
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
          .then((url) => window.AA_DB.collection('images').doc('site').set({ [id]: url }, { merge: true }).then(() => url))
          .then((url) => { cache[id] = url; notify(id); resolve(url); })
          .catch(reject);
      });
    });
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
    const el = document.createElement('div');
    el.className = 'aa-imgslot' + (cfg.fit === 'contain' ? ' aa-fit-contain' : '') + (opts.className ? ' ' + opts.className : '') + (editable ? ' is-editable' : '');
    el.setAttribute('data-slot-id', id);
    if (editable) {
      el.setAttribute('role', 'button');
      el.setAttribute('tabindex', '0');
      el.setAttribute('aria-label', opts.placeholder || 'Imagen');
    }

    const img = document.createElement('img');
    img.alt = opts.placeholder || '';
    img.draggable = false;

    const placeholder = document.createElement('div');
    placeholder.className = 'aa-imgslot-placeholder';
    placeholder.textContent = opts.placeholder || '';

    el.appendChild(img);
    el.appendChild(placeholder);

    function refresh() {
      const src = getSrc(id);
      if (src) {
        img.src = src;
        img.style.display = 'block';
        placeholder.style.display = 'none';
      } else {
        img.style.display = 'none';
        placeholder.style.display = 'flex';
      }
    }
    refresh();
    const unsubscribe = subscribe(id, refresh);
    el._aaUnsubscribe = unsubscribe;

    if (editable) {
      const dropzone = document.createElement('div');
      dropzone.className = 'aa-imgslot-dropzone';
      dropzone.textContent = 'Suelta la foto aquí';
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      el.appendChild(dropzone);
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
      el.addEventListener('click', () => input.click());
      el.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); input.click(); } });
      input.addEventListener('change', () => { if (input.files[0]) handleFile(input.files[0]); input.value = ''; });
      el.addEventListener('dragover', (e) => { e.preventDefault(); el.classList.add('is-dragover'); });
      el.addEventListener('dragleave', () => el.classList.remove('is-dragover'));
      el.addEventListener('drop', (e) => {
        e.preventDefault();
        el.classList.remove('is-dragover');
        const file = e.dataTransfer.files && e.dataTransfer.files[0];
        handleFile(file);
      });
    }

    return el;
  }

  window.AAImageStore = { getSrc, hasCustom, subscribe, ready };
  window.AACreateImageSlot = createImageSlot;
})();
