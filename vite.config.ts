import { defineConfig } from "vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { nitro as nitroPlugin } from "nitro/vite";

// Standalone Vite config (no third-party build presets). Uses the app's own
// SSR entry (src/server.ts) as the Nitro server handler.
export default defineConfig({
  server: {
    port: Number(process.env["PORT"]) || 3000,
  },
  plugins: [
    tsConfigPaths({ projects: ["./tsconfig.json"] }),
    tailwindcss(),
    tanstackStart({
      server: { entry: "server" },
    }),
    nitroPlugin(),
    viteReact(),
  ],
});
