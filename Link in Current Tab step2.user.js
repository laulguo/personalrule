// ==UserScript==
// @name          Link in Current Tab
// @author        paul_guo/Claude Opus 4.6
// @version       20260325
// @include       *.baidu.*
// @include       *qidian.com*
// @include       *zhihu.com*
// @namespace     *
// @grant         none
// @updateURL https://raw.githubusercontent.com/laulguo/personalrule/master/Link%20in%20Current%20Tab%20step2.user.js
// @description   Force all links to be opened in current tab instead of the new one
// ==/UserScript==

function handle(e) {
  let el = e.target;
  let i = 0;
  
  while( el && el.tagName !== 'A' && el.tagName !== 'FORM' && i++ < 5 ) {
    el = el.parentNode;
  }

  if( el && (el.tagName === 'A' || el.tagName === 'FORM') ) {
    if( el.target && (el.target === '_blank' || el.target === '_new') ) {
      console.log('拦截新标签页:', el.target);
      e.preventDefault();
      e.stopPropagation();
      
      if( el.tagName === 'A' ) {
        window.location.href = el.href;
      } else if( el.tagName === 'FORM' ) {
        el.target = '_self';
        el.submit();
      }
    }
  }
}

document.addEventListener('click', handle, true);
document.addEventListener('submit', handle, true);
