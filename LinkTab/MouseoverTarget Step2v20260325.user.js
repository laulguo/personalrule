// ==UserScript==
// @name         强制当前页打开链接-注入版
// @version      20260325
// @description  通过注入页面上下文，彻底拦截 _blank / window.open / SPA 跳转（知乎、虎扑等）
// @author       laulguo/GPT优化
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

                /** ===== 1. 劫持 window.open（核心） ===== */
                const originalOpen = window.open;
                window.open = function(url, target, features) {
                    return originalOpen.call(window, url, '_self', features);
                };

                /** ===== 2. 拦截 target="_blank" 属性 ===== */
                const observer = new MutationObserver(() => {
                    document.querySelectorAll('a[target="_blank"]').forEach(a => {
                        a.removeAttribute('target');
                    });
                });

                observer.observe(document, { childList: true, subtree: true });

                /** ===== 3. 点击捕获（最强兜底） ===== */
                document.addEventListener('click', function(e) {
                    const link = e.target.closest('a');
                    if (!link) return;

                    const target = link.getAttribute('target');

                    if (target === '_blank') {
                        e.preventDefault();
                        e.stopImmediatePropagation();
                        window.location.href = link.href;
                    }
                }, true);

                /** ===== 4. Hook a.target（防止动态赋值） ===== */
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
                } catch (e) {}

                /** ===== 5. 防 JS 跳转（部分站点） ===== */
                const originalAssign = window.location.assign;
                window.location.assign = function(url) {
                    window.location.href = url;
                };

                const originalReplace = window.location.replace;
                window.location.replace = function(url) {
                    window.location.href = url;
                };

            })();
        `;

        document.documentElement.appendChild(script);
        script.remove();
    }

    inject();

})();