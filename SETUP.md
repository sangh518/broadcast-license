# 초기 세팅 체크리스트 (계정 작업)

sync(v1.5)가 동작하려면 아래 계정 작업이 필요하다. 완료 순서대로.

## 1. 원장 시트 생성

- [ ] 구글 시트 새로 생성 (비공개), 이름 예: `방송 라이선스 원장`
- [ ] 첫 탭 이름을 **`원장`** 으로 변경 (sync가 이 탭명을 읽는다)
- [ ] 1행 헤더: `등록일 | 제품 | 채널 | 주문번호·입금자명 | VRChat 이름 | 상태 | 메모`
  - `제품`: 소문자+언더스코어 코드 (예: `headcanon_lab`)
  - `상태`: `활성` 만 배포됨. 그 외 값(보류 등)은 제외
- [ ] 시트 URL의 `/d/`와 `/edit` 사이 문자열(스프레드시트 ID)을 복사해 둔다

## 2. 구글 서비스 계정 (시트 읽기 전용)

- [ ] console.cloud.google.com → 새 프로젝트 (예: `broadcast-license`)
- [ ] "API 및 서비스" → **Google Sheets API 사용 설정**
- [ ] "IAM 및 관리자 → 서비스 계정" → 서비스 계정 생성 (역할 불필요)
- [ ] 생성된 계정 → "키" 탭 → **JSON 키 발급·다운로드**
- [ ] 원장 시트를 서비스 계정 이메일(`...@....iam.gserviceaccount.com`)에 **뷰어**로 공유

## 3. 리포 secrets 등록

```powershell
gh secret set SHEET_ID --repo sangh518/broadcast-license --body "<스프레드시트 ID>"
gh secret set GOOGLE_SERVICE_ACCOUNT_KEY --repo sangh518/broadcast-license < 다운받은키.json
```

- [ ] 키 JSON 파일은 등록 후 로컬에서 삭제

## 4. 동작 검증

- [ ] 시트 원장에 테스트 행 추가 (`제품=headcanon_lab`, `이름=테스트이름`, `상태=활성`)
- [ ] sync 실행: `gh workflow run sync --repo sangh518/broadcast-license` (또는 GitHub 웹 → Actions → sync → Run)
- [ ] `products/headcanon_lab.txt`에 반영 확인
- [ ] 배포 확인: `https://sangh518.github.io/broadcast-license/products/headcanon_lab.txt` (Pages 첫 배포 후)
- [ ] 캐시버스터 검증(월드 구현 시): `?v=1` 등 쿼리 변형이 캐시를 우회하는지 실측
