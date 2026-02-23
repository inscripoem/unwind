import { z } from 'zod'

export const Language = z.enum(['zh-CN', 'en-US'])
export type Language = z.infer<typeof Language>

export const Config = z.object({
  language: Language,
  ai: z.object({
    baseUrl: z.string().url(),
    apiKey: z.string().min(1),
    model: z.string().min(1),
  }),
})
export type Config = z.infer<typeof Config>
