/* main.js — dynamic single-page loader (no hardcoding)
   - Reads assets/html/sections.json
   - Builds nav + placeholders
   - Loads each section HTML (fetch)
   - Smooth scroll + sticky-header offset + footer year
*/

(() => {
  const basePath = 'assets/html/';
  const configFile = `${basePath}sections.json`;
  const cache = new Map();

  async function fetchText(path) {
    if (cache.has(path)) return cache.get(path);
    const res = await fetch(path, { cache: 'no-store' });
    if (!res.ok) throw new Error(`Fetch failed: ${path} (${res.status})`);
    const text = await res.text();
    cache.set(path, text);
    return text;
  }

  function buildNav(sections) {
    const ul = document.getElementById('nav-menu');
    if (!ul) return;
    ul.innerHTML = sections
      .map(s => `<li><a href="#${s.id}" class="nav-link">${s.label}</a></li>`)
      .join('');
  }

  function createPlaceholders(sections) {
    const main = document.getElementById('main-content');
    main.innerHTML = '';
    sections.forEach(s => {
      const div = document.createElement('div');
      div.id = s.id;
      div.className = 'section-wrapper';
      if (s.lazy) div.dataset.lazy = 'true';
      main.appendChild(div);
    });
  }

  async function loadSectionById(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.innerHTML = `<div class="section-loader">Loading...</div>`;
    try {
      const html = await fetchText(`${basePath}${id}.html`);
      el.innerHTML = html;
    } catch (e) {
      el.innerHTML = `<div class="include-error">Section "${id}" failed to load.</div>`;
      console.error(e);
    }
  }

  function enableSmoothScroll() {
    document.addEventListener('click', e => {
      const a = e.target.closest('a[href^="#"]');
      if (!a) return;
      const hash = a.getAttribute('href');
      const target = document.querySelector(hash);
      if (!target) return;
      e.preventDefault();
      const header = document.querySelector('.header');
      const offset = header ? header.offsetHeight + 12 : 0;
      const top = target.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  }

  function setYear() {
    const y = document.getElementById('year');
    if (y) y.textContent = new Date().getFullYear();
  }

  async function boot() {
    try {
      const sections = await fetch(configFile, { cache: 'no-store' }).then(r => r.json());
      buildNav(sections);
      createPlaceholders(sections);

      const nodes = Array.from(document.querySelectorAll('#main-content > .section-wrapper'));
      const lazy = nodes.filter(n => n.dataset.lazy === 'true');

      if ('IntersectionObserver' in window && lazy.length) {
        const io = new IntersectionObserver((entries, obs) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              loadSectionById(entry.target.id);
              obs.unobserve(entry.target);
            }
          });
        }, { rootMargin: '200px 0px' });
        lazy.forEach(n => io.observe(n));
      }

      // Load non-lazy immediately
      await Promise.all(nodes.filter(n => !n.dataset.lazy).map(n => loadSectionById(n.id)));

      enableSmoothScroll();
      setYear();
    } catch (e) {
      console.error('Boot error', e);
      document.getElementById('main-content').innerHTML =
        `<div class="include-error">Site failed to load sections.</div>`;
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
