import { AI_CONFIG } from '../../config/aiConfig'
import { MockAIProvider } from './MockAIProvider'
import { LiveAIProvider } from './LiveAIProvider'

const provider = AI_CONFIG.mode === 'LIVE' ? new LiveAIProvider() : new MockAIProvider()
export const AIService = {
  streamResponse(request) { return provider.stream(request) },
  get mode() { return AI_CONFIG.mode },
}
