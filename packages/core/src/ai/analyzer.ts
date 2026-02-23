import { generateText } from 'ai'
import { createAIClient } from './client.js'
import { SYSTEM_PROMPT } from './prompts.js'
import { tools } from './tools.js'
import { UninstallPlan } from '../types/plan.js'
import type { Config } from '../types/config.js'

export interface AnalyzeOptions {
  config: Config
  input: string
  scriptContent?: string
  onToolCall?: (toolName: string, args: unknown) => void
}

export async function analyze(options: AnalyzeOptions): Promise<UninstallPlan> {
  const { config, input, scriptContent, onToolCall } = options

  const client = createAIClient(config.ai)
  const model = client(config.ai.model)

  const userMessage = scriptContent
    ? `Analyze this installation script and generate an uninstall plan:\n\n\`\`\`bash\n${scriptContent}\n\`\`\``
    : `Analyze this installation command/program and generate an uninstall plan: ${input}`

  const result = await generateText({
    model,
    system: SYSTEM_PROMPT,
    prompt: userMessage,
    tools,
    onStepFinish: (event) => {
      if (event.toolCalls && onToolCall) {
        for (const call of event.toolCalls) {
          onToolCall(call.toolName, call.input)
        }
      }
    },
  })

  // Parse the result text as JSON to get the UninstallPlan
  // The model should output a JSON object matching the UninstallPlan schema
  const jsonMatch = result.text.match(/```json\n?([\s\S]*?)\n?```/)
  const jsonStr = jsonMatch ? jsonMatch[1] : result.text

  try {
    const parsed = JSON.parse(jsonStr)
    return UninstallPlan.parse(parsed)
  } catch {
    // If parsing fails, create a basic plan from the text
    return {
      summary: 'Analysis result',
      steps: [],
      warnings: [result.text],
    }
  }
}
