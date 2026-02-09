"use client";

import { useMemo, useState } from "react";
import { EditorLayout } from "../../components/editor/EditorLayout";
import { GenerateButton } from "../../components/editor/GenerateButton";
import { buildPrompt } from "../../components/editor/PromptBuilder";
import { StyleSelector } from "../../components/editor/StyleSelector";
import { Button } from "../../components/ui/Button";
import { useGenerationStore } from "../../store/useGenerationStore";

interface PromptApiResponse {
  prompt: string;
  negativePrompt: string;
  model: string;
  promptVersion: string;
}

export default function GeneratePage() {
  const previewUrl = useGenerationStore((state) => state.previewUrl);
  const selectedOptions = useGenerationStore((state) => state.selectedOptions);

  const fallbackPrompt = useMemo(() => buildPrompt(selectedOptions), [selectedOptions]);

  const [userInput, setUserInput] = useState("");
  const [promptLoading, setPromptLoading] = useState(false);
  const [promptError, setPromptError] = useState<string | null>(null);
  const [generatedPrompt, setGeneratedPrompt] = useState<string | null>(null);
  const [negativePrompt, setNegativePrompt] = useState<string | null>(null);
  const [promptMeta, setPromptMeta] = useState<{ model: string; version: string } | null>(null);

  const finalPrompt = generatedPrompt || fallbackPrompt;

  const handleGeneratePrompt = async () => {
    setPromptError(null);

    if (!userInput.trim()) {
      setPromptError("원하는 스타일을 자유롭게 입력해 주세요.");
      return;
    }

    setPromptLoading(true);

    try {
      const response = await fetch("/api/prompts/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userInput,
          styleOptions: selectedOptions,
        }),
      });

      const data = (await response.json().catch(() => ({}))) as Partial<PromptApiResponse> & {
        error?: string;
      };

      if (!response.ok) {
        setPromptError(data.error || "프롬프트 생성에 실패했습니다.");
        return;
      }

      if (!data.prompt) {
        setPromptError("프롬프트 응답 형식이 올바르지 않습니다.");
        return;
      }

      setGeneratedPrompt(data.prompt);
      setNegativePrompt(data.negativePrompt || null);
      setPromptMeta({
        model: data.model || "unknown",
        version: data.promptVersion || "v1",
      });
    } catch {
      setPromptError("네트워크 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setPromptLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-8">
      <h1 className="mb-4 text-2xl font-bold">스타일 선택 및 생성</h1>

      <EditorLayout
        preview={
          <div className="sticky top-6 space-y-3">
            <p className="text-sm font-semibold text-gray-600">원본 미리보기</p>
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="원본 업로드 이미지"
                className="max-h-[520px] w-full rounded-xl object-cover"
              />
            ) : (
              <div className="rounded-xl border border-dashed border-gray-300 p-8 text-sm text-gray-500">
                업로드된 이미지가 없습니다. `/upload`에서 사진을 먼저 등록해 주세요.
              </div>
            )}
          </div>
        }
        panel={
          <div className="space-y-6">
            <StyleSelector />

            <section className="space-y-2">
              <p className="text-sm font-semibold text-gray-700">자유 입력 요청</p>
              <textarea
                value={userInput}
                onChange={(event) => setUserInput(event.target.value)}
                className="min-h-[88px] w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-black"
                placeholder="예: 뉴진스 하니 느낌 단발, 애쉬 브라운, 자연스러운 질감"
              />
              <div className="flex items-center gap-2">
                <Button type="button" variant="secondary" onClick={handleGeneratePrompt} disabled={promptLoading}>
                  {promptLoading ? "프롬프트 생성 중..." : "프롬프트 생성"}
                </Button>
                {promptMeta ? (
                  <span className="text-xs text-gray-500">
                    model: {promptMeta.model} / version: {promptMeta.version}
                  </span>
                ) : null}
              </div>
              {promptError ? <p className="text-xs text-rose-600">{promptError}</p> : null}
            </section>

            <div className="rounded-xl bg-gray-50 p-3 text-xs text-gray-700">
              <p className="font-semibold">최종 프롬프트</p>
              <p className="mt-1 break-all">{finalPrompt}</p>
            </div>

            {negativePrompt ? (
              <div className="rounded-xl bg-gray-50 p-3 text-xs text-gray-600">
                <p className="font-semibold text-gray-700">네거티브 프롬프트</p>
                <p className="mt-1 break-all">{negativePrompt}</p>
              </div>
            ) : null}

            <GenerateButton prompt={finalPrompt} negativePrompt={negativePrompt} disabled={!previewUrl} />
          </div>
        }
      />
    </div>
  );
}

