"use client";

import Image from "next/image";
import { useDropzone } from "react-dropzone";
import { Button } from "../ui/Button";

interface UploadAreaProps {
  onSelectFile: (file: File) => void;
  disabled?: boolean;
  previewUrl?: string | null;
}

export function UploadArea({ onSelectFile, disabled = false, previewUrl = null }: UploadAreaProps) {
  const { getRootProps, getInputProps, isDragActive, isDragReject, open, acceptedFiles } = useDropzone({
    accept: { "image/*": [] },
    maxFiles: 1,
    multiple: false,
    noClick: true,
    disabled,
    onDropAccepted: (files) => {
      if (files[0]) {
        onSelectFile(files[0]);
      }
    },
  });

  const hasPreview = Boolean(previewUrl);

  return (
    <div
      {...getRootProps()}
      className={`relative aspect-[4/5] w-full overflow-hidden rounded-3xl border-2 border-dashed p-6 text-center transition sm:p-8 ${
        isDragReject
          ? "border-rose-400 bg-rose-50"
          : isDragActive
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 bg-white"
      } ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
    >
      <input {...getInputProps()} />

      {hasPreview ? (
        <>
          <Image
            src={previewUrl ?? ""}
            alt="업로드 미리보기"
            fill
            unoptimized
            className="absolute inset-0 object-cover"
          />
          <div className="absolute inset-0 bg-black/15" />
        </>
      ) : null}

      <div className="relative z-10 flex h-full w-full flex-col items-center justify-center">
        {!hasPreview ? (
          <>
            <p className="text-lg font-semibold text-gray-900">사진 업로드</p>
            <p className="mt-2 text-sm text-gray-600">
              이미지를 드래그하거나 파일을 선택하세요. (JPG, PNG, WEBP / 최대 10MB)
            </p>
          </>
        ) : null}

        <Button
          type="button"
          className={hasPreview ? "bg-white text-gray-900 hover:bg-gray-100" : "mt-6"}
          onClick={open}
          disabled={disabled}
        >
          {hasPreview ? "다시 업로드" : "파일 선택"}
        </Button>

        {!hasPreview && acceptedFiles[0] ? (
          <p className="mt-3 text-xs text-gray-500">선택됨: {acceptedFiles[0].name}</p>
        ) : null}
      </div>
    </div>
  );
}
