import type { FaceQualityResult } from "@rathodparesh/face-verify-core";
export function FaceQualityPanel({ quality }: { quality?: FaceQualityResult | undefined }) {
  if (!quality) return <section className="fv-card"><h3>Face quality</h3><p>No analysis yet.</p></section>;
  return <section className="fv-card"><h3>Face quality</h3><strong>{Math.round(quality.score * 100)}% — {quality.acceptable ? "Acceptable" : "Needs attention"}</strong><ul>{quality.issues.length ? quality.issues.map((issue) => <li key={issue}>{issue.replaceAll("_", " ").toLowerCase()}</li>) : <li>No quality issues detected.</li>}</ul></section>;
}
