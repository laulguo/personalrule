// ==UserScript==
// @name         Replace target=_blank with _self
// @match        *://*/*
// @run-at       document-end
// ==/UserScript==

document.querySelectorAll('a[target="_blank"]').forEach(a => {
  a.target = '_self';
});

// 处理动态加载的链接
const observer = new MutationObserver(() => {
  document.querySelectorAll('a[target="_blank"]').forEach(a => {
    a.target = '_self';
  });
});
observer.observe(document.body, { childList: true, subtree: true });
