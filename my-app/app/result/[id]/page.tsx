"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { useT } from "../../../lib/i18n/useT";
import { ActionToolbar } from "../../../components/result/ActionToolbar";
import { ComparisonView } from "../../../components/result/ComparisonView";
import { FeedbackModal } from "../../../components/result/FeedbackModal";
import { AIEvaluationView } from "../../../components/result/AIEvaluationView";
import { useGenerationStore } from "../../../store/useGenerationStore";
import { convertImageSrcToWebpDataUrl } from "../../../lib/webp-client";
import { type AIEvaluationResult } from "../../../lib/ai-evaluation";

interface GenerationDetailsResponse {
  options?: {
    aiEvaluation?: AIEvaluationResult;
  } | null;
  generatedImagePath?: string | null;
}

export default function ResultPage() {
  const t = useT();
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();

  const id = params?.id || "unknown";

  const [evaluation, setEvaluation] = useState<AIEvaluationResult | null>(null);
  const [dbOutputUrl, setDbOutputUrl] = useState<string | null>(null);

  const previewUrl = useGenerationStore((state) => state.previewUrl);
  const latestOutputUrl = useGenerationStore((state) => state.latestOutputUrl);
  const latestPredictionId = useGenerationStore((state) => state.latestPredictionId);
  const hydrateOriginalImage = useGenerationStore((state) => state.hydrateOriginalImage);

  useEffect(() => {
    void hydrateOriginalImage();

    // Fetch evaluation and output url from DB if not in store
    async function fetchGeneration() {
      if (!id || id === "unknown") return;
      const response = await fetch(`/api/generations/${encodeURIComponent(id)}`, {
        method: "GET",
        cache: "no-store",
      });

      if (!response.ok) {
        return;
      }

      const data = (await response.json().catch(() => null)) as GenerationDetailsResponse | null;
      if (!data) {
        return;
      }

      const options = data.options;
      if (options?.aiEvaluation) {
        setEvaluation(options.aiEvaluation);
      }
      if (data.generatedImagePath) {
        setDbOutputUrl(data.generatedImagePath);
      }
    }

    void fetchGeneration();
  }, [hydrateOriginalImage, id]);

  const outputFromQuery = searchParams.get("output");
  const isSamePrediction = latestPredictionId === id;

  const beforeImage = previewUrl || "https://placehold.co/900x1200?text=Original";
  const rawAfterImage =
    (isSamePrediction ? latestOutputUrl : null) ||
    dbOutputUrl ||
    outputFromQuery ||
    "https://placehold.co/900x1200?text=Generated";
  const [afterImage, setAfterImage] = useState(rawAfterImage);

  useEffect(() => {
    let active = true;
    const applyWebp = async () => {
      const webpSrc = await convertImageSrcToWebpDataUrl(rawAfterImage);
      if (active) {
        setAfterImage(webpSrc || rawAfterImage);
      }
    };
    void applyWebp();

    return () => {
      active = false;
    };
  }, [rawAfterImage]);

  const hasRealOutput = useMemo(
    () =>
      Boolean(
        afterImage &&
        !afterImage.includes("placehold.co/900x1200?text=Generated"),
      ),
    [afterImage],
  );

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-6 px-4 py-8 sm:px-6">
      <header className="w-full max-w-2xl space-y-1 text-center">
        <h1 className="text-2xl font-bold">{t("result.title")}</h1>
        <p className="text-sm text-gray-600">{t("result.id")}: {id}</p>
      </header>

      {!hasRealOutput ? (
        <p className="w-full max-w-2xl rounded-lg bg-amber-50 px-3 py-2 text-center text-xs text-amber-800">
          {t("result.noOutput")}
        </p>
      ) : null}

      <ComparisonView beforeImage={beforeImage} afterImage={afterImage} />

      {evaluation && <AIEvaluationView evaluation={evaluation} />}

      <div className="flex w-full max-w-2xl justify-center">
        <ActionToolbar id={id} outputImageUrl={hasRealOutput ? afterImage : null} />
      </div>
      <div className="flex w-full max-w-2xl justify-center">
        <FeedbackModal generationId={id} />
      </div>
    </div>
  );
}

