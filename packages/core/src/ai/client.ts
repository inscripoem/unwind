import { createOpenAI } from '@ai-sdk/openai'
import type { Config } from '../types/config.js'

export function createAIClient(config: Config['ai']) {
  return createOpenAI({
    baseURL: config.baseUrl,
    apiKey: config.apiKey,
  })
}
