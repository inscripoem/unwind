import type { UninstallPlan } from '../types/plan.js'

export const RISK_ICONS = {
  safe: '✅',
  warning: '⚠️',
  critical: '🚨',
} as const

export function formatPlanAsMarkdown(plan: UninstallPlan, input?: string): string {
  const lines: string[] = []

  lines.push(`# Uninstall Plan`)
  lines.push('')
  if (input) {
    lines.push(`**Input:** ${input}`)
  }
  lines.push(`**Summary:** ${plan.summary}`)
  lines.push('')

  if (plan.warnings.length > 0) {
    lines.push(`## ${RISK_ICONS.warning} Warnings`)
    for (const warning of plan.warnings) {
      lines.push(`- ${warning}`)
    }
    lines.push('')
  }

  const safeSteps = plan.steps.filter(s => s.risk === 'safe')
  const warningSteps = plan.steps.filter(s => s.risk === 'warning')
  const criticalSteps = plan.steps.filter(s => s.risk === 'critical')

  if (safeSteps.length > 0) {
    lines.push(`## ${RISK_ICONS.safe} Safe Operations`)
    for (const step of safeSteps) {
      lines.push(`- \`${step.command}\` - ${step.description}`)
    }
    lines.push('')
  }

  if (warningSteps.length > 0) {
    lines.push(`## ${RISK_ICONS.warning} Warning Operations`)
    for (const step of warningSteps) {
      lines.push(`- \`${step.command}\` - ${step.description}`)
      if (step.reason) {
        lines.push(`  > ${step.reason}`)
      }
    }
    lines.push('')
  }

  if (criticalSteps.length > 0) {
    lines.push(`## ${RISK_ICONS.critical} Critical Operations (Skipped by default)`)
    for (const step of criticalSteps) {
      lines.push(`- \`${step.command}\` - ${step.description}`)
      if (step.reason) {
        lines.push(`  > ${RISK_ICONS.warning} ${step.reason}`)
      }
    }
    lines.push('')
  }

  return lines.join('\n')
}
