import * as ort from "onnxruntime-web";
import { createCanvas } from "../image/canvasUtils";
import type { EmbeddingPreprocessOptions } from "../types";
export function preprocessFace(face: HTMLCanvasElement, options: EmbeddingPreprocessOptions): ort.Tensor {
  const canvas = createCanvas(options.inputWidth, options.inputHeight);
  const context = canvas.getContext("2d")!;
  context.drawImage(face, 0, 0, canvas.width, canvas.height);
  const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
  const channels = 3, plane = canvas.width * canvas.height;
  const values = new Float32Array(plane * channels);
  for (let pixel = 0; pixel < plane; pixel += 1) {
    const offset = pixel * 4;
    const rgb = options.colorOrder === "RGB" ? [pixels[offset]!, pixels[offset+1]!, pixels[offset+2]!] : [pixels[offset+2]!, pixels[offset+1]!, pixels[offset]!];
    for (let channel = 0; channel < channels; channel += 1) {
      const normalized = (rgb[channel]! - options.mean[channel]!) / options.std[channel]!;
      values[options.inputLayout === "NCHW" ? channel * plane + pixel : pixel * channels + channel] = normalized;
    }
  }
  return new ort.Tensor("float32", values, options.inputLayout === "NCHW" ? [1,3,canvas.height,canvas.width] : [1,canvas.height,canvas.width,3]);
}
