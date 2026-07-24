# Models are intentionally not bundled

Supply these browser-served files yourself:

- MediaPipe Face Landmarker task file
- ONNX face embedding model

Optionally supply a separate MediaPipe face detector task file for custom detector integrations. Confirm every model's redistribution and intended-use license. See `docs/MODEL_SETUP.md`.

For UI and inference-pipeline testing only, generate the deliberately
non-biometric demo ONNX file:

```bash
python scripts/generate-demo-embedding-model.py
```

The generated model is not trained for face recognition and must never be used
for identity, authentication, security, accuracy evaluation, or production.
