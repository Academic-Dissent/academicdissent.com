// Render taxonomy pages: by subjects or by dissent tags
(function () {
  const container = document.getElementById('taxonomy');
  if (!container || !window.AD_DATA) return;
  const mode = (window.AD_TAXONOMY && window.AD_TAXONOMY.mode) || 'subjects';

  const posts = [...(window.AD_DATA.posts || [])].sort((a,b) => (a.date < b.date ? 1 : -1));

  let groups = {};
  if (mode === 'subjects') {
    posts.forEach(p => {
      groups[p.subject] = groups[p.subject] || [];
      groups[p.subject].push(p);
    });
  } else { // tags
    posts.forEach(p => {
      (p.tags || []).forEach(t => {
        groups[t] = groups[t] || [];
        groups[t].push(p);
      });
    });
  }

  const hash = decodeURIComponent(location.hash.replace('#',''));

  const makeGroup = (name, items) => {
    const sec = document.createElement('section');
    sec.id = name;
    sec.className = 'tax-group';
    sec.innerHTML = `<h2>${name}</h2>`;

    items.forEach(p => {
      const div = document.createElement('div');
      div.className = 'ledger-item';
      div.innerHTML = `
        <a class="title" href="post.html?slug=${encodeURIComponent(p.slug)}">${p.title}</a>
        <div class="meta">${new Date(p.date + 'T00:00:00Z').toLocaleDateString(undefined, { year:'numeric', month:'short', day:'2-digit' })}
        • Target: ${p.target.title} (${p.target.authors})</div>`;
      sec.appendChild(div);
    });
    return sec;
  };

  Object.keys(groups).sort().forEach(name => {
    container.appendChild(makeGroup(name, groups[name]));
  });

  if (hash && document.getElementById(hash)) {
    document.getElementById(hash).scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
})();
