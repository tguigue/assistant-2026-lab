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

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* Injects the Material Symbols Rounded font the DS Icon relies on. */}
    <MaterialIconStylesheet />
    {/* DS atoms use react-intl; an app-wide provider (DS components fall back to
        their default messages) lets any of them render. */}
    <IntlProvider locale="fr" defaultLocale="fr" messages={{}} onError={() => {}}>
      <App />
    </IntlProvider>
  </StrictMode>,
)
