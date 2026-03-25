// ==UserScript==
// @name         强制当前页打开链接-精简版
// @version      20260325
// @description  左键点击在当前页打开 _blank 链接，中键/Ctrl保留新标签，性能最优
// @include      *.baidu.*
// @include      *qidian.com*
// @include      *zhihu.com*
// @include      *hupu.com*
// @include      *lkong.com*
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';

    function inject() {
        const script = document.createElement('script');
        script.textContent = `
            (function() {
                'use strict';

                /** ===== 1. Hook HTMLAnchorElement.prototype.target（防止 JS 动态赋值 _blank） ===== */
                try {
                    Object.defineProperty(HTMLAnchorElement.prototype, 'target', {
                        set: function(value) {
                            if (value === '_blank') value = '_self';
                            this.setAttribute('target', value);
                        },
                        get: function() {
                            return this.getAttribute('target');
                        }
                    });
                } catch(e) {}

                /** ===== 2. MutationObserver（仅处理新增节点） ===== */
                const observer = new MutationObserver(mutations => {
                    for (const mutation of mutations) {
                        for (const node of mutation.addedNodes) {
                            if (node.nodeType !== 1) continue; // 元素节点
                            if (node.tagName === 'A' && node.target === '_blank') node.removeAttribute('target');
                            node.querySelectorAll && node.querySelectorAll('a[target="_blank"]').forEach(a => a.removeAttribute('target'));
                        }
                    }
                });
                observer.observe(document.body || document.documentElement, { childList: true, subtree: true });

                /** ===== 3. click 捕获（左键强制当前页，保留中键/Ctrl/Shift/Meta新标签） ===== */
                document.addEventListener('click', e => {
                    const link = e.target.closest('a[target="_blank"]');
                    if (!link) return;

                    if (e.button === 0 && !e.ctrlKey && !e.shiftKey && !e.metaKey) {
                        e.preventDefault();
                        e.stopImmediatePropagation();
                        window.location.href = link.href;
                    }
                }, true);

            })();
        `;
        document.documentElement.appendChild(script);
        script.remove();
    }

    inject();

})();