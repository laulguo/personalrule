// ==UserScript==
// @name          Link in Current Tab
// @author        paul_guo
// @version       20220517
// @include       *.baidu.*
// @include       *qidian.com*
// @namespace     *
// @updateURL https://raw.githubusercontent.com/laulguo/personalrule/master/target%20blank%20remove_part_mode/Link%20in%20Current%20Tab%20step2.user.js
// @description   Force all links to be opened in current tab instead of the new one
// Based on SAGAN‘s Link in Current Tab-https://chrome.google.com/webstore/detail/cbkcdebbfbegnmbephalggnchfebihbl
// ==/UserScript==

window.addEventListener('click', handle);
window.addEventListener('click', handle, true);
window.addEventListener('submit', handle);
window.addEventListener('submit', handle, true);

function handle(e) {
  let i = 0, el = e.target, els = [];
  let frames = Array.from(document.querySelectorAll('iframe,frame')).map(f => f.name).filter(f => f);
  try {
    if( window.parent != window ) {
      frames.push(...Array.from(window.parent.document.querySelectorAll('iframe,frame')).map(f => f.name).filter(f => f));
    }
  } catch(e) {}

  while( el && !el.target && i++ < 5 ) {
    el = el.parentNode;
  }

  els.push(el, document.querySelector('head base'));
  els.forEach(el => {
    if( el && el.target ) {
      if( el.target.startsWith('_') ) {
        if( el.target == "_blank" ) {
          el.target = "_top";
        }
      } else if( !frames.includes(el.target) ) {
        el.target = "_top";
      }
    }
  });
}
