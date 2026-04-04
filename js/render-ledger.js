// Render the Ledger (homepage feed) with incremental "Show more" loading
(function () {
  const listEl = document.getElementById('ledger');
  if (!listEl) return;

  const fmt = (d) => new Date(d + 'T00:00:00Z').toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: '2-digit' });

  const pageSizeAttr = parseInt(listEl.getAttribute('data-page-size') || '2', 10);
  const PAGE_SIZE = Number.isFinite(pageSizeAttr) && pageSizeAttr > 0 ? pageSizeAttr : 2;

  const makeItem = (p) => {
    const item = document.createElement('div');
    item.className = 'ledger-item';
    const target = `${p.target.title} (${p.target.authors}; ${p.target.journal || ''}${p.target.journal ? ', ' : ''}${p.target.date})`;
    item.innerHTML = `
      <a class="title" href="post.html?slug=${encodeURIComponent(p.slug)}">${p.title}</a>
      <div class="meta">${fmt(p.date)} • Target: ${target}</div>
      <div class="meta">
        <a class="chip" href="subjects.html#${encodeURIComponent(p.subject)}">${p.subject}</a>
        ${(p.tags || []).map(t => `<a class="chip" href="dissent-tags.html#${encodeURIComponent(t)}">${t}</a>`).join('')}
      </div>
    `;
    return item;
  };

  const ensureControls = () => {
    let btn = document.getElementById('ledger-more');
    if (!btn) {
      btn = document.createElement('button');
      btn.id = 'ledger-more';
      btn.type = 'button';
      btn.textContent = 'Show more';
      // Place button after the list
      listEl.insertAdjacentElement('afterend', btn);
    }
    return btn;
  };

  const ensureEmpty = () => {
    let empty = document.getElementById('ledger-empty');
    if (!empty) {
      empty = document.createElement('div');
      empty.id = 'ledger-empty';
      empty.className = 'meta';
      empty.textContent = 'No dissents yet.';
      listEl.appendChild(empty);
    }
    return empty;
  };

  const start = async () => {
    // Await client-side loader if present
    if (window.AD_DATA_READY && typeof window.AD_DATA_READY.then === 'function') {
      try { await window.AD_DATA_READY; } catch (_) {}
    }
    const postsAll = (window.AD_DATA && Array.isArray(window.AD_DATA.posts)) ? [...window.AD_DATA.posts] : [];
    // Sort reverse-chronological as a guard
    postsAll.sort((a, b) => (a.date < b.date ? 1 : -1));

    // Reset list
    listEl.innerHTML = '';
    const empty = ensureEmpty();
    if (!postsAll.length) {
      empty.style.display = '';
      const btn = document.getElementById('ledger-more');
      if (btn) btn.style.display = 'none';
      return;
    }
    empty.style.display = 'none';

    let rendered = 0;
    const renderNext = () => {
      const next = postsAll.slice(rendered, rendered + PAGE_SIZE);
      next.forEach(p => listEl.appendChild(makeItem(p)));
      rendered += next.length;
      // Notify listeners (e.g., search) that ledger DOM changed
      window.dispatchEvent(new CustomEvent('ledger:updated'));
      const btn = ensureControls();
      if (rendered >= postsAll.length) {
        btn.style.display = 'none';
      } else {
        btn.style.display = '';
      }
    };

    const btn = ensureControls();
    btn.onclick = renderNext;

    // Initial page
    renderNext();
  };

  start();
})();
