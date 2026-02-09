# Prompt API 구현 로드맵

## 문서 구성
1. 요구사항/범위: `docs/prompt-api-phase-1-requirements.md`
2. API/스키마 설계: `docs/prompt-api-phase-2-api-schema.md`
3. 서버 구현: `docs/prompt-api-phase-3-implementation.md`
4. QA/배포: `docs/prompt-api-phase-4-qa-release.md`

## 추천 진행 순서
1. Phase 1 확정 후 API 계약 동결
2. Phase 2에서 DB 반영점 확정
3. Phase 3 코드 구현 + 스테이징 검증
4. Phase 4 성능/운영 기준 통과 후 배포

## 현재 결정 사항 반영
1. Auth: Clerk
2. DB/Storage: Supabase
3. Payment: Polar
4. Image Generation: Replicate
