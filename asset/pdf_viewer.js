/* ==========================================================================
   ASPEN / HTML5 DIV 내장형 PDF 뷰어 생성기 (상대경로 전용 · 외부 CDN 미사용)
   ========================================================================== */

/**
 * 지정한 div(또는 Aspen 위젯) 내부에 상대경로 기반 PDF 뷰어를 생성합니다.
 *
 * @param {Object} options 설정 옵션
 * @param {string|HTMLElement} options.target - 대상 div의 id, CSS 선택자, DOM 요소, 또는 Aspen 위젯 레이블(예: 'div$pdfViewer', '#pdf-container')
 * @param {string} options.pdfUrl - PDF 파일의 상대경로 (예: './pdf/manual.pdf')
 * @param {string} [options.title='비뚤림위험 평가도구 매뉴얼'] - 상단 바에 표시할 문서 제목
 * @param {number} [options.page=1] - 처음 열릴 페이지 번호
 * @param {string} [options.zoom='FitH'] - 초기 줌 모드 ('FitH': 가로 맞춤, 'Fit': 한 페이지 맞춤, 숫자: 배율%)
 * @param {boolean} [options.showToolbar=true] - 브라우저 기본 PDF 툴바 노출 여부
 * @param {boolean} [options.showHeader=true] - 커스텀 상단 헤더(제목, 새창열기, 다운로드, 닫기) 노출 여부
 * @param {Function} [options.onClose] - 닫기 버튼 클릭 시 실행할 콜백 (미지정 시 대상 위젯/div 숨김 처리)
 */
function renderPdfViewerInDiv(options) {
  const config = Object.assign(
    {
      target: '#pdf-viewer-container',
      pdfUrl: './pdf/posmac-leaflet-0909.pdf',
      title: 'PosMAC 리플렛 0909',
      page: 1,
      zoom: 'FitH',
      showToolbar: true,
      showHeader: false,
      onClose: null,
    },
    options || {},
  );

  // 1. 대상 컨테이너 DOM 탐색 (Aspen $W 위젯 및 일반 DOM 모두 호환)
  const container = resolveTargetContainer(config.target);
  if (!container) {
    console.warn('[PDF VIEWER WARN] 대상 div를 찾을 수 없습니다:', config.target);
    return null;
  }

  // 2. 상대경로 URL 및 PDF 뷰어 해시 파라미터 조합
  const cleanUrl = encodeURI(config.pdfUrl).replace(/#/g, '%23');
  const toolbarParam = config.showToolbar ? '1' : '0';
  const hashParams = `#page=${config.page}&view=${config.zoom}&toolbar=${toolbarParam}&navpanes=0`;
  const fullPdfSrc = `${cleanUrl}${hashParams}`;

  // 3. 컨테이너 기본 스타일 보정
  if (getComputedStyle(container).position === 'static') {
    container.style.position = 'relative';
  }
  container.style.overflow = 'hidden';
  container.style.height = '100%';

  // 4. 내부 HTML 렌더링
  container.innerHTML = `
    <div class="aspen-pdf-wrap" style="
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      background: #18253A;
      border: 1.5px solid rgba(110, 195, 250, 0.35);
      //border-radius: 12px;
      overflow: hidden;
      box-sizing: border-box;
      box-shadow: 0 16px 40px rgba(8, 15, 30, 0.45);
      font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif;
    ">
      ${
        config.showHeader
          ? `
      <div class="aspen-pdf-header" style="
        height: 52px;
        min-height: 52px;
        padding: 0 18px;
        background: linear-gradient(180deg, #18253A 0%, #0E1726 100%);
        border-bottom: 1px solid rgba(148, 185, 225, 0.22);
        display: flex;
        align-items: center;
        justify-content: space-between;
        color: #F1F5F9;
        user-select: none;
      ">
        <div style="display: flex; align-items: center; gap: 10px; overflow: hidden;">
          <span style="
            background: linear-gradient(135deg, #00A0E9, #0070C0);
            color: #FFFFFF;
            font-size: 11px;
            font-weight: 700;
            padding: 3px 8px;
            border-radius: 5px;
            letter-spacing: 0.4px;
          ">PDF</span>
          <span class="aspen-pdf-title" style="
            font-size: 15px;
            font-weight: 700;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          ">${escapeHtml(config.title)}</span>
        </div>

        <div style="display: flex; align-items: center; gap: 8px;">
          <a href="${cleanUrl}" target="_blank" rel="noopener" style="
            text-decoration: none;
            background: rgba(56, 189, 248, 0.14);
            border: 1px solid rgba(56, 189, 248, 0.45);
            color: #E0F2FE;
            font-size: 13px;
            font-weight: 600;
            padding: 6px 12px;
            border-radius: 6px;
            cursor: pointer;
          ">새 탭으로 열기 ↗</a>

          <a href="${cleanUrl}" download style="
            text-decoration: none;
            background: rgba(255, 255, 255, 0.08);
            border: 1px solid rgba(255, 255, 255, 0.2);
            color: #F1F5F9;
            font-size: 13px;
            font-weight: 600;
            padding: 6px 12px;
            border-radius: 6px;
            cursor: pointer;
          ">다운로드 ↓</a>

          <button type="button" data-role="pdf-close-btn" style="
            background: rgba(239, 68, 68, 0.18);
            border: 1px solid rgba(248, 113, 113, 0.45);
            color: #FCA5A5;
            font-size: 13px;
            font-weight: 700;
            padding: 6px 12px;
            border-radius: 6px;
            cursor: pointer;
          ">닫기 ✕</button>
        </div>
      </div>
      `
          : ''
      }

      <div class="aspen-pdf-body" style="
        position: relative;
        flex: 1;
        width: 100%;
        height: 100%;
        background: #2B3445;
      ">
        <object
          data="${fullPdfSrc}"
          type="application/pdf"
          style="width: 100%; height: 100%; border: 0; display: block;"
        >
          <iframe
            src="${fullPdfSrc}"
            style="width: 100%; height: 100%; border: 0; display: block;"
            title="${escapeHtml(config.title)}"
          >
            <div style="
              padding: 40px;
              text-align: center;
              color: #F1F5F9;
            ">
              <p style="margin-bottom: 14px; font-size: 15px;">현재 브라우저에서 내장 PDF 미리보기를 지원하지 않습니다.</p>
              <a href="${cleanUrl}" target="_blank" rel="noopener" style="
                display: inline-block;
                background: #0070C0;
                color: #FFFFFF;
                padding: 10px 20px;
                border-radius: 8px;
                text-decoration: none;
                font-weight: 700;
              ">PDF 파일 직접 열기</a>
            </div>
          </iframe>
        </object>
      </div>
    </div>
  `;

  // 5. 닫기 버튼 이벤트 연결
  const closeBtn = container.querySelector('[data-role="pdf-close-btn"]');
  if (closeBtn) {
    closeBtn.addEventListener('click', function () {
      if (typeof config.onClose === 'function') {
        config.onClose(container);
      } else if (typeof $W === 'function' && typeof config.target === 'string' && $W(config.target)) {
        $W(config.target).set('visibility', 'hidden');
      } else {
        container.style.display = 'none';
      }
    });
  }

  return container;
}

/**
 * Aspen 위젯 레이블, DOM ID, CSS 선택자, HTMLElement를 모두 실제 DOM 요소로 변환
 */
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
