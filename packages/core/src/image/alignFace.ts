import { createCanvas } from "./canvasUtils";
import type { KeyLandmarks } from "../types";
export function alignFace(source: HTMLCanvasElement, landmarks: KeyLandmarks): HTMLCanvasElement {
  const output = createCanvas(source.width, source.height);
  const context = output.getContext("2d")!;
  const dx = (landmarks.rightEye.x - landmarks.leftEye.x) * source.width;
  const dy = (landmarks.rightEye.y - landmarks.leftEye.y) * source.height;
  const angle = Math.atan2(dy, dx);
  context.translate(source.width / 2, source.height / 2);
  context.rotate(-angle);
  context.drawImage(source, -source.width / 2, -source.height / 2);
  return output;
}
