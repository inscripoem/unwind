export interface ParsedCommand {
  packageManager: string
  packages: string[]
  isGlobal: boolean
  raw: string
}

const PACKAGE_MANAGER_PATTERNS: Record<string, RegExp> = {
  npm: /npm\s+(?:install|i|add)\s+(?:-g\s+|--global\s+)?(.+)/i,
  yarn: /yarn\s+(?:global\s+)?add\s+(.+)/i,
  pnpm: /pnpm\s+(?:add|install)\s+(?:-g\s+|--global\s+)?(.+)/i,
  bun: /bun\s+(?:add|install)\s+(?:-g\s+|--global\s+)?(.+)/i,
  brew: /brew\s+install\s+(.+)/i,
  apt: /(?:apt|apt-get)\s+install\s+(?:-y\s+)?(.+)/i,
  pip: /pip3?\s+install\s+(.+)/i,
  cargo: /cargo\s+install\s+(.+)/i,
  go: /go\s+install\s+(.+)/i,
}

export function parseCommand(input: string): ParsedCommand | null {
  const trimmed = input.trim()

  for (const [pm, pattern] of Object.entries(PACKAGE_MANAGER_PATTERNS)) {
    const match = trimmed.match(pattern)
    if (match) {
      const packagesStr = match[1].trim()
      const packages = packagesStr
        .split(/\s+/)
        .filter(p => !p.startsWith('-'))

      const isGlobal =
        trimmed.includes('-g') ||
        trimmed.includes('--global') ||
        trimmed.includes('global add')

      return {
        packageManager: pm,
        packages,
        isGlobal,
        raw: trimmed,
      }
    }
  }

  return null
}
