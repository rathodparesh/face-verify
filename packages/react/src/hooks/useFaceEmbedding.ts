import { useCallback, useState } from "react";
import { createFaceEmbedding, type CreateEmbeddingOptions, type FaceEnrollmentResult, type FaceInput, type FaceVerificationError } from "@rathodparesh/face-verify-core";
export function useFaceEmbedding() {
  const [result, setResult] = useState<FaceEnrollmentResult>();
  const [error, setError] = useState<FaceVerificationError>();
  const [isProcessing, setIsProcessing] = useState(false);
  const createEmbedding = useCallback(async (input: FaceInput, options?: CreateEmbeddingOptions) => {
    setIsProcessing(true); setError(undefined);
    try { const next = await createFaceEmbedding(input, options); setResult(next); return next; }
    catch (cause) { setError(cause as FaceVerificationError); throw cause; }
    finally { setIsProcessing(false); }
  }, []);
  const reset = useCallback(() => { result?.embedding.vector?.fill(0); setResult(undefined); setError(undefined); }, [result]);
  return { createEmbedding, result, progress: isProcessing ? 0.5 : result ? 1 : 0, isProcessing, error, reset };
}
