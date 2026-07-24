import type { FaceEnrollmentResult, FaceVerificationError, FaceVerificationResult } from "@rathodparesh/face-verify-core";
export interface FaceCaptureResult { source: HTMLCanvasElement | File; capturedAt: string }
export interface FaceCaptureProps {
  allowCamera?: boolean; allowUpload?: boolean; autoStartCamera?: boolean;
  preferredCamera?: "user" | "environment"; showMesh?: boolean; showPoints?: boolean;
  showBoundingBox?: boolean; showFaceGuide?: boolean; mirrorFrontCamera?: boolean;
  detectionIntervalMs?: number; disabled?: boolean;
  onCapture?: (capture: FaceCaptureResult) => void;
  onError?: (error: FaceVerificationError) => void;
}
export interface FaceVerificationStudioProps extends Omit<FaceCaptureProps, "onCapture"> {
  mode?: "enrollment" | "verification"; referenceEmbedding?: number[];
  showQuality?: boolean; showJson?: boolean; threshold?: number;
  includeLandmarksInJson?: boolean; includeEmbeddingInJson?: boolean;
  onEmbeddingCreated?: (result: FaceEnrollmentResult) => void;
  onEnrollmentComplete?: (result: FaceEnrollmentResult) => void;
  onVerificationComplete?: (result: FaceVerificationResult) => void;
}
