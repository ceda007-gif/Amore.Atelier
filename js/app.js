/* Amore Atelier — static application logic (ES/EN routes, local portfolio, hero video & a11y). */
(function () {
  const WA_NUMBER = '526243552989';
  const I18N = window.AA_I18N;
  const DEFAULTS = window.AA_DEFAULTS;

  const state = {
    lang: window.AA_SITE_LANG || 'es',
    page: 'inicio',
    filter: 'todos',
    content: JSON.parse(JSON.stringify(DEFAULTS)),
    settings: { showNavCta: true, showHeroCta1: false, showHeroCta2: false, showPortfolio: true },
    form: { nombre: '', fecha: '', venue: '', servicio: '', mensaje: '' }
  };
  state.form.servicio = I18N[state.lang].selectOpts[0];

  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const t = () => I18N[state.lang];
  const c = () => state.content[state.lang];

  function waHref(text) {
    return 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(text || t().waPrefill);
  }
  function formWaHref() {
    return waHref(t().formMsg(state.form));
  }

  /* ---------------- routing ---------------- */
  const ROUTES = ['inicio', 'nosotros', 'servicios', 'portafolio', 'contacto'];
  function pageFromHash() {
    const h = (location.hash || '').replace(/^#\/?/, '');
    return ROUTES.includes(h) ? h : (window.AA_DEFAULT_PAGE || 'inicio');
  }
  function urlForPage(page) {
    const langBase = window.AA_LANG_BASE != null ? window.AA_LANG_BASE : '';
    const map = window.AA_SITE_LANG === 'en'
      ? { inicio: '', nosotros: 'about/', servicios: 'services/', portafolio: 'portfolio/', contacto: 'contact/' }
      : { inicio: '', nosotros: 'nosotros/', servicios: 'servicios/', portafolio: 'portafolio/', contacto: 'contacto/' };
    if (page in map) return langBase + map[page];
    return null;
  }
  function redirectForMissingPage(page) {
    const u = urlForPage(page);
    if (u != null) { location.href = u; return; }
    location.href = (window.AA_SITE_BASE || '../') + '#/' + page;
  }
  function goTo(page) {
    if (location.protocol !== 'file:') {
      const u = urlForPage(page);
      if (u != null && page !== state.page) {
        location.href = u;
        return;
      }
      if (u != null && page === state.page) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
    }
    if (!document.querySelector('.aa-page[data-page="' + page + '"]')) {
      redirectForMissingPage(page);
      return;
    }
    const target = page === 'inicio' ? '' : '/' + page;
    if (location.hash === '#' + target || (target === '' && (location.hash === '' || location.hash === '#'))) {
      applyRoute();
    } else {
      location.hash = target;
    }
  }
  function applyRoute() {
    const p = pageFromHash();
    if (p === 'portafolio' && !state.settings.showPortfolio) {
      location.hash = '';
      return;
    }
    if (location.protocol !== 'file:' && location.hash) {
      const defPage = window.AA_DEFAULT_PAGE || 'inicio';
      const targetUrl = urlForPage(p);
      if (targetUrl != null && p !== defPage) {
        location.replace(targetUrl);
        return;
      }
      if (p === defPage && window.history && history.replaceState) {
        history.replaceState(null, '', location.pathname + location.search);
      }
    }
    if (!document.querySelector('.aa-page[data-page="' + p + '"]')) {
      redirectForMissingPage(p);
      return;
    }
    state.page = p;
    syncPage();
    updateSeo();
    window.scrollTo({ top: 0, behavior: 'auto' });
    syncHeroVideo();
    onScroll();
  }

  /* ---------------- responsive hero video ---------------- */
  function isMobileHero() {
    return !!(window.matchMedia && window.matchMedia('(max-width: 860px), (orientation: portrait) and (max-width: 1024px)').matches);
  }
  function syncHeroVideo() {
    const v = document.getElementById('aa-hero-video');
    if (!v) return;
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const saveData = !!(navigator.connection && navigator.connection.saveData);
    const mobile = isMobileHero();
    const mode = mobile ? 'mobile' : 'desktop';
    const base = v.getAttribute('data-asset-base') || ((window.AA_ASSET_BASE || '') + 'assets/');
    if (v.getAttribute('data-hero-mode') !== mode) {
      v.poster = base + (mobile ? 'hero-mobile-poster.jpg' : 'hero-poster.jpg');
      v.setAttribute('data-hero-mode', mode);
      if (state.page === 'inicio' && !reduce && !saveData) {
        while (v.firstChild) v.removeChild(v.firstChild);
        const prefix = mobile ? 'hero-mobile' : 'hero-video';
        [['webm', 'video/webm'], ['mp4', 'video/mp4']].forEach(([ext, type]) => {
          const s = document.createElement('source');
          s.src = base + prefix + '.' + ext;
          s.type = type;
          v.appendChild(s);
        });
        v.load();
      }
    }
    if (state.page === 'inicio' && !reduce && !saveData && !document.hidden) {
      v.muted = true;
      const pr = v.play();
      if (pr && pr.catch) pr.catch(() => {});
    } else {
      v.pause();
    }
  }

  /* ---------------- lightweight DOM syncs ---------------- */
  function syncPage() {
    $$('.aa-page').forEach((el) => el.classList.toggle('aa-hidden', el.getAttribute('data-page') !== state.page));
    $$('[data-nav]').forEach((b) => b.classList.toggle('is-active', b.getAttribute('data-nav') === state.page));
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
    ['aa-nav-cta', 'aa-about-cta', 'aa-svc-cta', 'aa-planners-cta', 'aa-closing-wa', 'aa-contact-wa', 'aa-footer-wa'].forEach((id) => {
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
    const desc = (T.seoDescs && T.seoDescs[state.page]) || T.seoDesc;
    document.title = title;
    document.documentElement.lang = state.lang;
    const setMeta = (sel, val) => { const m = document.querySelector(sel); if (m) m.setAttribute('content', val); };
    setMeta('meta[name="description"]', desc);
    setMeta('meta[property="og:title"]', title);
    setMeta('meta[property="og:description"]', desc);
    setMeta('meta[property="og:locale"]', state.lang === 'es' ? 'es_MX' : 'en_US');
    setMeta('meta[name="twitter:title"]', title);
    setMeta('meta[name="twitter:description"]', desc);
  }

  /* ---------------- dynamic list builders ---------------- */
  function renderFeaturedWork() {
    const grid = document.getElementById('aa-featured-grid');
    if (!grid) return;
    const ids = window.AA_FEATURED || [];
    const items = window.AA_PORTFOLIO || [];
    const modifiers = ['aa-featured-item--lead', 'aa-featured-item--mid', 'aa-featured-item--detail'];

    grid.innerHTML = '';
    ids.forEach((id, i) => {
      const p = items.find((item) => item.id === id);
      if (!p) return;
      const meta = p[state.lang] || p.es;
      const fig = document.createElement('figure');
      fig.className = 'aa-featured-item ' + (modifiers[i] || '');
      fig.setAttribute('data-reveal', '');

      const frame = document.createElement('div');
      frame.className = 'aa-featured-frame';
      const slot = window.AACreateImageSlot('feat-' + p.id, {
        src: p.src,
        pos: p.pos || '50% 50%',
        alt: meta.alt || meta.title,
        placeholder: meta.title,
        className: 'aa-featured-photo'
      });
      frame.appendChild(slot);

      const cap = document.createElement('figcaption');
      cap.className = 'aa-featured-cap';
      cap.innerHTML = '<span class="aa-featured-event"></span><strong class="aa-featured-title"></strong>';
      cap.querySelector('.aa-featured-event').textContent = meta.event;
      cap.querySelector('.aa-featured-title').textContent = meta.title;

      fig.appendChild(frame);
      fig.appendChild(cap);
      grid.appendChild(fig);
    });
  }

  function renderServicesAndSteps() {
    const grid = document.getElementById('aa-services-grid');
    if (!grid) return;
    const C = c(), T = t();
    const svcSlots = ['aa-svc1', 'aa-svc2', 'aa-svc3', 'aa-svc4'];
    const svcHref = urlForPage('servicios') || '#/servicios';

    grid.innerHTML = '';
    C.services.forEach((svc, i) => {
      const card = document.createElement('a');
      card.className = 'aa-svc-card aa-svc-card-textonly';
      card.href = svcHref;
      card.setAttribute('data-go', 'servicios');
      card.setAttribute('data-reveal', '');
      const body = document.createElement('div');
      body.className = 'aa-svc-body';
      body.innerHTML = '<span class="aa-svc-n">0' + (i + 1) + '</span><h3></h3><p></p>';
      body.querySelector('h3').textContent = svc.title;
      body.querySelector('p').textContent = svc.short;
      card.appendChild(body);
      grid.appendChild(card);
    });

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

    const rows = document.getElementById('aa-svc-rows');
    rows.innerHTML = '';
    C.services.forEach((svc, i) => {
      const row = document.createElement('div');
      row.className = 'aa-svc-row';
      row.setAttribute('data-reveal', '');
      const slot = window.AACreateImageSlot(svcSlots[i], { placeholder: svc.title, alt: svc.title, className: 'aa-svc-row-photo' });
      slot.style.order = i % 2 === 0 ? '0' : '2';
      const textWrap = document.createElement('div');
      textWrap.style.order = '1';
      const tagsHtml = T.tags[i].map(() => '<li></li>').join('');
      textWrap.innerHTML =
        '<span class="aa-svc-row-n">0' + (i + 1) + '</span><h2></h2><p></p>' +
        '<ul class="aa-tag-list">' + tagsHtml + '</ul>' +
        '<a class="aa-link-underline aa-svc-cta-link" target="_blank" rel="noopener"></a>';
      textWrap.querySelector('h2').textContent = svc.title;
      textWrap.querySelector('p').textContent = svc.long;
      $$('li', textWrap).forEach((li, j) => { li.textContent = T.tags[i][j]; });
      const ctaLink = textWrap.querySelector('.aa-svc-cta-link');
      ctaLink.textContent = T.svcCtaLink;
      ctaLink.href = waHref(T.svcWaMsg(svc.title));
      row.appendChild(slot);
      row.appendChild(textWrap);
      rows.appendChild(row);
    });
  }

  function renderGallery() {
    const filtersEl = document.getElementById('aa-filters');
    if (!filtersEl) return;
    const T = t();
    const items = window.AA_PORTFOLIO || [];

    filtersEl.innerHTML = '';
    [{ key: 'todos' }, { key: 'letreros' }, { key: 'seating' }, { key: 'papeleria' }, { key: 'senaletica' }].forEach((f) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'aa-filter-btn';
      btn.setAttribute('data-filter', f.key);
      btn.textContent = T.filters[f.key];
      btn.addEventListener('click', () => { state.filter = f.key; syncFilterUI(); });
      filtersEl.appendChild(btn);
    });

    const gal = document.getElementById('aa-gallery');
    gal.innerHTML = '';
    items.forEach((p) => {
      const meta = p[state.lang] || p.es;
      const fig = document.createElement('figure');
      fig.className = 'aa-gallery-item';
      fig.setAttribute('data-cat', p.cat);

      const frame = document.createElement('div');
      frame.className = 'aa-gallery-frame';
      frame.style.aspectRatio = p.ratio || '3 / 4';

      const slot = window.AACreateImageSlot(p.id, {
        src: p.src,
        pos: p.pos || '50% 50%',
        alt: meta.alt || meta.title,
        placeholder: meta.title,
        className: 'aa-gallery-photo'
      });
      frame.appendChild(slot);

      const cap = document.createElement('figcaption');
      cap.className = 'aa-gallery-cap';
      cap.innerHTML = '<strong class="aa-gallery-title"></strong><span class="aa-gallery-event"></span>';
      cap.querySelector('.aa-gallery-title').textContent = meta.title;
      cap.querySelector('.aa-gallery-event').textContent = meta.event + ' · ' + meta.tag;

      fig.appendChild(frame);
      fig.appendChild(cap);
      gal.appendChild(fig);
    });
    syncFilterUI();
  }

  function renderContactSelect() {
    const sel = document.getElementById('aa-f-servicio');
    if (!sel) return;
    const T = t();
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
    sel.value = T.selectOpts[idx] || T.selectOpts[0];
    state.form.servicio = sel.value;

    const fNombre = document.getElementById('aa-f-nombre');
    const fFecha = document.getElementById('aa-f-fecha');
    const fVenue = document.getElementById('aa-f-venue');
    const fMensaje = document.getElementById('aa-f-mensaje');
    if (fNombre) fNombre.placeholder = T.fNombrePh;
    if (fFecha) fFecha.placeholder = T.fFechaPh;
    if (fVenue) fVenue.placeholder = T.fVenuePh;
    if (fMensaje) fMensaje.placeholder = T.fMensajePh;
  }

  function renderStaticImageSlots() {
    const about1Wrap = document.getElementById('aa-about1-slot');
    if (!about1Wrap) return;
    about1Wrap.innerHTML = '';
    about1Wrap.appendChild(window.AACreateImageSlot('aa-about1', {
      placeholder: 'Amore Atelier · Los Cabos',
      alt: state.lang === 'en' ? 'Amore Atelier custom wedding welcome sign in Los Cabos' : 'Letrero de bienvenida a medida de Amore Atelier en Los Cabos',
      className: 'aa-about-photo'
    }));

    const about2Wrap = document.getElementById('aa-about2-slot');
    about2Wrap.innerHTML = '';
    about2Wrap.appendChild(window.AACreateImageSlot('aa-about2', {
      placeholder: 'Dariana & Aldo',
      alt: 'Dariana & Aldo — Amore Atelier',
      className: 'aa-about-photo2'
    }));
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
  let lastScrollY = window.scrollY || 0;
  function onScroll() {
    const nav = document.getElementById('aa-nav');
    const links = document.getElementById('aa-navlinks');
    const y = window.scrollY || 0;
    if (nav) {
      nav.classList.toggle('is-scrolled', y > 30);
      if ((links && links.classList.contains('is-open')) || y <= 80) {
        nav.classList.remove('is-nav-hidden');
      } else if (y > lastScrollY + 6) {
        nav.classList.add('is-nav-hidden');
      } else if (y < lastScrollY - 6) {
        nav.classList.remove('is-nav-hidden');
      }
    }
    lastScrollY = y;
    const heroVideo = document.getElementById('aa-hero-video');
    if (nav) nav.classList.toggle('is-over-hero', !!heroVideo && state.page === 'inicio' && y <= 30);
    if (heroVideo && state.page === 'inicio') {
      heroVideo.style.transform = isMobileHero() ? '' : 'translateY(' + (y * 0.25) + 'px) scale(1.04)';
    }
  }

  function renderAll() {
    renderStaticImageSlots();
    renderFeaturedWork();
    renderServicesAndSteps();
    renderGallery();
    renderContactSelect();
    syncTextBindings();
    syncVisibilityFlags();
    updateFormSubmitHref();
    refreshReveal();
  }
  function syncSiteLangButtons() {
    $$('[data-site-lang]').forEach((b) => b.classList.toggle('is-active', b.getAttribute('data-site-lang') === window.AA_SITE_LANG));
  }
  function goToLangSite(l) {
    if (l === window.AA_SITE_LANG) return;
    if (window.AA_ALT_LANG_URL) { location.href = window.AA_ALT_LANG_URL; return; }
    const target = l === 'en' ? 'en/' : '../';
    location.href = target + location.hash;
  }

  /* ---------------- mobile nav ---------------- */
  function closeMobileNav(returnFocus) {
    const nav = document.getElementById('aa-nav');
    const toggle = document.getElementById('aa-nav-toggle');
    const links = document.getElementById('aa-navlinks');
    if (!toggle || !links) return;
    const wasOpen = links.classList.contains('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    links.classList.remove('is-open');
    if (nav) nav.classList.remove('is-menu-open');
    if (returnFocus && wasOpen) toggle.focus();
  }
  function bindMobileNav() {
    const nav = document.getElementById('aa-nav');
    const toggle = document.getElementById('aa-nav-toggle');
    const links = document.getElementById('aa-navlinks');
    if (!toggle || !links) return;
    toggle.addEventListener('click', () => {
      const open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!open));
      links.classList.toggle('is-open', !open);
      if (nav) nav.classList.toggle('is-menu-open', !open);
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && links.classList.contains('is-open')) closeMobileNav(true);
    });
    document.addEventListener('click', (e) => {
      if (links.classList.contains('is-open') && nav && !nav.contains(e.target)) closeMobileNav(false);
    });
    window.addEventListener('resize', () => {
      if (window.innerWidth > 860 && links.classList.contains('is-open')) closeMobileNav(false);
    }, { passive: true });
  }

  /* ---------------- init ---------------- */
  function bindStaticEvents() {
    document.addEventListener('click', (e) => {
      const goBtn = e.target.closest('[data-go]');
      if (goBtn) {
        if (goBtn.tagName === 'A' && (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button === 1)) return;
        if (goBtn.tagName === 'A') e.preventDefault();
        goTo(goBtn.getAttribute('data-go'));
        closeMobileNav(false);
        return;
      }
      const siteLangBtn = e.target.closest('[data-site-lang]');
      if (siteLangBtn) { goToLangSite(siteLangBtn.getAttribute('data-site-lang')); return; }
      const faqBtn = e.target.closest('[data-faq-btn]');
      if (faqBtn) {
        const item = faqBtn.closest('.aa-faq-item');
        if (item) {
          const open = !item.classList.contains('is-open');
          item.classList.toggle('is-open', open);
          faqBtn.setAttribute('aria-expanded', String(open));
        }
        return;
      }
    });
    bindMobileNav();
    syncSiteLangButtons();

    const fNombre = document.getElementById('aa-f-nombre');
    const fFecha = document.getElementById('aa-f-fecha');
    const fVenue = document.getElementById('aa-f-venue');
    const fServicio = document.getElementById('aa-f-servicio');
    const fMensaje = document.getElementById('aa-f-mensaje');
    if (fNombre) fNombre.addEventListener('input', () => { state.form.nombre = fNombre.value; updateFormSubmitHref(); });
    if (fFecha) fFecha.addEventListener('input', () => { state.form.fecha = fFecha.value; updateFormSubmitHref(); });
    if (fVenue) fVenue.addEventListener('input', () => { state.form.venue = fVenue.value; updateFormSubmitHref(); });
    if (fServicio) fServicio.addEventListener('change', () => { state.form.servicio = fServicio.value; updateFormSubmitHref(); });
    if (fMensaje) fMensaje.addEventListener('input', () => { state.form.mensaje = fMensaje.value; updateFormSubmitHref(); });

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('hashchange', applyRoute);
    document.addEventListener('visibilitychange', syncHeroVideo);
    window.addEventListener('resize', syncHeroVideo, { passive: true });
  }

  function init() {
    setupRevealObserver();
    bindStaticEvents();
    renderAll();
    applyRoute();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
