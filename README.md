# PosMAC Player

노바피프티 포스맥(PosMAC) 태양광 프레임용 HTML5 영상 플레이어(영상 2종)와 PDF 뷰어 연동 콘텐츠입니다.

- 해상도: 1740 × 1080
- 형태: 웹 임베드용 정적 HTML5 (별도 빌드 불필요)
- 패키징 일자: 2026-11-13

## 구성

```
index.html      진입 페이지
data.js         콘텐츠 데이터
corp/ css/ js/  공통 스타일·스크립트
asset/ wgts/    이미지·영상·위젯 리소스
pdf/            PDF 뷰어에서 열리는 자료 (posmac-leaflet-0909.pdf)
```

## 로컬 실행

PDF 뷰어와 리소스 로딩은 `file://` 이 아닌 HTTP 환경에서 동작합니다.

```bash
python3 -m http.server 8000
# http://localhost:8000 접속
```

## GitHub Pages 배포

저장소의 `Settings > Pages` 에서 `main` 브랜치 `/ (root)` 를 선택하면
아래 주소로 공개됩니다.

- 배포 주소: https://sungchulheo.github.io/posmac-player/

## 참고

- 파일명은 한글·공백 없이 영문으로 유지해 주세요. 한글 파일명은 OS별 유니코드
  정규화 차이로 배포 환경에서 404가 발생할 수 있습니다.

## 라이선스

저작권은 주식회사 노바피프티에 귀속되며 모든 권리를 보유합니다. 자세한 내용은 [LICENSE](LICENSE)를 참고하세요.
