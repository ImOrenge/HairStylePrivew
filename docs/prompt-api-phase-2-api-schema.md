# Prompt API Phase 2: API 계약/스키마 설계

## 목표
- Prompt 생성 API 계약을 확정하고 Supabase 스키마 반영 지점을 정의한다.

## API 계약
엔드포인트:
- `POST /api/prompts/generate`

요청:
```json
{
  "generationId": "uuid",
  "userInput": "뉴진스 하니 느낌 단발, 애쉬 브라운",
  "styleOptions": {
    "gender": "female",
    "length": "short",
    "style": "layered",
    "color": "ash_brown"
  }
}
```

응답:
```json
{
  "prompt": "photorealistic ...",
  "negativePrompt": "low quality, blurry ...",
  "normalizedOptions": {
    "gender": "female",
    "length": "short",
    "style": "layered",
    "color": "ash_brown"
  },
  "promptVersion": "v1",
  "model": "gemini-pro"
}
```

에러 규약:
1. `400` 잘못된 입력
2. `401` 인증 실패
3. `403` 타인 `generationId` 접근
4. `404` generation 없음
5. `422` 모델 출력 파싱 실패
6. `500` 내부 처리 실패

## DB 반영
기존 `generations` 활용:
1. `prompt_used`: 최종 positive prompt 저장
2. `options` JSONB 확장:
   - `negativePrompt`
   - `normalizedOptions`
   - `promptVersion`
   - `promptModel`

선택(권장) 추가 테이블:
- `prompt_requests`
1. `id` (uuid pk)
2. `user_id` (text, fk users.id)
3. `generation_id` (uuid, fk generations.id)
4. `input_text` (text)
5. `output_prompt` (text)
6. `output_negative_prompt` (text)
7. `latency_ms` (int)
8. `status` (success/failed)
9. `error_message` (text)
10. `created_at` (timestamptz)

## 완료 기준
1. 요청/응답 TypeScript 타입 정의 완료
2. API 오류 포맷 공통화 완료
3. DB 저장 필드 확정 완료
