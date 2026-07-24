import { useCallback, useState } from "react";
import { compareFaceEmbeddings, createFaceEmbedding, verifyFace, type FaceEnrollmentResult, type FaceInput, type FaceVerificationError, type FaceVerificationResult, type VerifyFaceOptions } from "@rathodparesh/face-verify-core";
export function useFaceVerification() {
  const [enrollmentResult, setEnrollmentResult] = useState<FaceEnrollmentResult>();
  const [verificationResult, setVerificationResult] = useState<FaceVerificationResult>();
  const [error, setError] = useState<FaceVerificationError>();
  const [isProcessing, setIsProcessing] = useState(false);
  const run = useCallback(async <T,>(operation: () => Promise<T>) => { setIsProcessing(true); setError(undefined); try { return await operation(); } catch (cause) { setError(cause as FaceVerificationError); throw cause; } finally { setIsProcessing(false); } }, []);
  const enroll = useCallback((input: FaceInput, options?: VerifyFaceOptions) => run(async () => { const result = await createFaceEmbedding(input, options); setEnrollmentResult(result); return result; }), [run]);
  const verify = useCallback((reference: FaceInput | number[], probe: FaceInput | number[], options?: VerifyFaceOptions) => run(async () => { const result = await verifyFace(reference, probe, options); setVerificationResult(result); return result; }), [run]);
  const compare = useCallback((reference: number[], probe: number[], options?: { threshold?: number }) => compareFaceEmbeddings(reference, probe, options), []);
  const reset = useCallback(() => { enrollmentResult?.embedding.vector?.fill(0); setEnrollmentResult(undefined); setVerificationResult(undefined); setError(undefined); }, [enrollmentResult]);
  return { enroll, verify, compare, enrollmentResult, verificationResult, progress: isProcessing ? 0.5 : 0, isProcessing, error, reset };
}
