import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// Provider-agnostic LLM proxy for dev (/api/llm → Groq/OpenAI-compatible endpoint).
// A separate plugin handles /api/learner (Neon sync) in dev — decodes the Clerk JWT
// without verifying the signature (localhost-safe) and forwards CRUD to Neon directly.
// In production, these are both Cloudflare Pages Functions under functions/api/.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const base = (env.LLM_BASE_URL || 'https://api.groq.com/openai/v1').replace(/\/$/, '')

  return {
    plugins: [
      react(),

      // Dev-only: /api/learner middleware (mirrors functions/api/learner.js behaviour)
      {
        name: 'learner-api-dev',
        configureServer(server) {
          server.middlewares.use('/api/learner', async (req, res) => {
            res.setHeader('Access-Control-Allow-Origin', '*')
            res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, DELETE, OPTIONS')
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
            res.setHeader('Content-Type', 'application/json')

            if (req.method === 'OPTIONS') {
              res.statusCode = 204
              return res.end()
            }

            const auth = req.headers['authorization'] || ''
            const token = auth.replace(/^Bearer\s+/i, '')
            if (!token) {
              res.statusCode = 401
              return res.end('"Unauthorized"')
            }

            // Decode (no signature verification) — fine for localhost dev
            let userId, email
            try {
              const raw = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
              const payload = JSON.parse(Buffer.from(raw, 'base64').toString('utf8'))
              userId = payload.sub
              email = payload.email || ''
            } catch {
              res.statusCode = 401
              return res.end('"Invalid token"')
            }

            if (!userId) {
              res.statusCode = 401
              return res.end('"No user ID in token"')
            }

            if (!env.DATABASE_URL) {
              res.statusCode = 500
              return res.end('"DATABASE_URL not set in .env"')
            }

            const { neon } = await import('@neondatabase/serverless')
            const sql = neon(env.DATABASE_URL)

            try {
              if (req.method === 'GET') {
                const rows = await sql`SELECT state FROM learners WHERE clerk_user_id = ${userId}`
                return res.end(JSON.stringify(rows[0]?.state ?? null))
              }

              if (req.method === 'PUT') {
                const body = await new Promise((resolve, reject) => {
                  const chunks = []
                  req.on('data', c => chunks.push(c))
                  req.on('end', () => resolve(Buffer.concat(chunks).toString()))
                  req.on('error', reject)
                })
                const state = JSON.parse(body)
                await sql`
                  INSERT INTO learners (clerk_user_id, email, state, updated_at)
                  VALUES (${userId}, ${email}, ${JSON.stringify(state)}, NOW())
                  ON CONFLICT (clerk_user_id) DO UPDATE
                  SET state = ${JSON.stringify(state)}, email = ${email}, updated_at = NOW()
                `
                return res.end('{"ok":true}')
              }

              if (req.method === 'DELETE') {
                await sql`DELETE FROM learners WHERE clerk_user_id = ${userId}`
                return res.end('{"ok":true}')
              }

              res.statusCode = 405
              res.end('"Method not allowed"')
            } catch (e) {
              console.error('[learner-api-dev]', e.message)
              res.statusCode = 500
              res.end(JSON.stringify({ error: e.message }))
            }
          })
        },
      },
    ],

    server: {
      port: 5173,
      proxy: {
        '/api/llm': {
          target: base,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/llm/, '/chat/completions'),
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq, req) => {
              const byo = req.headers['x-llm-key']
              const key = (Array.isArray(byo) ? byo[0] : byo) || env.LLM_API_KEY
              if (key) proxyReq.setHeader('authorization', `Bearer ${key}`)
              proxyReq.removeHeader('x-llm-key')
            })
          },
        },
      },
    },
  }
})
