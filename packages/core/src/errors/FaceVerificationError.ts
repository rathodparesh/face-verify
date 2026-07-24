export type FaceVerificationErrorCode =
  | "MODEL_NOT_INITIALIZED" | "MODEL_LOAD_FAILED" | "UNSUPPORTED_INPUT"
  | "CAMERA_PERMISSION_DENIED" | "CAMERA_NOT_AVAILABLE" | "NO_FACE_DETECTED"
  | "MULTIPLE_FACES_DETECTED" | "FACE_QUALITY_TOO_LOW" | "EMBEDDING_GENERATION_FAILED"
  | "EMBEDDING_DIMENSION_MISMATCH" | "WEBGPU_NOT_AVAILABLE"
  | "WASM_INITIALIZATION_FAILED" | "CANVAS_CONTEXT_UNAVAILABLE" | "PROCESSING_ABORTED";

export class FaceVerificationError extends Error {
  readonly code: FaceVerificationErrorCode;
  readonly recoverable: boolean;
  readonly details?: Record<string, unknown>;
  constructor(code: FaceVerificationErrorCode, message: string, recoverable = true, details?: Record<string, unknown>) {
    super(message);
    this.name = "FaceVerificationError";
    this.code = code;
    this.recoverable = recoverable;
    if (details !== undefined) this.details = details;
  }
}
