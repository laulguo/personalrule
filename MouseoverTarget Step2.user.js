// ==UserScript==
// @name         强制当前页打开链接-鼠标预处理
// @version      3.0
// @description  利用“鼠标悬停”预处理和“点击拦截”双重机制，彻底解决知乎、虎扑等动态加载网站在新标签页打开的问题。
// @author       laulguo/Gemini3.0
// @include       *.baidu.*
// @include       *qidian.com*
// @include       *zhihu.com*
// @include       *hupu.com*
// @grant        none
// @run-at       document-start
// @downloadURL https://github.com/laulguo/personalrule/raw/refs/heads/master/MouseoverTarget%20Step2.user.js
// @updateURL https://github.com/laulguo/personalrule/raw/refs/heads/master/MouseoverTarget%20Step2.user.js
// ==/UserScript==

(function() {
    'use strict';

    // 核心逻辑：将链接强制改为当前页打开
    function fixLink(link) {
        if (link.target === '_blank' || link.getAttribute('target') === '_blank') {
            link.removeAttribute('target'); // 移除 target 属性
            link.target = '_self';          // 显式指定为当前页
        }
    }

    // 策略一：鼠标悬停预处理 (Mouseover Hook)
    // 这是解决“动态加载/瀑布流”最有效的手段。
    // 当你把鼠标移向链接准备点击时，脚本就已经把属性改掉了。
    document.addEventListener('mouseover', function(e) {
        var link = e.target.closest('a');
        if (link) {
            fixLink(link);
        }
    }, true); // 使用捕获阶段，保证最早执行

    // 策略二：点击暴力拦截 (Click Interceptor)
    // 防止某些框架在点击瞬间又把 target="_blank" 加回去
    document.addEventListener('click', function(e) {
        var link = e.target.closest('a');

        // 如果是链接，且依然被标记为新窗口打开
        if (link && (link.target === '_blank' || link.getAttribute('target') === '_blank')) {
            // 1. 阻止浏览器默认的新窗口行为
            e.preventDefault();
            // 2. 阻止网页自带脚本的干扰
            e.stopPropagation();
            // 3. 强制在当前窗口跳转
            window.location.href = link.href;
        }
    }, true); // 这里的 true 非常关键，代表在“捕获阶段”拦截，优先级最高

    // 策略三：针对 window.open 的补丁 (可选，防止纯 JS 弹窗)
    // 部分网站不使用 <a> 标签，而是用 JS 弹窗，这里进行劫持
    const originalOpen = window.open;
    window.open = function(url, target, features) {
        // 强制目标为 _self
        return originalOpen.call(window, url, '_self', features);
    };

})();
