# broadcast-license

VRChat 월드용 **방송 라이선스 화이트리스트** 저장소입니다.

- `products/<제품>.txt` — 제품별 라이선스 등록자 명단 (한 줄 = VRChat 표시 이름 하나)
- 이 파일들이 GitHub Pages로 배포되고, 월드가 이를 조회해 방송 워터마크를 해제합니다.
- 게임의 모든 기능은 **무료**입니다. 라이선스는 방송 송출 시 워터마크 제거에만 관여합니다.

**구매·등록 안내**: [docs/license-guide.md](docs/license-guide.md)

## 운영 구조

```
비공개 원장 시트  ──(Actions: sync, 수동 실행)──▶  products/*.txt  ──(Pages)──▶  월드가 fetch
```

- 명단 반영: 시트 수정 → sync 워크플로 수동 실행 → 커밋 → Pages 배포 (CDN 캐시로 최대 ~10분)
- `products/*.txt` 직접 수정도 가능 (push 시 lint가 형식 검사)
