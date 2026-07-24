import { FaceVerificationError } from "../errors/FaceVerificationError";

export function validateVector(vector: readonly number[], label = "Embedding"): void {
  if (vector.length === 0) throw new FaceVerificationError("EMBEDDING_GENERATION_FAILED", `${label} is empty.`);
  if (vector.some((value) => !Number.isFinite(value))) {
    throw new FaceVerificationError("EMBEDDING_GENERATION_FAILED", `${label} contains a non-finite value.`);
  }
}
export function normalizeEmbedding(vector: readonly number[]): number[] {
  validateVector(vector);
  const magnitude = Math.hypot(...vector);
  if (magnitude === 0) throw new FaceVerificationError("EMBEDDING_GENERATION_FAILED", "Cannot normalize a zero vector.");
  return vector.map((value) => value / magnitude);
}
