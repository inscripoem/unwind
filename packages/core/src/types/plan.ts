import { z } from 'zod'

export const RiskLevel = z.enum(['critical', 'warning', 'safe'])
export type RiskLevel = z.infer<typeof RiskLevel>

export const UninstallStep = z.object({
  command: z.string(),
  description: z.string(),
  risk: RiskLevel,
  reason: z.string().optional(),
})
export type UninstallStep = z.infer<typeof UninstallStep>

export const UninstallPlan = z.object({
  summary: z.string(),
  steps: z.array(UninstallStep),
  warnings: z.array(z.string()),
})
export type UninstallPlan = z.infer<typeof UninstallPlan>
