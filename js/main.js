/* Ink Theme — Minimal Client Scripts */
(function () {
  'use strict';

  // ── Copyright year ──
  var el = document.getElementById('copyright-year');
  if (el) {
    el.textContent = new Date().getFullYear();
  }

  // ── TOC toggle for mobile ──
  var toc = document.querySelector('.toc');
  if (toc) {
    var toggle = toc.querySelector('.toc-toggle');
    if (toggle) {
      toggle.addEventListener('click', function () {
        toc.classList.toggle('open');
      });
    }
  }

  // ── Code block beautify: add header bar with macOS dots + language label ──
  var highlights = document.querySelectorAll('.post-body .highlight');
  highlights.forEach(function (fig) {
    // Extract language from class (e.g., "highlight bash" → "bash")
    var lang = '';
    var classes = fig.className.split(/\s+/);
    for (var i = 0; i < classes.length; i++) {
      if (classes[i] !== 'highlight') {
        lang = classes[i];
        break;
      }
    }

    // Create header bar
    var header = document.createElement('div');
    header.className = 'code-header';

    // macOS dots
    var dots = document.createElement('div');
    dots.className = 'dots';
    dots.innerHTML = '<span></span><span></span><span></span>';
    header.appendChild(dots);

    // Language label
    if (lang) {
      var label = document.createElement('span');
      label.className = 'lang-label';
      label.textContent = lang;
      header.appendChild(label);
    }

    // Insert header before the table
    fig.insertBefore(header, fig.firstChild);
  });
})();
