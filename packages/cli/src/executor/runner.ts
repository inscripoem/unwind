import { execa } from 'execa'
import type { UninstallStep } from '@unwind/core'

export interface ExecutionResult {
  step: UninstallStep
  success: boolean
  output?: string
  error?: string
}

export async function executeStep(step: UninstallStep): Promise<ExecutionResult> {
  try {
    // Add sudo if needed
    let command = step.command
    if (needsSudo(command)) {
      command = `sudo ${command}`
    }

    const result = await execa(command, {
      shell: true,
      reject: false,
    })

    if (result.exitCode !== 0) {
      return {
        step,
        success: false,
        error: result.stderr || `Exit code: ${result.exitCode}`,
      }
    }

    return {
      step,
      success: true,
      output: result.stdout,
    }
  } catch (error) {
    return {
      step,
      success: false,
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

function needsSudo(command: string): boolean {
  const sudoPatterns = [
    /^rm\s+(-rf?\s+)?\/usr/,
    /^rm\s+(-rf?\s+)?\/opt/,
    /^rm\s+(-rf?\s+)?\/etc/,
    /systemctl\s+(disable|stop|remove)/,
    /update-alternatives/,
  ]

  return sudoPatterns.some(pattern => pattern.test(command))
}

export async function executeShellCommand(command: string): Promise<string> {
  try {
    const result = await execa(command, {
      shell: true,
      reject: false,
    })
    return result.stdout || result.stderr || ''
  } catch (error) {
    return error instanceof Error ? error.message : String(error)
  }
}
