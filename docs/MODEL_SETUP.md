# Model setup

No biometric model is bundled. Copy your licensed assets to an application-controlled public directory:

```text
public/models/
  face_landmarker.task
  face_embedding.onnx
  mediapipe-wasm/
    vision_wasm_internal.js
    vision_wasm_internal.wasm
    vision_wasm_nosimd_internal.js
    vision_wasm_nosimd_internal.wasm
  onnxruntime-wasm/
    ort-wasm-simd-threaded.mjs
    ort-wasm-simd-threaded.wasm
    ort-wasm-simd-threaded.jsep.mjs
    ort-wasm-simd-threaded.jsep.wasm
    ort-wasm-simd-threaded.jspi.mjs
    ort-wasm-simd-threaded.jspi.wasm
    ort-wasm-simd-threaded.asyncify.mjs
    ort-wasm-simd-threaded.asyncify.wasm
```

An optional `face_detector.task` path is accepted for detector-specific future integrations. Version 0.1 uses the detector included in Face Landmarker.

Configure explicit URLs with `initializeFaceModels`. For a fully same-origin deployment, also copy MediaPipe's WASM directory and set `wasmFilesUrl`.

The included React demo initializes these paths automatically:

```ts
await initializeFaceModels({
  faceDetectorModelUrl: "/models/face_detector.task",
  faceLandmarkerModelUrl: "/models/face_landmarker.task",
  embeddingModelUrl: "/models/face_embedding.onnx",
  wasmFilesUrl: "/models/mediapipe-wasm",
  onnxWasmFilesUrl: "/models/onnxruntime-wasm",
  delegate: "auto",
});
```

`wasmFilesUrl` configures MediaPipe. `onnxWasmFilesUrl` separately configures
ONNX Runtime Web. They are different runtimes and must not point to the same
directory. The URL must be served with the `application/wasm` MIME type.

The ONNX model must accept one float tensor and return one numeric embedding tensor. Configure:

- exact input width and height;
- NCHW or NHWC layout;
- RGB or BGR channel order;
- per-channel mean and standard deviation;
- input/output names if model metadata is ambiguous.

Inspect the model with Netron or the model producer's documentation. Incorrect preprocessing can produce plausible but useless vectors. Output dimensions are read at runtime.

Calibrate the comparison threshold against a representative, consented validation set using the exact preprocessing and model version. Do not reuse a threshold from another model.

Before distribution or production use, confirm licenses for the face landmarker, embedding model, training data, and intended biometric/commercial use. Record model checksum, source, version, license, and review date.

## Demo-only pipeline model

To exercise model loading and the UI without selecting or redistributing a
biometric model, run:

```bash
python scripts/generate-demo-embedding-model.py
```

This creates `examples/react-demo/public/models/face_embedding.onnx` with input
shape `[1, 3, 112, 112]` and output shape `[1, 128]`. It calculates average RGB
features followed by a deterministic linear projection. It is not trained for
face recognition, its similarity results are not meaningful, and it must never
be used for identity, authentication, security, or production.
