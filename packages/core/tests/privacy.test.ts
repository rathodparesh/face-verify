import { describe, expect, it } from "vitest";
import { FaceVerificationError, calculateFaceQuality, clearSensitiveData, registerSensitiveArray } from "../src";
describe("privacy and errors", () => {
  it("overwrites registered vectors", () => { const value = registerSensitiveArray([1, 2]); clearSensitiveData(); expect(value).toEqual([0, 0]); });
  it("serializes typed errors", () => { const error = new FaceVerificationError("NO_FACE_DETECTED", "No face"); expect(error.code).toBe("NO_FACE_DETECTED"); expect(error.recoverable).toBe(true); });
  it("maps quality issues", () => {
    const pixels = new Uint8ClampedArray(4 * 4 * 4);
    class TestImageData { constructor(public data: Uint8ClampedArray, public width: number, public height: number) {} }
    Object.defineProperty(globalThis, "ImageData", { value: TestImageData, configurable: true });
    const quality = calculateFaceQuality(new ImageData(pixels, 4, 4));
    expect(quality.issues).toContain("NO_FACE"); expect(quality.issues).toContain("IMAGE_TOO_DARK");
  });
});
