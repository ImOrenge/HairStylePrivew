"use client";

import { useT } from "../../lib/i18n/useT";
import { type AIEvaluationResult } from "../../lib/ai-evaluation";

interface AIEvaluationViewProps {
    evaluation: AIEvaluationResult;
}

export function AIEvaluationView({ evaluation }: AIEvaluationViewProps) {
    const t = useT();
    const { score, comment, tips } = evaluation;

    // Color logic for score
    const getScoreColor = (s: number) => {
        if (s >= 85) return "text-emerald-500 border-emerald-200 bg-emerald-50";
        if (s >= 70) return "text-amber-500 border-amber-200 bg-amber-50";
        return "text-rose-500 border-rose-200 bg-rose-50";
    };

    const scoreStyles = getScoreColor(score);

    return (
        <div className="w-full max-w-2xl overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-[0_20px_40px_rgba(0,0,0,0.04)]">
            <div className="flex flex-col gap-6 p-6 sm:p-8">
                <header className="flex items-center justify-between gap-4">
                    <div className="space-y-1">
                        <p className="text-xs font-bold uppercase tracking-widest text-stone-400">
                            {t("result.evaluation.title")}
                        </p>
                        <h2 className="text-xl font-bold text-stone-900">{t("result.evaluation.comment")}</h2>
                    </div>
                    <div className={`flex h-16 w-16 items-center justify-center rounded-2xl border text-xl font-black ${scoreStyles}`}>
                        {score}
                    </div>
                </header>

                <p className="text-lg leading-relaxed text-stone-700">
                    &ldquo;{comment}&rdquo;
                </p>

                <hr className="border-stone-100" />

                <div className="space-y-4">
                    <h3 className="text-sm font-bold text-stone-900">{t("result.evaluation.tips")}</h3>
                    <ul className="grid gap-3 sm:grid-cols-2">
                        {tips.map((tip, i) => (
                            <li key={i} className="flex items-start gap-3 rounded-xl bg-stone-50 p-3 text-sm text-stone-600">
                                <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-stone-900 text-[10px] text-white">
                                    {i + 1}
                                </span>
                                {tip}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}
