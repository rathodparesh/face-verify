# Public API

## Core

- `initializeFaceModels(options): Promise<ModelState>` loads and caches the MediaPipe landmarker and ONNX session. `delegate` is `auto`, `webgpu`, or `wasm`.
- `disposeFaceModels(): Promise<void>` closes both cached models.
- `getModelProgress(): ModelProgress` reports model initialization stage and fraction.
- `createFaceEmbedding(input, options): Promise<FaceEnrollmentResult>` validates one face, checks quality, aligns/crops/preprocesses it, runs ONNX, and returns a normalized vector.
- `verifyFace(reference, probe, options): Promise<FaceVerificationResult>` accepts images or numeric vectors.
- `compareFaceEmbeddings(reference, probe, options): ComparisonResult` calculates cosine similarity after strict validation.
- `normalizeEmbedding(vector): number[]` returns an L2-normalized copy.
- `calculateFaceQuality(image, analysis?, options?): FaceQualityResult` reports quality score and issue codes.
- `mapNormalizedPoint(point, options): Point` maps source-normalized points through `contain` or `cover`, including mirroring.
- `normalizeBoundingBox(box, sourceWidth, sourceHeight): NormalizedBoundingBox`.
- `downloadJson(value, filename): void`.
- `clearSensitiveData(): void` overwrites registered mutable numeric arrays and revokes registered URLs.
- `isBrowserEnvironment(): boolean`.

Accepted `FaceInput`: `File`, `Blob`, `ImageBitmap`, `HTMLImageElement`, `HTMLVideoElement`, `HTMLCanvasElement`, and `ImageData`.

`CreateEmbeddingOptions` controls quality enforcement, crop padding, JSON landmark/vector inclusion, and cancellation. Full landmarks default off. Full embeddings default on because enrollment requires retrieving the vector; disable with `includeEmbeddingInJson: false` when only metadata is needed.

## React hooks

- `useCamera(preferredCamera?)`
- `useFaceModels()`
- `useFaceLandmarks(mediaElement, detectionIntervalMs?)`
- `useFaceEmbedding()`
- `useFaceVerification()`

All hooks clean up their owned interval, track, or mutable result state. The camera does not auto-start unless the component is configured to do so.

## React components

- `FaceCapture`
- `FaceMeshOverlay`
- `FaceGuide`
- `FaceEnrollment`
- `FaceVerification`
- `FaceVerificationStudio`
- `FaceQualityPanel`
- `VerificationResult`
- `JsonViewer`

Import `@rathodparesh/face-verify-react/styles.css` once. Components expose text status and errors through live regions, retain keyboard access, and use 44 px minimum controls.

## Errors

`FaceVerificationError` contains `code`, `recoverable`, and optional structured `details`. Codes cover model, input, camera, face-count, quality, embedding, WebGPU/WASM, canvas, and cancellation failures.
