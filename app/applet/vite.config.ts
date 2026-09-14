import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  // Garante caminhos relativos para o Android WebView (file://)
  base: "./",
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  nitro: {
    preset: "node-server",
    prerender: {
      routes: ["/"],
    },
  },
});
