export type InputType = 'url' | 'command' | 'program'

const URL_PATTERN = /^https?:\/\//i
const PACKAGE_MANAGERS = [
  'npm', 'yarn', 'pnpm', 'bun',
  'brew', 'apt', 'apt-get', 'yum', 'dnf', 'pacman', 'apk',
  'cargo', 'pip', 'pip3', 'go', 'gem',
]

export function detectInputType(input: string): InputType {
  const trimmed = input.trim()

  if (URL_PATTERN.test(trimmed)) {
    return 'url'
  }

  const words = trimmed.toLowerCase().split(/\s+/)
  const hasPackageManager = PACKAGE_MANAGERS.some(pm => words.includes(pm))
  const hasInstallKeyword = words.some(w =>
    ['install', 'add', 'i', 'global', '-g'].includes(w)
  )

  if (hasPackageManager || hasInstallKeyword) {
    return 'command'
  }

  return 'program'
}
