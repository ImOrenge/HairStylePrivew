"use client";

import { useCallback } from "react";
import { useGenerationStore } from "../store/useGenerationStore";

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Failed to read image file"));
    reader.readAsDataURL(file);
  });
}

export function useGenerate() {
  const originalImage = useGenerationStore((state) => state.originalImage);
  const setIsGenerating = useGenerationStore((state) => state.setIsGenerating);
  const setProgress = useGenerationStore((state) => state.setProgress);

  const runGeneration = useCallback(
    async (prompt: string, negativePrompt?: string) => {
      setIsGenerating(true);
      setProgress(0);
      try {
        for (let i = 1; i <= 5; i += 1) {
          await wait(180);
          setProgress(i * 10);
        }

        const imageDataUrl = originalImage ? await fileToDataUrl(originalImage) : undefined;

        const response = await fetch("/api/generations/run", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            prompt,
            negativePrompt,
            imageDataUrl,
          }),
        });

        const result = (await response.json().catch(() => ({}))) as {
          id?: string;
          error?: string;
        };

        if (!response.ok || !result.id) {
          throw new Error(result.error || "Failed to generate image");
        }

        setProgress(100);
        await wait(180);
        return result.id;
      } finally {
        setIsGenerating(false);
      }
    },
    [originalImage, setIsGenerating, setProgress],
  );

  return { runGeneration };
}
