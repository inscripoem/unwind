// Types
export { Config, Language } from './types/config.js'
export { UninstallPlan, UninstallStep, RiskLevel } from './types/plan.js'

// Parsers
export { detectInputType, type InputType } from './parsers/detector.js'
export { parseCommand, type ParsedCommand } from './parsers/command.js'
export { fetchUrl, extractUrlsFromScript } from './parsers/url.js'

// AI
export { createAIClient } from './ai/client.js'
export { analyze, type AnalyzeOptions } from './ai/analyzer.js'
export { SYSTEM_PROMPT } from './ai/prompts.js'
export { tools, shellTool, fetchTool } from './ai/tools.js'

// Formatters
export { formatPlanAsMarkdown, RISK_ICONS } from './formatters/markdown.js'

// i18n
export { initI18n, t, i18next } from './i18n/index.js'
