import { FaceVerificationError } from "../errors/FaceVerificationError";
import { createCanvas, isBrowserEnvironment } from "./canvasUtils";
import type { FaceInput } from "../types";

export async function inputToCanvas(input: FaceInput): Promise<HTMLCanvasElement> {
  if (!isBrowserEnvironment()) throw new FaceVerificationError("UNSUPPORTED_INPUT", "Image processing requires a browser.", false);
  let source: CanvasImageSource;
  let width: number;
  let height: number;
  let objectUrl: string | undefined;
  try {
    if (input instanceof Blob) {
      objectUrl = URL.createObjectURL(input);
      const image = new Image();
      image.src = objectUrl;
      await image.decode();
      source = image; width = image.naturalWidth; height = image.naturalHeight;
    } else if (input instanceof ImageData) {
      const canvas = createCanvas(input.width, input.height);
      canvas.getContext("2d")?.putImageData(input, 0, 0);
      return canvas;
    } else {
      source = input as CanvasImageSource;
      if (input instanceof HTMLVideoElement) { width = input.videoWidth; height = input.videoHeight; }
      else if (input instanceof HTMLImageElement) { width = input.naturalWidth; height = input.naturalHeight; }
      else { width = input.width; height = input.height; }
    }
    if (!width || !height) throw new FaceVerificationError("UNSUPPORTED_INPUT", "Input has no usable dimensions.");
    const canvas = createCanvas(width, height);
    const context = canvas.getContext("2d");
    if (!context) throw new FaceVerificationError("CANVAS_CONTEXT_UNAVAILABLE", "2D canvas is unavailable.", false);
    context.drawImage(source, 0, 0, width, height);
    return canvas;
  } finally {
    if (objectUrl) URL.revokeObjectURL(objectUrl);
  }
}
