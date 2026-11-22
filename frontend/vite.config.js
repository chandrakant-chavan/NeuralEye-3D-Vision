import path from 'path'
import { fileURLToPath } from 'url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'SAMEORIGIN',
  'Cross-Origin-Resource-Policy': 'cross-origin',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(self), microphone=()',
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Embedder-Policy': 'credentialless',
}

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'esbuild',
    target: 'es2020',
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('onnxruntime-web')) return 'onnx'
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) return 'react'
        },
      },
    },
  },
  worker: {
    format: 'es',
    plugins: () => [],
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    cors: true,
    allowedHosts: true,
    headers: securityHeaders,
  },
  preview: {
    host: '0.0.0.0',
    port: 4173,
    cors: true,
    allowedHosts: true,
    headers: securityHeaders,
  },
  optimizeDeps: {
    include: ['onnxruntime-web'],
  },
})
