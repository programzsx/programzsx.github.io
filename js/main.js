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
  if (!toc) return;

  var toggle = toc.querySelector('.toc-toggle');
  if (!toggle) return;

  toggle.addEventListener('click', function () {
    toc.classList.toggle('open');
  });
})();
