import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Configure server for client-side routing
  server: {
    historyApiFallback: true,
  },
  // Configure preview for client-side routing
  preview: {
    historyApiFallback: true,
  },
})