import { defineConfig } from 'vite'
import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'

// Absolute path to the design-system's compiled output.
const dsDist = fileURLToPath(
  new URL('./node_modules/@doctrinelegal/design-system/dist/', import.meta.url),
)

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    // The design-system's package.json points its `development` export condition
    // at `./src/components/<family>/index.ts`, but the published package only ships
    // `dist/` + `src/style/` — not `src/components/`. So in dev Vite picks the
    // (missing) source file and fails to resolve, while the production build uses
    // the `import` condition (dist) and works. We alias each single-segment DS
    // subpath straight to its compiled `dist/<family>.js`, matching the build and
    // auto-covering every family we adopt. `style.css` is mapped explicitly;
    // multi-segment paths (locales/*, feedback/CustomToastContainer, utils/*) fall
    // through to normal exports resolution.
    alias: [
      { find: '@doctrinelegal/design-system/style.css', replacement: dsDist + 'design-system.css' },
      // Single-segment, non-dotted families (button, icon, data-display, modal-v2…)
      // → compiled dist/<family>.js. The `[^/.]` class excludes dotted specifiers
      // like `typography.css` and slashed ones like `locales/fr.json`, which keep
      // their normal exports resolution.
      { find: /^@doctrinelegal\/design-system\/([^/.]+)$/, replacement: dsDist + '$1.js' },
    ],
  },
  server: {
    allowedHosts: ['.ngrok-free.dev', '.ngrok-free.app', '.ngrok.app', '.ngrok.io'],
  },
})
