# Prompt API Phase 4: QA/운영/배포

## 목표
- Prompt 생성 API를 운영 가능한 수준으로 검증하고 배포 기준을 통과한다.

## 테스트
기능 테스트:
1. 정상 입력 시 prompt/negativePrompt 반환
2. 부정확한 입력(짧은 문장/오타/유행어) 처리
3. 타인 generation 접근 차단
4. 키 미설정 상태 실패 응답
5. 재시도 시 동일 입력 안정성 확인

성능 테스트:
1. 동시 요청 부하에서 응답 시간 측정
2. LLM 지연 시 timeout 처리 확인

## 운영 지표
1. 성공률 (`prompt_generate_success_rate`)
2. 평균/95p 지연 (`prompt_generate_latency_ms`)
3. 포맷 파싱 실패율
4. 요청당 토큰 사용량/비용

## 모니터링/알림
1. API 5xx 비율 임계치 알림
2. 타임아웃 증가 알림
3. 모델 응답 이상(빈 문자열/포맷 깨짐) 알림

## 배포 체크리스트
1. `.env.local`/배포 환경변수 설정 완료
2. Supabase migration 적용 완료
3. 롤백 전략:
   - `promptVersion` 이전 버전으로 즉시 전환
4. 운영 매뉴얼:
   - 장애 시 임시 fallback prompt 사용

## 완료 기준
1. 스테이징 E2E 통과
2. 프로덕션 배포 후 24시간 오류율 기준 만족
3. 운영 대시보드에서 핵심 KPI 확인 가능
