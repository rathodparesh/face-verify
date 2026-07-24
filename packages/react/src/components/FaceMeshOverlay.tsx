import { useEffect, useRef } from "react";
import { FaceLandmarker } from "@mediapipe/tasks-vision";
import { mapNormalizedPoint, type NormalizedBoundingBox, type Point } from "@rathodparesh/face-verify-core";
export interface FaceMeshOverlayProps {
  mediaElement: HTMLVideoElement | HTMLImageElement | null; landmarks: Point[];
  boundingBox?: NormalizedBoundingBox; showMesh?: boolean; showPoints?: boolean;
  showBoundingBox?: boolean; mirrored?: boolean; lineWidth?: number; pointRadius?: number;
}
export function FaceMeshOverlay({ mediaElement, landmarks, boundingBox, showMesh = true, showPoints = false, showBoundingBox = true, mirrored = false, lineWidth = 1, pointRadius = 1 }: FaceMeshOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas || !mediaElement) return;
    let frame = 0;
    const draw = () => {
      const rect = mediaElement.getBoundingClientRect(); const ratio = window.devicePixelRatio || 1;
      canvas.width = Math.round(rect.width * ratio); canvas.height = Math.round(rect.height * ratio);
      canvas.style.width = `${rect.width}px`; canvas.style.height = `${rect.height}px`;
      const context = canvas.getContext("2d"); if (!context) return;
      context.scale(ratio, ratio); context.clearRect(0, 0, rect.width, rect.height);
      const sourceWidth = mediaElement instanceof HTMLVideoElement ? mediaElement.videoWidth : mediaElement.naturalWidth;
      const sourceHeight = mediaElement instanceof HTMLVideoElement ? mediaElement.videoHeight : mediaElement.naturalHeight;
      const map = (point: Point) => mapNormalizedPoint(point, { sourceWidth, sourceHeight, containerWidth: rect.width, containerHeight: rect.height, objectFit: "cover", mirrored });
      context.strokeStyle = "#45f3c3"; context.fillStyle = "#45f3c3"; context.lineWidth = lineWidth;
      if (showMesh) for (const connection of FaceLandmarker.FACE_LANDMARKS_TESSELATION) {
        const from = landmarks[connection.start]; const to = landmarks[connection.end]; if (!from || !to) continue;
        const a = map(from), b = map(to); context.beginPath(); context.moveTo(a.x, a.y); context.lineTo(b.x, b.y); context.stroke();
      }
      if (showPoints) for (const landmark of landmarks) { const point = map(landmark); context.beginPath(); context.arc(point.x, point.y, pointRadius, 0, Math.PI * 2); context.fill(); }
      if (showBoundingBox && boundingBox) {
        const topLeft = map({ x: boundingBox.x, y: boundingBox.y }); const bottomRight = map({ x: boundingBox.x + boundingBox.width, y: boundingBox.y + boundingBox.height });
        context.strokeStyle = "#ffd166"; context.lineWidth = 2; context.strokeRect(Math.min(topLeft.x, bottomRight.x), topLeft.y, Math.abs(bottomRight.x - topLeft.x), bottomRight.y - topLeft.y);
      }
    };
    const observer = new ResizeObserver(() => { cancelAnimationFrame(frame); frame = requestAnimationFrame(draw); });
    observer.observe(mediaElement); frame = requestAnimationFrame(draw);
    return () => { observer.disconnect(); cancelAnimationFrame(frame); canvas.getContext("2d")?.clearRect(0,0,canvas.width,canvas.height); };
  }, [mediaElement, landmarks, boundingBox, showMesh, showPoints, showBoundingBox, mirrored, lineWidth, pointRadius]);
  return <canvas ref={canvasRef} className="fv-overlay" aria-hidden="true" />;
}
