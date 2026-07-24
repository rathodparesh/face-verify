import { FaceVerificationError } from "./errors/FaceVerificationError";
import { analyzeLandmarks } from "./detector/faceLandmarker";
import { normalizeEmbedding } from "./embedding/normalizeEmbedding";
import { preprocessFace } from "./embedding/preprocessFace";
import { alignFace } from "./image/alignFace";
import { cropFace } from "./image/cropFace";
import { inputToCanvas } from "./image/loadImage";
import { calculateFaceQuality } from "./quality/qualityCheck";
import { getModelState } from "./initializeFaceModels";
import type { CreateEmbeddingOptions, FaceEnrollmentResult, FaceInput } from "./types";

export async function createFaceEmbedding(input: FaceInput, options: CreateEmbeddingOptions = {}): Promise<FaceEnrollmentResult> {
  const started = performance.now();
  if (options.signal?.aborted) throw new FaceVerificationError("PROCESSING_ABORTED", "Processing was aborted.");
  const models = getModelState();
  const canvas = await inputToCanvas(input);
  const analysis = analyzeLandmarks(models.landmarker.detect(canvas));
  if (analysis.faceCount === 0) throw new FaceVerificationError("NO_FACE_DETECTED", "No face was detected.");
  if (analysis.faceCount > 1) throw new FaceVerificationError("MULTIPLE_FACES_DETECTED", "Exactly one face is required.");
  const quality = calculateFaceQuality(canvas, analysis, options.quality);
  if (options.qualityCheck && !quality.acceptable) {
    throw new FaceVerificationError(
      "FACE_QUALITY_TOO_LOW",
      `Face quality is too low: ${quality.issues.join(", ").replaceAll("_", " ").toLowerCase()}.`,
      true,
      { issues: quality.issues, quality },
    );
  }
  const aligned = alignFace(canvas, analysis.keyLandmarks);
  const cropped = cropFace(aligned, analysis.boundingBox, options.cropPadding);
  const tensor = preprocessFace(cropped, models.preprocess);
  const inputName = models.preprocess.inputName ?? models.embeddingSession.inputNames[0];
  const outputName = models.preprocess.outputName ?? models.embeddingSession.outputNames[0];
  if (!inputName || !outputName) throw new FaceVerificationError("EMBEDDING_GENERATION_FAILED", "The model input or output name is unavailable.", false);
  const output = await models.embeddingSession.run({ [inputName]: tensor });
  const raw = output[outputName]?.data;
  tensor.dispose();
  if (!raw) throw new FaceVerificationError("EMBEDDING_GENERATION_FAILED", "The embedding model returned no output.");
  const vector = normalizeEmbedding(Array.from(raw as Float32Array));
  const includeLandmarks = options.includeLandmarksInJson ?? false;
  const includeEmbedding = options.includeEmbeddingInJson ?? true;
  return {
    schema_version: "1.0.0", operation: "face_enrollment", status: "success", face_detected: true, face_count: 1,
    embedding: { model: models.modelName, model_version: models.modelVersion, dimensions: vector.length, normalized: true, ...(includeEmbedding ? { vector } : {}) },
    face: { bounding_box: analysis.boundingBox, detection_confidence: analysis.detectionConfidence, key_landmarks: { left_eye: analysis.keyLandmarks.leftEye, right_eye: analysis.keyLandmarks.rightEye, nose: analysis.keyLandmarks.nose, mouth: analysis.keyLandmarks.mouth }, ...(includeLandmarks ? { landmarks: analysis.landmarks } : {}) },
    visualization: { mesh_displayed: false, bounding_box_displayed: false, landmark_count: analysis.landmarks.length, coordinate_system: "normalized", landmarks_included_in_json: includeLandmarks },
    quality, processing: { mode: "browser", backend: models.backend, duration_ms: Math.round(performance.now() - started) },
    privacy: { processed_locally: true, image_uploaded: false, raw_image_included: false, raw_image_stored: false, embedding_stored_automatically: false, landmark_mesh_stored: false },
    created_at: new Date().toISOString(),
  };
}
