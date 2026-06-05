import './process-shim' // must be first — shims process.env before DS modules load
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { IntlProvider } from 'react-intl'
import { MaterialIconStylesheet } from '@doctrinelegal/design-system/icon'
// Doctrine design-system global CSS (component styles + tokens, then the .typo-*
// typography classes), then our Tailwind layer so the app's utilities win on
// overlap. DS atoms style themselves via scoped CSS modules.
import '@doctrinelegal/design-system/style.css'
import '@doctrinelegal/design-system/typography.css'
import './index.css'
import App from './App.tsx'
import { Sandbox } from './components/Sandbox.tsx'

// `/?sandbox` renders the DS spike instead of the app (reference gallery during
// the migration; remove once Phase-3 is complete).
const showSandbox = new URLSearchParams(window.location.search).has('sandbox')

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* Injects the Material Symbols Rounded font the DS Icon relies on. */}
    <MaterialIconStylesheet />
    {/* Many DS atoms use react-intl; an app-wide provider (empty messages +
        swallowed errors for now) lets any of them render. The French message
        catalog (locales/fr.json) is wired in during the migration. */}
    <IntlProvider locale="fr" defaultLocale="fr" messages={{}} onError={() => {}}>
      {showSandbox ? <Sandbox /> : <App />}
    </IntlProvider>
  </StrictMode>,
)
