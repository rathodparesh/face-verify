import { useCallback, useEffect, useRef, useState } from "react";
import { analyzeLandmarks, getModelState, type FaceAnalysis, type FaceQualityResult } from "@rathodparesh/face-verify-core";
export function useFaceLandmarks(mediaElement: HTMLVideoElement | HTMLImageElement | null, detectionIntervalMs = 100) {
  const [analysis, setAnalysis] = useState<FaceAnalysis>();
  const [quality] = useState<FaceQualityResult>();
  const [error, setError] = useState<Error>(); const timer = useRef<number | undefined>(undefined);
  const stopDetection = useCallback(() => { if (timer.current) window.clearInterval(timer.current); timer.current = undefined; }, []);
  const startDetection = useCallback((detect?: (media: HTMLVideoElement | HTMLImageElement) => FaceAnalysis) => {
    stopDetection(); if (!mediaElement) return;
    const detector = detect ?? ((media: HTMLVideoElement | HTMLImageElement) => analyzeLandmarks(getModelState().landmarker.detect(media)));
    timer.current = window.setInterval(() => { if (!document.hidden) try { setAnalysis(detector(mediaElement)); } catch (cause) { setError(cause as Error); } }, detectionIntervalMs);
  }, [detectionIntervalMs, mediaElement, stopDetection]);
  useEffect(() => stopDetection, [stopDetection]);
  return { landmarks: analysis?.landmarks ?? [], boundingBox: analysis?.boundingBox, faceCount: analysis?.faceCount ?? 0, detectionConfidence: analysis?.detectionConfidence ?? 0, quality, status: analysis?.faceCount === 1 ? "face_found" : "searching", startDetection, stopDetection, isDetecting: timer.current !== undefined, error };
}
