제시해주신 아이디어를 바탕으로 Next.js 생태계에 최적화된 **'AI 기반 헤어스타일 미리보기 SaaS'**의 제품 요구사항 정의서(PRD) 초안을 작성해 드립니다.

이 문서는 개발자, 디자이너, 이해관계자가 제품의 기능을 명확히 이해하고 개발에 착수할 수 있도록 구조화되었습니다.

---

# 제품 요구사항 정의서 (PRD): AI Hairstyle Preview SaaS

## 1. 프로젝트 개요 (Overview)

* **제품명 (가칭):** HairFit AI
* **목적:** 사용자가 미용실 방문 전, 본인의 얼굴 사진에 다양한 헤어스타일을 합성해 봄으로써 스타일 실패에 대한 두려움을 줄이고 의사결정을 돕는 웹 서비스 제공.
* **핵심 가치:** 간편함(Easy), 리얼리티(Realistic), 즉시성(Instant).
* **타겟 유저:** 헤어스타일 변화를 고민하는 2030 남녀, 고객 상담 도구가 필요한 헤어 디자이너.

## 2. 사용자 플로우 (User Flow)

제시하신 4단계를 구체화한 흐름입니다.

1. **Onboarding/Login:** 서비스 접속 및 소셜 로그인 (비회원은 1회 무료 체험 등 제한).
2. **Photo Upload:** 정면 얼굴 사진 업로드 (가이드라인 제공).
3. **Face Detection (System):** 업로드된 사진에서 얼굴 인식 및 유효성 검사.
4. **Template Selection:** 원하는 성별, 기장, 스타일(펌/염색), 무드 선택.
5. **AI Generation:** 선택한 옵션을 바탕으로 이미지 합성 처리.
6. **Review & Action:** 결과물 확인(Before/After), 저장, 공유, 혹은 다시 시도.

## 3. 상세 기능 명세 (Functional Requirements)

### 3.1. 회원가입 및 인증

* **소셜 로그인:** Google, Kakao, Apple 로그인 지원.
* **크레딧 시스템:** 무료 크레딧 제공 및 추가 생성을 위한 결제 연동 (Stripe/Toss Payments).

### 3.2. 이미지 업로드 및 전처리

* **Drag & Drop:** 직관적인 업로드 인터페이스.
* **유효성 검사 (Client-side):**
* `face-api.js` 등을 활용하여 사진 내에 '사람 얼굴'이 존재하는지 1차 확인.
* 이미지 해상도 최소/최대 제한 (예: 512x512 이상).


* **가이드라인 팝업:** "안경 벗기", "이마 드러내기" 등 AI 합성에 유리한 사진 가이드 제공.

### 3.3. 헤어스타일 템플릿 선택

* **필터링 UI:**
* 성별 (남/여/유니섹스)
* 길이 (Short, Medium, Long)
* 색상 (Color Picker 또는 프리셋)
* 스타일 (Straight, Perm, Bangs, Layered 등)


* **프롬프트 매핑:** 사용자가 선택한 태그를 AI가 이해할 수 있는 텍스트 프롬프트(예: "blonde wavy bob hair, photorealistic")로 변환하는 로직 포함.

### 3.4. AI 이미지 생성 (Core)

* **Inpainting/ControlNet:** 얼굴 영역은 유지하고 머리카락 영역(Masking)만 변경하는 기술 적용.
* **비동기 처리:** 생성 시간이 5~15초 소요될 수 있으므로 Loading Indicator 및 진행 상황 표시 줄(Progress Bar) 필수.

### 3.5. 리뷰 및 결과 페이지

* **슬라이더 뷰:** 원본과 합성본을 겹쳐서 슬라이더로 비교(Compare Slider)하는 기능.
* **히스토리:** 과거 생성한 이미지를 보관하는 갤러리 (S3 연동).
* **다운로드/공유:** 워터마크가 포함된 무료 다운로드 vs 워터마크 제거(유료).

## 4. 기술 스택 (Technical Stack)

Next.js 생태계를 적극 활용하여 개발 생산성과 성능을 최적화합니다.

| 구분 | 추천 스택 | 설명 |
| --- | --- | --- |
| **Framework** | **Next.js 14+ (App Router)** | SEO 최적화 및 Server Actions 활용 |
| **Language** | TypeScript | 정적 타입 지정을 통한 에러 방지 |
| **Styling** | **Tailwind CSS** + Shadcn/ui | 빠른 UI 구축 및 모던한 디자인 시스템 |
| **State Mgmt** | Zustand | 가벼운 전역 상태 관리 (유저 선택 옵션 등) |
| **Auth** | **Clerk** 또는 NextAuth.js | 빠르고 안전한 소셜 인증 구현 |
| **Database** | **Supabase** (PostgreSQL) | 유저 정보, 결제 내역, 이미지 메타데이터 저장 |
| **Storage** | Supabase Storage 또는 AWS S3 | 업로드된 원본 및 생성된 이미지 저장 |
| **AI Model API** | **Replicate API** | Stable Diffusion (ControlNet, Inpainting) 모델을 API로 호출하여 서버 구축 비용 절감 |
| **Payment** | Toss Payments / Stripe | 결제 모듈 연동 |
| **Deploy** | **Vercel** | Next.js 최적화 배포 및 CI/CD |

## 5. 데이터 아키텍처 및 스키마 (간략)

### User Table

* `id`, `email`, `credits`, `created_at`

### Generation Table

* `id`, `user_id` (FK)
* `original_image_url`
* `generated_image_url`
* `prompt_used` (사용된 옵션)
* `status` (processing, completed, failed)
* `created_at`

## 6. 비기능 요구사항 (Non-Functional Requirements)

* **응답 속도:** AI 생성 요청 후 20초 이내 결과 반환 (API 타임아웃 관리 필수).
* **보안 (Privacy):** 사용자가 업로드한 원본 얼굴 사진은 생성 후 24시간 뒤 자동 삭제 정책 명시 (개인정보 보호).
* **반응형 웹:** 모바일(스마트폰)에서의 사용성 최우선 고려.

## 7. 주요 마일스톤 (MVP 단계)

1. **1주차:** 기획 확정, UI 디자인(Figma), Next.js 프로젝트 세팅.
2. **2주차:** 회원가입(Clerk), 이미지 업로드(Storage), DB 설계.
3. **3주차:** **Replicate API 연동** 및 프롬프트 엔지니어링 테스트 (가장 중요).
4. **4주차:** 결제 연동, 결과 페이지 UI 고도화, QA 및 배포.

---

