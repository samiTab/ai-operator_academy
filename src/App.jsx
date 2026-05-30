import React from 'react'
import { SignedIn, SignedOut, SignIn } from '@clerk/clerk-react'
import AIOperatorAcademy from './AIOperatorAcademy.jsx'

const T = {
  bg: '#15120D', bg2: '#1C1813', surface: '#221D16',
  line: '#3A3124', text: '#F3ECDD', dim: '#B6AB95', faint: '#857B68',
  amber: '#E7A958', clay: '#C76F49',
}
const serif = "'Fraunces', Georgia, serif"
const sans = "'Spline Sans', system-ui, sans-serif"

// Clerk appearance — dark warm theme to match the app
const clerkAppearance = {
  variables: {
    colorBackground: T.bg2,
    colorText: T.text,
    colorTextSecondary: T.dim,
    colorPrimary: T.amber,
    colorDanger: '#DA8466',
    colorInputBackground: T.surface,
    colorInputText: T.text,
    colorNeutral: T.faint,
    fontFamily: sans,
    borderRadius: '12px',
    fontSize: '15px',
  },
  elements: {
    card: {
      background: T.bg2,
      border: `1px solid ${T.line}`,
      boxShadow: '0 24px 60px -12px rgba(0,0,0,.7)',
    },
    headerTitle: { fontFamily: serif, color: T.text },
    headerSubtitle: { color: T.dim },
    socialButtonsBlockButton: {
      background: T.surface,
      border: `1px solid ${T.line}`,
      color: T.text,
    },
    formButtonPrimary: {
      background: `linear-gradient(135deg, ${T.amber}, ${T.clay})`,
      color: '#21190F',
      fontWeight: 600,
    },
    footerActionLink: { color: T.amber },
    identityPreviewText: { color: T.text },
    formFieldLabel: { color: T.dim },
    dividerLine: { background: T.line },
    dividerText: { color: T.faint },
  },
}

class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { error: null } }
  static getDerivedStateFromError(error) { return { error } }
  componentDidCatch(error, info) { console.error('AOA crashed:', error, info) }
  render() {
    if (this.state.error) {
      return (
        <div style={{ minHeight: '100vh', background: T.bg, color: T.text, fontFamily: sans, display: 'grid', placeItems: 'center', padding: 24 }}>
          <div style={{ maxWidth: 560, textAlign: 'center' }}>
            <h1 style={{ fontSize: 22, marginBottom: 10 }}>Something broke on this screen</h1>
            <p style={{ color: T.dim, lineHeight: 1.6, marginBottom: 18 }}>
              A runtime error stopped the page from rendering. The details are in your browser console (F12).
            </p>
            <pre style={{ textAlign: 'left', background: '#221D16', border: '1px solid #3A3124', borderRadius: 10, padding: 14, fontSize: 12.5, color: '#DA8466', overflowX: 'auto', whiteSpace: 'pre-wrap' }}>
              {String(this.state.error && (this.state.error.stack || this.state.error.message || this.state.error))}
            </pre>
            <button onClick={() => window.location.reload()} style={{ marginTop: 16, background: `linear-gradient(135deg,${T.amber},${T.clay})`, color: '#21190F', border: 'none', borderRadius: 10, padding: '11px 20px', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>
              Reload
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

function AuthPage() {
  return (
    <div style={{
      minHeight: '100vh', background: T.bg, color: T.text, fontFamily: sans,
      backgroundImage: `radial-gradient(900px 500px at 80% -8%, ${T.clay}1c, transparent), radial-gradient(700px 500px at 0% 100%, ${T.amber}10, transparent)`,
      display: 'grid', gridTemplateColumns: '1fr 1fr', alignItems: 'center',
    }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400..650;1,9..144,400..600&family=Spline+Sans:wght@300;400;500;600&display=swap'); * { box-sizing: border-box; }`}</style>

      {/* Left: pitch */}
      <div style={{ padding: '60px 56px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 48 }}>
          <div style={{ width: 32, height: 32, borderRadius: 9, background: `linear-gradient(135deg,${T.amber},${T.clay})`, display: 'grid', placeItems: 'center' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#21190F" strokeWidth="2.5" strokeLinecap="round"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>
          </div>
          <span style={{ fontFamily: serif, fontSize: 19, fontWeight: 600 }}>AI Operator <span style={{ color: T.amber }}>Academy</span></span>
        </div>

        <h1 style={{ fontFamily: serif, fontSize: 46, lineHeight: 1.05, fontWeight: 600, margin: '0 0 20px', letterSpacing: -1 }}>
          Put AI to work in your business — <span style={{ color: T.amber, fontStyle: 'italic' }}>this week.</span>
        </h1>
        <p style={{ fontSize: 17, color: T.dim, lineHeight: 1.6, margin: '0 0 36px', maxWidth: 440 }}>
          A personalized path built around your work. You'll ship a real automation and walk away with proof — not just theory.
        </p>

        <div style={{ display: 'grid', gap: 14 }}>
          {[
            ['A path composed for your role & goal', 'Answer 8 questions — we design your course.'],
            ['Practice in a live Claude sandbox', 'Apply every concept to your own real work.'],
            ['A verifiable certificate', 'Tied to what you actually built.'],
          ].map(([title, sub]) => (
            <div key={title} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <div style={{ width: 20, height: 20, borderRadius: 6, background: `${T.amber}22`, border: `1px solid ${T.amber}55`, display: 'grid', placeItems: 'center', flexShrink: 0, marginTop: 2 }}>
                <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><polyline points="1 6 4.5 9.5 11 2.5" stroke={T.amber} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <div>
                <div style={{ fontSize: 14.5, fontWeight: 500, color: T.text }}>{title}</div>
                <div style={{ fontSize: 13, color: T.faint, marginTop: 2 }}>{sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right: Clerk sign-in */}
      <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 56px' }}>
        <SignIn appearance={clerkAppearance} fallbackRedirectUrl="/" signUpFallbackRedirectUrl="/" />
      </div>
    </div>
  )
}

export default function App() {
  return (
    <ErrorBoundary>
      <SignedOut>
        <AuthPage />
      </SignedOut>
      <SignedIn>
        <AIOperatorAcademy />
      </SignedIn>
    </ErrorBoundary>
  )
}
