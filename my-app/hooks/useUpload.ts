"use client";

import { useCallback, useState } from "react";

export type UploadStatus = "idle" | "checking" | "success" | "error";

const MAX_FILE_SIZE_MB = 10;
const MIN_RESOLUTION = 512;

type FaceDetectionEngine = "FaceDetector" | "none";

type FaceDetectorCtor = new (options?: {
  fastMode?: boolean;
  maxDetectedFaces?: number;
}) => {
  detect: (image: ImageBitmap | HTMLImageElement) => Promise<Array<unknown>>;
};

interface UploadResult {
  ok: boolean;
  message: string;
}

export interface UploadValidationDetails {
  formatValid: boolean | null;
  sizeValid: boolean | null;
  resolutionValid: boolean | null;
  faceValid: boolean | null;
  faceDetectionSupported: boolean;
  faceDetectionEngine: FaceDetectionEngine;
  width: number | null;
  height: number | null;
  sizeMB: number | null;
}

const defaultDetails: UploadValidationDetails = {
  formatValid: null,
  sizeValid: null,
  resolutionValid: null,
  faceValid: null,
  faceDetectionSupported: false,
  faceDetectionEngine: "none",
  width: null,
  height: null,
  sizeMB: null,
};

function getFaceDetectorCtor(): FaceDetectorCtor | null {
  if (typeof window === "undefined") {
    return null;
  }

  return (window as Window & { FaceDetector?: FaceDetectorCtor }).FaceDetector ?? null;
}

async function readImageDimensions(file: File) {
  const objectUrl = URL.createObjectURL(file);

  try {
    return await new Promise<{ width: number; height: number }>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve({ width: img.width, height: img.height });
      img.onerror = () => reject(new Error("image_load_failed"));
      img.src = objectUrl;
    });
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

async function detectFaceWithBrowserApi(file: File) {
  const FaceDetector = getFaceDetectorCtor();
  if (!FaceDetector) {
    return { supported: false, detected: null as boolean | null };
  }

  const objectUrl = URL.createObjectURL(file);

  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("image_load_failed"));
      img.src = objectUrl;
    });

    const detector = new FaceDetector({ fastMode: true, maxDetectedFaces: 1 });
    const faces = await detector.detect(image);
    return { supported: true, detected: faces.length > 0 };
  } catch {
    return { supported: true, detected: null as boolean | null };
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

export function useUpload() {
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [message, setMessage] = useState("정면 얼굴 사진을 업로드해 주세요.");
  const [details, setDetails] = useState<UploadValidationDetails>(defaultDetails);

  const validateImage = useCallback(async (file: File): Promise<UploadResult> => {
    setStatus("checking");
    setDetails(defaultDetails);
    setMessage("이미지 유효성을 확인하고 있습니다...");

    const isImage = file.type.startsWith("image/");
    const sizeMB = Number((file.size / 1024 / 1024).toFixed(2));

    if (!isImage) {
      setStatus("error");
      setDetails((prev) => ({ ...prev, formatValid: false, sizeMB }));
      setMessage("이미지 파일만 업로드할 수 있습니다.");
      return { ok: false, message: "invalid_type" };
    }

    if (sizeMB > MAX_FILE_SIZE_MB) {
      setStatus("error");
      setDetails((prev) => ({ ...prev, formatValid: true, sizeValid: false, sizeMB }));
      setMessage(`파일 크기가 ${MAX_FILE_SIZE_MB}MB를 초과했습니다.`);
      return { ok: false, message: "too_large" };
    }

    setDetails((prev) => ({ ...prev, formatValid: true, sizeValid: true, sizeMB }));
    setMessage("해상도를 확인하고 있습니다...");

    const dimensions = await readImageDimensions(file).catch(() => null);

    if (!dimensions) {
      setStatus("error");
      setDetails((prev) => ({ ...prev, resolutionValid: false }));
      setMessage("이미지를 읽을 수 없습니다. 다른 파일을 시도해 주세요.");
      return { ok: false, message: "load_failed" };
    }

    if (dimensions.width < MIN_RESOLUTION || dimensions.height < MIN_RESOLUTION) {
      setStatus("error");
      setDetails((prev) => ({
        ...prev,
        width: dimensions.width,
        height: dimensions.height,
        resolutionValid: false,
      }));
      setMessage(`최소 ${MIN_RESOLUTION}x${MIN_RESOLUTION} 이상의 사진이 필요합니다.`);
      return { ok: false, message: "too_small" };
    }

    setMessage("얼굴 감지를 수행하고 있습니다...");

    const browserFaceResult = await detectFaceWithBrowserApi(file);

    if (browserFaceResult.supported && browserFaceResult.detected === false) {
      setStatus("error");
      setDetails((prev) => ({
        ...prev,
        width: dimensions.width,
        height: dimensions.height,
        resolutionValid: true,
        faceDetectionSupported: true,
        faceDetectionEngine: "FaceDetector",
        faceValid: false,
      }));
      setMessage("얼굴이 감지되지 않았습니다. 정면 얼굴 사진으로 다시 시도해 주세요.");
      return { ok: false, message: "face_not_detected" };
    }

    if (browserFaceResult.supported && browserFaceResult.detected === true) {
      setStatus("success");
      setDetails((prev) => ({
        ...prev,
        width: dimensions.width,
        height: dimensions.height,
        resolutionValid: true,
        faceDetectionSupported: true,
        faceDetectionEngine: "FaceDetector",
        faceValid: true,
      }));
      setMessage("얼굴 감지가 확인되었습니다. 생성 페이지로 이동할 수 있습니다.");
      return { ok: true, message: "ok" };
    }

    setStatus("success");
    setDetails((prev) => ({
      ...prev,
      width: dimensions.width,
      height: dimensions.height,
      resolutionValid: true,
      faceDetectionSupported: false,
      faceDetectionEngine: "none",
      faceValid: null,
    }));
    setMessage("업로드 가능한 사진입니다. (현재 환경에서 얼굴 자동 감지를 사용할 수 없습니다)");
    return { ok: true, message: "ok" };
  }, []);

  const resetValidation = useCallback(() => {
    setStatus("idle");
    setMessage("정면 얼굴 사진을 업로드해 주세요.");
    setDetails(defaultDetails);
  }, []);

  return {
    status,
    message,
    details,
    validateImage,
    resetValidation,
  };
}
