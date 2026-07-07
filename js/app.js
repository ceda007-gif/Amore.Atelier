/* Amore Atelier — app state, routing and rendering. */
(function () {
  const I18N = window.AA_I18N;
  const DEFAULTS = window.AA_DEFAULTS;
  const WA_BASE = window.AA_WA_BASE;
  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));

  /* ---------------- persistence helpers ---------------- */
  function loadLang() {
    try { const l = localStorage.getItem('aa-lang'); if (l === 'es' || l === 'en') return l; } catch (e) {}
    return 'es';
  }
  function loadSettings() {
    const d = { showNavCta: true, showHeroCta1: true, showHeroCta2: true, showPortfolio: false };
    try {
      const s = JSON.parse(localStorage.getItem('aa-settings') || 'null');
      if (s && typeof s === 'object') return Object.assign({}, d, s);
    } catch (e) {}
    return d;
  }
  function saveSettings(s) { try { localStorage.setItem('aa-settings', JSON.stringify(s)); } catch (e) {} }

  function deepMerge(base, over) {
    const out = Array.isArray(base) ? base.slice() : Object.assign({}, base);
    for (const k in over) {
      if (over[k] && typeof over[k] === 'object' && base[k] && typeof base[k] === 'object') {
        out[k] = deepMerge(base[k], over[k]);
      } else if (over[k] != null) {
        out[k] = over[k];
      }
    }
    return out;
  }
  function loadContent() {
    const d = JSON.parse(JSON.stringify(DEFAULTS));
    try {
      const saved = JSON.parse(localStorage.getItem('aa-content-v2') || 'null');
      if (saved && typeof saved === 'object') return deepMerge(d, saved);
    } catch (e) {}
    return d;
  }
  function saveContent(c) { try { localStorage.setItem('aa-content-v2', JSON.stringify(c)); } catch (e) {} }

  function getByPath(obj, path) {
    return path.split('.').reduce((o, k) => (o == null ? o : o[k]), obj);
  }
  function setByPath(obj, path, val) {
    const parts = path.split('.');
    let o = obj;
    for (let i = 0; i < parts.length - 1; i++) o = o[parts[i]];
    o[parts[parts.length - 1]] = val;
  }

  /* ---------------- state ---------------- */
  const state = {
    page: 'inicio',
    lang: loadLang(),
    filter: 'todos',
    settings: loadSettings(),
    content: loadContent(),
    form: { nombre: '', fecha: '', servicio: '', mensaje: '' }
  };
  state.form.servicio = I18N[state.lang].selectOpts[0];

  function t() { return I18N[state.lang]; }
  function c() { return state.content[state.lang]; }
  function waHref() { return WA_BASE + '?text=' + encodeURIComponent(t().waPrefill); }
  function formWaHref() { return WA_BASE + '?text=' + encodeURIComponent(t().formMsg(state.form)); }

  /* ---------------- admin field spec ---------------- */
  const ADMIN_SECTIONS = [
    { name: 'Inicio · Portada', fields: [
      { label: 'Ubicación (manuscrito)', path: 'heroLoc' },
      { label: 'Título línea 1', path: 'heroTitleA' },
      { label: 'Título línea 2', path: 'heroTitleB' },
      { label: 'Subtítulo', path: 'heroSub', ml: true, wide: true }
    ] },
    { name: 'Inicio · Manifiesto', fields: [{ label: 'Frase principal', path: 'manifesto', ml: true, wide: true }] },
    { name: 'Inicio · Servicios', fields: [{ label: 'Etiqueta', path: 'servEyebrow' }, { label: 'Título', path: 'servTitle' }] },
    { name: 'Nosotros · Bloque 1', fields: [
      { label: 'Título (manuscrito)', path: 'aboutHeading' },
      { label: 'Párrafo 1', path: 'aboutBody1', ml: true, wide: true },
      { label: 'Párrafo 2', path: 'aboutBody2', ml: true, wide: true },
      { label: 'Párrafo 3', path: 'aboutBody3', ml: true, wide: true }
    ] },
    { name: 'Nosotros · Fundadores', fields: [
      { label: 'Título (manuscrito)', path: 'aboutHeading2' },
      { label: 'Texto antes de los nombres', path: 'aboutFoundersLead' },
      { label: 'Nombres (en negritas)', path: 'aboutFoundersNames' },
      { label: 'Texto después de los nombres', path: 'aboutFoundersRest', ml: true, wide: true }
    ] },
    { name: 'Servicio 1', fields: [{ label: 'Título', path: 'services.0.title' }, { label: 'Frase corta (tarjeta)', path: 'services.0.short', ml: true }, { label: 'Descripción (página Servicios)', path: 'services.0.long', ml: true, wide: true }] },
    { name: 'Servicio 2', fields: [{ label: 'Título', path: 'services.1.title' }, { label: 'Frase corta (tarjeta)', path: 'services.1.short', ml: true }, { label: 'Descripción (página Servicios)', path: 'services.1.long', ml: true, wide: true }] },
    { name: 'Servicio 3', fields: [{ label: 'Título', path: 'services.2.title' }, { label: 'Frase corta (tarjeta)', path: 'services.2.short', ml: true }, { label: 'Descripción (página Servicios)', path: 'services.2.long', ml: true, wide: true }] },
    { name: 'Servicio 4', fields: [{ label: 'Título', path: 'services.3.title' }, { label: 'Frase corta (tarjeta)', path: 'services.3.short', ml: true }, { label: 'Descripción (página Servicios)', path: 'services.3.long', ml: true, wide: true }] },
    { name: 'Inicio · Proceso', fields: [
      { label: 'Etiqueta', path: 'procEyebrow' }, { label: 'Título', path: 'procTitle' },
      { label: 'Paso 1 · título', path: 'steps.0.title' }, { label: 'Paso 1 · texto', path: 'steps.0.desc', ml: true },
      { label: 'Paso 2 · título', path: 'steps.1.title' }, { label: 'Paso 2 · texto', path: 'steps.1.desc', ml: true },
      { label: 'Paso 3 · título', path: 'steps.2.title' }, { label: 'Paso 3 · texto', path: 'steps.2.desc', ml: true }
    ] },
    { name: 'Inicio · Testimonio', fields: [{ label: 'Manuscrito', path: 'quoteScript' }, { label: 'Cita', path: 'quoteText', ml: true, wide: true }, { label: 'Autor', path: 'quoteAuthor', wide: true }] },
    { name: 'Página Servicios', fields: [{ label: 'Título', path: 'svcPageTitle' }, { label: 'Intro', path: 'svcPageIntro', ml: true, wide: true }, { label: 'Título del CTA', path: 'svcCtaTitle' }] },
    { name: 'Portafolio', fields: [{ label: 'Título', path: 'portTitle', wide: true }] },
    { name: 'Contacto', fields: [{ label: 'Título', path: 'contactTitle' }, { label: 'Intro', path: 'contactIntro', ml: true, wide: true }, { label: 'Estudio', path: 'estudioVal' }, { label: 'Cobertura', path: 'coberturaVal' }, { label: 'Título del formulario', path: 'formTitle' }] },
    { name: 'Pie de página', fields: [{ label: 'Descripción', path: 'footerDesc', ml: true, wide: true }] }
  ];

  /* ---------------- admin auth ---------------- */
  const ADMIN_AUTH_KEY = 'aa-admin-auth-v1';
  const ADMIN_PASSWORD_HASH = 'd25920fb603773e2ca4e3064e148afbd07250a0fb295ec1aa063489fefef00b2';
  async function sha256Hex(text) {
    const bytes = new TextEncoder().encode(text);
    const digest = await crypto.subtle.digest('SHA-256', bytes);
    return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, '0')).join('');
  }
  function isAdminAuthed() {
    try { return localStorage.getItem(ADMIN_AUTH_KEY) === ADMIN_PASSWORD_HASH; } catch (e) { return false; }
  }
  function syncAdminGate() {
    const authed = isAdminAuthed();
    $('#aa-admin-login').classList.toggle('aa-hidden', authed);
    $('#aa-admin-content').classList.toggle('aa-hidden', !authed);
    $$('.aa-admin-only').forEach((el) => el.classList.toggle('aa-hidden', !authed));
  }
  async function attemptAdminLogin() {
    const input = document.getElementById('aa-admin-pass');
    const error = document.getElementById('aa-admin-login-error');
    const hash = await sha256Hex(input.value);
    if (hash === ADMIN_PASSWORD_HASH) {
      try { localStorage.setItem(ADMIN_AUTH_KEY, hash); } catch (e) {}
      input.value = '';
      error.classList.add('aa-hidden');
      syncAdminGate();
    } else {
      error.classList.remove('aa-hidden');
    }
  }
  function adminLogout() {
    try { localStorage.removeItem(ADMIN_AUTH_KEY); } catch (e) {}
    syncAdminGate();
    goTo('inicio');
  }

  const BUTTON_TOGGLES = [
    { key: 'showPortfolio', label: 'Página "Portafolio" · visible en el sitio' },
    { key: 'showNavCta', label: 'Botón "Cotizar" · barra superior' },
    { key: 'showHeroCta1', label: 'Botón "Solicitar cotización" · portada' },
    { key: 'showHeroCta2', label: 'Botón "Ver portafolio" · portada' }
  ];

  /* ---------------- routing ---------------- */
  const ROUTES = ['inicio', 'nosotros', 'servicios', 'portafolio', 'contacto', 'admin'];
  function pageFromHash() {
    const h = (location.hash || '').replace(/^#\/?/, '');
    return ROUTES.includes(h) ? h : 'inicio';
  }
  function goTo(page) {
    const target = page === 'inicio' ? '' : '/' + page;
    if (location.hash === '#' + target || (target === '' && (location.hash === '' || location.hash === '#'))) {
      applyRoute();
    } else {
      location.hash = target;
    }
  }
  function applyRoute() {
    let p = pageFromHash();
    if (p === 'portafolio' && !state.settings.showPortfolio) {
      location.hash = '';
      return;
    }
    state.page = p;
    syncPage();
    updateSeo();
    window.scrollTo({ top: 0, behavior: 'auto' });
  }

  /* ---------------- lightweight DOM syncs ---------------- */
  function syncPage() {
    $$('.aa-page').forEach((el) => el.classList.toggle('aa-hidden', el.getAttribute('data-page') !== state.page));
    $$('[data-nav]').forEach((b) => b.classList.toggle('is-active', b.getAttribute('data-nav') === state.page));
    if (state.page === 'admin') syncAdminGate();
    if (state.page === 'inicio') {
      const rule = $('.aa-hero-rule');
      if (rule) {
        rule.classList.remove('is-drawn');
        void rule.offsetWidth;
        requestAnimationFrame(() => rule.classList.add('is-drawn'));
      }
    }
    refreshReveal();
  }
  function syncLangButtons() {
    $$('[data-lang]').forEach((b) => b.classList.toggle('is-active', b.getAttribute('data-lang') === state.lang));
    document.documentElement.lang = state.lang;
  }
  function syncVisibilityFlags() {
    const s = state.settings;
    const flags = {
      showNavCta: s.showNavCta,
      showHeroCta1: s.showHeroCta1,
      showHeroCta2: s.showHeroCta2 && s.showPortfolio,
      showPortfolio: s.showPortfolio
    };
    $$('[data-if]').forEach((el) => el.classList.toggle('aa-hidden', !flags[el.getAttribute('data-if')]));
  }
  function syncFilterUI() {
    $$('.aa-filter-btn').forEach((b) => b.classList.toggle('is-active', b.getAttribute('data-filter') === state.filter));
    $$('.aa-gallery-item').forEach((el) => {
      const show = state.filter === 'todos' || el.getAttribute('data-cat') === state.filter;
      el.classList.toggle('is-hidden', !show);
    });
  }
  function syncTextBindings() {
    const V = Object.assign({}, t(), c());
    $$('[data-t]').forEach((el) => {
      const key = el.getAttribute('data-t');
      if (key in V) el.textContent = V[key];
    });
    const wa = waHref();
    ['aa-nav-cta', 'aa-hero-cta1', 'aa-about-cta', 'aa-svc-cta', 'aa-contact-wa', 'aa-footer-wa'].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.href = wa;
    });
  }
  function updateFormSubmitHref() {
    const el = document.getElementById('aa-f-submit');
    if (el) el.href = formWaHref();
  }
  function updateSeo() {
    const T = t();
    const title = (T.seoTitles[state.page] || T.seoTitles.inicio) + ' | ' + T.seoBrand;
    document.title = title;
    document.documentElement.lang = state.lang;
    const setMeta = (sel, val) => { const m = document.querySelector(sel); if (m) m.setAttribute('content', val); };
    setMeta('meta[name="description"]', T.seoDesc);
    setMeta('meta[property="og:title"]', title);
    setMeta('meta[property="og:description"]', T.seoDesc);
    setMeta('meta[property="og:locale"]', state.lang === 'es' ? 'es_MX' : 'en_US');
    setMeta('meta[name="twitter:title"]', title);
    setMeta('meta[name="twitter:description"]', T.seoDesc);
  }

  /* ---------------- dynamic list builders ---------------- */
  function clearSlots(container) {
    $$('.aa-imgslot', container).forEach((el) => { if (el._aaUnsubscribe) el._aaUnsubscribe(); });
    container.innerHTML = '';
  }

  function renderServicesAndSteps() {
    const C = c(), T = t();
    const svcSlots = ['aa-svc1', 'aa-svc2', 'aa-svc3', 'aa-svc4'];

    // Home services grid
    const grid = document.getElementById('aa-services-grid');
    clearSlots(grid);
    C.services.forEach((svc, i) => {
      const card = document.createElement('button');
      card.className = 'aa-svc-card';
      card.setAttribute('data-reveal', '');
      const slot = window.AACreateImageSlot(svcSlots[i], { placeholder: svc.title, className: 'aa-svc-card-photo' });
      const body = document.createElement('div');
      body.className = 'aa-svc-body';
      body.innerHTML =
        '<span class="aa-svc-n">0' + (i + 1) + '</span>' +
        '<h3></h3><p></p>';
      body.querySelector('h3').textContent = svc.title;
      body.querySelector('p').textContent = svc.short;
      card.appendChild(slot);
      card.appendChild(body);
      card.addEventListener('click', () => goTo('servicios'));
      grid.appendChild(card);
    });

    // Home process steps
    const proc = document.getElementById('aa-process-grid');
    proc.innerHTML = '';
    C.steps.forEach((st, i) => {
      const div = document.createElement('div');
      div.className = 'aa-step';
      div.setAttribute('data-reveal', '');
      div.innerHTML = '<span class="aa-step-n">0' + (i + 1) + '</span><h3></h3><p></p>';
      div.querySelector('h3').textContent = st.title;
      div.querySelector('p').textContent = st.desc;
      proc.appendChild(div);
    });

    // Servicios detail rows
    const rows = document.getElementById('aa-svc-rows');
    clearSlots(rows);
    C.services.forEach((svc, i) => {
      const row = document.createElement('div');
      row.className = 'aa-svc-row';
      row.setAttribute('data-reveal', '');
      const slot = window.AACreateImageSlot(svcSlots[i], { placeholder: svc.title, className: 'aa-svc-row-photo' });
      slot.style.order = i % 2 === 0 ? '0' : '2';
      const textWrap = document.createElement('div');
      textWrap.style.order = '1';
      const tagsHtml = T.tags[i].map((tag) => '<li></li>').join('');
      textWrap.innerHTML =
        '<span class="aa-svc-row-n">0' + (i + 1) + '</span><h2></h2><p></p>' +
        '<ul class="aa-tag-list">' + tagsHtml + '</ul>';
      textWrap.querySelector('h2').textContent = svc.title;
      textWrap.querySelector('p').textContent = svc.long;
      $$('li', textWrap).forEach((li, j) => { li.textContent = T.tags[i][j]; });
      row.appendChild(slot);
      row.appendChild(textWrap);
      rows.appendChild(row);
    });
  }

  function renderGallery() {
    const T = t();
    const heights = ['360px', '260px', '300px', '340px', '280px', '380px', '300px', '260px', '340px'];
    const cats = ['letreros', 'seating', 'papeleria', 'letreros', 'senaletica', 'papeleria', 'seating', 'letreros', 'papeleria'];

    const filtersEl = document.getElementById('aa-filters');
    filtersEl.innerHTML = '';
    [{ key: 'todos' }, { key: 'letreros' }, { key: 'seating' }, { key: 'papeleria' }, { key: 'senaletica' }].forEach((f) => {
      const btn = document.createElement('button');
      btn.className = 'aa-filter-btn';
      btn.setAttribute('data-filter', f.key);
      btn.textContent = T.filters[f.key];
      btn.addEventListener('click', () => { state.filter = f.key; syncFilterUI(); });
      filtersEl.appendChild(btn);
    });

    const gal = document.getElementById('aa-gallery');
    clearSlots(gal);
    heights.forEach((h, i) => {
      const item = document.createElement('div');
      item.className = 'aa-gallery-item';
      item.setAttribute('data-cat', cats[i]);
      item.style.height = h;
      const slot = window.AACreateImageSlot('aa-g' + i, { placeholder: T.galPh + (i + 1), className: 'aa-gallery-photo' });
      const tag = document.createElement('span');
      tag.className = 'aa-gallery-tag';
      tag.textContent = T.gtags[i];
      item.appendChild(slot);
      item.appendChild(tag);
      gal.appendChild(item);
    });
    syncFilterUI();
  }

  function renderContactSelect() {
    const T = t();
    const sel = document.getElementById('aa-f-servicio');
    const prevValue = sel.value;
    const prevOpts = $$('option', sel).map((o) => o.value);
    const prevIdx = prevOpts.indexOf(prevValue);
    sel.innerHTML = '';
    T.selectOpts.forEach((opt) => {
      const o = document.createElement('option');
      o.value = opt; o.textContent = opt;
      sel.appendChild(o);
    });
    const idx = prevIdx >= 0 ? prevIdx : 0;
    sel.value = T.selectOpts[idx];
    state.form.servicio = sel.value;
  }

  function renderAdminFields() {
    const C = c();
    const container = document.getElementById('aa-admin-sections');
    container.innerHTML = '';
    ADMIN_SECTIONS.forEach((sec) => {
      const card = document.createElement('div');
      card.className = 'aa-admin-card';
      const h2 = document.createElement('h2');
      h2.textContent = sec.name;
      const fieldsWrap = document.createElement('div');
      fieldsWrap.className = 'aa-admin-fields';
      sec.fields.forEach((fld) => {
        const wrap = document.createElement('div');
        wrap.className = 'aa-admin-field' + (fld.wide ? ' aa-field-wide' : '');
        const label = document.createElement('label');
        label.textContent = fld.label;
        wrap.appendChild(label);
        const value = getByPath(C, fld.path) || '';
        let input;
        if (fld.ml) {
          input = document.createElement('textarea');
          input.rows = 3;
        } else {
          input = document.createElement('input');
          input.type = 'text';
        }
        input.value = value;
        input.addEventListener('input', () => {
          setByPath(state.content[state.lang], fld.path, input.value);
          saveContent(state.content);
          renderServicesAndSteps();
          syncTextBindings();
        });
        wrap.appendChild(input);
        fieldsWrap.appendChild(wrap);
      });
      card.appendChild(h2);
      card.appendChild(fieldsWrap);
      container.appendChild(card);
    });
    renderToggleRows();
    renderAdminImageGroups();
  }

  function renderToggleRows() {
    const wrap = document.getElementById('aa-admin-toggles');
    wrap.innerHTML = '';
    BUTTON_TOGGLES.forEach((bt) => {
      const row = document.createElement('div');
      row.className = 'aa-toggle-row';
      const span = document.createElement('span');
      span.textContent = bt.label;
      const toggle = document.createElement('button');
      toggle.className = 'aa-toggle' + (state.settings[bt.key] ? ' is-on' : '');
      toggle.innerHTML = '<span class="aa-toggle-knob"></span>';
      toggle.addEventListener('click', () => {
        state.settings[bt.key] = !state.settings[bt.key];
        saveSettings(state.settings);
        renderToggleRows();
        syncVisibilityFlags();
        if (bt.key === 'showPortfolio' && !state.settings.showPortfolio && state.page === 'portafolio') {
          goTo('inicio');
        }
      });
      row.appendChild(span);
      row.appendChild(toggle);
      wrap.appendChild(row);
    });
  }

  function renderAdminImageGroups() {
    const heroWrap = document.getElementById('aa-admin-hero-slot');
    clearSlots(heroWrap);
    heroWrap.appendChild(window.AACreateImageSlot('aa-hero', { placeholder: 'Foto principal (hero)', className: 'aa-admin-thumb-400' }));

    const aboutGrid = document.getElementById('aa-admin-about-grid');
    clearSlots(aboutGrid);
    [
      { id: 'aa-about1', ph: 'Foto de la pareja', size: 'Horizontal · 1400 × 1100 px' },
      { id: 'aa-about2', ph: 'Foto Dariana & Aldo', size: 'Vertical · 1000 × 1300 px' }
    ].forEach((d) => {
      const item = document.createElement('div');
      item.className = 'aa-admin-img-item';
      item.appendChild(window.AACreateImageSlot(d.id, { placeholder: d.ph, className: 'aa-admin-thumb-200' }));
      const size = document.createElement('span');
      size.className = 'aa-admin-img-size';
      size.textContent = d.size;
      item.appendChild(size);
      aboutGrid.appendChild(item);
    });

    const svcGrid = document.getElementById('aa-admin-svc-grid');
    clearSlots(svcGrid);
    const svcNames = ['Letreros de bienvenida', 'Seating charts', 'Papelería de mesa', 'Señalética'];
    ['aa-svc1', 'aa-svc2', 'aa-svc3', 'aa-svc4'].forEach((id, i) => {
      const item = document.createElement('div');
      item.className = 'aa-admin-img-item';
      item.appendChild(window.AACreateImageSlot(id, { placeholder: svcNames[i], className: 'aa-admin-thumb-130' }));
      const size = document.createElement('span');
      size.className = 'aa-admin-img-size';
      size.textContent = '1200 × 900 px';
      item.appendChild(size);
      svcGrid.appendChild(item);
    });

    const galGrid = document.getElementById('aa-admin-gal-grid');
    clearSlots(galGrid);
    for (let i = 0; i < 9; i++) {
      const item = document.createElement('div');
      item.className = 'aa-admin-img-item';
      item.appendChild(window.AACreateImageSlot('aa-g' + i, { placeholder: 'Foto ' + (i + 1), className: 'aa-admin-thumb-120' }));
      const size = document.createElement('span');
      size.className = 'aa-admin-img-size';
      size.textContent = '1000 × 1300 px';
      item.appendChild(size);
      galGrid.appendChild(item);
    }
  }

  function renderStaticImageSlots() {
    document.getElementById('aa-heroimg').appendChild(
      window.AACreateImageSlot('aa-hero', { placeholder: t().heroPh, className: 'aa-hero-photo' })
    );
    document.getElementById('aa-about1-slot').appendChild(
      window.AACreateImageSlot('aa-about1', { placeholder: 'Foto de la pareja', className: 'aa-about-photo' })
    );
    document.getElementById('aa-about2-slot').appendChild(
      window.AACreateImageSlot('aa-about2', { placeholder: 'Foto de Dariana & Aldo', className: 'aa-about-photo2' })
    );
  }
  function updateHeroPlaceholder() {
    const ph = document.querySelector('#aa-heroimg .aa-imgslot-placeholder');
    if (ph) ph.textContent = t().heroPh;
  }

  /* ---------------- reveal-on-scroll ---------------- */
  let revealObserver = null;
  function setupRevealObserver() {
    revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          en.target.classList.add('is-visible');
          revealObserver.unobserve(en.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
  }
  function refreshReveal() {
    const activePage = $('.aa-page[data-page="' + state.page + '"]');
    if (!activePage) return;
    $$('[data-reveal]', activePage).forEach((el, i) => {
      if (!el.classList.contains('is-visible')) {
        el.style.transitionDelay = Math.min(i * 0.05, 0.3) + 's';
        revealObserver.observe(el);
      }
    });
  }

  /* ---------------- scroll effects ---------------- */
  function onScroll() {
    const nav = document.getElementById('aa-nav');
    const y = window.scrollY || 0;
    if (nav) nav.classList.toggle('is-scrolled', y > 30);
    const hero = document.getElementById('aa-heroimg');
    if (hero && state.page === 'inicio') hero.style.transform = 'translateY(' + (y * 0.12) + 'px)';
  }

  /* ---------------- lang / content actions ---------------- */
  function setLang(l) {
    if (l === state.lang) return;
    try { localStorage.setItem('aa-lang', l); } catch (e) {}
    const oldOpts = I18N[state.lang].selectOpts;
    const newOpts = I18N[l].selectOpts;
    const idx = oldOpts.indexOf(state.form.servicio);
    state.lang = l;
    state.form.servicio = idx >= 0 ? newOpts[idx] : newOpts[0];
    renderServicesAndSteps();
    renderGallery();
    renderContactSelect();
    renderAdminFields();
    syncTextBindings();
    syncLangButtons();
    updateHeroPlaceholder();
    updateFormSubmitHref();
    updateSeo();
  }
  function resetContent() {
    try { localStorage.removeItem('aa-content-v2'); } catch (e) {}
    state.content = JSON.parse(JSON.stringify(DEFAULTS));
    renderServicesAndSteps();
    renderGallery();
    renderContactSelect();
    renderAdminFields();
    syncTextBindings();
  }

  /* ---------------- init ---------------- */
  function bindStaticEvents() {
    document.addEventListener('click', (e) => {
      const goBtn = e.target.closest('[data-go]');
      if (goBtn) { goTo(goBtn.getAttribute('data-go')); return; }
      const langBtn = e.target.closest('[data-lang]');
      if (langBtn) { setLang(langBtn.getAttribute('data-lang')); return; }
    });
    document.getElementById('aa-reset-content').addEventListener('click', resetContent);
    document.getElementById('aa-admin-logout').addEventListener('click', adminLogout);
    document.getElementById('aa-admin-login-btn').addEventListener('click', attemptAdminLogin);
    document.getElementById('aa-admin-pass').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') attemptAdminLogin();
    });

    const fNombre = document.getElementById('aa-f-nombre');
    const fFecha = document.getElementById('aa-f-fecha');
    const fServicio = document.getElementById('aa-f-servicio');
    const fMensaje = document.getElementById('aa-f-mensaje');
    fNombre.addEventListener('input', () => { state.form.nombre = fNombre.value; updateFormSubmitHref(); });
    fFecha.addEventListener('input', () => { state.form.fecha = fFecha.value; updateFormSubmitHref(); });
    fServicio.addEventListener('change', () => { state.form.servicio = fServicio.value; updateFormSubmitHref(); });
    fMensaje.addEventListener('input', () => { state.form.mensaje = fMensaje.value; updateFormSubmitHref(); });

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('hashchange', applyRoute);
  }

  function init() {
    setupRevealObserver();
    bindStaticEvents();
    renderStaticImageSlots();
    renderServicesAndSteps();
    renderGallery();
    renderContactSelect();
    renderAdminFields();
    syncTextBindings();
    syncVisibilityFlags();
    syncLangButtons();
    updateFormSubmitHref();
    applyRoute();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
