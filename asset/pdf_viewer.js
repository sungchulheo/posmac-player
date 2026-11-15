/* PosMAC tablet-friendly full-screen continuous catalogue (v4).
   The ASPEN stage uses fixed 1740x1080 coordinates; therefore the catalogue
   is mounted under document.body rather than inside the scaled ASPEN widget. */
(function () {
  'use strict';
  var OVERLAY_ID = 'posmac-catalogue-fullscreen-v4';
  var previousOverflow = null;
  function closePosmacCatalogue() {
    var overlay = document.getElementById(OVERLAY_ID);
    if (overlay) overlay.parentNode.removeChild(overlay);
    if (previousOverflow !== null) {
      document.documentElement.style.overflow = previousOverflow.html;
      document.body.style.overflow = previousOverflow.body;
      previousOverflow = null;
    }
  }
  window.closePosmacCatalogue = closePosmacCatalogue;
  window.renderPdfViewerInDiv = function (options) {
    closePosmacCatalogue();
    var overlay = document.createElement('div');
    overlay.id = OVERLAY_ID;
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-label', 'PosMAC 제품 카탈로그');
    overlay.style.cssText = 'position:fixed!important;inset:0!important;top:0!important;left:0!important;width:100vw!important;height:100vh!important;height:100dvh!important;z-index:2147483647!important;background:#fff!important;overflow:hidden!important;transform:none!important;zoom:1!important;display:flex!important;flex-direction:column!important;box-sizing:border-box!important;';
    var header = document.createElement('div');
    header.style.cssText = 'height:54px;min-height:54px;background:#12335b;color:white;display:flex;align-items:center;justify-content:space-between;padding:0 14px;box-sizing:border-box;font:600 18px Arial,sans-serif;touch-action:manipulation;';
    var title = document.createElement('span');
    title.textContent = 'PosMAC 브랜드 · 제품 카탈로그';
    var close = document.createElement('button');
    close.type = 'button';
    close.textContent = '✕  HOME';
    close.setAttribute('aria-label', '카탈로그 닫기');
    close.style.cssText = 'font:700 16px Arial,sans-serif;background:#fff;color:#12335b;border:0;border-radius:6px;padding:10px 16px;cursor:pointer;touch-action:manipulation;';
    close.addEventListener('click', function (e) { e.stopPropagation(); closePosmacCatalogue(); });
    header.appendChild(title); header.appendChild(close);
    var scroller = document.createElement('div');
    scroller.className = 'posmac-fullscreen-scroll';
    scroller.style.cssText = 'display:block!important;flex:1 1 auto!important;min-height:0!important;width:100%!important;overflow-y:scroll!important;overflow-x:hidden!important;-webkit-overflow-scrolling:touch!important;overscroll-behavior:contain!important;touch-action:pan-y!important;background:white!important;position:relative!important;box-sizing:border-box!important;';
    for (var i=1;i<=8;i++) {
      var img=document.createElement('img');
      img.src='asset/pdf_pages/page-'+String(i).padStart(2,'0')+'.jpg';
      img.alt='PosMAC 제품 카탈로그 '+i+'페이지';
      img.draggable=false;
      img.loading=i<=2?'eager':'lazy';
      img.style.cssText='display:block!important;width:100%!important;max-width:100%!important;height:auto!important;max-height:none!important;object-fit:contain!important;margin:0!important;padding:0!important;border:0!important;user-select:none!important;-webkit-user-drag:none!important;pointer-events:none!important;';
      scroller.appendChild(img);
    }
    overlay.appendChild(header); overlay.appendChild(scroller);
    // Prevent the ASPEN stage from consuming gestures while catalogue is open.
    previousOverflow = {html:document.documentElement.style.overflow,body:document.body.style.overflow};
    document.documentElement.style.overflow='hidden';
    document.body.style.overflow='hidden';
    document.body.appendChild(overlay);
    return overlay;
  };
})();
