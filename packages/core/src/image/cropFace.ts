import { createCanvas } from "./canvasUtils";
import type { NormalizedBoundingBox } from "../types";
export function cropFace(source: HTMLCanvasElement, box: NormalizedBoundingBox, padding = 0.2): HTMLCanvasElement {
  const x = Math.max(0, (box.x - box.width * padding) * source.width);
  const y = Math.max(0, (box.y - box.height * padding) * source.height);
  const right = Math.min(source.width, (box.x + box.width * (1 + padding)) * source.width);
  const bottom = Math.min(source.height, (box.y + box.height * (1 + padding)) * source.height);
  const output = createCanvas(Math.max(1, Math.round(right - x)), Math.max(1, Math.round(bottom - y)));
  output.getContext("2d")!.drawImage(source, x, y, right - x, bottom - y, 0, 0, output.width, output.height);
  return output;
}
