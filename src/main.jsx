import React from 'react'
import ReactDOM from 'react-dom/client'
import { ClerkProvider } from '@clerk/clerk-react'
import App from './App.jsx'
import './index.css'

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  ReactDOM.createRoot(document.getElementById('root')).render(
    <div style={{ minHeight: '100vh', background: '#15120D', color: '#F3ECDD', display: 'grid', placeItems: 'center', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ textAlign: 'center', maxWidth: 480, padding: 32 }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>⚙️</div>
        <h2 style={{ margin: '0 0 12px', fontSize: 22 }}>Missing Clerk key</h2>
        <p style={{ color: '#B6AB95', lineHeight: 1.6, margin: 0 }}>
          Set <code style={{ background: '#221D16', padding: '2px 6px', borderRadius: 4 }}>VITE_CLERK_PUBLISHABLE_KEY</code> in Cloudflare's build environment variables and redeploy.
        </p>
      </div>
    </div>
  )
} else {
  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
        <App />
      </ClerkProvider>
    </React.StrictMode>,
  )
}
