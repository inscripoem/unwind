import * as p from '@clack/prompts'
import { Config, Language } from '@unwind/core'
import { saveConfig } from './loader.js'

interface ModelInfo {
  id: string
  name?: string
}

export async function runWizard(): Promise<Config> {
  p.intro('Welcome to unwind! 🎉')

  const language = await p.select({
    message: 'Select your language / 选择语言',
    options: [
      { value: 'en-US', label: 'English' },
      { value: 'zh-CN', label: '中文' },
    ],
  }) as Language

  if (p.isCancel(language)) {
    p.cancel('Setup cancelled')
    process.exit(0)
  }

  const messages = language === 'zh-CN' ? {
    baseUrl: '输入 AI API 地址 (例如: https://api.openai.com/v1)',
    apiKey: '输入 API 密钥',
    fetchingModels: '正在获取可用模型...',
    fetchFailed: '无法获取模型列表，请手动输入',
    selectModel: '选择模型',
    enterModel: '手动输入模型名称',
    saved: '配置已保存！',
  } : {
    baseUrl: 'Enter AI API base URL (e.g., https://api.openai.com/v1)',
    apiKey: 'Enter your API key',
    fetchingModels: 'Fetching available models...',
    fetchFailed: 'Could not fetch models, please enter manually',
    selectModel: 'Select a model',
    enterModel: 'Enter model name manually',
    saved: 'Configuration saved!',
  }

  const baseUrl = await p.text({
    message: messages.baseUrl,
    placeholder: 'https://api.openai.com/v1',
    validate: (value) => {
      if (!value) return 'URL is required'
      try {
        new URL(value)
      } catch {
        return 'Invalid URL'
      }
    },
  })

  if (p.isCancel(baseUrl)) {
    p.cancel('Setup cancelled')
    process.exit(0)
  }

  const apiKey = await p.password({
    message: messages.apiKey,
    validate: (value) => {
      if (!value) return 'API key is required'
    },
  })

  if (p.isCancel(apiKey)) {
    p.cancel('Setup cancelled')
    process.exit(0)
  }

  // Try to fetch models
  let model: string

  const spinner = p.spinner()
  spinner.start(messages.fetchingModels)

  const models = await fetchModels(baseUrl as string, apiKey as string)

  if (models && models.length > 0) {
    spinner.stop('Models fetched')

    const selected = await p.select({
      message: messages.selectModel,
      options: models.map(m => ({
        value: m.id,
        label: m.name || m.id,
      })),
    })

    if (p.isCancel(selected)) {
      p.cancel('Setup cancelled')
      process.exit(0)
    }

    model = selected as string
  } else {
    spinner.stop(messages.fetchFailed)

    const entered = await p.text({
      message: messages.enterModel,
      placeholder: 'gpt-4o',
      validate: (value) => {
        if (!value) return 'Model name is required'
      },
    })

    if (p.isCancel(entered)) {
      p.cancel('Setup cancelled')
      process.exit(0)
    }

    model = entered as string
  }

  const config: Config = {
    language,
    ai: {
      baseUrl: baseUrl as string,
      apiKey: apiKey as string,
      model,
    },
  }

  await saveConfig(config)

  p.outro(messages.saved)

  return config
}

async function fetchModels(baseUrl: string, apiKey: string): Promise<ModelInfo[] | null> {
  try {
    const url = new URL('/models', baseUrl)
    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    })

    if (!response.ok) {
      return null
    }

    const data = await response.json() as { data?: ModelInfo[] }
    return data.data || null
  } catch {
    return null
  }
}
