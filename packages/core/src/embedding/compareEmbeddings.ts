import { FaceVerificationError } from "../errors/FaceVerificationError";
import { validateVector } from "./normalizeEmbedding";
import type { ComparisonResult } from "../types";

export function compareFaceEmbeddings(
  referenceVector: readonly number[],
  probeVector: readonly number[],
  options: { metric?: "cosine"; threshold?: number } = {},
): ComparisonResult {
  validateVector(referenceVector, "Reference embedding");
  validateVector(probeVector, "Probe embedding");
  if (referenceVector.length !== probeVector.length) {
    throw new FaceVerificationError("EMBEDDING_DIMENSION_MISMATCH", "Embedding dimensions must match.", false, {
      reference: referenceVector.length, probe: probeVector.length,
    });
  }
  let dot = 0, referenceNorm = 0, probeNorm = 0;
  for (let index = 0; index < referenceVector.length; index += 1) {
    const reference = referenceVector[index]!;
    const probe = probeVector[index]!;
    dot += reference * probe; referenceNorm += reference * reference; probeNorm += probe * probe;
  }
  if (referenceNorm === 0 || probeNorm === 0) {
    throw new FaceVerificationError("EMBEDDING_GENERATION_FAILED", "Cosine similarity is undefined for a zero vector.");
  }
  const score = Math.max(-1, Math.min(1, dot / Math.sqrt(referenceNorm * probeNorm)));
  const threshold = options.threshold ?? 0.72;
  return { metric: "cosine_similarity", score, threshold, decision: score >= threshold ? "match" : "no_match", verified: score >= threshold };
}
