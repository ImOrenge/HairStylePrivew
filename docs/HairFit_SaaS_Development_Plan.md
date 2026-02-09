# HairFit AI SaaS 개발 계획 (v0.2)

기준 문서:
- `hairPrivewPrd.md`
- `ComponentStructuer.md`

## 1. 목표와 범위

목표:
- 사용자 얼굴 사진 기반 AI 헤어스타일 미리보기 SaaS MVP를 4주 내 출시
- 업로드 → 스타일 선택 → 생성 → 비교/저장까지 핵심 플로우 완성

MVP 포함 범위:
- 소셜 로그인(최소 1개 Provider)
- 사진 업로드 + 얼굴 유효성 검사
- 스타일 옵션 선택 + 프롬프트 매핑
- Replicate 기반 생성 파이프라인
- 결과 비교 슬라이더(Before/After)
- 크레딧 차감/잔액, 기본 결제 연동(Polar)
- 히스토리 조회

MVP 제외(2차):
- 다중 모델 A/B 라우팅
- 고급 편집(부분 리터치, 얼굴 형태 보정)
- 팀/스튜디오 다계정 권한

## 2. 아키텍처 결정

확정 Provider:
- Auth: `Clerk`
- Payment: `Polar`
- Database/Storage: `Supabase` (PostgreSQL + Storage)

프론트엔드:
- Next.js 14+ App Router, TypeScript, Tailwind, shadcn/ui, Zustand

백엔드/데이터:
- Next.js Route Handler + Server Actions
- Supabase(PostgreSQL + Storage)
- DB 핵심 테이블: `users`, `generations`, `credit_ledger`, `payment_transactions`

AI:
- Replicate API(ControlNet/Inpainting)
- 비동기 Job 상태: `queued` / `processing` / `completed` / `failed`

운영:
- Vercel 배포
- 모니터링: Sentry(에러), 기본 로그 수집(요청/응답/실패 원인)

## 3. 컴포넌트 기반 구현 순서

1차(핵심 플로우):
- `app/upload/page.tsx` + `components/upload/*`
- `app/generate/page.tsx` + `components/editor/*`
- `app/result/[id]/page.tsx` + `components/result/*`

2차(전환/운영):
- `app/page.tsx` 랜딩 전환 컴포넌트
- `app/mypage/page.tsx` 히스토리/크레딧
- 결제/크레딧 충전 플로우

공통:
- `store/useGenerationStore.ts`
- `lib/replicate.ts`, `lib/polar.ts`, `lib/clerk.ts`, `lib/supabase.ts`
- `components/layout/*`, Toast/Skeleton/에러 경계

## 4. 4주 실행 계획 (MVP)

1주차: 기반 구축
- 프로젝트 부트스트랩, 디자인 토큰, 라우팅 골격
- Auth 연결(Clerk)
- DB 스키마/마이그레이션
- 업로드 기본 UI + Supabase Storage 연결
- 완료 기준: 로그인 후 업로드 화면 진입/저장 가능

2주차: 생성 파이프라인
- 스타일 선택 UI, `PromptBuilder` 로직
- Replicate 호출 API + Job 상태 저장
- 생성 진행률/로딩 상태, 실패 재시도 UX
- 완료 기준: 옵션 선택 후 생성 요청/결과 URL 저장

3주차: 결과/과금
- Compare Slider, 다운로드/공유
- 크레딧 차감 로직, Polar 결제/웹훅 연동
- 마이페이지 히스토리/잔액
- 완료 기준: 결제 후 크레딧 충전, 생성 시 차감 정확성

4주차: 품질/출시
- 성능 튜닝(이미지 최적화, API timeout/retry)
- 보안/개인정보 정책 반영(24시간 원본 삭제 배치)
- QA, 버그픽스, 배포 및 운영 대시보드
- 완료 기준: UAT 통과, 운영 체크리스트 완료, 프로덕션 배포

## 5. 품질 기준(KPI/SLO)

제품 KPI:
- 업로드→생성 완료 전환율 60% 이상
- 생성 재시도율 25% 이하
- 무료→유료 전환율(초기) 3~5%

기술 SLO:
- 생성 요청 성공률 95% 이상
- 생성 응답 20초 이내(대부분 케이스)
- 주요 페이지 LCP 2.5초 이내(모바일 기준)

## 6. 리스크와 대응

모델 결과 품질 편차:
- 스타일별 프롬프트 템플릿 고정 + Negative Prompt 운영

생성 비용 급증:
- 해상도/횟수 제한, 무료 크레딧 상한, 실패 호출 캐시/중복 방지

개인정보/저작권 이슈:
- 원본 24시간 자동 삭제
- 이용약관/개인정보 처리방침/삭제 정책 명시

## 7. 출시 직전 체크리스트

- 결제 웹훅 서명 검증 완료
- 크레딧 차감/환불 트랜잭션 원자성 검증
- 실패 케이스(얼굴 미검출, timeout, 결제 실패) UX 문구 점검
- 로그/알림 채널 연동(Sentry, 운영 알림)
- 기본 운영 매뉴얼(장애 대응, 문의 대응) 작성
