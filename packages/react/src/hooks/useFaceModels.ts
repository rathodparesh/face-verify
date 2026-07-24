import { useCallback, useState } from "react";
import { getModelProgress, initializeFaceModels, type InitializeFaceModelsOptions, type ModelProgress } from "@rathodparesh/face-verify-core";
export function useFaceModels() {
  const [progress, setProgress] = useState<ModelProgress>(getModelProgress());
  const [error, setError] = useState<Error>();
  const initialize = useCallback(async (options: InitializeFaceModelsOptions) => {
    setError(undefined);
    try { return await initializeFaceModels({ ...options, onProgress: setProgress }); }
    catch (cause) { const next = cause instanceof Error ? cause : new Error(String(cause)); setError(next); throw next; }
  }, []);
  return { initialize, progress, isReady: progress.stage === "ready", isLoading: progress.stage.startsWith("loading"), error };
}
