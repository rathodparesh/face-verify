import type { FaceAnalysis, Point } from "../types";
import type { FaceLandmarker } from "@mediapipe/tasks-vision";
export function analyzeLandmarks(result: ReturnType<FaceLandmarker["detect"]>): FaceAnalysis {
  const faces = result.faceLandmarks;
  if (faces.length !== 1) return { faceCount: faces.length, boundingBox: { x: 0, y: 0, width: 0, height: 0 }, landmarks: [], keyLandmarks: { leftEye: {x:0,y:0}, rightEye:{x:0,y:0}, nose:{x:0,y:0}, mouth:{x:0,y:0} }, detectionConfidence: 0 };
  const landmarks: Point[] = faces[0]!.map(({ x, y, z }) => ({ x, y, z }));
  const xs = landmarks.map((point) => point.x); const ys = landmarks.map((point) => point.y);
  const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
  return {
    faceCount: 1, boundingBox: { x: minX, y: minY, width: maxX - minX, height: maxY - minY },
    landmarks,
    keyLandmarks: { leftEye: landmarks[33]!, rightEye: landmarks[263]!, nose: landmarks[1]!, mouth: landmarks[13]! },
    detectionConfidence: 1,
  };
}
