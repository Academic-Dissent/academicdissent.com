// Client-side loader: builds window.AD_DATA from dissents/index.json + Markdown front matter
// Exposes window.AD_DATA_READY (Promise)
(function () {
  if (window.AD_DATA_READY) return; // already initialized

  const fetchText = (url) => fetch(url, { cache: 'no-store' }).then(r => {
    if (!r.ok) throw new Error('HTTP ' + r.status + ' for ' + url);
    return r.text();
  });

  const parseFrontMatter = (md) => {
    // Expect leading YAML front matter delimited by --- ... ---
    if (!md.startsWith('---')) return { meta: {}, body: md };
    const end = md.indexOf('\n---', 3);
    if (end === -1) return { meta: {}, body: md };
    const fmBlock = md.slice(3, end + 1); // include trailing newline
    const rest = md.slice(end + 4); // skip "\n---"
    let meta = {};
    try {
      if (window.jsyaml && window.jsyaml.load) {
        meta = window.jsyaml.load(fmBlock) || {};
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn('YAML front matter parse error:', e);
    }
    return { meta, body: rest };
  };

  const extractSections = (body) => {
    // Extract sections delineated by level-2 headings: ## Claim, ## Dissent, ## Proof, ## Conclusion
    const lines = body.split(/\r?\n/);
    let current = null;
    const sections = { claim: '', dissent: '', proof: '', conclusion: '' };
    const push = (key, line) => { sections[key] += (sections[key] ? '\n' : '') + line; };
    const headingRe = /^##\s+(.*)\s*$/;
    lines.forEach(line => {
      const m = line.match(headingRe);
      if (m) {
        const name = m[1].trim().toLowerCase();
        if (name.startsWith('claim')) current = 'claim';
        else if (name.startsWith('dissent')) current = 'dissent';
        else if (name.startsWith('proof')) current = 'proof';
        else if (name.startsWith('conclusion')) current = 'conclusion';
        else current = null;
        return;
      }
      if (current) push(current, line);
    });
    // Trim trailing whitespace
    Object.keys(sections).forEach(k => { sections[k] = sections[k].trim(); });
    return sections;
  };

  const load = async () => {
    const out = [];
    try {
      const idxResp = await fetch('dissents/index.json', { cache: 'no-store' });
      const idxJson = await idxResp.json();
      const entries = Array.isArray(idxJson && idxJson.dissents) ? idxJson.dissents : [];
      // Validate filename convention (non-blocking): YYYY-<slug>-<CODE>.md
      const fnameRe = /^\d{4}-[a-z0-9-]+-[A-Z0-9]{8}\.md$/;
      entries.forEach(e => {
        try {
          const path = (e && e.dissent_path) || '';
          const base = path.split('/')[(path.split('/').length - 1)] || '';
          if (base && !fnameRe.test(base)) {
            // eslint-disable-next-line no-console
            console.warn('Dissent filename does not match convention YYYY-<slug>-<CODE>.md:', base);
          }
        } catch (_) {}
      });
      // Fetch all markdown files in parallel
      const tasks = entries.map(e => fetchText(e.dissent_path).then(md => ({ entry: e, md })).catch(() => null));
      const results = await Promise.all(tasks);
      results.forEach(item => {
        if (!item) return;
        const { entry, md } = item;
        const { meta, body } = parseFrontMatter(md);
        if (!meta || !meta.slug || !meta.title || !meta.date) {
          // Missing core metadata — skip silently but log
          // eslint-disable-next-line no-console
          console.warn('Skipping dissent: missing slug/title/date', entry && entry.dissent_path);
          return;
        }
        const sections = extractSections(body || '');
        const post = {
          slug: meta.slug,
          title: meta.title,
          date: meta.date,
          subject: meta.subject || 'Applied Microeconomics',
          tags: Array.isArray(meta.tags) ? meta.tags : [],
          target: meta.target || { title: entry.paper_title, authors: entry.authors, journal: '', date: entry.year },
          claim: sections.claim || '',
          dissent: sections.dissent || '',
          proof: sections.proof || '',
          conclusion: sections.conclusion || ''
        };
        out.push(post);
      });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn('Failed to load dissents:', e);
    }
    // Sort reverse-chronological by date (YYYY-MM-DD)
    out.sort((a, b) => (a.date < b.date ? 1 : -1));
    window.AD_DATA = window.AD_DATA || {};
    window.AD_DATA.posts = out;
  };

  window.AD_DATA_READY = load();
})();
