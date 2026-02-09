# Prompt API Phase 3: 서버 구현

## 목표
- 실제 API 라우트와 프롬프트 생성 모듈을 구현해 `/generate` 화면과 연결한다.

## 구현 항목
1. 라우트 추가
- `my-app/app/api/prompts/generate/route.ts`

2. 프롬프트 엔진 모듈
- `my-app/lib/prompt-generator.ts`
- 함수:
  - `buildSystemInstruction()`
  - `buildUserPromptContext()`
  - `generatePrompt()`
  - `validatePromptOutput()`

3. 인증/권한
- `auth()`로 `userId` 확인
- `generationId`가 해당 사용자 소유인지 조회

4. DB 저장
- `generations.prompt_used` 업데이트
- `generations.options`에 `negativePrompt`, `promptVersion`, `promptModel` 반영

5. 실패 처리
- LLM 타임아웃
- 출력 포맷 검증 실패
- DB 업데이트 실패

## 구현 순서
1. Route Handler 골격 + 입력 검증
2. Prompt Generator 모듈 연결
3. Supabase 조회/업데이트 연결
4. API 응답 표준화
5. 프론트 `generate/page.tsx` 연결

## 코드 규칙
1. 모델 키는 `.env.local`만 사용
2. 실제 키/토큰을 코드/문서에 저장하지 않음
3. 프롬프트 버전 문자열 강제 (`v1`, `v2`...)

## 완료 기준
1. 업로드 후 `/generate`에서 API 호출 가능
2. 성공 시 prompt가 DB와 응답 둘 다 저장됨
3. 실패 케이스 5종(400/401/403/404/500) 수동 테스트 완료
