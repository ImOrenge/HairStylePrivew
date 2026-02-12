"use client";

import Link from "next/link";
import { useT } from "../../lib/i18n/useT";

export function Footer() {
  const t = useT();

  return (
    <footer className="border-t border-stone-200/60 bg-white/80 backdrop-blur transition-colors dark:border-zinc-800/60 dark:bg-zinc-950/80">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-6 py-6 text-sm text-stone-600 dark:text-zinc-400 sm:flex-row sm:items-center sm:justify-between">
        <p>&copy; {new Date().getFullYear()} HairFit</p>
        <div className="flex items-center gap-3">
          <Link href="/privacy-policy" className="underline-offset-4 hover:underline">
            {t("footer.privacy")}
          </Link>
          <Link href="/terms-of-service" className="underline-offset-4 hover:underline">
            {t("footer.terms")}
          </Link>
          <p>{t("footer.builtWith")}</p>
        </div>
      </div>
    </footer>
  );
}
