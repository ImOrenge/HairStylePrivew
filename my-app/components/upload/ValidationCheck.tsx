import { UploadStatus, UploadValidationDetails } from "../../hooks/useUpload";

interface ValidationCheckProps {
  status: UploadStatus;
  message: string;
  details: UploadValidationDetails;
}

const toneMap: Record<UploadStatus, string> = {
  idle: "bg-gray-100 text-gray-700",
  checking: "bg-blue-100 text-blue-700",
  success: "bg-emerald-100 text-emerald-700",
  error: "bg-rose-100 text-rose-700",
};

function formatCheckState(value: boolean | null) {
  if (value === null) {
    return "대기";
  }

  return value ? "통과" : "실패";
}

export function ValidationCheck({ status, message, details }: ValidationCheckProps) {
  const engineLabel =
    details.faceDetectionEngine === "FaceDetector" ? "FaceDetector" : "미사용";

  return (
    <section className={`rounded-xl px-4 py-3 ${toneMap[status]}`}>
      <p className="text-sm font-medium">{message}</p>
      <div className="mt-3 grid gap-1 text-xs">
        <p>파일 형식: {formatCheckState(details.formatValid)}</p>
        <p>파일 크기(10MB 이하): {formatCheckState(details.sizeValid)}</p>
        <p>해상도(512x512 이상): {formatCheckState(details.resolutionValid)}</p>
        <p>
          얼굴 감지:
          {details.faceDetectionSupported
            ? ` ${formatCheckState(details.faceValid)}`
            : " 미지원/미사용"}
        </p>
        <p>감지 엔진: {engineLabel}</p>
        {details.width && details.height ? <p>해상도: {details.width} x {details.height}</p> : null}
        {details.sizeMB !== null ? <p>파일 크기: {details.sizeMB}MB</p> : null}
      </div>
    </section>
  );
}
