/* PosMAC kiosk-safe catalogue viewer. Pages are local raster previews of the original PDF. */
function renderPdfViewerInDiv(options) {
  const config = Object.assign({
    target: '#pdf-viewer-container', pdfUrl: './pdf/posmac-leaflet-0909.pdf',
    title: 'PosMAC 리플렛 0909', page: 1, zoom: 'FitH',
    showToolbar: true, showHeader: false, onClose: null
  }, options || {});
  const container = resolveTargetContainer(config.target);
  if (!container) { console.warn('PDF viewer target missing', config.target); return null; }
  // Preserve existing Aspen layer navigation; do not open a new window or external PDF app.
  const count = 8;
  let current = Math.max(1, Math.min(count, Number(config.page) || 1));
  let scale = 1;
  container.style.position = 'relative';
  container.style.overflow = 'hidden';
  container.style.height = '100%';
  container.innerHTML = `
    <div class="posmac-catalogue" style="width:100%;height:100%;background:#202936;display:flex;flex-direction:column;overflow:hidden;box-sizing:border-box;font-family:Arial,sans-serif;color:#fff;touch-action:pan-y">
      <div class="posmac-catalogue-page" style="flex:1;min-height:0;display:flex;align-items:center;justify-content:center;overflow:auto;padding:8px;box-sizing:border-box;touch-action:pan-x pan-y">
        <img class="posmac-catalogue-img" alt="제품 카탈로그" draggable="false" style="display:block;max-width:100%;max-height:100%;width:auto;height:auto;object-fit:contain;transform-origin:center center;user-select:none;-webkit-user-drag:none" />
      </div>
      <div style="flex:none;min-height:64px;display:flex;justify-content:center;align-items:center;gap:14px;background:#111c2b;padding:7px;box-sizing:border-box">
        <button type="button" data-pdf="prev" style="font-size:19px;min-width:82px;min-height:46px;border:0;border-radius:7px;background:#344c67;color:white">◀ 이전</button>
        <span data-pdf="counter" style="font-size:19px;min-width:74px;text-align:center">1 / 8</span>
        <button type="button" data-pdf="next" style="font-size:19px;min-width:82px;min-height:46px;border:0;border-radius:7px;background:#344c67;color:white">다음 ▶</button>
        <button type="button" data-pdf="minus" style="font-size:21px;min-width:48px;min-height:46px;border:0;border-radius:7px;background:#344c67;color:white">−</button>
        <button type="button" data-pdf="plus" style="font-size:21px;min-width:48px;min-height:46px;border:0;border-radius:7px;background:#344c67;color:white">＋</button>
        <button type="button" data-pdf="reset" style="font-size:16px;min-width:70px;min-height:46px;border:0;border-radius:7px;background:#344c67;color:white">맞춤</button>
      </div>
    </div>`;
  const image = container.querySelector('.posmac-catalogue-img');
  const pageArea = container.querySelector('.posmac-catalogue-page');
  const counter = container.querySelector('[data-pdf="counter"]');
  const imagePath = n => 'asset/pdf_pages/page-' + String(n).padStart(2,'0') + '.jpg';
  const update = () => {
    image.src = imagePath(current);
    image.style.transform = 'scale(' + scale + ')';
    counter.textContent = current + ' / ' + count;
    pageArea.scrollTop = 0; pageArea.scrollLeft = 0;
  };
  const go = delta => { current = Math.max(1, Math.min(count, current + delta)); scale=1; update(); };
  container.querySelector('[data-pdf="prev"]').onclick = () => go(-1);
  container.querySelector('[data-pdf="next"]').onclick = () => go(1);
  container.querySelector('[data-pdf="plus"]').onclick = () => {scale=Math.min(3,+(scale+.25).toFixed(2));update();};
  container.querySelector('[data-pdf="minus"]').onclick = () => {scale=Math.max(1,+(scale-.25).toFixed(2));update();};
  container.querySelector('[data-pdf="reset"]').onclick = () => {scale=1;update();};
  let startX=0,startY=0;
  pageArea.addEventListener('touchstart', e => { if(e.touches.length===1){startX=e.touches[0].clientX;startY=e.touches[0].clientY;} }, {passive:true});
  pageArea.addEventListener('touchend', e => {
    if(scale!==1 || !e.changedTouches.length)return;
    const dx=e.changedTouches[0].clientX-startX,dy=e.changedTouches[0].clientY-startY;
    if(Math.abs(dx)>65 && Math.abs(dx)>Math.abs(dy)*1.3)go(dx<0?1:-1);
  },{passive:true});
  update();
  return container;
}

function resolveTargetContainer(target) {
  if (!target) return null;

  if (target instanceof HTMLElement) {
    return target;
  }

  if (typeof target === 'string') {
    // 1) Aspen 위젯($W) 우선 확인
    if (typeof $W === 'function') {
      try {
        const w = $W(target);
        if (w && w.tag) return w.tag;
      } catch (e) {}
    }

    // 2) data-label 속성 확인
    const byLabel = document.querySelector(`[data-label="${target}"]`);
    if (byLabel) return byLabel;

    // 3) ID 또는 일반 CSS 선택자 확인
    const byId = document.getElementById(target.replace(/^#/, ''));
    if (byId) return byId;

    try {
      return document.querySelector(target);
    } catch (e) {}
  }

  return null;
}

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
