Next.js (App Router) 기반의 **AI 헤어스타일 미리보기 SaaS**를 위한 화면 설계 및 컴포넌트 구조 제안입니다.

개발 효율성을 위해 **Atomic Design** 패턴을 유연하게 적용하고, **Shadcn/ui**와 **Tailwind CSS**를 활용하는 것을 가정하여 구조를 잡았습니다.

---

# 📂 Next.js 프로젝트 디렉토리 및 컴포넌트 구조도

이 구조는 유지보수와 확장성을 고려하여 **페이지(Pages)**와 **재사용 가능한 컴포넌트(Components)**를 명확히 분리했습니다.

```
src/
├── app/                        # App Router (페이지 라우팅)
│   ├── layout.tsx              # 전역 레이아웃 (Header, Footer, ToastProvider)
│   ├── page.tsx                # [1] 메인 랜딩 페이지
│   ├── (auth)/                 # 인증 관련 (Clerk 등 사용 시 자동 처리 가능)
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   ├── upload/                 # [2] 사진 업로드 페이지
│   │   └── page.tsx
│   ├── generate/               # [3] 스타일 선택 및 생성 페이지
│   │   └── page.tsx
│   ├── result/                 # [4] 결과 확인 페이지
│   │   └── [id]/               # 생성된 이미지 ID 기반 동적 라우팅
│   │       └── page.tsx
│   └── mypage/                 # [5] 히스토리 및 크레딧 관리
│       └── page.tsx
│
├── components/                 # 컴포넌트 모음
│   ├── ui/                     # Shadcn/ui 기본 컴포넌트 (Button, Card 등)
│   ├── layout/                 # Header, Footer, Sidebar
│   ├── home/                   # 메인 페이지 전용 컴포넌트
│   ├── upload/                 # 업로드 페이지 전용 컴포넌트
│   ├── editor/                 # 스타일 편집/선택 전용 컴포넌트
│   └── result/                 # 결과 페이지 전용 컴포넌트
│
├── lib/                        # 유틸리티 함수, API 클라이언트
├── hooks/                      # 커스텀 훅 (useUpload, useGenerate)
└── store/                      # 전역 상태 관리 (Zustand)

```

---

# 🖥️ 페이지별 상세 컴포넌트 설계

## 1. 메인 랜딩 페이지 (`app/page.tsx`)

방문자를 서비스 사용자로 전환시키는 것이 핵심입니다.

* **`<HeroSection />`**:
* **구성:** 강력한 헤드카피 ("AI로 찾는 인생 헤어스타일"), 데모 영상/GIF, '지금 무료로 시작하기' CTA 버튼.
* **기능:** 버튼 클릭 시 로그인 여부 체크 후 `/upload`로 리다이렉트.


* **`<FeatureShowcase />`**:
* **구성:** Before/After 비교 슬라이더 예시, 주요 기능 3가지(간편함, 자연스러움, 다양함) 아이콘 및 설명.


* **`<PricingPreview />`**:
* **구성:** 무료/유료 플랜 비교 카드.


* **`<ReviewCarousel />`**:
* **구성:** 유저들의 실제 사용 후기 및 생성된 이미지 슬라이드.



## 2. 사진 업로드 페이지 (`app/upload/page.tsx`)

사용자가 이탈하기 쉬운 단계이므로 직관적이고 빨라야 합니다.

* **`<UploadArea />` (Client Component)**:
* **구성:** Drag & Drop 영역, 파일 선택 버튼.
* **기능:** `react-dropzone` 사용. 파일 업로드 시 로컬 미리보기 생성.


* **`<FaceGuideOverlay />`**:
* **구성:** 업로드 영역 위에 오버레이 되는 가이드 (정면 응시, 안경 미착용 등).
* **기능:** 툴팁 또는 모달 형태.


* **`<ValidationCheck />`**:
* **구성:** "얼굴 인식 중...", "사진이 너무 흐립니다" 등의 상태 메시지 표시.
* **기술:** 업로드 직후 클라이언트 단에서 간단한 이미지 검증 수행.



## 3. 스타일 선택 및 생성 페이지 (`app/generate/page.tsx`)

가장 복잡한 상태 관리가 필요한 페이지입니다.

* **`<EditorLayout />`**:
* 좌측: 업로드한 원본 이미지 미리보기 (Sticky).
* 우측: 스타일 선택 패널.


* **`<StyleSelector />` (Client Component)**:
* **Tabs:** 성별 (남/여) 탭.
* **StyleGrid:** 헤어스타일 썸네일 그리드 (펌, 직모, 숏컷 등). 선택 시 하이라이트 효과.
* **ColorPicker:** 머리색 선택 (원형 팔레트).


* **`<PromptBuilder />` (Hidden)**:
* **기능:** 사용자가 선택한 옵션을 조합하여 백엔드로 보낼 프롬프트 텍스트 생성 (UI에는 보이지 않음).


* **`<GenerateButton />`**:
* **구성:** "스타일 적용하기 (2 크레딧)" 버튼.
* **기능:** 클릭 시 로딩 스피너 및 진행률 바(Progress Bar) 노출.



## 4. 결과 확인 페이지 (`app/result/[id]/page.tsx`)

결과물에 대한 만족도를 높이고 공유를 유도합니다.

* **`<ComparisonView />`**:
* **구성:** `react-compare-slider` 등을 활용하여 원본과 생성된 이미지를 겹쳐서 비교.
* **UX:** 마우스 호버나 드래그로 Before/After 즉시 확인.


* **`<ActionToolbar />`**:
* **구성:** 다운로드, 공유하기(링크 복사), 다시 생성하기(옵션 변경) 버튼 그룹.


* **`<FeedbackModal />`**:
* **구성:** 결과물 만족도(좋아요/싫어요) 평가. AI 모델 튜닝 데이터로 활용.



## 5. 마이페이지 (`app/mypage/page.tsx`)

* **`<HistoryGallery />`**:
* **구성:** 과거 생성했던 이미지 그리드 리스트.
* **기능:** 클릭 시 해당 결과 페이지(`/result/[id]`)로 이동.


* **`<CreditStatus />`**:
* **구성:** 현재 남은 크레딧 잔액 표시 및 '충전하기' 버튼.



---

# 🛠️ 핵심 상태 관리 (Zustand Store 설계)

페이지 간 데이터 전달(예: 업로드한 이미지를 생성 페이지에서 보여주기)을 위해 전역 상태 관리가 필요합니다.

```typescript
// store/useGenerationStore.ts

interface GenerationState {
  originalImage: File | null; // 사용자가 업로드한 원본 파일
  previewUrl: string | null;  // 원본 이미지 미리보기 URL
  selectedOptions: {
    gender: 'male' | 'female';
    length: string;
    style: string;
    color: string;
  };
  isGenerating: boolean;
  
  // Actions
  setOriginalImage: (file: File) => void;
  setOptions: (options: Partial<GenerationState['selectedOptions']>) => void;
  setIsGenerating: (status: boolean) => void;
}

```

---

# 💡 UI/UX 개발 팁

1. **Skeleton Loading:** 이미지가 생성되거나 로딩되는 동안 빈 화면 대신 뼈대(Skeleton) UI를 보여주어 체감 대기 시간을 줄이세요. (Shadcn/ui에 `Skeleton` 컴포넌트 포함됨)
2. **Optimistic UI:** 좋아요 버튼이나 찜하기 기능은 서버 응답을 기다리지 않고 UI를 먼저 변경하여 반응성을 높이세요.
3. **Toast Notification:** 생성 완료, 오류 발생, 링크 복사 등의 이벤트는 토스트 메시지로 가볍게 알리세요.
