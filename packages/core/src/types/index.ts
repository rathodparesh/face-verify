export type InferenceDelegate = "auto" | "webgpu" | "wasm";
export type FaceInput =
  | File
  | Blob
  | ImageBitmap
  | HTMLImageElement
  | HTMLVideoElement
  | HTMLCanvasElement
  | ImageData;

export interface Point { x: number; y: number; z?: number }
export interface NormalizedBoundingBox { x: number; y: number; width: number; height: number }
export interface KeyLandmarks { leftEye: Point; rightEye: Point; nose: Point; mouth: Point }
export interface FaceAnalysis {
  faceCount: number;
  boundingBox: NormalizedBoundingBox;
  landmarks: Point[];
  keyLandmarks: KeyLandmarks;
  detectionConfidence: number;
}
export interface EmbeddingPreprocessOptions {
  inputWidth: number;
  inputHeight: number;
  inputLayout: "NCHW" | "NHWC";
  colorOrder: "RGB" | "BGR";
  mean: [number, number, number];
  std: [number, number, number];
  inputName?: string;
  outputName?: string;
}
export interface InitializeFaceModelsOptions {
  faceDetectorModelUrl: string;
  faceLandmarkerModelUrl: string;
  embeddingModelUrl: string;
  wasmFilesUrl?: string;
  onnxWasmFilesUrl?: string;
  delegate?: InferenceDelegate;
  preprocess?: Partial<EmbeddingPreprocessOptions>;
  modelName?: string;
  modelVersion?: string;
  onProgress?: (progress: ModelProgress) => void;
}
export interface ModelProgress {
  stage: "idle" | "loading_vision" | "loading_embedding" | "ready" | "error";
  progress: number;
}
export interface FaceQualityOptions {
  enabled?: boolean;
  minimumScore?: number;
  minimumFaceWidthRatio?: number;
  maximumFaceWidthRatio?: number;
  maximumYaw?: number;
  maximumPitch?: number;
  maximumRoll?: number;
  minimumBrightness?: number;
  maximumBrightness?: number;
  minimumSharpness?: number;
}
export type FaceQualityIssue =
  | "NO_FACE" | "MULTIPLE_FACES" | "FACE_TOO_SMALL" | "FACE_TOO_LARGE"
  | "FACE_OFF_CENTER" | "FACE_CROPPED" | "IMAGE_TOO_DARK" | "IMAGE_TOO_BRIGHT"
  | "IMAGE_BLURRY" | "HEAD_TURNED" | "HEAD_TILTED" | "EYES_NOT_VISIBLE";
export interface FaceQualityResult {
  score: number;
  acceptable: boolean;
  brightness: number;
  sharpness: number;
  faceSize: number;
  pose: { yaw: number; pitch: number; roll: number };
  issues: FaceQualityIssue[];
}
export interface CreateEmbeddingOptions {
  qualityCheck?: boolean;
  quality?: FaceQualityOptions;
  includeLandmarksInJson?: boolean;
  includeEmbeddingInJson?: boolean;
  cropPadding?: number;
  signal?: AbortSignal;
}
export interface FaceEnrollmentResult {
  schema_version: "1.0.0";
  operation: "face_enrollment";
  status: "success";
  face_detected: true;
  face_count: 1;
  embedding: { model: string; model_version: string; dimensions: number; normalized: true; vector?: number[] };
  face: {
    bounding_box: NormalizedBoundingBox;
    detection_confidence: number;
    key_landmarks: { left_eye: Point; right_eye: Point; nose: Point; mouth: Point };
    landmarks?: Point[];
  };
  visualization: { mesh_displayed: boolean; bounding_box_displayed: boolean; landmark_count: number; coordinate_system: "normalized"; landmarks_included_in_json: boolean };
  quality: FaceQualityResult;
  processing: { mode: "browser"; backend: InferenceDelegate; duration_ms: number };
  privacy: { processed_locally: true; image_uploaded: false; raw_image_included: false; raw_image_stored: false; embedding_stored_automatically: false; landmark_mesh_stored: false };
  created_at: string;
}
export type VerificationDecision = "match" | "no_match" | "unable_to_verify";
export interface ComparisonResult {
  metric: "cosine_similarity";
  score: number;
  threshold: number;
  decision: Exclude<VerificationDecision, "unable_to_verify">;
  verified: boolean;
}
export interface VerifyFaceOptions extends CreateEmbeddingOptions { threshold?: number; metric?: "cosine" }
export interface FaceVerificationResult {
  schema_version: "1.0.0"; operation: "face_verification"; status: "success";
  verified: boolean; decision: VerificationDecision;
  similarity: { metric: "cosine_similarity"; score: number; threshold: number };
  reference: { embedding_dimensions: number; embedding_normalized: boolean };
  probe: { face_detected: boolean; face_count: number; embedding_dimensions: number; embedding_normalized: boolean };
  quality: Pick<FaceQualityResult, "score" | "acceptable" | "issues">;
  liveness: { performed: false; status: "not_checked" };
  processing: { mode: "browser"; backend: InferenceDelegate; duration_ms: number };
  privacy: { image_uploaded: false; processed_locally: true };
  created_at: string;
}
export interface CoordinateMapOptions {
  sourceWidth: number; sourceHeight: number; containerWidth: number; containerHeight: number;
  objectFit?: "contain" | "cover"; mirrored?: boolean;
}
