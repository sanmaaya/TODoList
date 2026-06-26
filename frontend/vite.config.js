import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { fileURLToPath } from 'url'
import path from 'path'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/_/backend': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/_\/backend/, ''),
      }
    }
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        dashboard: resolve(__dirname, 'dashboard.html'),
        subjects: resolve(__dirname, 'subjects.html'),
        notes: resolve(__dirname, 'notes.html'),
        exams: resolve(__dirname, 'exams.html'),
        tracker: resolve(__dirname, 'tracker.html'),
        goals: resolve(__dirname, 'goals.html'),
        todo: resolve(__dirname, 'todo.html'),
      }
    }
  }
})
