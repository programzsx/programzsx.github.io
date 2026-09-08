/* Ink Theme — Cyber-noir Editorial Client Scripts */
(function () {
  'use strict';

  /* ---------- Helpers ---------- */
  function sha256(text) {
    return crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
      .then(function (buf) {
        var arr = new Uint8Array(buf);
        var hex = '';
        for (var i = 0; i < arr.length; i++) {
          hex += (arr[i] < 16 ? '0' : '') + arr[i].toString(16);
        }
        return hex;
      });
  }

  /* ---------- Copyright year ---------- */
  var yearEl = document.getElementById('copyright-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Code block header (language label) + copy button ---------- */
  var highlights = document.querySelectorAll('.post-body .highlight');
  highlights.forEach(function (fig) {
    var lang = '';
    var classes = fig.className.split(/\s+/);
    for (var i = 0; i < classes.length; i++) {
      if (classes[i] !== 'highlight') { lang = classes[i]; break; }
    }
    var header = document.createElement('div');
    header.className = 'code-header';

    var right = document.createElement('div');
    right.className = 'code-header-side';
    if (lang) {
      var label = document.createElement('span');
      label.className = 'lang-label';
      label.textContent = lang;
      right.appendChild(label);
    }
    var copyBtn = document.createElement('button');
    copyBtn.type = 'button';
    copyBtn.className = 'code-copy';
    copyBtn.textContent = 'copy';
    copyBtn.setAttribute('aria-label', '复制代码');
    right.appendChild(copyBtn);
    header.appendChild(right);

    fig.insertBefore(header, fig.firstChild);

    copyBtn.addEventListener('click', function () {
      var code = fig.querySelector('pre code') || fig.querySelector('code') || fig.querySelector('pre');
      var text = code ? code.innerText : '';
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function () {
          copyBtn.textContent = 'copied';
          copyBtn.classList.add('copied');
          setTimeout(function () { copyBtn.textContent = 'copy'; copyBtn.classList.remove('copied'); }, 1600);
        });
      } else {
        // Fallback for older browsers
        var ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.left = '-9999px';
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); copyBtn.textContent = 'copied'; copyBtn.classList.add('copied'); } catch (e) {}
        document.body.removeChild(ta);
        setTimeout(function () { copyBtn.textContent = 'copy'; copyBtn.classList.remove('copied'); }, 1600);
      }
    });
  });

  /* ---------- Image loading strategy ----------
     First in-body image is the LCP candidate: eager + high priority.
     Everything else lazy-loads. (Card excerpts hide images via CSS anyway.) */
  document.querySelectorAll('.post-body img, .entry-content img').forEach(function (img, i) {
    if (i === 0 && img.closest('.post-body')) {
      img.setAttribute('loading', 'eager');
      img.setAttribute('fetchpriority', 'high');
    } else if (!img.hasAttribute('loading')) {
      img.setAttribute('loading', 'lazy');
    }
    if (!img.hasAttribute('decoding')) img.setAttribute('decoding', 'async');
  });

  /* ---------- Lightbox: click-to-zoom images in post body ----------
     Markup is created here; ALL styles live in style.css (.lightbox). */
  var lb = document.createElement('div');
  lb.className = 'lightbox';
  lb.setAttribute('role', 'dialog');
  lb.setAttribute('aria-modal', 'true');
  lb.setAttribute('aria-label', '图片预览');
  lb.hidden = true;
  lb.innerHTML = '<img class="lightbox-img" alt=""><button class="lightbox-close" type="button" aria-label="关闭">×</button>';
  document.body.appendChild(lb);
  var lbImg = lb.querySelector('.lightbox-img');
  var lbClose = lb.querySelector('.lightbox-close');

  function openLightbox(src, alt) {
    lbImg.src = src;
    lbImg.alt = alt || '';
    lb.hidden = false;
    document.body.style.overflow = 'hidden';
  }
  function closeLightbox() {
    lb.hidden = true;
    lbImg.src = '';
    document.body.style.overflow = '';
  }
  lb.addEventListener('click', closeLightbox);
  lbClose.addEventListener('click', function (e) { e.stopPropagation(); closeLightbox(); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !lb.hidden) closeLightbox();
  });

  document.querySelectorAll('.post-body img, .entry-content img').forEach(function (img) {
    img.setAttribute('tabindex', '0');
    img.setAttribute('role', 'button');
    img.setAttribute('aria-label', '点击放大图片');
    var activate = function () { openLightbox(img.src, img.alt); };
    img.addEventListener('click', activate);
    img.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activate(); } });
  });

  /* ---------- Reading progress bar ---------- */
  var progress = document.getElementById('reading-progress');
  if (progress) {
    var updateProgress = function () {
      var doc = document.documentElement;
      var scrollTop = window.scrollY || doc.scrollTop;
      var max = (doc.scrollHeight - doc.clientHeight) || 1;
      var pct = Math.min(100, Math.max(0, (scrollTop / max) * 100));
      progress.style.setProperty('--progress', pct + '%');
    };
    window.addEventListener('scroll', updateProgress, { passive: true });
    window.addEventListener('resize', updateProgress, { passive: true });
    updateProgress();
  }

  /* ---------- Taxonomy tree: expand/collapse + check toggle ---------- */
  var taxTree = document.querySelector('.tax-tree');
  if (taxTree) {
    // Toggle (arrow) button: expand/collapse
    taxTree.addEventListener('click', function (e) {
      var toggle = e.target.closest('.tax-toggle');
      if (toggle) {
        var node = toggle.closest('.tax-node');
        if (!node) return;
        var expanded = node.getAttribute('aria-expanded') === 'true';
        node.setAttribute('aria-expanded', expanded ? 'false' : 'true');
        return;
      }
      // Checkbox circle: toggle checked state
      var check = e.target.closest('.tax-check');
      if (check) {
        var node2 = check.closest('.tax-node');
        if (!node2) return;
        var checked = check.getAttribute('aria-checked') === 'true';
        check.setAttribute('aria-checked', checked ? 'false' : 'true');
        node2.classList.toggle('is-selected', !checked);
        return;
      }
      // Row click (anywhere except toggle / check / name link): select
      var row = e.target.closest('.tax-node-row');
      if (row) {
        // If the click landed on the name link, let it navigate
        if (e.target.closest('.tax-name')) return;
        var node3 = row.closest('.tax-node');
        if (!node3) return;
        var c = node3.querySelector('.tax-check');
        if (c) {
          var now = c.getAttribute('aria-checked') === 'true';
          c.setAttribute('aria-checked', now ? 'false' : 'true');
          node3.classList.toggle('is-selected', !now);
        }
      }
    });
    // Keyboard: left/right arrows expand/collapse
    taxTree.addEventListener('keydown', function (e) {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      var btn = e.target.closest('.tax-toggle');
      if (!btn) return;
      var node = btn.closest('.tax-node');
      if (!node) return;
      var hasChildren = node.classList.contains('tax-node--has-children');
      if (!hasChildren) return;
      e.preventDefault();
      var expanded = node.getAttribute('aria-expanded') === 'true';
      if (e.key === 'ArrowRight' && !expanded) {
        node.setAttribute('aria-expanded', 'true');
      } else if (e.key === 'ArrowLeft' && expanded) {
        node.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ---------- Search overlay ---------- */
  var searchBtn = document.getElementById('search-btn');
  var searchOverlay = document.getElementById('search-overlay');
  var searchInput = document.getElementById('search-input');
  var searchResults = document.getElementById('search-results');
  var searchData = null;
  var searchHits = [];
  var searchActive = 0;

  function loadSearch() {
    if (searchData) return Promise.resolve(searchData);
    return fetch('/search.json').then(function (r) { return r.json(); }).then(function (d) { searchData = d; return d; }).catch(function () { searchData = []; });
  }
  function openSearch() {
    if (!searchOverlay) return;
    searchOverlay.hidden = false;
    setTimeout(function () { searchInput.focus(); }, 30);
    loadSearch();
  }
  function closeSearch() {
    if (!searchOverlay) return;
    searchOverlay.hidden = true;
    if (searchInput) { searchInput.value = ''; }
    if (searchResults) { searchResults.innerHTML = ''; }
    searchHits = [];
  }
  function highlight(text, q) {
    if (!q) return text;
    try {
      var safe = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      var re = new RegExp('(' + safe + ')', 'gi');
      return text.replace(re, '<mark>$1</mark>');
    } catch (e) { return text; }
  }
  function renderSearch(query) {
    if (!searchResults) return;
    searchResults.innerHTML = '';
    if (!query) { searchHits = []; return; }
    var lower = query.toLowerCase();
    var hits = [];
    if (Array.isArray(searchData)) {
      searchData.forEach(function (post) {
        if (!post) return;
        var title = post.title || '';
        var content = (post.content || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
        if (title.toLowerCase().indexOf(lower) >= 0 || content.toLowerCase().indexOf(lower) >= 0) {
          var idx = content.toLowerCase().indexOf(lower);
          var snippet = idx >= 0 ? content.substring(Math.max(0, idx - 30), idx + query.length + 80) : content.substring(0, 120);
          hits.push({ title: title, url: post.url, snippet: snippet });
        }
      });
    }
    if (hits.length === 0) {
      searchResults.innerHTML = '<p class="empty">无匹配结果</p>';
      searchHits = [];
      return;
    }
    hits.slice(0, 12).forEach(function (h, i) {
      var a = document.createElement('a');
      a.className = 'search-hit' + (i === 0 ? ' is-active' : '');
      a.href = h.url;
      a.innerHTML = '<span class="search-hit-title">' + highlight(h.title, query) + '</span><span class="search-hit-snippet">' + highlight(h.snippet + '...', query) + '</span>';
      searchResults.appendChild(a);
    });
    searchHits = Array.prototype.slice.call(searchResults.querySelectorAll('.search-hit'));
  }
  if (searchBtn) searchBtn.addEventListener('click', openSearch);
  if (searchOverlay) {
    searchOverlay.addEventListener('click', function (e) {
      if (e.target.matches('[data-search-close]') || e.target.classList.contains('search-overlay-backdrop')) closeSearch();
    });
  }
  if (searchInput) {
    var t;
    searchInput.addEventListener('input', function () {
      clearTimeout(t);
      var q = searchInput.value.trim();
      t = setTimeout(function () { renderSearch(q); }, 150);
    });
  }
  document.addEventListener('keydown', function (e) {
    if (e.key === '/' && !searchOverlay || (e.key === '/' && searchOverlay && searchOverlay.hidden)) {
      // Don't trigger when typing in inputs
      var t = e.target;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
      e.preventDefault();
      openSearch();
    } else if (e.key === 'Escape' && searchOverlay && !searchOverlay.hidden) {
      closeSearch();
    } else if (e.key === 'ArrowDown' && !searchOverlay.hidden && searchHits.length) {
      e.preventDefault();
      searchActive = (searchActive + 1) % searchHits.length;
      searchHits.forEach(function (h, i) { h.classList.toggle('is-active', i === searchActive); });
      searchHits[searchActive].scrollIntoView({ block: 'nearest' });
    } else if (e.key === 'ArrowUp' && !searchOverlay.hidden && searchHits.length) {
      e.preventDefault();
      searchActive = (searchActive - 1 + searchHits.length) % searchHits.length;
      searchHits.forEach(function (h, i) { h.classList.toggle('is-active', i === searchActive); });
      searchHits[searchActive].scrollIntoView({ block: 'nearest' });
    } else if (e.key === 'Enter' && !searchOverlay.hidden && searchHits[searchActive]) {
      e.preventDefault();
      window.location.href = searchHits[searchActive].href;
    }
  });

  /* ---------- Share buttons ---------- */
  document.querySelectorAll('.share-row').forEach(function (row) {
    var url = row.getAttribute('data-share-url') || window.location.href;
    var title = row.getAttribute('data-share-title') || document.title;
    var encUrl = encodeURIComponent(url);
    var encTitle = encodeURIComponent(title);
    row.querySelectorAll('[data-share-action]').forEach(function (btn) {
      var act = btn.getAttribute('data-share-action');
      if (act === 'copy') {
        btn.addEventListener('click', function () {
          navigator.clipboard.writeText(url).then(function () {
            btn.classList.add('copied');
            var t = btn.textContent;
            btn.textContent = '已复制';
            setTimeout(function () { btn.classList.remove('copied'); btn.textContent = t; }, 1500);
          });
        });
      } else if (act === 'twitter') {
        btn.href = 'https://twitter.com/intent/tweet?text=' + encTitle + '&url=' + encUrl;
        btn.target = '_blank';
        btn.rel = 'noopener';
      } else if (act === 'weibo') {
        btn.href = 'https://service.weibo.com/share/share.php?url=' + encUrl + '&title=' + encTitle;
        btn.target = '_blank';
        btn.rel = 'noopener';
      }
    });
  });

  /* ---------- Reveal on scroll (IntersectionObserver) ---------- */
  if ('IntersectionObserver' in window) {
    var revealIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          revealIO.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    document.querySelectorAll('.reveal').forEach(function (el) { revealIO.observe(el); });
  } else {
    document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- TOC scroll-spy ---------- */
  var tocLinks = document.querySelectorAll('.sidebar-toc a[href^="#"]');
  if (tocLinks.length && 'IntersectionObserver' in window) {
    var headings = [];
    tocLinks.forEach(function (a) {
      var id = a.getAttribute('href').slice(1);
      var h = document.getElementById(id);
      if (h) headings.push({ id: id, el: h, link: a });
    });
    var setActive = function (id) {
      tocLinks.forEach(function (a) { a.classList.remove('active'); });
      var target = document.querySelector('.sidebar-toc a[href="#' + id + '"]');
      if (target) target.classList.add('active');
    };
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) setActive(entry.target.id);
      });
    }, { rootMargin: '-20% 0px -70% 0px' });
    headings.forEach(function (h) { spy.observe(h.el); });
  }

  /* ---------- Theme toggle (light / dark) ---------- */
  var themeBtn = document.getElementById('theme-toggle');
  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      var html = document.documentElement;
      var current = html.getAttribute('data-theme') || '';
      // No attribute = follow system (currently dark). Clicking forces light, then dark, then system.
      var next;
      if (!current) next = 'light';
      else if (current === 'light') next = 'dark';
      else next = ''; // back to system
      if (next) html.setAttribute('data-theme', next);
      else html.removeAttribute('data-theme');
      try { localStorage.setItem('ink-theme', next); } catch (e) {}
    });
  }

  /* ---------- Site-wide password gate ---------- */
  var siteMeta = document.querySelector('meta[name="site-password"]');
  if (siteMeta) {
    var sitePassword = siteMeta.getAttribute('content');
    var siteGate = document.getElementById('password-gate');
    var siteBody = document.getElementById('post-body-protected');
    var siteInput = document.getElementById('password-input');
    var siteSubmit = document.getElementById('password-submit');
    var siteError = document.getElementById('password-error');
    var SITE_AUTH_KEY = 'site_auth';

    if (sessionStorage.getItem(SITE_AUTH_KEY) === '1') {
      siteGate.style.display = 'none';
      siteBody.style.display = '';
    } else {
      siteInput.focus();
    }

    function trySiteUnlock() {
      sha256(siteInput.value).then(function (hash) {
        return sha256(sitePassword).then(function (expected) {
          if (hash === expected) {
            sessionStorage.setItem(SITE_AUTH_KEY, '1');
            siteGate.style.display = 'none';
            siteBody.style.display = '';
          } else {
            siteError.textContent = '密码错误，请重试';
            siteInput.value = '';
            siteInput.focus();
          }
        });
      });
    }

    siteSubmit.addEventListener('click', trySiteUnlock);
    siteInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') trySiteUnlock();
    });
  }

  /* ---------- Per-post password gate (legacy) ---------- */
  var postMeta = document.querySelector('meta[name="post-password"]');
  if (postMeta && !siteMeta) {
    var correctPassword = postMeta.getAttribute('content');
    var gate = document.getElementById('password-gate');
    var body = document.getElementById('post-body-protected');
    var input = document.getElementById('password-input');
    var submit = document.getElementById('password-submit');
    var error = document.getElementById('password-error');
    var pagePath = window.location.pathname;
    if (sessionStorage.getItem('auth_' + pagePath) === correctPassword) {
      gate.style.display = 'none';
      body.style.display = 'block';
    }
    function tryUnlock() {
      if (input.value === correctPassword) {
        sessionStorage.setItem('auth_' + pagePath, correctPassword);
        gate.style.display = 'none';
        body.style.display = 'block';
      } else {
        error.textContent = '密码错误，请重试';
        input.value = '';
        input.focus();
      }
    }
    submit.addEventListener('click', tryUnlock);
    input.addEventListener('keydown', function (e) { if (e.key === 'Enter') tryUnlock(); });
    input.focus();
  }
})();
