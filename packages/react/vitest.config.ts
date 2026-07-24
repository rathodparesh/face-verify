import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";
export default defineConfig({
  plugins: [react()],
  resolve: { alias: { "@rathodparesh/face-verify-core": fileURLToPath(new URL("../core/src/index.ts", import.meta.url)) } },
  test: { environment: "jsdom", setupFiles: ["./tests/setup.ts"] },
});
