# FaceVerify

Production-oriented, browser-only face enrollment and 1:1 comparison for React and TypeScript. FaceVerify detects one face, displays a facial landmark mesh, aligns and crops the face, runs a configurable ONNX embedding model, and compares embeddings with cosine similarity.

> Face embeddings are biometric data. Face similarity is not liveness detection, legal identity proof, or protection against presentation attacks.

## Packages

- `@rathodparesh/face-verify-core` — framework-independent browser APIs
- `@rathodparesh/face-verify-react` — responsive components and hooks

Both are version `0.1.0`. Processing is local by design: no image upload, analytics request, automatic storage, `localStorage`, or IndexedDB.

## Features

- MediaPipe Face Landmarker detection and official mesh connections
- ONNX Runtime Web with WebGPU preference and WASM fallback
- Configurable preprocessing for NCHW/NHWC, RGB/BGR, mean, standard deviation, and model I/O names
- Quality checks, normalized bounding boxes, alignment, padded crop, and L2-normalized vectors
- Image/image-element/video/canvas/ImageData/File/Blob inputs
- Responsive, accessible camera and upload UI from 320 px upward
- JSON-safe enrollment and verification results
- Explicit sensitive-data clearing and no automatic persistence
- ESM, CommonJS, declarations, SSR-safe imports

## Install

```bash
pnpm add @rathodparesh/face-verify-core @rathodparesh/face-verify-react
```

Place licensed model assets under your own origin, then initialize:

```ts
import { initializeFaceModels } from "@rathodparesh/face-verify-core";

await initializeFaceModels({
  faceDetectorModelUrl: "/models/face_detector.task",
  faceLandmarkerModelUrl: "/models/face_landmarker.task",
  embeddingModelUrl: "/models/face_embedding.onnx",
  delegate: "auto",
  preprocess: {
    inputWidth: 112,
    inputHeight: 112,
    inputLayout: "NCHW",
    colorOrder: "RGB",
    mean: [127.5, 127.5, 127.5],
    std: [128, 128, 128],
  },
});
```

`faceDetectorModelUrl` is reserved for detector-specific integrations; version 0.1 uses Face Landmarker's built-in detector. Model URLs are never inferred. The default MediaPipe WASM runtime URL is documented and may be overridden with `wasmFilesUrl` for fully same-origin hosting.

## React

```tsx
import { FaceVerificationStudio } from "@rathodparesh/face-verify-react";
import "@rathodparesh/face-verify-react/styles.css";

<FaceVerificationStudio
  mode="verification"
  referenceEmbedding={savedEmbedding}
  allowCamera
  allowUpload
  showMesh
  showBoundingBox
  showFaceGuide
  showQuality
  showJson
  threshold={0.72}
  onVerificationComplete={(result) => secureApplicationHandler(result)}
/>;
```

For enrollment, use `mode="enrollment"` and `onEnrollmentComplete`. Camera access only starts automatically if `autoStartCamera` is enabled.

## Core usage

```ts
import {
  createFaceEmbedding,
  verifyFace,
  compareFaceEmbeddings,
} from "@rathodparesh/face-verify-core";

const enrollment = await createFaceEmbedding(file, {
  qualityCheck: true,
  includeLandmarksInJson: false,
});

const verification = await verifyFace(enrollment.embedding.vector!, probeFile, {
  threshold: 0.72,
  qualityCheck: true,
});

const direct = compareFaceEmbeddings(firstVector, secondVector, {
  metric: "cosine",
  threshold: 0.72,
});
```

The actual embedding dimension comes from the model output and is never hardcoded. Calibrate thresholds using representative validation data for the exact model and population; `0.72` is only an API default, not a universal recommendation.

## Webcam, upload, and mesh

`FaceCapture` handles webcam start/stop/switch and uploaded files. `FaceMeshOverlay` accepts normalized landmarks plus a media element. It uses official MediaPipe connections, `ResizeObserver`, device-pixel-ratio scaling, and cover-crop coordinate mapping. Front-camera mirroring is applied to coordinates in the overlay and to the video with CSS; the canvas element itself is not transformed.

## Errors

```ts
import { FaceVerificationError } from "@rathodparesh/face-verify-core";

try {
  await createFaceEmbedding(file);
} catch (error) {
  if (error instanceof FaceVerificationError) {
    renderMessage(error.code, error.recoverable);
  }
}
```

## Next.js and Vite

Imports are SSR-safe. Browser APIs are accessed only during functions, hooks, or effects. In Next.js, render camera UI from a client component (`"use client"`). In Vite, initialize models before the first face operation and copy model files into `public/models`.

## Privacy, security, and model licensing

Obtain explicit consent and define retention/deletion rules. Encrypt stored embeddings, restrict access, avoid logs, and use HTTPS. Call `clearSensitiveData()` and component reset methods when data is no longer needed. FaceVerify does not perform liveness in 0.1.0.

You must verify that each model license permits redistribution and the intended commercial or biometric use. No production model is bundled.

See [privacy](docs/PRIVACY.md), [security](docs/SECURITY.md), and [model setup](docs/MODEL_SETUP.md).

## Development

```bash
pnpm install
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm pack:check
pnpm dev
```

## Publishing

After authentication and validation:

```bash
pnpm --filter @rathodparesh/face-verify-core publish --access public --no-git-checks
pnpm --filter @rathodparesh/face-verify-react publish --access public --no-git-checks
```

Publish core first. The manual release workflow enforces that order.
