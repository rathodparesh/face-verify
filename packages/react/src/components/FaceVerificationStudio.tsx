import { useState } from "react";
import type { FaceInput, FaceQualityResult } from "@rathodparesh/face-verify-core";
import { useFaceVerification } from "../hooks/useFaceVerification";
import type { FaceVerificationStudioProps } from "../types";
import { FaceCapture } from "./FaceCapture"; import { FaceQualityPanel } from "./FaceQualityPanel"; import { VerificationResult } from "./VerificationResult"; import { JsonViewer } from "./JsonViewer";
export function FaceVerificationStudio({ mode = "enrollment", referenceEmbedding, showQuality = true, showJson = true, threshold = 0.72, includeLandmarksInJson = false, includeEmbeddingInJson = true, onEmbeddingCreated, onEnrollmentComplete, onVerificationComplete, onError, ...captureProps }: FaceVerificationStudioProps) {
  const api = useFaceVerification(); const [capture, setCapture] = useState<FaceInput>();
  const rejectedQuality =
    api.error?.code === "FACE_QUALITY_TOO_LOW"
      ? (api.error.details?.quality as FaceQualityResult | undefined)
      : undefined;
  const process = async (source: FaceInput) => {
    setCapture(source);
    try {
      if (mode === "verification") {
        if (!referenceEmbedding) throw new Error("A reference embedding is required for verification.");
        const result = await api.verify(referenceEmbedding, source, { threshold, qualityCheck: true, includeLandmarksInJson, includeEmbeddingInJson });
        onVerificationComplete?.(result);
      } else {
        const result = await api.enroll(source, { qualityCheck: true, includeLandmarksInJson, includeEmbeddingInJson });
        onEmbeddingCreated?.(result); onEnrollmentComplete?.(result);
      }
    } catch (cause) { onError?.(cause as never); }
  };
  const value = api.verificationResult ?? api.enrollmentResult;
  return <div className="fv-studio"><div><FaceCapture {...captureProps} {...(onError ? { onError } : {})} onCapture={({ source }) => void process(source)} /><button type="button" className="fv-reset" disabled={!capture && !value} onClick={() => { api.reset(); setCapture(undefined); }}>Reset</button></div><aside>{api.isProcessing && <p role="status">Processing face locally…</p>}{api.error && <p role="alert">{api.error.message}</p>}{showQuality && <FaceQualityPanel quality={api.enrollmentResult?.quality ?? rejectedQuality} />}<VerificationResult result={api.verificationResult} />{showJson && value && <JsonViewer value={value} filename={`face-${mode}-${Date.now()}.json`} />}</aside></div>;
}
