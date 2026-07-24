import { useCallback, useEffect, useRef, useState } from "react";
import { FaceVerificationError } from "@rathodparesh/face-verify-core";

export function useCamera(preferredCamera: "user" | "environment" = "user") {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream>();
  const [permissionState, setPermissionState] = useState<PermissionState | "unknown">("unknown");
  const [availableDevices, setAvailableDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>();
  const [error, setError] = useState<FaceVerificationError>();
  const [isStarting, setIsStarting] = useState(false);
  const stopCamera = useCallback(() => {
    setStream((current) => { current?.getTracks().forEach((track) => track.stop()); return undefined; });
    if (videoRef.current) videoRef.current.srcObject = null;
  }, []);
  const startCamera = useCallback(async (deviceId?: string) => {
    setIsStarting(true); setError(undefined);
    try {
      if (!navigator.mediaDevices?.getUserMedia) throw new FaceVerificationError("CAMERA_NOT_AVAILABLE", "No camera API is available.");
      const next = await navigator.mediaDevices.getUserMedia({ video: deviceId ? { deviceId: { exact: deviceId } } : { facingMode: { ideal: preferredCamera } }, audio: false });
      stopCamera(); setStream(next); setPermissionState("granted");
      if (videoRef.current) { videoRef.current.srcObject = next; await videoRef.current.play(); }
      setSelectedDeviceId(next.getVideoTracks()[0]?.getSettings().deviceId);
      setAvailableDevices((await navigator.mediaDevices.enumerateDevices()).filter((item) => item.kind === "videoinput"));
    } catch (cause) {
      const denied = cause instanceof DOMException && (cause.name === "NotAllowedError" || cause.name === "SecurityError");
      setPermissionState(denied ? "denied" : "unknown");
      setError(cause instanceof FaceVerificationError ? cause : new FaceVerificationError(denied ? "CAMERA_PERMISSION_DENIED" : "CAMERA_NOT_AVAILABLE", denied ? "Camera permission was denied. Enable it in browser settings." : "The camera could not be started.", true, { cause: String(cause) }));
    } finally { setIsStarting(false); }
  }, [preferredCamera, stopCamera]);
  const switchCamera = useCallback(async () => {
    const index = availableDevices.findIndex((item) => item.deviceId === selectedDeviceId);
    const next = availableDevices[(index + 1) % availableDevices.length];
    if (next) await startCamera(next.deviceId);
  }, [availableDevices, selectedDeviceId, startCamera]);
  useEffect(() => stopCamera, [stopCamera]);
  return { videoRef, stream, startCamera, stopCamera, switchCamera, permissionState, availableDevices, selectedDeviceId, error, isStarting };
}
