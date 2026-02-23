# unwind

> Intelligent Reverse Uninstaller - Analyze installation scripts and generate safe uninstall commands using AI.

## What is unwind?

Many CLI tools provide one-liner installation scripts (`curl -fsSL https://example.com/install | bash`) but rarely offer standardized uninstall procedures. This leaves systems cluttered with orphaned files, environment variables, and configurations.

**unwind** solves this by:
1. Analyzing installation scripts/commands using AI
2. Reverse-engineering the installation steps
3. Generating precise uninstall commands with risk classification
4. Optionally executing the cleanup with user confirmation

## Features

- 🔍 **Smart Analysis** - AI-powered reverse engineering of installation scripts
- ⚠️ **Risk Classification** - Automatically identifies high-risk operations (package managers, runtimes)
- 🛡️ **Safe by Default** - Critical operations are skipped unless explicitly confirmed
- 📥 **Multiple Input Types** - Supports URLs, commands, and program names
- 🌐 **Web Demo** - Try it online before installing

## Installation

```bash
npm install -g unwind
```

## Usage

### Interactive Mode

```bash
unwind
```

### Direct Mode

```bash
# Analyze an installation command
unwind "npm install -g typescript"

# Analyze a script URL
unwind "https://bun.sh/install"

# Analyze by program name
unwind "neovim"
```

## Risk Levels

| Level | Description | Default Behavior |
|-------|-------------|------------------|
| 🚨 **Critical** | Package managers, runtimes, system tools | Skipped |
| ⚠️ **Warning** | Shared configs, environment variables | Executed with warning |
| ✅ **Safe** | Application-specific files | Executed |

## Configuration

Configuration is stored in `~/.config/unwind/config.yaml`:

```yaml
language: en-US  # or zh-CN
ai:
  baseUrl: https://api.openai.com/v1
  apiKey: sk-your-api-key
  model: gpt-4o
```

Environment variables take precedence:
- `UNWIND_API_KEY`
- `UNWIND_BASE_URL`
- `UNWIND_MODEL`

## Project Structure

```
unwind/
├── apps/docs/       # Nextra documentation site
├── packages/cli/    # CLI tool
└── packages/core/   # Shared core logic
```

## Development

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run docs site locally
pnpm docs:dev

# Build CLI
pnpm cli:build
```

## License

MIT
