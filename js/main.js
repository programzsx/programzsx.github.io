/* Ink Theme — Minimal Client Scripts
   注：代码块头部已改为 Hexo 渲染期注入（scripts/code-header.js），
   移动端 TOC 折叠死代码已删除（前端样式缺陷清单 5.2 / 8.3）。 */
(function () {
  'use strict';

  // ── Copyright year ──
  var el = document.getElementById('copyright-year');
  if (el) {
    el.textContent = new Date().getFullYear();
  }

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
