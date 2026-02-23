import { z } from 'zod'
import { tool } from 'ai'

export const shellTool = tool({
  description: 'Execute a read-only shell command to gather system information. Only use for commands like which, ls, cat, brew list, npm list, pip show, etc.',
  inputSchema: z.object({
    command: z.string().describe('The shell command to execute'),
  }),
  execute: async ({ command }) => {
    // This will be implemented by the CLI with actual shell execution
    // For now, return a placeholder
    return { output: `[Shell execution not available in this context: ${command}]` }
  },
})

export const fetchTool = tool({
  description: 'Fetch content from a URL. Use this to retrieve remote scripts for analysis.',
  inputSchema: z.object({
    url: z.string().url().describe('The URL to fetch'),
  }),
  execute: async ({ url }) => {
    try {
      const response = await fetch(url)
      if (!response.ok) {
        return { error: `Failed to fetch: ${response.status}` }
      }
      const content = await response.text()
      return { content: content.slice(0, 50000) } // Limit content size
    } catch (error) {
      return { error: `Fetch error: ${error}` }
    }
  },
})

export const tools = {
  shell: shellTool,
  fetch: fetchTool,
}
