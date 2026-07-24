# Model setup

No biometric model is bundled. Copy your licensed assets to an application-controlled public directory:

```text
public/models/
  face_landmarker.task
  face_embedding.onnx
```

An optional `face_detector.task` path is accepted for detector-specific future integrations. Version 0.1 uses the detector included in Face Landmarker.

Configure explicit URLs with `initializeFaceModels`. For a fully same-origin deployment, also copy MediaPipe's WASM directory and set `wasmFilesUrl`.

The ONNX model must accept one float tensor and return one numeric embedding tensor. Configure:

- exact input width and height;
- NCHW or NHWC layout;
- RGB or BGR channel order;
- per-channel mean and standard deviation;
- input/output names if model metadata is ambiguous.

Inspect the model with Netron or the model producer's documentation. Incorrect preprocessing can produce plausible but useless vectors. Output dimensions are read at runtime.

Calibrate the comparison threshold against a representative, consented validation set using the exact preprocessing and model version. Do not reuse a threshold from another model.

Before distribution or production use, confirm licenses for the face landmarker, embedding model, training data, and intended biometric/commercial use. Record model checksum, source, version, license, and review date.
