네, 자유 입력 방식으로 방향을 잡으셨군요! 사용자에게 훨씬 더 큰 자유도를 주는 훌륭한 결정입니다.

말씀하신 **'구글 나노바나나(Google Nano Banana)'**에 대해 먼저 짚고 넘어가야 할 것 같습니다.

현재 구글의 공식 AI 제품 라인업 중에 '나노바나나'라는 이름의 공개된 API 서비스는 없습니다. 아마도 다음 중 하나와 혼동하셨거나, 내부 프로젝트명을 들으셨을 가능성이 높습니다.

1. **Google Gemini Nano:** 안드로이드 기기 등에서 오프라인으로 돌아가는 초경량 온디바이스 AI 모델입니다. (서버 API용으로는 부적합합니다.)
2. **Google Gemini Pro (추천):** 서버에서 호출하여 사용할 수 있는 강력한 성능의 범용 LLM API입니다. 우리가 필요한 '프롬프트 엔지니어링' 작업에 가장 적합합니다.

사용자가 대충 입력한 텍스트(예: "뉴진스 하니 단발")를 AI가 이미지 생성을 잘할 수 있는 전문적인 영어 명령어(프롬프트)로 바꿔주는 역할에는 **Google Gemini Pro API**를 사용하는 것이 업계 표준입니다.

이것을 '나노바나나'라고 통칭하신 것으로 이해하고, **Next.js에서 Google Gemini Pro API를 활용해 '헤어스타일 프롬프트 생성기'를 만드는 방법**을 알려드리겠습니다.

---

### 🛠️ 구현 목표: "개떡같이 말해도 찰떡같이 알아듣는 AI"

* **사용자 입력:** "요즘 유행하는 가벼운 느낌의 레이어드컷 해줘, 염색은 애쉬 브라운으로."
* **Gemini API (우리가 만들 것):** 이 말을 알아듣고 Stable Diffusion이 이해할 수 있는 영어 문장으로 변환합니다.
* *결과물:* `(masterpiece, best quality, photorealistic:1.3), a portrait of a woman with [light layered medium haircut with textured ends, ash brown hair color], trending korean hairstyle, natural studio lighting, sharp focus on hair...`



---

### 📜 Next.js API Route 구현 코드 (app/api/enhance-prompt/route.ts)

먼저 필요한 패키지를 설치합니다.

```bash
npm install @google/generative-ai

```

그리고 구글 AI 스튜디오에서 API 키를 발급받아 `.env.local`에 `GOOGLE_API_KEY=your_api_key_here`로 저장하세요.

다음은 실제 API 라우트 코드입니다. 핵심은 AI에게 **'너는 전문 헤어스타일리스트이자 프롬프트 엔지니어야'**라고 페르소나를 부여하는 시스템 지시문(System Instruction)입니다.

```typescript
// src/app/api/enhance-prompt/route.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// 1. Google API 클라이언트 초기화
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");

// 2. AI에게 부여할 페르소나 및 지침 (핵심!)
const SYSTEM_INSTRUCTION = `
You are an expert AI hair stylist and a professional prompt engineer for Stable Diffusion.
Your goal is to convert rough user descriptions of hairstyles into highly detailed, photorealistic image generation prompts in English.

Rules:
1.  Analyze the user's input to extract key elements: length, texture, color, bangs, and specific style names (e.g., "hush cut", "ivy league cut").
2.  Translate these elements into precise English descriptive terms.
3.  Always prepend standard quality boosters at the beginning: "(masterpiece, best quality, photorealistic:1.4), professional portrait, studio lighting,".
4.  Always append standard negative embeddings at the end: " --neg low quality, ugly, deformed face, extra limbs, blurry, bad anatomy, watermark, text".
5.  Output ONLY the final English prompt string. Do not include any conversational text.

Example Input: "아이유 같은 중단발 레이어드컷에 시스루뱅 좀 넣어줘"
Example Output: (masterpiece, best quality, photorealistic:1.4), professional portrait, studio lighting, medium length layered haircut with soft texture, wispy see-through bangs covering forehead naturally, dark brown hair color, IU K-pop star aesthetic, sharp focus on hair --neg low quality, ugly, deformed face, blurry
`;

export async function POST(request: Request) {
  try {
    const { userInput } = await request.json();

    if (!userInput) {
      return NextResponse.json({ error: "User input is required" }, { status: 400 });
    }

    // 3. Gemini Pro 모델 설정
    const model = genAI.getGenerativeModel({ 
      model: "gemini-pro",
      generationConfig: {
          temperature: 0.7, // 약간의 창의성 허용
          maxOutputTokens: 200,
      }
    });

    // 4. 프롬프트 생성 요청
    // 시스템 지침과 사용자 입력을 결합하여 보냅니다.
    const combinedPrompt = `${SYSTEM_INSTRUCTION}\n\nUser Input: "${userInput}"\nOutput:`;
    
    const result = await model.generateContent(combinedPrompt);
    const response = await result.response;
    const enhancedPrompt = response.text();

    console.log("--- 프롬프트 변환 결과 ---");
    console.log("입력:", userInput);
    console.log("출력:", enhancedPrompt);

    // 5. 결과 반환
    return NextResponse.json({ prompt: enhancedPrompt });

  } catch (error) {
    console.error("Gemini API Error:", error);
    return NextResponse.json({ error: "Failed to enhance prompt" }, { status: 500 });
  }
}

```

---

### 🚀 프론트엔드에서의 사용 흐름 (간략)

1. 사용자가 `generate/page.tsx`의 텍스트 입력창에 원하는 스타일을 입력하고 '생성하기' 버튼을 누릅니다.
2. 프론트엔드에서 방금 만든 `/api/enhance-prompt`로 사용자가 입력한 텍스트를 보냅니다.
3. API가 Gemini를 통해 만든 **고품질 영어 프롬프트**를 응답으로 보내줍니다.
4. 프론트엔드는 이 **고품질 프롬프트**를 받아서, 실제 이미지를 생성하는 AI 모델 API (예: Replicate의 Stable Diffusion Inpainting 모델)로 최종 전송합니다.

