"use client";

import Link from "next/link";
import { useState } from "react";
import { FaceGuideOverlay } from "../../components/upload/FaceGuideOverlay";
import { UploadArea } from "../../components/upload/UploadArea";
import { ValidationCheck } from "../../components/upload/ValidationCheck";
import { Button } from "../../components/ui/Button";
import { useUpload } from "../../hooks/useUpload";
import { useGenerationStore } from "../../store/useGenerationStore";

export default function UploadPage() {
  const [guideOpen, setGuideOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const { status, message, details, validateImage, resetValidation } = useUpload();
  const { previewUrl, setOriginalImage, clearOriginalImage } = useGenerationStore((state) => ({
    previewUrl: state.previewUrl,
    setOriginalImage: state.setOriginalImage,
    clearOriginalImage: state.clearOriginalImage,
  }));

  const handleSelectFile = async (file: File) => {
    setIsUploading(true);
    try {
      const result = await validateImage(file);
      if (result.ok) {
        setOriginalImage(file);
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleReset = () => {
    clearOriginalImage();
    resetValidation();
  };

  return (
    <div className="mx-auto grid w-full max-w-4xl gap-4 px-6 py-8 sm:gap-5">
      <h1 className="text-2xl font-bold">사진 업로드</h1>
      <p className="text-sm text-gray-600">
        정면 얼굴 사진을 업로드하면 다음 단계에서 헤어스타일을 선택해 결과를 생성할 수 있습니다.
      </p>

      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
        <p className="text-sm text-amber-900">팁: 안경/모자를 벗고 얼굴 윤곽이 잘 보이게 촬영해 주세요.</p>
        <Button type="button" variant="secondary" onClick={() => setGuideOpen(true)}>
          가이드 보기
        </Button>
      </div>

      <UploadArea onSelectFile={handleSelectFile} disabled={isUploading} />
      <ValidationCheck status={status} message={message} details={details} />

      {previewUrl ? (
        <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-medium text-gray-700">업로드 미리보기</p>
            <Button type="button" variant="ghost" onClick={handleReset}>
              다시 업로드
            </Button>
          </div>
          <img src={previewUrl} alt="업로드 미리보기" className="max-h-80 rounded-xl object-cover" />
        </section>
      ) : null}

      <div className="flex justify-end">
        {previewUrl ? (
          <Link href="/generate">
            <Button>다음 단계</Button>
          </Link>
        ) : (
          <Button disabled>다음 단계</Button>
        )}
      </div>

      <FaceGuideOverlay open={guideOpen} onClose={() => setGuideOpen(false)} />
    </div>
  );
}
