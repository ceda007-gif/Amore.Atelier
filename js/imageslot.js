/* Amore Atelier — local image slot widget & accessible lightbox (no Firebase). */
(function () {
  function getSrc(id) {
    const def = (window.AA_IMAGE_SLOTS[id] || {}).defaultSrc;
    return def ? (window.AA_ASSET_BASE || '') + def : null;
  }
  function getPos(id) {
    return (window.AA_IMAGE_SLOTS[id] || {}).pos || '50% 50%';
  }

  /* ---------------- shared accessible lightbox ---------------- */
  let lightboxEl = null;
  let lastFocusedEl = null;
  function ensureLightbox() {
    if (lightboxEl) return lightboxEl;
    lightboxEl = document.createElement('div');
    lightboxEl.className = 'aa-lightbox';
    lightboxEl.setAttribute('role', 'dialog');
    lightboxEl.setAttribute('aria-modal', 'true');
    lightboxEl.setAttribute('aria-label', 'Vista ampliada de imagen');
    lightboxEl.innerHTML = '<button type="button" class="aa-lightbox-close" aria-label="Cerrar">&times;</button><img alt="">';
    lightboxEl.addEventListener('click', (e) => {
      if (e.target === lightboxEl || e.target.closest('.aa-lightbox-close')) closeLightbox();
    });
    document.addEventListener('keydown', (e) => {
      if (!lightboxEl || !lightboxEl.classList.contains('is-open')) return;
      if (e.key === 'Escape') { closeLightbox(); return; }
      if (e.key === 'Tab') {
        e.preventDefault();
        const closeBtn = lightboxEl.querySelector('.aa-lightbox-close');
        if (closeBtn) closeBtn.focus();
      }
    });
    document.body.appendChild(lightboxEl);
    return lightboxEl;
  }
  function openLightbox(src, alt) {
    lastFocusedEl = document.activeElement;
    const el = ensureLightbox();
    const img = el.querySelector('img');
    img.src = src;
    img.alt = alt || '';
    el.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    const closeBtn = el.querySelector('.aa-lightbox-close');
    if (closeBtn) closeBtn.focus();
  }
  function closeLightbox() {
    if (!lightboxEl || !lightboxEl.classList.contains('is-open')) return;
    lightboxEl.classList.remove('is-open');
    document.body.style.overflow = '';
    if (lastFocusedEl && typeof lastFocusedEl.focus === 'function' && document.contains(lastFocusedEl)) {
      lastFocusedEl.focus();
    }
    lastFocusedEl = null;
  }

  /**
   * Builds an accessible image slot element from local assets or explicit src.
   * @param {string} id - slot id in window.AA_IMAGE_SLOTS (or custom key when opts.src is set)
   * @param {object} opts - { src, pos, placeholder, alt, className, eager }
   */
  function createImageSlot(id, opts) {
    opts = opts || {};
    const cfg = window.AA_IMAGE_SLOTS[id] || {};
    const src = opts.src ? (window.AA_ASSET_BASE || '') + opts.src : getSrc(id);
    const pos = opts.pos || getPos(id);
    const label = opts.alt || opts.placeholder || '';

    const el = document.createElement('div');
    el.className = 'aa-imgslot' + (cfg.fit === 'contain' ? ' aa-fit-contain' : '') + (opts.className ? ' ' + opts.className : '');
    el.setAttribute('data-slot-id', id);

    const img = document.createElement('img');
    img.alt = label;
    img.draggable = false;
    img.loading = opts.eager ? 'eager' : 'lazy';
    img.decoding = 'async';
    img.style.objectPosition = pos;

    const placeholder = document.createElement('div');
    placeholder.className = 'aa-imgslot-placeholder';
    placeholder.textContent = opts.placeholder || '';

    el.appendChild(img);
    el.appendChild(placeholder);

    if (src) {
      img.src = src;
      img.style.display = 'block';
      placeholder.style.display = 'none';
      el.classList.add('has-image');
      el.setAttribute('role', 'button');
      el.setAttribute('tabindex', '0');
      el.setAttribute('aria-label', label ? 'Ampliar: ' + label : 'Ver imagen completa');

      el.addEventListener('click', (e) => {
        e.stopPropagation();
        openLightbox(src, label);
      });
      el.addEventListener('keydown', (e) => {
        if (e.key !== 'Enter' && e.key !== ' ') return;
        e.preventDefault();
        e.stopPropagation();
        openLightbox(src, label);
      });
    } else {
      img.style.display = 'none';
      placeholder.style.display = 'flex';
    }

    return el;
  }

  window.AAImageStore = { getSrc, getPos, openLightbox };
  window.AACreateImageSlot = createImageSlot;
})();
