# Prompt API GitHub Issues 템플릿

사용 방법:
1. 각 이슈 블록의 `Title`, `Labels`, `Body`를 그대로 복사해 GitHub Issue 생성
2. 우선순위는 Phase 순서대로 진행

---

## Issue 1
Title: `[PA-001] 유저 스토리 확정`
Labels: `backend`, `product`, `phase-1`

Body:
```md
## 배경
업로드 후 프롬프트 생성까지 사용자 흐름을 명확히 정의해야 API/화면 구현이 정렬됩니다.

## 작업
- 업로드 이후 프롬프트 생성 진입 조건 정의
- 성공/실패 시나리오 정리
- PRD 및 prompt 문서와 용어 통일

## 완료 기준 (DoD)
- 성공/실패 시나리오 6개 이상 문서화
- 관련 문서(`docs/prompt-api-phase-1-requirements.md`) 업데이트 완료
```

## Issue 2
Title: `[PA-002] Prompt 생성 API 계약 합의`
Labels: `backend`, `api`, `phase-1`

Body:
```md
## 배경
프론트/백엔드/QA가 동일한 요청/응답 규약을 기준으로 개발해야 합니다.

## 작업
- `POST /api/prompts/generate` 요청 스키마 확정
- 응답 스키마 및 에러 규약 확정
- 상태코드(400/401/403/404/422/500) 표 정리

## 완료 기준 (DoD)
- JSON 예시 포함 API 계약 문서 확정
- 프론트/백엔드 리뷰 승인 완료
```

## Issue 3
Title: `[PA-003] 인증/권한 규칙 확정`
Labels: `security`, `backend`, `phase-1`

Body:
```md
## 작업
- Clerk `userId` 기반 소유권 정책 확정
- generation 접근 권한(본인만) 문서화
- 권한 실패 응답 규약 확정

## 완료 기준 (DoD)
- 401/403 판단 기준 명확화
- QA 테스트 케이스에 권한 시나리오 반영
```

## Issue 4
Title: `[PA-101] generations.options 저장 규약 확정`
Labels: `database`, `backend`, `phase-2`

Body:
```md
## 작업
- `negativePrompt`, `promptVersion`, `promptModel`, `normalizedOptions` 저장 구조 확정
- JSONB 스키마 예시 정의

## 완료 기준 (DoD)
- 문서에 저장 예시 2개 이상 반영
- 추후 마이그레이션 변경 필요 없음
```

## Issue 5
Title: `[PA-102] prompt_requests 테이블 마이그레이션 작성`
Labels: `database`, `migration`, `phase-2`

Body:
```md
## 작업
- `prompt_requests` 테이블 생성 SQL 작성
- 인덱스/외래키 추가
- RLS 정책 추가

## 완료 기준 (DoD)
- migration SQL 생성 완료
- 로컬/스테이징 DB 적용 테스트 완료
```

## Issue 6
Title: `[PA-103] Prompt 로그 조회 성능 설계`
Labels: `database`, `performance`, `phase-2`

Body:
```md
## 작업
- 조회 패턴 기준 인덱스 점검 (`user_id`, `generation_id`, `created_at`)
- p95 조회 성능 목표 정의

## 완료 기준 (DoD)
- 성능 목표 수치 문서화
- 인덱스 설계 리뷰 승인
```

## Issue 7
Title: `[PA-201] Prompt Generator 모듈 구현`
Labels: `backend`, `ai`, `phase-3`

Body:
```md
## 작업
- `lib/prompt-generator.ts` 구현
- 시스템 지시문 + 사용자 입력 정규화 + 출력 검증
- 버전 관리 상수(`promptVersion`) 적용

## 완료 기준 (DoD)
- 단위 테스트 통과
- 포맷 검증 실패 케이스 처리
```

## Issue 8
Title: `[PA-202] POST /api/prompts/generate 라우트 구현`
Labels: `backend`, `api`, `phase-3`

Body:
```md
## 작업
- 인증/권한 확인
- generation 소유권 확인
- Prompt Generator 호출
- 결과 DB 저장(`prompt_used`, `options`)

## 완료 기준 (DoD)
- 200/400/401/403/404/422/500 케이스 동작
- API 응답 포맷 문서와 일치
```

## Issue 9
Title: `[PA-203] generate 페이지 Prompt API 연동`
Labels: `frontend`, `integration`, `phase-3`

Body:
```md
## 작업
- `/generate`에서 Prompt API 호출
- 로딩/실패 UI 반영
- 응답된 prompt로 생성 파이프라인 연결

## 완료 기준 (DoD)
- 업로드 -> 프롬프트 생성 -> 이미지 생성 흐름 동작
- 사용자 실패 메시지 UX 점검 완료
```

## Issue 10
Title: `[PA-204] Prompt 버전 전환/롤백 지원`
Labels: `backend`, `ops`, `phase-3`

Body:
```md
## 작업
- prompt 버전 상수화
- 버전 변경 시 하위 호환 정책 정의

## 완료 기준 (DoD)
- 버전 전환 방법 문서화
- 롤백 절차 검증 완료
```

## Issue 11
Title: `[PA-301] Prompt API 기능 QA 실행`
Labels: `qa`, `phase-4`

Body:
```md
## 작업
- 정상/실패/권한/입력오류/모델오류 시나리오 테스트
- 결과 리포트 작성

## 완료 기준 (DoD)
- 체크리스트 100% 실행
- Blocker 0건
```

## Issue 12
Title: `[PA-302] Prompt API 성능/타임아웃 검증`
Labels: `performance`, `qa`, `phase-4`

Body:
```md
## 작업
- p95 latency 측정
- 모델 지연 시 timeout/fallback 검증

## 완료 기준 (DoD)
- 목표 성능 수치 충족
- 타임아웃 정책 반영 완료
```

## Issue 13
Title: `[PA-303] 모니터링/알림 구성`
Labels: `ops`, `monitoring`, `phase-4`

Body:
```md
## 작업
- 오류율/파싱실패율/타임아웃 지표 수집
- 알림 임계치 설정

## 완료 기준 (DoD)
- 알림 테스트 통과
- 대시보드 확인 가능
```

## Issue 14
Title: `[PA-304] 프로덕션 배포 체크리스트 완료`
Labels: `release`, `phase-4`

Body:
```md
## 작업
- env/migration/rollback/runbook 최종 점검
- 배포 승인 프로세스 수행

## 완료 기준 (DoD)
- 체크리스트 전부 통과
- 배포 승인 완료
```

---

## 선택: gh CLI로 생성
`gh` CLI 사용 시 아래 패턴으로 생성:

```bash
gh issue create --title "[PA-001] 유저 스토리 확정" --label "backend,product,phase-1" --body-file /path/to/body.md
```
