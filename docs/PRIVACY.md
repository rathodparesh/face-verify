# Privacy

Face images and embeddings are sensitive biometric data. FaceVerify processes inputs in the browser and does not automatically upload, persist, log, or place them in browser storage. Results contain no image or Base64 payload. Full landmarks are excluded by default.

The host application must:

- obtain meaningful, jurisdiction-appropriate consent before collection;
- state purpose, retention period, recipients, and deletion method;
- minimize collection and avoid unrelated identity fields in biometric records;
- protect stored vectors with encryption and strict access control;
- provide deletion and consent-withdrawal mechanisms;
- avoid analytics, crash logs, screenshots, and debugging logs that capture vectors;
- stop camera access when it is no longer needed;
- document cross-border transfers or subprocessors if it later sends data anywhere.

Call reset methods and `clearSensitiveData()` when practical. JavaScript garbage collection and immutable copies mean memory erasure cannot be guaranteed. A browser-only architecture reduces network exposure but does not remove risks from malicious scripts, extensions, compromised devices, or the host application.
