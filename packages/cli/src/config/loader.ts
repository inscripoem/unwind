import { homedir } from 'node:os'
import { join } from 'node:path'
import { readFile, writeFile, mkdir, chmod } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { parse, stringify } from 'yaml'
import { Config } from '@unwind/core'

const CONFIG_DIR = join(homedir(), '.config', 'unwind')
const CONFIG_FILE = join(CONFIG_DIR, 'config.yaml')

export async function loadConfig(): Promise<Config | null> {
  // Check environment variables first
  const envConfig = loadEnvConfig()
  if (envConfig) {
    return envConfig
  }

  // Load from file
  if (!existsSync(CONFIG_FILE)) {
    return null
  }

  try {
    const content = await readFile(CONFIG_FILE, 'utf-8')
    const parsed = parse(content)
    return Config.parse(parsed)
  } catch {
    return null
  }
}

function loadEnvConfig(): Config | null {
  const apiKey = process.env.UNWIND_API_KEY
  const baseUrl = process.env.UNWIND_BASE_URL
  const model = process.env.UNWIND_MODEL

  if (apiKey && baseUrl && model) {
    return {
      language: 'en-US',
      ai: { baseUrl, apiKey, model },
    }
  }

  return null
}

export async function saveConfig(config: Config): Promise<void> {
  await mkdir(CONFIG_DIR, { recursive: true })

  const content = stringify(config)
  await writeFile(CONFIG_FILE, content, 'utf-8')

  // Set file permissions to 600 (owner read/write only)
  await chmod(CONFIG_FILE, 0o600)
}

export function configExists(): boolean {
  return existsSync(CONFIG_FILE) || !!process.env.UNWIND_API_KEY
}
