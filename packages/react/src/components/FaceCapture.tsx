import { useEffect, useRef, useState } from "react";
import { FaceVerificationError } from "@rathodparesh/face-verify-core";
import { useCamera } from "../hooks/useCamera";
import { useFaceLandmarks } from "../hooks/useFaceLandmarks";
import type { FaceCaptureProps } from "../types";
import { FaceGuide } from "./FaceGuide";
import { FaceMeshOverlay } from "./FaceMeshOverlay";
export function FaceCapture({ allowCamera = true, allowUpload = true, autoStartCamera = false, preferredCamera = "user", showMesh = true, showPoints = false, showBoundingBox = true, showFaceGuide = true, mirrorFrontCamera = true, detectionIntervalMs = 100, disabled = false, onCapture, onError }: FaceCaptureProps) {
  const camera = useCamera(preferredCamera); const imageRef = useRef<HTMLImageElement>(null); const [imageUrl, setImageUrl] = useState<string>();
  const detection = useFaceLandmarks(camera.stream ? camera.videoRef.current : imageUrl ? imageRef.current : null, detectionIntervalMs);
  useEffect(() => { if (autoStartCamera && allowCamera) void camera.startCamera(); }, [autoStartCamera, allowCamera]);
  useEffect(() => { if (camera.error) onError?.(camera.error); }, [camera.error, onError]);
  useEffect(() => {
    if (!camera.stream && !imageUrl) return;
    detection.startDetection();
    return detection.stopDetection;
  }, [camera.stream, imageUrl, detection.startDetection, detection.stopDetection]);
  useEffect(() => () => { if (imageUrl) URL.revokeObjectURL(imageUrl); }, [imageUrl]);
  const capture = () => {
    const video = camera.videoRef.current; if (!video?.videoWidth) return;
    const canvas = document.createElement("canvas"); canvas.width = video.videoWidth; canvas.height = video.videoHeight;
    const context = canvas.getContext("2d"); if (!context) { onError?.(new FaceVerificationError("CANVAS_CONTEXT_UNAVAILABLE", "Capture is unavailable.")); return; }
    context.drawImage(video, 0, 0); onCapture?.({ source: canvas, capturedAt: new Date().toISOString() });
  };
  return <section className="fv-capture" aria-label="Face capture">
    <div className="fv-preview">
      <video ref={camera.videoRef} playsInline muted className={mirrorFrontCamera ? "fv-mirrored" : ""} />
      {imageUrl && <img ref={imageRef} src={imageUrl} alt="Uploaded face preview" />}
      <FaceMeshOverlay mediaElement={camera.stream ? camera.videoRef.current : imageRef.current} landmarks={detection.landmarks} {...(detection.boundingBox ? { boundingBox: detection.boundingBox } : {})} showMesh={showMesh} showPoints={showPoints} showBoundingBox={showBoundingBox} mirrored={mirrorFrontCamera && Boolean(camera.stream)} />
      {showFaceGuide && <FaceGuide status={camera.stream || imageUrl ? "found" : "neutral"} />}
    </div>
    <p role="status" aria-live="polite">{camera.error?.message ?? (camera.isStarting ? "Starting camera…" : camera.stream ? "Camera ready." : "Choose camera or upload an image.")}</p>
    <div className="fv-actions">
      {allowCamera && !camera.stream && <button type="button" disabled={disabled || camera.isStarting} onClick={() => void camera.startCamera()}>Start camera</button>}
      {allowCamera && camera.stream && <><button type="button" disabled={disabled} onClick={capture}>Capture face</button><button type="button" onClick={camera.stopCamera}>Stop camera</button>{camera.availableDevices.length > 1 && <button type="button" onClick={() => void camera.switchCamera()}>Switch camera</button>}</>}
      {allowUpload && <label className="fv-button">Upload image<input aria-label="Upload face image" type="file" accept="image/*" disabled={disabled} onChange={(event) => { const file = event.target.files?.[0]; if (!file) return; if (imageUrl) URL.revokeObjectURL(imageUrl); setImageUrl(URL.createObjectURL(file)); onCapture?.({ source: file, capturedAt: new Date().toISOString() }); }} /></label>}
    </div>
  </section>;
}
