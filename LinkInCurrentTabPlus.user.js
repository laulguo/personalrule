// ==UserScript==
// @name         强制当前页打开链接（通用增强版）
// @version      4.0
// @description  尽可能阻止网站在新标签页打开链接，兼容 target=_blank、onclick、window.open、动态内容
// @author       ChatGPT
// @match        *://*/*
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';

    function isRealLink(link) {
        if (!link || link.tagName !== 'A') return false;
        const href = link.getAttribute('href');
        if (!href) return false;
        if (href.startsWith('javascript:')) return false;
        if (href.startsWith('#')) return false;
        return true;
    }

    function fixLink(link) {
        if (!link || link.tagName !== 'A') return;

        // 移除 target=_blank
        if (link.target === '_blank' || link.getAttribute('target') === '_blank') {
            link.removeAttribute('target');
            link.target = '_self';
        }

        // 一些网站会用 rel=noopener/noreferrer 配合新标签页
        // 这里不是必须，但顺手处理
        const rel = link.getAttribute('rel');
        if (rel && /noopener|noreferrer/i.test(rel)) {
            link.removeAttribute('rel');
        }

        // 特殊处理内联 onclick
        const onclick = link.getAttribute('onclick');
        if (onclick) {
            // 对 Discuz 系 atarget(this) 特别处理
            if (/atarget\s*\(\s*this\s*\)/i.test(onclick)) {
                link.removeAttribute('onclick');
            }

            // 如果 onclick 里明显有 window.open，也移除
            else if (/window\.open\s*\(/i.test(onclick)) {
                link.removeAttribute('onclick');
            }
        }
    }

    function getLinkFromEvent(e) {
        const target = e.target;
        if (!target) return null;
        return target.closest ? target.closest('a') : null;
    }

    // 预处理：鼠标悬停
    document.addEventListener('mouseover', function(e) {
        const link = getLinkFromEvent(e);
        if (link) fixLink(link);
    }, true);

    // 预处理：鼠标按下时再修一次，比 click 更早
    document.addEventListener('mousedown', function(e) {
        const link = getLinkFromEvent(e);
        if (link) fixLink(link);
    }, true);

    // 焦点进入时也修一下，兼容键盘操作
    document.addEventListener('focusin', function(e) {
        const link = getLinkFromEvent(e);
        if (link) fixLink(link);
    }, true);

    // 核心：点击拦截
    document.addEventListener('click', function(e) {
        const link = getLinkFromEvent(e);
        if (!link) return;

        fixLink(link);

        const href = link.href;
        if (!href) return;

        // 如果用户明确想新标签打开，则尊重用户习惯
        if (
            e.ctrlKey || e.metaKey || e.shiftKey ||
            e.button === 1
        ) {
            return;
        }

        // 对可正常导航的真实链接，强制接管
        if (isRealLink(link)) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();

            window.location.assign(href);
        }
    }, true);

    // 拦截 auxclick（中键）
    document.addEventListener('auxclick', function(e) {
        const link = getLinkFromEvent(e);
        if (!link) return;
        fixLink(link);
    }, true);

    // 拦截 window.open
    const originalOpen = window.open;
    window.open = function(url, target, features) {
        if (url) {
            window.location.assign(url);
            return window;
        }
        return null;
    };

    // 监听 DOM 动态变化，修复新插入的链接
    const observer = new MutationObserver(function(mutations) {
        for (const mutation of mutations) {
            for (const node of mutation.addedNodes) {
                if (node.nodeType !== 1) continue;

                if (node.tagName === 'A') {
                    fixLink(node);
                }

                const links = node.querySelectorAll ? node.querySelectorAll('a') : [];
                for (const link of links) {
                    fixLink(link);
                }
            }
        }
    });

    document.addEventListener('DOMContentLoaded', function() {
        document.querySelectorAll('a').forEach(fixLink);
        observer.observe(document.documentElement, {
            childList: true,
            subtree: true
        });
    });

})();
