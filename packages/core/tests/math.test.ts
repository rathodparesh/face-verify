import { describe, expect, it } from "vitest";
import { FaceVerificationError, compareFaceEmbeddings, mapNormalizedPoint, normalizeBoundingBox, normalizeEmbedding } from "../src";
describe("embedding math", () => {
  it("L2-normalizes vectors", () => expect(normalizeEmbedding([3, 4])).toEqual([0.6, 0.8]));
  it("calculates cosine decisions", () => {
    expect(compareFaceEmbeddings([1, 0], [1, 0], { threshold: 0.9 })).toMatchObject({ score: 1, decision: "match" });
    expect(compareFaceEmbeddings([1, 0], [0, 1], { threshold: 0.9 }).decision).toBe("no_match");
  });
  it.each([[[], []], [[1, Number.NaN], [1, 2]]])("rejects invalid vectors", (reference, probe) => expect(() => compareFaceEmbeddings(reference, probe)).toThrow(FaceVerificationError));
  it("rejects mismatched dimensions", () => expect(() => compareFaceEmbeddings([1], [1, 2])).toThrow("dimensions"));
});
describe("coordinates", () => {
  it("normalizes boxes", () => expect(normalizeBoundingBox({ x: 10, y: 20, width: 30, height: 40 }, 100, 200)).toEqual({ x: .1, y: .1, width: .3, height: .2 }));
  it("maps cover crop and mirroring", () => {
    expect(mapNormalizedPoint({ x: 0, y: .5 }, { sourceWidth: 100, sourceHeight: 200, containerWidth: 200, containerHeight: 200 })).toEqual({ x: 0, y: 100 });
    expect(mapNormalizedPoint({ x: 0, y: .5 }, { sourceWidth: 100, sourceHeight: 200, containerWidth: 200, containerHeight: 200, mirrored: true })).toEqual({ x: 200, y: 100 });
  });
});
