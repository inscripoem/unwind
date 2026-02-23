#!/usr/bin/env node

import * as p from '@clack/prompts'
import { initI18n, t } from '@unwind/core'
import { loadConfig, configExists } from './config/loader.js'
import { runWizard } from './config/wizard.js'
import { runUninstall } from './commands/uninstall.js'

async function main() {
  const args = process.argv.slice(2)

  // Check if config exists
  let config = await loadConfig()

  if (!config) {
    // Run setup wizard
    config = await runWizard()
  }

  await initI18n(config.language)

  // Get input from args or prompt
  let input: string

  if (args.length > 0) {
    input = args.join(' ')
  } else {
    const prompted = await p.text({
      message: t('enterInput'),
      placeholder: 'npm install -g typescript',
    })

    if (p.isCancel(prompted)) {
      p.outro(t('goodbye'))
      process.exit(0)
    }

    input = prompted as string
  }

  if (!input.trim()) {
    p.log.error('No input provided')
    process.exit(1)
  }

  await runUninstall(config, input.trim())
}

main().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})
