/* PosMAC continuous-scroll catalogue viewer for kiosk browsers.
 * Keeps the original Aspen entry point and target resolution.
 * Uses the eight locally hosted catalogue page images; no PDF plugin required.
 */
function renderPdfViewerInDiv(options) {
  const config = Object.assign({
    target: '#pdf-viewer-container',
    pdfUrl: './pdf/posmac-leaflet-0909.pdf',
    title: 'PosMAC 리플렛 0909',
    page: 1, zoom: 'FitH', showToolbar: true, showHeader: false, onClose: null
  }, options || {});
  const container = resolveTargetContainer(config.target);
  if (!container) {
    console.warn('[PosMAC] PDF viewer target missing:', config.target);
    return null;
  }
  container.style.position = 'relative';
  container.style.overflow = 'hidden';
  container.style.height = '100%';
  container.innerHTML = `
    <div class="posmac-catalogue" style="width:100%;height:100%;min-height:0;overflow:hidden;background:#202936;box-sizing:border-box;">
      <div class="posmac-catalogue-scroll" role="region" aria-label="제품 카탈로그 연속 스크롤" tabindex="0" style="width:100%;height:100%;overflow-y:auto;overflow-x:hidden;overscroll-behavior:contain;-webkit-overflow-scrolling:touch;touch-action:pan-y;box-sizing:border-box;">
        ${Array.from({length:8}, (_,i) => `<img src="asset/pdf_pages/page-${String(i+1).padStart(2,'0')}.jpg" alt="제품 카탈로그 ${i+1}페이지" draggable="false" loading="${i<2?'eager':'lazy'}" decoding="async" style="display:block;width:100%;height:auto;max-width:100%;margin:0;padding:0;border:0;user-select:none;-webkit-user-drag:none;" />`).join('')}
      </div>
    </div>`;
  const scroller = container.querySelector('.posmac-catalogue-scroll');
  // If called with an initial page, scroll there after image layout has stabilized.
  const initialPage = Math.max(1, Math.min(8, Number(config.page) || 1));
  if (initialPage > 1) {
    const imgs = scroller.querySelectorAll('img');
    const target = imgs[initialPage - 1];
    const jump = () => { scroller.scrollTop = target.offsetTop - scroller.offsetTop; };
    Promise.all(Array.from(imgs).slice(0, initialPage).map(img => img.complete ? Promise.resolve() : new Promise(resolve => {img.addEventListener('load',resolve,{once:true});img.addEventListener('error',resolve,{once:true});}))).then(jump);
  }
  return container;
}

function resolveTargetContainer(target) {
  if (!target) return null;
  if (target instanceof HTMLElement) return target;
  if (typeof target === 'string') {
    if (typeof $W === 'function') {
      try { const w = $W(target); if (w && w.tag) return w.tag; } catch (e) {}
    }
    const byLabel = document.querySelector(`[data-label="${target}"]`);
    if (byLabel) return byLabel;
    const byId = document.getElementById(target.replace(/^#/, ''));
    if (byId) return byId;
    try { return document.querySelector(target); } catch (e) {}
  }
  return null;
}
function escapeHtml(str) {
  return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
