/* Amore Atelier — image slot store + widget.
   Images the owner drops onto a slot are compressed client-side and kept in
   localStorage as data URLs, keyed by slot id. Every rendered instance of a
   given slot id (e.g. the hero photo and its thumbnail in the edit panel)
   re-renders when that slot's image changes. */
(function () {
  const STORE_KEY = 'aa-images-v1';
  const MAX_DIM = 1400;

  function load() {
    try { return JSON.parse(localStorage.getItem(STORE_KEY) || '{}'); } catch (e) { return {}; }
  }
  function save(map) {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(map)); } catch (e) {}
  }

  let cache = load();
  const listeners = {}; // id -> Set of callbacks

  function subscribe(id, cb) {
    (listeners[id] || (listeners[id] = new Set())).add(cb);
    return () => listeners[id].delete(cb);
  }
  function notify(id) {
    (listeners[id] || []).forEach((cb) => cb());
  }

  function getSrc(id) {
    if (cache[id]) return cache[id];
    const def = (window.AA_IMAGE_SLOTS[id] || {}).defaultSrc;
    return def || null;
  }
  function hasCustom(id) {
    return !!cache[id];
  }
  function setSrc(id, dataUrl) {
    cache[id] = dataUrl;
    save(cache);
    notify(id);
  }
  function clearSrc(id) {
    delete cache[id];
    save(cache);
    notify(id);
  }

  function fileToDataUrl(file, done) {
    const img = new Image();
    const reader = new FileReader();
    reader.onload = () => {
      img.onload = () => {
        const scale = Math.min(1, MAX_DIM / Math.max(img.width, img.height));
        const w = Math.round(img.width * scale), h = Math.round(img.height * scale);
        const canvas = document.createElement('canvas');
        canvas.width = w; canvas.height = h;
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);
        let out;
        try { out = canvas.toDataURL('image/webp', 0.85); } catch (e) { out = null; }
        if (!out || out.indexOf('data:image/webp') !== 0) out = canvas.toDataURL('image/jpeg', 0.85);
        done(out);
      };
      img.onerror = () => done(reader.result);
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  }

  /**
   * Builds a self-updating image slot element.
   * @param {string} id - slot id, must exist in window.AA_IMAGE_SLOTS
   * @param {object} opts - { placeholder: string, className: string }
   */
  function createImageSlot(id, opts) {
    opts = opts || {};
    const cfg = window.AA_IMAGE_SLOTS[id] || {};
    const el = document.createElement('div');
    el.className = 'aa-imgslot' + (cfg.fit === 'contain' ? ' aa-fit-contain' : '') + (opts.className ? ' ' + opts.className : '');
    el.setAttribute('data-slot-id', id);
    el.setAttribute('role', 'button');
    el.setAttribute('tabindex', '0');
    el.setAttribute('aria-label', opts.placeholder || 'Imagen');

    const img = document.createElement('img');
    img.alt = opts.placeholder || '';
    img.draggable = false;

    const placeholder = document.createElement('div');
    placeholder.className = 'aa-imgslot-placeholder';
    placeholder.textContent = opts.placeholder || '';

    const dropzone = document.createElement('div');
    dropzone.className = 'aa-imgslot-dropzone';
    dropzone.textContent = 'Suelta la foto aquí';

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';

    el.appendChild(img);
    el.appendChild(placeholder);
    el.appendChild(dropzone);
    el.appendChild(input);

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

    function handleFile(file) {
      if (!file || file.type.indexOf('image/') !== 0) return;
      fileToDataUrl(file, (dataUrl) => setSrc(id, dataUrl));
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

    return el;
  }

  window.AAImageStore = { getSrc, hasCustom, setSrc, clearSrc, subscribe };
  window.AACreateImageSlot = createImageSlot;
})();
