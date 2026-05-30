import React from 'react'
import ReactDOM from 'react-dom/client'
import { ClerkProvider } from '@clerk/clerk-react'
import App from './App.jsx'
import './index.css'

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  console.warn('[AOA] VITE_CLERK_PUBLISHABLE_KEY is not set — auth will not work. Add it to .env')
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY || 'pk_test_placeholder'}>
      <App />
    </ClerkProvider>
  </React.StrictMode>,
)
