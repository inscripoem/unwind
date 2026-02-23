import * as p from '@clack/prompts'
import {
  analyze,
  detectInputType,
  fetchUrl,
  formatPlanAsMarkdown,
  initI18n,
  t,
  type Config,
  type UninstallPlan,
  type UninstallStep,
} from '@unwind/core'
import { renderMarkdown } from '../ui/markdown.js'
import { executeStep, executeShellCommand } from '../executor/runner.js'

export async function runUninstall(config: Config, input: string) {
  await initI18n(config.language)

  const inputType = detectInputType(input)

  const spinner = p.spinner()
  spinner.start(t('analyzing'))

  let scriptContent: string | undefined

  if (inputType === 'url') {
    try {
      scriptContent = await fetchUrl(input)
    } catch (error) {
      spinner.stop('Failed to fetch URL')
      p.log.error(error instanceof Error ? error.message : String(error))
      return
    }
  }

  try {
    const plan = await analyze({
      config,
      input,
      scriptContent,
      onToolCall: (toolName, args) => {
        spinner.message(`Using tool: ${toolName}`)
      },
    })

    spinner.stop(t('analysisComplete'))

    // Display the plan
    displayPlan(plan)

    // Confirm execution
    const safeSteps = plan.steps.filter(s => s.risk !== 'critical')
    const criticalSteps = plan.steps.filter(s => s.risk === 'critical')

    if (safeSteps.length === 0 && criticalSteps.length === 0) {
      p.log.info('No uninstall steps generated.')
      return
    }

    if (safeSteps.length > 0) {
      const confirmSafe = await p.confirm({
        message: t('confirmExecute'),
        initialValue: true,
      })

      if (p.isCancel(confirmSafe) || !confirmSafe) {
        p.outro(t('goodbye'))
        return
      }

      // Execute safe and warning steps
      await executeSteps(safeSteps)
    }

    if (criticalSteps.length > 0) {
      p.log.warn(t('skippedCritical'))

      const confirmCritical = await p.confirm({
        message: t('confirmCritical'),
        initialValue: false,
      })

      if (confirmCritical && !p.isCancel(confirmCritical)) {
        await executeSteps(criticalSteps)
      }
    }

    p.outro(t('executionComplete'))
  } catch (error) {
    spinner.stop(t('executionFailed'))
    p.log.error(error instanceof Error ? error.message : String(error))
  }
}

function displayPlan(plan: UninstallPlan) {
  const markdown = formatPlanAsMarkdown(plan)
  console.log(renderMarkdown(markdown))
}

async function executeSteps(steps: UninstallStep[]) {
  for (const step of steps) {
    const spinner = p.spinner()
    spinner.start(`Executing: ${step.command}`)

    const result = await executeStep(step)

    if (result.success) {
      spinner.stop(`✓ ${step.description}`)
    } else {
      spinner.stop(`✗ ${step.description}`)
      p.log.error(result.error || 'Unknown error')

      const shouldContinue = await p.confirm({
        message: 'Continue with remaining steps?',
        initialValue: false,
      })

      if (p.isCancel(shouldContinue) || !shouldContinue) {
        break
      }
    }
  }
}
