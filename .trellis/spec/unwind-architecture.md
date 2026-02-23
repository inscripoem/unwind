# Unwind 项目架构规范

> 本文档定义 unwind 项目的架构约定和技术规范。

---

## 技术栈约束

### 必须使用

| 类别 | 技术 | 说明 |
|------|------|------|
| AI/Agent | `ai` + `@ai-sdk/openai` | Vercel AI SDK |
| 结构化输出 | `zod` | 定义卸载计划结构 |
| 终端 UI | `@clack/prompts` | 现代交互向导 |
| Markdown 渲染 | `marked` + `marked-terminal` | 终端富文本 |
| 命令执行 | `execa` | 子进程管理 |
| i18n | `i18next` | 多语言支持 |
| 配置解析 | `yaml` | YAML 格式配置文件 |

### 禁止使用

| 技术 | 原因 |
|------|------|
| LangChain | 过于臃肿，不符合项目轻量化目标 |
| JSON 配置 | 项目统一使用 YAML 格式 |

---

## 包结构规范

```
packages/
├── core/     # @unwind/core - 核心逻辑
└── cli/      # unwind - 命令行工具

apps/
└── docs/     # 文档站 (Nextra)
```

### 代码归属原则

| 代码类型 | 归属包 | 示例 |
|----------|--------|------|
| 类型定义 | `@unwind/core` | `UninstallPlan`, `Config` |
| AI 分析逻辑 | `@unwind/core` | `analyze()`, `createAIClient()` |
| 解析器 | `@unwind/core` | `detectInputType()`, `fetchUrl()` |
| 格式化函数 | `@unwind/core` | `formatPlanAsMarkdown()` |
| i18n 配置 | `@unwind/core` | `initI18n()`, `t()` |
| CLI 交互 | `unwind` (CLI) | 向导、执行器、终端渲染 |
| Web UI | `docs` | React 组件、API Routes |

**关键规则**: 如果一个函数被多个包使用，它必须放在 `@unwind/core` 中。

---

## 风险分级规范

### 等级定义

| 等级 | 类型 | 示例 | 默认行为 |
|------|------|------|----------|
| `critical` | 包管理器、运行时、系统工具 | uv, pip, node, python, brew | **默认跳过** |
| `warning` | 共享配置、环境变量 | ~/.bashrc 修改, PATH 变量 | 默认执行，标注提示 |
| `safe` | 应用程序自身文件 | ~/app/, ~/.config/app/ | 默认执行 |

### 显示图标

```typescript
// packages/core/src/formatters/markdown.ts
export const RISK_ICONS = {
  safe: '✅',
  warning: '⚠️',
  critical: '🚨',
} as const
```

所有显示风险等级的地方必须使用 `RISK_ICONS` 常量。

---

## 配置规范

### 配置文件

- 路径: `~/.config/unwind/config.yaml`
- 权限: `600` (仅用户可读写)
- 格式: YAML

```yaml
language: zh-CN  # 或 en-US
ai:
  baseUrl: https://api.openai.com/v1
  apiKey: sk-xxx
  model: gpt-4o
```

### 环境变量

| 变量 | 说明 |
|------|------|
| `UNWIND_API_KEY` | API 密钥 |
| `UNWIND_BASE_URL` | API 基础 URL |
| `UNWIND_MODEL` | 模型名称 |

**优先级**: 环境变量 > 配置文件

---

## 国际化规范

- 使用 `i18next` 库
- 支持语言: `zh-CN`, `en-US`
- 翻译文件位置: `packages/core/src/i18n/`

```typescript
// 正确用法
import { t } from '@unwind/core'
console.log(t('analyzing'))

// 错误用法 - 硬编码字符串
console.log('Analyzing...')
```

---

## 模块系统

- 使用 ESM (`"type": "module"`)
- 导入路径必须包含 `.js` 扩展名

```typescript
// 正确
import { analyze } from './ai/analyzer.js'

// 错误
import { analyze } from './ai/analyzer'
```

---

## Agent 工具规范

Agent 可自主构建命令，但有安全边界：

| 阶段 | 允许操作 |
|------|----------|
| 分析阶段 | 只读命令 (ls, cat, which, echo $PATH 等) |
| 执行阶段 | 用户确认后的卸载命令 |

工具定义使用 `inputSchema` (不是 `parameters`):

```typescript
// 正确
export const shellTool = tool({
  description: '...',
  inputSchema: z.object({ command: z.string() }),
  execute: async ({ command }) => { ... },
})

// 错误 - Vercel AI SDK 不支持
export const shellTool = tool({
  parameters: z.object({ command: z.string() }),
})
```
