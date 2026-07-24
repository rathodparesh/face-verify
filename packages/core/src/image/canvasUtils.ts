import { FaceVerificationError } from "../errors/FaceVerificationError";
import type { CoordinateMapOptions, NormalizedBoundingBox, Point } from "../types";

export function isBrowserEnvironment(): boolean {
  return typeof window !== "undefined" && typeof document !== "undefined";
}
export function createCanvas(width: number, height: number): HTMLCanvasElement {
  if (!isBrowserEnvironment()) throw new FaceVerificationError("UNSUPPORTED_INPUT", "Canvas processing requires a browser.", false);
  const canvas = document.createElement("canvas"); canvas.width = width; canvas.height = height; return canvas;
}
export function normalizeBoundingBox(box: { x: number; y: number; width: number; height: number }, width: number, height: number): NormalizedBoundingBox {
  return { x: box.x / width, y: box.y / height, width: box.width / width, height: box.height / height };
}
export function mapNormalizedPoint(point: Point, options: CoordinateMapOptions): Point {
  const fit = options.objectFit ?? "cover";
  const scale = fit === "cover"
    ? Math.max(options.containerWidth / options.sourceWidth, options.containerHeight / options.sourceHeight)
    : Math.min(options.containerWidth / options.sourceWidth, options.containerHeight / options.sourceHeight);
  const renderedWidth = options.sourceWidth * scale;
  const renderedHeight = options.sourceHeight * scale;
  const offsetX = (options.containerWidth - renderedWidth) / 2;
  const offsetY = (options.containerHeight - renderedHeight) / 2;
  const sourceX = (options.mirrored ? 1 - point.x : point.x) * options.sourceWidth;
  return { x: sourceX * scale + offsetX, y: point.y * options.sourceHeight * scale + offsetY, ...(point.z === undefined ? {} : { z: point.z }) };
}
export function clearCanvas(canvas: HTMLCanvasElement): void {
  canvas.getContext("2d")?.clearRect(0, 0, canvas.width, canvas.height);
}
