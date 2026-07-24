import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";
import * as ort from "onnxruntime-web";
import { FaceVerificationError } from "./errors/FaceVerificationError";
import type { EmbeddingPreprocessOptions, InferenceDelegate, InitializeFaceModelsOptions, ModelProgress } from "./types";

const defaultPreprocess: EmbeddingPreprocessOptions = { inputWidth: 112, inputHeight: 112, inputLayout: "NCHW", colorOrder: "RGB", mean: [127.5,127.5,127.5], std: [128,128,128] };
export interface ModelState {
  landmarker: FaceLandmarker; embeddingSession: ort.InferenceSession; backend: InferenceDelegate;
  preprocess: EmbeddingPreprocessOptions; modelName: string; modelVersion: string;
}
let state: ModelState | undefined;
let pending: Promise<ModelState> | undefined;
let progress: ModelProgress = { stage: "idle", progress: 0 };
export function getModelProgress(): ModelProgress { return { ...progress }; }
export function getModelState(): ModelState {
  if (!state) throw new FaceVerificationError("MODEL_NOT_INITIALIZED", "Call initializeFaceModels() before face processing.");
  return state;
}
export async function initializeFaceModels(options: InitializeFaceModelsOptions): Promise<ModelState> {
  if (state) return state;
  if (pending) return pending;
  const notify = (next: ModelProgress) => { progress = next; options.onProgress?.(next); };
  pending = (async () => {
    try {
      notify({ stage: "loading_vision", progress: 0.1 });
      const fileset = await FilesetResolver.forVisionTasks(options.wasmFilesUrl ?? "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.22-rc.20250304/wasm");
      const delegate = options.delegate ?? "auto";
      const gpuAvailable = typeof navigator !== "undefined" && "gpu" in navigator;
      if (delegate === "webgpu" && !gpuAvailable) throw new FaceVerificationError("WEBGPU_NOT_AVAILABLE", "WebGPU is not available.");
      const backend: InferenceDelegate = delegate === "auto" ? (gpuAvailable ? "webgpu" : "wasm") : delegate;
      const landmarker = await FaceLandmarker.createFromOptions(fileset, {
        baseOptions: { modelAssetPath: options.faceLandmarkerModelUrl, delegate: backend === "webgpu" ? "GPU" : "CPU" },
        runningMode: "IMAGE", numFaces: 2, minFaceDetectionConfidence: 0.5,
      });
      notify({ stage: "loading_embedding", progress: 0.55 });
      const embeddingSession = await ort.InferenceSession.create(options.embeddingModelUrl, {
        executionProviders: backend === "webgpu" ? ["webgpu", "wasm"] : ["wasm"],
      });
      state = { landmarker, embeddingSession, backend, preprocess: { ...defaultPreprocess, ...options.preprocess }, modelName: options.modelName ?? "configured-face-embedding-model", modelVersion: options.modelVersion ?? "unknown" };
      notify({ stage: "ready", progress: 1 });
      return state;
    } catch (error) {
      notify({ stage: "error", progress: 0 });
      if (error instanceof FaceVerificationError) throw error;
      throw new FaceVerificationError("MODEL_LOAD_FAILED", "One or more face models could not be loaded.", false, { cause: String(error) });
    } finally { pending = undefined; }
  })();
  return pending;
}
export async function disposeFaceModels(): Promise<void> {
  if (!state) return;
  state.landmarker.close();
  await state.embeddingSession.release();
  state = undefined; progress = { stage: "idle", progress: 0 };
}
