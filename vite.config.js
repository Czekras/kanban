import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { readFileSync } from 'node:fs'

// Rule 2: pull the version from package.json so the header never hardcodes it.
const pkg = JSON.parse(readFileSync('./package.json', 'utf-8'))

export default defineConfig({
  plugins: [react()],
  // Rule 1: GitHub Pages serves from /<repo>/ — Czekras/kanban → /kanban/.
  base: '/kanban/',
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
})
