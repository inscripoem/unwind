import i18next from 'i18next'
import enUS from './en-US.json' with { type: 'json' }
import zhCN from './zh-CN.json' with { type: 'json' }
import type { Language } from '../types/config.js'

export async function initI18n(language: Language) {
  await i18next.init({
    lng: language,
    fallbackLng: 'en-US',
    resources: {
      'en-US': { translation: enUS },
      'zh-CN': { translation: zhCN },
    },
  })

  return i18next
}

export function t(key: string): string {
  return i18next.t(key)
}

export { i18next }
