"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { useT } from "../../../lib/i18n/useT";
import { ActionToolbar } from "../../../components/result/ActionToolbar";
import { ComparisonView } from "../../../components/result/ComparisonView";
import { FeedbackModal } from "../../../components/result/FeedbackModal";
import { AIEvaluationView } from "../../../components/result/AIEvaluationView";
import { useGenerationStore } from "../../../store/useGenerationStore";
import { createClient } from "@supabase/supabase-js";
import { type AIEvaluationResult } from "../../../lib/ai-evaluation";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

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
      const { data, error } = await supabase
        .from("generations")
        .select("options, generated_image_path")
        .eq("id", id)
        .single();

      if (data && !error) {
        const options = data.options as any;
        if (options?.aiEvaluation) {
          setEvaluation(options.aiEvaluation);
        }
        if (data.generated_image_path) {
          setDbOutputUrl(data.generated_image_path);
        }
      }
    }

    void fetchGeneration();
  }, [hydrateOriginalImage, id]);

  const outputFromQuery = searchParams.get("output");
  const isSamePrediction = latestPredictionId === id;

  const beforeImage = previewUrl || "https://placehold.co/900x1200?text=Original";
  const afterImage =
    (isSamePrediction ? latestOutputUrl : null) ||
    dbOutputUrl ||
    outputFromQuery ||
    "https://placehold.co/900x1200?text=Generated";

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

