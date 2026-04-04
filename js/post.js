// Render a single critique post according to the standardized template
(function () {
  const el = document.getElementById('post');
  if (!el) return;

  const start = async () => {
    // Await client-side loader if present so AD_DATA.posts is populated
    if (window.AD_DATA_READY && typeof window.AD_DATA_READY.then === 'function') {
      try { await window.AD_DATA_READY; } catch (_) {}
    }
    const data = (window.AD_DATA && Array.isArray(window.AD_DATA.posts)) ? window.AD_DATA.posts : [];

    const params = new URLSearchParams(location.search);
    const slug = params.get('slug');
    const post = data.find(p => p.slug === slug) || null;

    if (!post) {
      el.innerHTML = '<p>Post not found.</p>';
      return;
    }

    const fmt = (d) => new Date(d + 'T00:00:00Z').toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: '2-digit' });

    // Build standardized sections
    const citation = `${post.target.title} — ${post.target.authors} — ${post.target.journal} (${post.target.date})`;
    const citationHTML = post.target.link ? `<a href="${post.target.link}" target="_blank" rel="noopener">${citation}</a>` : citation;

    const html = `
      <h1>${post.title}</h1>
      <div class="post-meta">${fmt(post.date)} • Subject: <a class="chip" href="subjects.html#${encodeURIComponent(post.subject)}">${post.subject}</a>
        ${(post.tags || []).map(t => `<a class="chip" href="dissent-tags.html#${encodeURIComponent(t)}">${t}</a>`).join('')}</div>

      <div class="section">
        <h2>The Target</h2>
        <p>${citationHTML}</p>
      </div>

      <div class="section">
        <h2>The Claim</h2>
        ${marked.parse(post.claim || '')}
      </div>

      <div class="section">
        <h2>The Dissent</h2>
        ${marked.parse(post.dissent || '')}
      </div>

      <div class="section">
        <h2>The Proof</h2>
        ${marked.parse(post.proof || '')}
      </div>

      <div class="section">
        <h2>The Conclusion</h2>
        ${marked.parse(post.conclusion || '')}
      </div>
    `;

    el.innerHTML = html;

    // Typeset math after insertion
    if (window.MathJax && window.MathJax.typesetPromise) {
      window.MathJax.typesetPromise([el]).catch(() => {});
    }
  };

  start();
})();
