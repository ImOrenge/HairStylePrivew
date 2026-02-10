"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useGenerationStore } from "../../store/useGenerationStore";
import { Button } from "../ui/Button";

interface ActionToolbarProps {
  id: string;
  outputImageUrl?: string | null;
}

function inferExtensionFromMime(mimeType: string): string {
  if (mimeType.includes("png")) {
    return "png";
  }
  if (mimeType.includes("jpeg") || mimeType.includes("jpg")) {
    return "jpg";
  }
  if (mimeType.includes("webp")) {
    return "webp";
  }

  return "png";
}

function inferExtensionFromUrl(rawUrl: string): string | null {
  try {
    const url = new URL(rawUrl);
    const match = url.pathname.match(/\.([a-zA-Z0-9]+)$/);
    return match?.[1]?.toLowerCase() ?? null;
  } catch {
    return null;
  }
}

function triggerDownload(href: string, filename: string) {
  const link = document.createElement("a");
  link.href = href;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
}

export function ActionToolbar({ id, outputImageUrl = null }: ActionToolbarProps) {
  const router = useRouter();
  const clearLatestResult = useGenerationStore((state) => state.clearLatestResult);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const handleCopy = async () => {
    const shareLink = `${window.location.origin}/result/${id}`;
    await navigator.clipboard.writeText(shareLink);
  };

  const handleDownload = async () => {
    if (!outputImageUrl || isDownloading) {
      return;
    }

    setIsDownloading(true);
    setDownloadError(null);

    try {
      const response = await fetch(outputImageUrl);
      if (!response.ok) {
        throw new Error(`download-failed-${response.status}`);
      }

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const ext = inferExtensionFromUrl(outputImageUrl) || inferExtensionFromMime(blob.type);
      const filename = `haristyle-${id}.${ext}`;

      triggerDownload(objectUrl, filename);
      URL.revokeObjectURL(objectUrl);
    } catch {
      try {
        const ext = inferExtensionFromUrl(outputImageUrl) || "png";
        triggerDownload(outputImageUrl, `haristyle-${id}.${ext}`);
      } catch {
        setDownloadError("다운로드에 실패했습니다. 잠시 후 다시 시도해 주세요.");
      }
    } finally {
      setIsDownloading(false);
    }
  };

  const handleRegenerate = () => {
    clearLatestResult();
    router.push("/generate");
  };

  return (
    <div className="w-full space-y-2">
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button variant="secondary" onClick={handleCopy}>
          링크 복사
        </Button>
        <Button variant="secondary" onClick={handleDownload} disabled={!outputImageUrl || isDownloading}>
          {isDownloading ? "다운로드 중..." : "다운로드"}
        </Button>
        <Button onClick={handleRegenerate}>옵션 수정 후 다시 생성</Button>
      </div>
      {downloadError ? <p className="text-center text-xs text-rose-600">{downloadError}</p> : null}
    </div>
  );
}
