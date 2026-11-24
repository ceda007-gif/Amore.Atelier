/* Amore Atelier — local image slot widget & accessible lightbox with captions & arrows. */
(function () {
  function getSrc(id) {
    const def = (window.AA_IMAGE_SLOTS[id] || {}).defaultSrc;
    return def ? (window.AA_ASSET_BASE || '') + def : null;
  }
  function getPos(id) {
    return (window.AA_IMAGE_SLOTS[id] || {}).pos || '50% 50%';
  }
  function isEn() {
    return (document.documentElement.lang || '').toLowerCase().startsWith('en');
  }

  /* ---------------- shared accessible lightbox ---------------- */
  let lightboxEl = null;
  let lastFocusedEl = null;
  let lbItems = [];
  let lbIndex = 0;

  function renderLightboxItem() {
    if (!lightboxEl || !lbItems.length) return;
    const item = lbItems[lbIndex] || lbItems[0];
    const img = lightboxEl.querySelector('img');
    const cap = lightboxEl.querySelector('.aa-lightbox-cap');
    const prevBtn = lightboxEl.querySelector('.aa-lightbox-prev');
    const nextBtn = lightboxEl.querySelector('.aa-lightbox-next');

    img.src = item.src;
    img.alt = item.alt || '';
    if (cap) {
      const text = item.caption || item.alt || '';
      const count = lbItems.length > 1 ? ` (${lbIndex + 1} / ${lbItems.length})` : '';
      cap.textContent = text ? text + count : '';
      cap.style.display = text ? 'block' : 'none';
    }
    const multi = lbItems.length > 1;
    if (prevBtn) prevBtn.style.display = multi ? 'flex' : 'none';
    if (nextBtn) nextBtn.style.display = multi ? 'flex' : 'none';
  }

  function stepLightbox(delta) {
    if (lbItems.length <= 1) return;
    lbIndex = (lbIndex + delta + lbItems.length) % lbItems.length;
    renderLightboxItem();
  }

  function ensureLightbox() {
    if (lightboxEl) return lightboxEl;
    const en = isEn();
    lightboxEl = document.createElement('div');
    lightboxEl.className = 'aa-lightbox';
    lightboxEl.setAttribute('role', 'dialog');
    lightboxEl.setAttribute('aria-modal', 'true');
    lightboxEl.setAttribute('aria-label', en ? 'Enlarged image view' : 'Vista ampliada de imagen');
    lightboxEl.innerHTML =
      '<button type="button" class="aa-lightbox-close" aria-label="' + (en ? 'Close' : 'Cerrar') + '">&times;</button>' +
      '<button type="button" class="aa-lightbox-nav aa-lightbox-prev" aria-label="' + (en ? 'Previous photo' : 'Foto anterior') + '">&#8249;</button>' +
      '<figure class="aa-lightbox-stage"><img alt=""><figcaption class="aa-lightbox-cap"></figcaption></figure>' +
      '<button type="button" class="aa-lightbox-nav aa-lightbox-next" aria-label="' + (en ? 'Next photo' : 'Siguiente foto') + '">&#8250;</button>';

    lightboxEl.addEventListener('click', (e) => {
      if (e.target.closest('.aa-lightbox-prev')) { stepLightbox(-1); return; }
      if (e.target.closest('.aa-lightbox-next')) { stepLightbox(1); return; }
      if (e.target === lightboxEl || e.target.closest('.aa-lightbox-close')) closeLightbox();
    });

    document.addEventListener('keydown', (e) => {
      if (!lightboxEl || !lightboxEl.classList.contains('is-open')) return;
      if (e.key === 'Escape') { closeLightbox(); return; }
      if (e.key === 'ArrowLeft') { e.preventDefault(); stepLightbox(-1); return; }
      if (e.key === 'ArrowRight') { e.preventDefault(); stepLightbox(1); return; }
      if (e.key === 'Tab') {
        const focusables = [...lightboxEl.querySelectorAll('button')].filter((b) => b.style.display !== 'none');
        if (!focusables.length) return;
        e.preventDefault();
        const cur = focusables.indexOf(document.activeElement);
        const next = e.shiftKey ? (cur <= 0 ? focusables.length - 1 : cur - 1) : (cur + 1) % focusables.length;
        focusables[next].focus();
      }
    });
    document.body.appendChild(lightboxEl);
    return lightboxEl;
  }

  function openLightbox(src, alt, gallery, index, caption) {
    lastFocusedEl = document.activeElement;
    const el = ensureLightbox();
    if (Array.isArray(gallery) && gallery.length) {
      lbItems = gallery;
      lbIndex = typeof index === 'number' && index >= 0 && index < gallery.length ? index : 0;
    } else {
      lbItems = [{ src, alt: alt || '', caption: caption || alt || '' }];
      lbIndex = 0;
    }
    renderLightboxItem();
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
   * @param {object} opts - { src, pos, placeholder, alt, caption, className, eager, gallery, index }
   */
  function createImageSlot(id, opts) {
    opts = opts || {};
    const cfg = window.AA_IMAGE_SLOTS[id] || {};
    const src = opts.src ? (window.AA_ASSET_BASE || '') + opts.src : getSrc(id);
    const pos = opts.pos || getPos(id);
    const label = opts.alt || opts.placeholder || '';
    const caption = opts.caption || opts.placeholder || label;

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
      const en = isEn();
      el.setAttribute('aria-label', label ? (en ? 'Enlarge: ' : 'Ampliar: ') + label : (en ? 'View full image' : 'Ver imagen completa'));

      el.addEventListener('click', (e) => {
        e.stopPropagation();
        openLightbox(src, label, opts.gallery, opts.index, caption);
      });
      el.addEventListener('keydown', (e) => {
        if (e.key !== 'Enter' && e.key !== ' ') return;
        e.preventDefault();
        e.stopPropagation();
        openLightbox(src, label, opts.gallery, opts.index, caption);
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
