"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useGenerate } from "../../hooks/useGenerate";
import { useGenerationStore } from "../../store/useGenerationStore";
import { Button } from "../ui/Button";

interface GenerateButtonProps {
  prompt: string;
  negativePrompt?: string | null;
  disabled?: boolean;
}

export function GenerateButton({ prompt, negativePrompt, disabled }: GenerateButtonProps) {
  const router = useRouter();
  const { runGeneration } = useGenerate();
  const isGenerating = useGenerationStore((state) => state.isGenerating);
  const progress = useGenerationStore((state) => state.progress);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setError(null);

    try {
      const id = await runGeneration(prompt, negativePrompt || undefined);
      router.push(`/result/${id}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "생성 중 오류가 발생했습니다.";
      setError(message);
    }
  };

  return (
    <div className="space-y-3">
      <Button onClick={handleGenerate} disabled={disabled || isGenerating} className="w-full">
        {isGenerating ? "생성 중..." : "스타일 적용하기 (2 크레딧)"}
      </Button>
      <div className="h-2 overflow-hidden rounded-full bg-gray-200">
        <div className="h-full bg-black transition-all" style={{ width: `${progress}%` }} />
      </div>
      {error ? <p className="text-xs text-rose-600">{error}</p> : null}
    </div>
  );
}
