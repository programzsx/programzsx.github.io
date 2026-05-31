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

  // ── Password gate ──
  var passwordMeta = document.querySelector('meta[name="post-password"]');
  if (passwordMeta) {
    var correctPassword = passwordMeta.getAttribute('content');
    var gate = document.getElementById('password-gate');
    var body = document.getElementById('post-body-protected');
    var input = document.getElementById('password-input');
    var submit = document.getElementById('password-submit');
    var error = document.getElementById('password-error');

    // Check if already authenticated this session
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
    input.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') tryUnlock();
    });
    input.focus();
  }
})();
