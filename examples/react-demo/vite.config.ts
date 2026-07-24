import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vite";

function serveOnnxRuntimeLoadersAsStaticFiles(): Plugin {
  return {
    name: "face-verify-onnx-runtime-loaders",
    configureServer(server) {
      server.middlewares.use((request, _response, next) => {
        if (
          request.url?.startsWith("/models/onnxruntime-wasm/") &&
          request.url.includes(".mjs?import")
        ) {
          const url = new URL(request.url, "http://localhost");
          url.searchParams.delete("import");
          request.url = `${url.pathname}${url.search}`;
        }
        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [serveOnnxRuntimeLoadersAsStaticFiles(), react()],
});
