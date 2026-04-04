// Site-wide search over dissents/index.json
// Rounded, icon-only control; filters Ledger items in-place (no dropdown)
(function() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  // Inject minimal UI if missing
  let wrap = document.querySelector('.site-search');
  if (!wrap) {
    wrap = document.createElement('div');
    wrap.className = 'site-search';
    wrap.innerHTML = `
      <label class="visually-hidden" for="site-search">Search dissents</label>
      <input id="site-search" class="site-search-input" type="search" autocomplete="off" />
    `;
    header.appendChild(wrap);
  }

  const input = wrap.querySelector('#site-search');
  if (!input) return;

  // Toggle compact/expanded visual state
  const updateActive = () => {
    const has = document.activeElement === input || (input.value && input.value.trim().length > 0);
    wrap.classList.toggle('active', !!has);
  };
  input.addEventListener('focus', updateActive);
  input.addEventListener('blur', updateActive);

  // Fetch index.json once
  let data = null;
  let postsByTitle = null; // map lower(title) -> slug
  let loading = false;
  const loadData = async () => {
    if (data || loading) return data;
    loading = true;
    try {
      const res = await fetch('dissents/index.json', { cache: 'no-store' });
      const json = await res.json();
      data = Array.isArray(json?.dissents) ? json.dissents : [];
    } catch (e) {
      data = [];
      // eslint-disable-next-line no-console
      console.warn('Search: failed to load dissents/index.json', e);
    }
    // Map AD_DATA target titles to slugs for ledger correlation
    postsByTitle = {};
    if (window.AD_DATA && Array.isArray(window.AD_DATA.posts)) {
      window.AD_DATA.posts.forEach(p => {
        if (p?.target?.title && p?.slug) {
          postsByTitle[p.target.title.toLowerCase()] = p.slug;
        }
      });
    }
    loading = false;
    return data;
  };

  const debounce = (fn, ms) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn.apply(null, a), ms); }; };
  const norm = (s) => (s || '').toString().toLowerCase();

  // Cache ledger items (by slug) if present on the page
  let ledgerCache = null; // { map: { slug -> element }, listEl, emptyEl }
  const initLedgerCache = () => {
    if (ledgerCache) return ledgerCache;
    const listEl = document.getElementById('ledger');
    if (!listEl) return null;
    const items = Array.from(listEl.querySelectorAll('.ledger-item'));
    const map = {};
    items.forEach(el => {
      // Derive slug from the title link href param
      const a = el.querySelector('a.title');
      if (!a) return;
      try {
        const url = new URL(a.getAttribute('href'), location.href);
        const slug = new URLSearchParams(url.search).get('slug');
        if (slug) map[slug] = el;
      } catch(_) {}
    });
    // Prepare hidden empty state element
    let emptyEl = document.getElementById('ledger-empty');
    if (!emptyEl) {
      emptyEl = document.createElement('div');
      emptyEl.id = 'ledger-empty';
      emptyEl.className = 'meta';
      emptyEl.textContent = 'No matches.';
      emptyEl.style.display = 'none';
      listEl.appendChild(emptyEl);
    }
    ledgerCache = { map, listEl, emptyEl };
    return ledgerCache;
  };

  const filterLedger = (allowedSlugs) => {
    const cache = initLedgerCache();
    if (!cache) return; // not on Ledger page
    const { map, emptyEl } = cache;
    const showAll = !allowedSlugs; // null/undefined means clear filter
    let visible = 0;
    Object.entries(map).forEach(([slug, el]) => {
      const ok = showAll || allowedSlugs.has(slug);
      el.style.display = ok ? '' : 'none';
      if (ok) visible += 1;
    });
    // If some posts on page don't have a recognized slug, leave them visible when showing all; hide on filtered state by default
    if (!showAll) {
      const others = Array.from(cache.listEl.querySelectorAll('.ledger-item'))
        .filter(el => !Object.values(map).includes(el));
      others.forEach(el => { el.style.display = 'none'; });
    } else {
      const others = Array.from(cache.listEl.querySelectorAll('.ledger-item'))
        .filter(el => !Object.values(map).includes(el));
      others.forEach(el => { el.style.display = ''; });
    }
    emptyEl.style.display = visible === 0 ? '' : 'none';
  };

  const doSearch = async () => {
    const q = norm(input.value).trim();
    updateActive();
    if (!q) { filterLedger(null); return; }
    const src = await loadData();
    const tokens = q.split(/\s+/).filter(Boolean);
    const filtered = src.filter(it => {
      const hay = `${norm(it.paper_title)} ${norm(it.authors)} ${norm(it.year)} ${norm(it.dissent_path)}`;
      return tokens.every(t => hay.includes(t));
    });
    // Build set of allowed slugs from filtered results
    const slugs = new Set();
    filtered.forEach(it => {
      const t = norm(it.paper_title);
      const slug = postsByTitle?.[t];
      if (slug) slugs.add(slug);
    });
    filterLedger(slugs);
  };

  const onInput = debounce(doSearch, 120);
  input.addEventListener('input', onInput);
  // Initialize active state once in case of prefilled value (rare)
  updateActive();

  // Refresh cache when Ledger DOM changes (e.g., Show more)
  window.addEventListener('ledger:updated', () => {
    ledgerCache = null;
    initLedgerCache();
    // Re-apply current filter if any
    const q = norm(input.value).trim();
    if (q) doSearch();
  });
})();
