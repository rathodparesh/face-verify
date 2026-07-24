import type { FaceAnalysis, FaceQualityIssue, FaceQualityOptions, FaceQualityResult } from "../types";

const defaults: Required<FaceQualityOptions> = {
  enabled: true, minimumScore: 0.55, minimumFaceWidthRatio: 0.2, maximumFaceWidthRatio: 0.85,
  maximumYaw: 25, maximumPitch: 20, maximumRoll: 20, minimumBrightness: 0.18,
  maximumBrightness: 0.92, minimumSharpness: 0.04,
};
function brightnessAndSharpness(data: ImageData): { brightness: number; sharpness: number } {
  const { width, height, data: pixels } = data;
  let luminance = 0, edges = 0, edgeCount = 0;
  const gray = new Float32Array(width * height);
  for (let index = 0; index < gray.length; index += 1) {
    const offset = index * 4;
    const value = (0.2126 * pixels[offset]! + 0.7152 * pixels[offset + 1]! + 0.0722 * pixels[offset + 2]!) / 255;
    gray[index] = value; luminance += value;
  }
  for (let y = 1; y < height - 1; y += 2) for (let x = 1; x < width - 1; x += 2) {
    const center = gray[y * width + x]!;
    edges += Math.abs(4 * center - gray[y * width + x - 1]! - gray[y * width + x + 1]! - gray[(y - 1) * width + x]! - gray[(y + 1) * width + x]!);
    edgeCount += 1;
  }
  return { brightness: luminance / gray.length, sharpness: Math.min(1, edges / Math.max(1, edgeCount)) };
}
export function calculateFaceQuality(input: ImageData | HTMLCanvasElement, analysis?: FaceAnalysis, options: FaceQualityOptions = {}): FaceQualityResult {
  const config = { ...defaults, ...options };
  const imageData = input instanceof ImageData ? input : input.getContext("2d")!.getImageData(0, 0, input.width, input.height);
  const metrics = brightnessAndSharpness(imageData);
  const issues: FaceQualityIssue[] = [];
  if (!analysis || analysis.faceCount === 0) issues.push("NO_FACE");
  if (analysis && analysis.faceCount > 1) issues.push("MULTIPLE_FACES");
  const faceSize = analysis?.boundingBox.width ?? 0;
  if (analysis && faceSize < config.minimumFaceWidthRatio) issues.push("FACE_TOO_SMALL");
  if (analysis && faceSize > config.maximumFaceWidthRatio) issues.push("FACE_TOO_LARGE");
  if (analysis) {
    const centerX = analysis.boundingBox.x + analysis.boundingBox.width / 2;
    const centerY = analysis.boundingBox.y + analysis.boundingBox.height / 2;
    if (Math.abs(centerX - 0.5) > 0.15 || Math.abs(centerY - 0.5) > 0.18) issues.push("FACE_OFF_CENTER");
    if (analysis.boundingBox.x < 0.01 || analysis.boundingBox.y < 0.01 || analysis.boundingBox.x + analysis.boundingBox.width > 0.99 || analysis.boundingBox.y + analysis.boundingBox.height > 0.99) issues.push("FACE_CROPPED");
  }
  if (metrics.brightness < config.minimumBrightness) issues.push("IMAGE_TOO_DARK");
  if (metrics.brightness > config.maximumBrightness) issues.push("IMAGE_TOO_BRIGHT");
  if (metrics.sharpness < config.minimumSharpness) issues.push("IMAGE_BLURRY");
  const score = Math.max(0, Math.min(1, 1 - issues.length * 0.15));
  return { score, acceptable: score >= config.minimumScore && issues.length === 0, brightness: metrics.brightness, sharpness: metrics.sharpness, faceSize, pose: { yaw: 0, pitch: 0, roll: 0 }, issues };
}
