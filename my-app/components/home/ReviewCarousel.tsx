"use client";

import { useMemo, useState } from "react";
import { Button } from "../ui/Button";
import { useT } from "../../lib/i18n/useT";

export function ReviewCarousel() {
  const t = useT();
  const [index, setIndex] = useState(0);

  const reviews = useMemo<{ author: string; role: string; body: string; result: string; rating: number }[]>(
    () => [
      /*
      {
        author: t("reviews.r1.author"),
        role: t("reviews.r1.role"),
        body: t("reviews.r1.body"),
        result: t("reviews.r1.result"),
        rating: 5,
      },
      {
        author: t("reviews.r2.author"),
        role: t("reviews.r2.role"),
        body: t("reviews.r2.body"),
        result: t("reviews.r2.result"),
        rating: 5,
      },
      {
        author: t("reviews.r3.author"),
        role: t("reviews.r3.role"),
        body: t("reviews.r3.body"),
        result: t("reviews.r3.result"),
        rating: 4,
      },
      */
    ],
    [t],
  );

  if (reviews.length === 0) return null;

  const current = reviews[index];

  return (
    <section className="rounded-3xl border border-stone-200/60 bg-white/90 p-6 shadow-xl backdrop-blur transition-colors dark:border-zinc-800/60 dark:bg-zinc-900/40 sm:p-8">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-600 dark:text-amber-500">{t("reviews.badge")}</p>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <article className="rounded-2xl border border-stone-100 bg-white p-5 dark:border-zinc-800/60 dark:bg-zinc-800/40">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-lg font-bold text-stone-900 dark:text-white">{current.author}</p>
              <p className="text-sm text-stone-500 dark:text-zinc-500">{current.role}</p>
            </div>
            <p className="text-lg text-amber-500 dark:text-amber-400" aria-label={`Rating ${current.rating}/5`}>
              {"★".repeat(current.rating)}
              <span className="text-stone-300 dark:text-zinc-700">{"★".repeat(5 - current.rating)}</span>
            </p>
          </div>

          <p className="mt-4 text-lg leading-8 text-stone-800 dark:text-zinc-100">&ldquo;{current.body}&rdquo;</p>
          <p className="mt-4 text-sm font-medium text-emerald-600 dark:text-emerald-400">{t("reviews.result")}: {current.result}</p>
        </article>

        <aside className="rounded-2xl border border-stone-100 bg-stone-50/50 p-5 dark:border-zinc-800/60 dark:bg-zinc-950/40">
          <p className="text-sm font-semibold text-stone-900 dark:text-zinc-200">{t("reviews.stats.title")}</p>
          <div className="mt-4 space-y-3 text-sm">
            <div className="flex items-center justify-between rounded-xl bg-white px-3 py-2 shadow-sm dark:bg-zinc-800/50 dark:shadow-none">
              <span className="text-stone-600 dark:text-zinc-400">{t("reviews.stats.satisfaction")}</span>
              <strong className="text-stone-900 dark:text-white">4.8 / 5.0</strong>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-white px-3 py-2 shadow-sm dark:bg-zinc-800/50 dark:shadow-none">
              <span className="text-stone-600 dark:text-zinc-400">{t("reviews.stats.returnRate")}</span>
              <strong className="text-stone-900 dark:text-white">67%</strong>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-white px-3 py-2 shadow-sm dark:bg-zinc-800/50 dark:shadow-none">
              <span className="text-stone-600 dark:text-zinc-400">{t("reviews.stats.recommend")}</span>
              <strong className="text-stone-900 dark:text-white">91%</strong>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <Button
              variant="secondary"
              className="border-stone-200 bg-white text-stone-900 hover:bg-stone-50 dark:border-zinc-800 dark:bg-zinc-800 dark:text-white dark:hover:bg-zinc-700"
              onClick={() => setIndex((prev) => (prev === 0 ? reviews.length - 1 : prev - 1))}
            >
              {t("reviews.prevReview")}
            </Button>
            <Button
              variant="secondary"
              className="border-stone-200 bg-white text-stone-900 hover:bg-stone-50 dark:border-zinc-800 dark:bg-zinc-800 dark:text-white dark:hover:bg-zinc-700"
              onClick={() => setIndex((prev) => (prev + 1) % reviews.length)}
            >
              {t("reviews.nextReview")}
            </Button>
          </div>

          <div className="mt-4 flex gap-2">
            {reviews.map((review, reviewIndex) => (
              <button
                key={review.author}
                type="button"
                onClick={() => setIndex(reviewIndex)}
                className={`h-2.5 rounded-full transition ${reviewIndex === index ? "w-8 bg-amber-500" : "w-2.5 bg-stone-300 dark:bg-zinc-700 hover:bg-stone-400 dark:hover:bg-zinc-600"
                  }`}
                aria-label={`${review.author} review`}
              />
            ))}
          </div>
        </aside>
      </div>
    </section>
  );
}
