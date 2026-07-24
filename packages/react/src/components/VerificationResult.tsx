import type { FaceVerificationResult } from "@rathodparesh/face-verify-core";
export function VerificationResult({ result }: { result?: FaceVerificationResult | undefined }) {
  if (!result) return null;
  return <section className={`fv-card fv-result fv-result--${result.decision}`} aria-live="polite"><h3>Verification result</h3><strong>{result.decision === "match" ? "Match" : result.decision === "no_match" ? "No match" : "Unable to verify"}</strong><p>Similarity: {(result.similarity.score * 100).toFixed(2)}%</p><p>Threshold: {(result.similarity.threshold * 100).toFixed(2)}%</p><small>Liveness was not checked.</small></section>;
}
