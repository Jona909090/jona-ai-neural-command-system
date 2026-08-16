import express from 'express'
import cors from 'cors'
import OpenAI from 'openai'

const app = express()
const port = process.env.PORT || 8787
const allowedOrigin = process.env.JONA_FRONTEND_ORIGIN || 'https://jona909090.github.io'

if (!process.env.OPENAI_API_KEY) {
  console.warn('OPENAI_API_KEY is not set. /api/conversation will return 503 until it is configured.')
}

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

app.disable('x-powered-by')
app.use(cors({ origin: allowedOrigin, methods: ['GET', 'POST'] }))
app.use(express.json({ limit: '256kb' }))

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'jona-ai-backend' })
})

app.post('/api/conversation', async (req, res) => {
  if (!process.env.OPENAI_API_KEY) {
    return res.status(503).json({ error: 'AI backend is not configured yet.' })
  }

  const input = String(req.body?.input || '').trim()
  const history = Array.isArray(req.body?.history) ? req.body.history : []

  if (!input) return res.status(400).json({ error: 'Input is required.' })
  if (input.length > 12000) return res.status(413).json({ error: 'Input is too long.' })

  const safeHistory = history
    .filter(item => item && ['user', 'assistant'].includes(item.role))
    .slice(-20)
    .map(item => ({
      role: item.role,
      content: String(item.text || '').slice(0, 12000),
    }))

  try {
    const response = await client.responses.create({
      model: process.env.OPENAI_MODEL || 'gpt-5.6',
      instructions: [
        'You are Jona AI, a concise and capable personal AI assistant.',
        'Reply in the same language as the user unless they ask otherwise.',
        'Use conversation history to maintain context.',
        'Never claim an external action was completed unless the application actually executed it.',
      ].join(' '),
      input: [...safeHistory, { role: 'user', content: input }],
    })

    return res.json({ text: response.output_text || '' })
  } catch (error) {
    console.error('OpenAI request failed:', error?.status, error?.message)
    return res.status(error?.status || 500).json({
      error: 'Jona AI could not complete this request.',
    })
  }
})

app.listen(port, () => {
  console.log(`Jona AI backend listening on port ${port}`)
})
