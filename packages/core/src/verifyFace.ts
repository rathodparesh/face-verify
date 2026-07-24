import { createFaceEmbedding } from "./createFaceEmbedding";
import { compareFaceEmbeddings } from "./embedding/compareEmbeddings";
import { getModelState } from "./initializeFaceModels";
import type { FaceInput, FaceVerificationResult, VerifyFaceOptions } from "./types";

function isVector(value: FaceInput | readonly number[]): value is readonly number[] { return Array.isArray(value); }
export async function verifyFace(referenceInput: FaceInput | readonly number[], probeInput: FaceInput | readonly number[], options: VerifyFaceOptions = {}): Promise<FaceVerificationResult> {
  const started = performance.now();
  const reference = isVector(referenceInput) ? [...referenceInput] : (await createFaceEmbedding(referenceInput, options)).embedding.vector!;
  const probeResult = isVector(probeInput) ? undefined : await createFaceEmbedding(probeInput, options);
  const probe = isVector(probeInput) ? [...probeInput] : probeResult!.embedding.vector!;
  const comparison = compareFaceEmbeddings(reference, probe, options.threshold === undefined ? {} : { threshold: options.threshold });
  const quality = probeResult?.quality ?? { score: 1, acceptable: true, issues: [] };
  return {
    schema_version: "1.0.0", operation: "face_verification", status: "success", verified: comparison.verified, decision: comparison.decision,
    similarity: { metric: comparison.metric, score: comparison.score, threshold: comparison.threshold },
    reference: { embedding_dimensions: reference.length, embedding_normalized: true },
    probe: { face_detected: Boolean(probeResult), face_count: probeResult?.face_count ?? 0, embedding_dimensions: probe.length, embedding_normalized: true },
    quality: { score: quality.score, acceptable: quality.acceptable, issues: quality.issues },
    liveness: { performed: false, status: "not_checked" },
    processing: { mode: "browser", backend: getModelState().backend, duration_ms: Math.round(performance.now() - started) },
    privacy: { image_uploaded: false, processed_locally: true }, created_at: new Date().toISOString(),
  };
}
