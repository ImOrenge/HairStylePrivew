"use client";

import { useDropzone } from "react-dropzone";
import { Button } from "../ui/Button";

interface UploadAreaProps {
  onSelectFile: (file: File) => void;
  disabled?: boolean;
}

export function UploadArea({ onSelectFile, disabled = false }: UploadAreaProps) {
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

  return (
    <div
      {...getRootProps()}
      className={`rounded-2xl border-2 border-dashed bg-white p-8 text-center transition ${
        isDragReject
          ? "border-rose-400 bg-rose-50"
          : isDragActive
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300"
      } ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
    >
      <input {...getInputProps()} />
      <p className="text-lg font-semibold">사진 업로드</p>
      <p className="mt-2 text-sm text-gray-600">
        이미지를 드래그하거나 파일을 선택하세요. (JPG, PNG, WEBP / 최대 10MB)
      </p>
      <Button
        type="button"
        className="mt-6"
        onClick={open}
        disabled={disabled}
      >
        파일 선택
      </Button>

      {acceptedFiles[0] ? (
        <p className="mt-3 text-xs text-gray-500">선택됨: {acceptedFiles[0].name}</p>
      ) : null}
    </div>
  );
}
