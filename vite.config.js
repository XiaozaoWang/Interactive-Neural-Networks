import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vitejs.dev/config/
// export default defineConfig({
//   plugins: [react(), tailwindcss()],
// });
export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0", // 允许局域网访问
    port: 5173,
    strictPort: false,
  },
});
