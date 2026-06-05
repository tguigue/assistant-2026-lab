// The Doctrine design system is built for Next.js and reads `process.env` at
// module-eval time. The browser (Vite dev) has no `process`, so define a minimal
// shim. This module is imported FIRST in main.tsx so it runs before any DS import
// evaluates. (The production build already replaces `process.env.NODE_ENV`, so
// this is effectively a dev-only safety net, harmless in the bundle.)
const g = globalThis as unknown as { process?: { env: Record<string, string | undefined> } }
if (!g.process) {
  g.process = { env: { NODE_ENV: import.meta.env.PROD ? 'production' : 'development' } }
}
export {}
