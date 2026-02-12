"use client";

import { useT } from "../../lib/i18n/useT";

export function FeatureShowcase() {
  const t = useT();

  const features = [
    {
      title: t("features.1.title"),
      description: t("features.1.desc"),
      point: t("features.1.point"),
    },
    {
      title: t("features.2.title"),
      description: t("features.2.desc"),
      point: t("features.2.point"),
    },
    {
      title: t("features.3.title"),
      description: t("features.3.desc"),
      point: t("features.3.point"),
    },
  ];

  return (
    <section className="rounded-3xl border border-stone-200/60 bg-white/90 p-6 shadow-xl backdrop-blur transition-colors dark:border-zinc-800/60 dark:bg-zinc-900/40 sm:p-8">
      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-600 dark:text-amber-500">{t("features.badge")}</p>
        <h2 className="text-2xl font-black tracking-tight text-stone-900 dark:text-white sm:text-3xl">
          {t("features.title")}
        </h2>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {features.map((feature, index) => (
          <article
            key={feature.title}
            className="group flex flex-col rounded-2xl border border-stone-200/60 bg-gradient-to-b from-amber-50/50 to-white/50 p-5 transition duration-300 hover:-translate-y-1 dark:border-zinc-800/60 dark:from-zinc-800/50 dark:to-zinc-900/50"
          >
            <span className="inline-flex w-fit rounded-full border border-amber-300/60 bg-white px-3 py-1 text-xs font-semibold text-amber-700 dark:border-amber-500/30 dark:bg-zinc-800 dark:text-amber-400">
              {String(index + 1).padStart(2, "0")}
            </span>
            <h3 className="mt-4 text-lg font-bold text-stone-900 dark:text-white">{feature.title}</h3>
            <p className="mt-2 flex-1 text-sm leading-6 text-stone-700 dark:text-zinc-300">{feature.description}</p>
            <p className="mt-4 text-xs font-semibold text-stone-500 dark:text-zinc-500">{feature.point}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
