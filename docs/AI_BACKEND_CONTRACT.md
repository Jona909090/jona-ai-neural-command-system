# JONA AI backend contract

JONA currently runs with `AI_MODE = 'MOCK'` in `src/config/aiConfig.js`.

To enable a real provider later:

1. Implement a server-side `POST /api/conversation` endpoint.
2. Load `OPENAI_API_KEY` only from that server's private environment.
3. Accept `{ input, history }` JSON.
4. Return a streamed UTF-8 text response, or `{ "text": "..." }` JSON as a non-streaming fallback.
5. Change `AI_MODE` to `LIVE` only after that backend is secured and available.

The browser must never receive the provider API key. `LiveAIProvider` talks only to the application backend and supports `AbortSignal` cancellation and streamed response bodies.

Conversation lifecycle hooks are emitted as browser events:

- `jona:listening-start`
- `jona:processing-start`
- `jona:response-start`
- `jona:response-complete`
