# Prompt API 이슈 티켓 체크리스트

기준 문서:
- `docs/prompt-api-phase-1-requirements.md`
- `docs/prompt-api-phase-2-api-schema.md`
- `docs/prompt-api-phase-3-implementation.md`
- `docs/prompt-api-phase-4-qa-release.md`

## Phase 1: 요구사항 확정

- [ ] `PA-001` 유저 스토리 확정
설명: 업로드 후 프롬프트 생성까지 사용자 흐름 정의.
완료 기준: 성공/실패 시나리오 6개 문서화.

- [ ] `PA-002` API 계약 합의
설명: 요청/응답 필드, 에러 코드 표준화.
완료 기준: 프론트/백엔드 합의된 JSON 스키마 확정.

- [ ] `PA-003` 보안/권한 규칙 확정
설명: Clerk userId 기반 소유권 검증 룰 문서화.
완료 기준: 401/403 조건 명확화 및 QA 체크포인트 반영.

## Phase 2: API/DB 스키마

- [ ] `PA-101` `generations.options` 확장 키 확정
설명: `negativePrompt`, `promptVersion`, `promptModel`, `normalizedOptions` 저장 규칙 정의.
완료 기준: 저장 포맷 예시 2개 포함.

- [ ] `PA-102` `prompt_requests` 테이블 마이그레이션 작성
설명: 프롬프트 생성 요청 로그 테이블 생성.
완료 기준: migration SQL + RLS policy 포함.

- [ ] `PA-103` DB 인덱스/조회 패턴 점검
설명: `generation_id`, `user_id`, `created_at` 중심 인덱스 검토.
완료 기준: p95 조회 성능 목표 정의.

## Phase 3: 서버 구현

- [ ] `PA-201` Prompt Generator 모듈 구현
설명: 시스템 지시문 구성, 사용자 입력 정규화, 출력 포맷 검증.
완료 기준: `lib/prompt-generator.ts` 단위 테스트 통과.

- [ ] `PA-202` `POST /api/prompts/generate` 라우트 구현
설명: 인증, 소유권 검사, Prompt Generator 호출, DB 저장.
완료 기준: 200/400/401/403/404/422/500 케이스 동작 확인.

- [ ] `PA-203` `/generate` 페이지 API 연동
설명: 기존 프롬프트 빌더 대신 서버 API 사용.
완료 기준: 업로드 이미지 기반 생성 요청이 end-to-end로 연결됨.

- [ ] `PA-204` 프롬프트 버전 관리 도입
설명: `promptVersion`을 고정값으로 관리하고 롤백 가능하게 구현.
완료 기준: 환경변수 또는 상수로 버전 전환 가능.

## Phase 4: QA/운영/배포

- [ ] `PA-301` 기능 QA 시나리오 실행
설명: 정상/권한/입력 오류/모델 오류 케이스 점검.
완료 기준: 체크리스트 100% 실행 기록.

- [ ] `PA-302` 성능 측정 및 타임아웃 정책 반영
설명: API 응답 시간, 모델 지연 시 fallback/오류 정책 검증.
완료 기준: p95 latency 목표 및 타임아웃 값 확정.

- [ ] `PA-303` 모니터링/알림 연결
설명: 5xx 비율, 파싱 실패율, 모델 타임아웃 지표 수집.
완료 기준: 운영 알림 채널에서 임계치 테스트 통과.

- [ ] `PA-304` 프로덕션 릴리즈 점검
설명: env, migration, rollback, runbook 최종 확인.
완료 기준: 릴리즈 체크리스트 통과 후 배포 승인.

## 권장 우선순위

1. `PA-001` ~ `PA-003`
2. `PA-101` ~ `PA-103`
3. `PA-201` ~ `PA-204`
4. `PA-301` ~ `PA-304`
