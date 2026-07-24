export type FaceGuideStatus = "neutral" | "found" | "too_far" | "too_close" | "off_center" | "poor_lighting" | "multiple" | "ready";
const messages: Record<FaceGuideStatus, string> = {
  neutral: "Place your face inside the guide.", found: "Hold still.", too_far: "Move closer to the camera.",
  too_close: "Move slightly backward.", off_center: "Look directly at the camera.", poor_lighting: "Improve the lighting.",
  multiple: "Only one person should be visible.", ready: "Ready to capture.",
};
export function FaceGuide({ status = "neutral" }: { status?: FaceGuideStatus }) {
  return <div className={`fv-guide fv-guide--${status}`} aria-hidden="true"><div className="fv-guide__oval" /><p className="fv-guide__message">{messages[status]}</p></div>;
}
