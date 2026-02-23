# unwind - 智能逆向卸载与系统清理终端工具

## Goal
构建一个基于 TypeScript 的硬核命令行工具 + 文档站（含 Landing page 和 Try Unwind 演示）。通过 LLM 与轻量级 Agent 工具调用，逆向分析安装脚本的系统操作，生成并安全执行精确的系统清理与卸载命令。

---

## Tech Stack

### Monorepo 架构
| 类别 | 选择 |
|------|------|
| Monorepo 工具 | pnpm workspaces |
| 运行时 | Node.js |
| 包管理 | pnpm |
| 文档站框架 | Nextra (基于 Next.js) |
| 后端代理 | Next.js API Routes |

### 核心依赖
| 类别 | 技术选型 | 说明 |
|------|----------|------|
| AI/Agent | `ai` + `@ai-sdk/openai` | 支持所有 OpenAI 兼容 API |
| 结构化输出 | `zod` | 定义卸载计划结构 |
| 终端 UI | `@clack/prompts` | 现代交互向导 |
| Markdown 渲染 | `marked` + `marked-terminal` | 终端富文本 |
| 命令执行 | `execa` | 子进程管理 |
| i18n | `i18next` | 多语言支持 |
| YAML 解析 | `yaml` | 配置文件解析 |

**禁止**: LangChain 等臃肿框架

---

## 项目结构

```
unwind/
├── apps/
│   └── docs/                     # Nextra 文档站 (Landing + Docs + Try)
│       ├── pages/
│       │   ├── index.mdx         # Landing page 首页 (含简化版 Try)
│       │   ├── try.tsx           # 完整 Try Unwind 演示页
│       │   ├── docs/
│       │   │   ├── getting-started.mdx
│       │   │   ├── configuration.mdx
│       │   │   ├── usage.mdx
│       │   │   └── risk-levels.mdx
│       │   └── api/
│       │       └── analyze.ts    # 代理 API (防 token 泄漏)
│       ├── components/
│       │   ├── TryUnwindMini.tsx # 首页简化版 Try 组件
│       │   ├── TryUnwindFull.tsx # 完整版 Try 组件
│       │   └── Terminal.tsx      # 伪终端渲染组件
│       ├── theme.config.tsx      # Nextra 主题配置
│       └── package.json
├── packages/
│   ├── cli/                      # CLI 工具
│   │   ├── src/
│   │   │   ├── index.ts          # CLI 入口 (#!/usr/bin/env node)
│   │   │   ├── commands/
│   │   │   │   └── uninstall.ts  # 主命令逻辑
│   │   │   ├── config/
│   │   │   │   ├── loader.ts     # 配置加载
│   │   │   │   └── wizard.ts     # 初始化向导
│   │   │   ├── executor/
│   │   │   │   └── runner.ts     # 命令执行器
│   │   │   └── ui/
│   │   │       ├── markdown.ts   # Markdown 渲染
│   │   │       └── prompts.ts    # 交互组件封装
│   │   ├── tsconfig.json
│   │   └── package.json
│   └── core/                     # 共享核心逻辑
│       ├── src/
│       │   ├── index.ts          # 导出入口
│       │   ├── ai/
│       │   │   ├── client.ts     # AI 客户端初始化
│       │   │   ├── analyzer.ts   # 脚本分析逻辑
│       │   │   ├── tools.ts      # Agent 工具 (shell, fetch)
│       │   │   └── prompts.ts    # System Prompt
│       │   ├── parsers/
│       │   │   ├── url.ts        # URL 解析
│       │   │   ├── command.ts    # 命令解析
│       │   │   └── detector.ts   # 输入类型检测
│       │   ├── types/
│       │   │   ├── config.ts     # 配置类型
│       │   │   └── plan.ts       # 卸载计划 Zod Schema
│       │   └── i18n/
│       │       ├── index.ts      # i18next 初始化
│       │       ├── zh-CN.json    # 中文
│       │       └── en-US.json    # 英文
│       ├── tsconfig.json
│       └── package.json
├── pnpm-workspace.yaml           # pnpm workspace 配置
├── package.json                  # 根 package.json
├── tsconfig.json                 # 根 TypeScript 配置
└── README.md
```

---

## 功能模块

### Module 1: CLI 首次运行初始化向导

**触发条件**: `~/.config/unwind/config.yaml` 不存在

**流程**:
1. 语言选择: `zh-CN` / `en-US`
2. AI 配置录入:
   - Base URL (如 `https://api.openai.com/v1`)
   - API Key
3. 动态模型选择:
   - 尝试请求 `{baseUrl}/models` 获取列表
   - 成功: `select` 组件选择
   - 失败: `text` 组件手动输入
4. 保存配置到 `~/.config/unwind/config.yaml` (明文, 权限 600)

### Module 2: 渐进式输入与溯源引擎

**双入口**:
- 参数直达: `unwind "curl -fsSL https://example.com/install.sh | bash"`
- 交互引导: `unwind` → 提示输入

**输入类型自动识别**:

| 类型 | 识别规则 | 处理方式 |
|------|----------|----------|
| URL | `http(s)://` 开头 | fetch 脚本内容 |
| 命令 | 包含包管理器关键词 | 解析命令结构 |
| 程序名 | 纯文本 | Agent 自行查询系统状态 |

**支持的包管理器** (全覆盖):
- Node: npm, yarn, pnpm, bun
- 系统: brew, apt, apt-get, yum, dnf, pacman, apk
- 语言: cargo, pip, pip3, go install, gem

### Module 3: LLM 分析策略

**优先级**:
1. **原生优先**: 检查 `--uninstall`, `--remove`, `uninstall` 子命令
2. **深度逆向**: 分析脚本操作 → 生成逆向命令
   - 创建目录 → `rm -rf`
   - 拷贝二进制 → `rm`
   - 写入环境变量 → 删除对应行
   - 注册 Systemd → `systemctl disable && rm`
3. **网络下钻**: 递归解析子脚本
   - 跳过: `.tar.gz`, `.zip`, 二进制文件
   - 无递归深度限制，有总超时

**Agent 能力** (自主构建命令):

Agent 可以自行决定执行什么命令来收集信息，类似 coding agent。提供两个基础工具：

| 工具 | 用途 | 安全边界 |
|------|------|----------|
| `shell` | 执行 shell 命令查询系统状态 | 仅允许只读命令 |
| `fetch` | 获取远程 URL 内容 | 跳过二进制文件 |

**安全边界**:
- 分析阶段：只允许只读操作，禁止任何写入/删除命令
- 执行阶段：用户确认后才执行卸载命令

### Module 4: 风险分级与安全门控 ⚠️

**问题场景**：
安装脚本可能安装了 `uv`、`node` 等包管理器/运行时，但用户系统上可能：
- 原本就有这些工具
- 其他程序也依赖这些工具

如果直接卸载，可能破坏用户系统上的其他程序。

**解决方案：风险分级 + 默认跳过**

**风险等级定义**:

| 等级 | 类型 | 示例 | 默认行为 |
|------|------|------|----------|
| `critical` | 包管理器、运行时、系统工具 | uv, pip, node, python, brew, cargo, git | **默认跳过**，标注警告 |
| `warning` | 共享配置、环境变量 | ~/.bashrc 修改, PATH 变量 | 默认执行，标注提示 |
| `safe` | 应用程序自身文件 | ~/app/, ~/.config/app/ | 默认执行 |

**卸载计划 Zod Schema**:
```typescript
const UninstallStep = z.object({
  command: z.string(),           // 要执行的命令
  description: z.string(),       // 操作描述
  risk: z.enum(['critical', 'warning', 'safe']),
  reason: z.string().optional(), // 风险原因说明
})

const UninstallPlan = z.object({
  summary: z.string(),           // 卸载概要
  steps: z.array(UninstallStep),
  warnings: z.array(z.string()), // 全局警告信息
})
```

**交互流程**:

```
[分析完成]
    ↓
[展示卸载指南]
  - safe 操作：正常列出
  - warning 操作：黄色标注 ⚠️
  - critical 操作：红色标注 🚨 + 警告说明
    ↓
[确认执行?]
  "检测到 3 个安全操作，1 个警告操作"
  "以下高风险操作已跳过：卸载 uv (可能影响其他程序)"
  "是否执行安全操作？[Y/n]"
    ↓
[可选：包含高风险操作?]
  "是否也执行高风险操作？(不推荐) [y/N]"
    ↓
[执行]
```

### Module 5: 全局配置与环境回退

**配置文件**: `~/.config/unwind/config.yaml`

**配置优先级** (高 → 低):
1. 环境变量: `UNWIND_API_KEY`, `UNWIND_BASE_URL`, `UNWIND_MODEL`
2. 配置文件: `~/.config/unwind/config.yaml`

**配置结构** (YAML):
```yaml
language: zh-CN  # 或 en-US
ai:
  baseUrl: https://api.openai.com/v1
  apiKey: sk-xxx
  model: gpt-4o
```

**TypeScript 类型**:
```typescript
interface Config {
  language: 'zh-CN' | 'en-US'
  ai: {
    baseUrl: string
    apiKey: string
    model: string
  }
}
```

### Module 6: 文档站 (Nextra)

**页面结构**:

```
首页 (/)
├── Hero Banner
│   └── 标题、简介、安装命令
├── TryUnwindMini 组件
│   └── 输入框 + 示例按钮 (npm install -g xxx, brew install xxx)
│   └── 点击 "Try it" 跳转到 /try?q=xxx
├── 功能亮点
├── 快速安装指南
└── Footer

完整演示页 (/try)
├── TryUnwindFull 组件
│   └── 输入框 + 示例按钮
│   └── 伪终端风格结果展示
│   └── 风险分级标注
├── 支持 URL 参数: /try?q=npm+install+-g+xxx
└── 可分享链接

文档 (/docs/*)
├── Getting Started: 安装和首次配置
├── Configuration: 配置文件和环境变量详解
├── Usage: 使用示例和最佳实践
└── Risk Levels: 风险分级说明
```

**后端 API** (`/api/analyze`):
- 接收用户输入
- 使用服务端 API Key 调用 LLM
- 返回分析结果（含风险分级）
- 防止 token 泄漏

---

## Acceptance Criteria

### CLI
- [ ] 首次运行显示初始化向导，完成后保存 YAML 配置
- [ ] 支持参数直达和交互引导两种模式
- [ ] 正确识别 URL、命令、程序名三种输入类型
- [ ] Agent 能自主构建只读命令查询系统状态
- [ ] LLM 分析生成结构化卸载计划 (Zod 验证)
- [ ] 卸载步骤包含风险分级 (critical/warning/safe)
- [ ] 高风险操作默认跳过，在指南中标注警告
- [ ] 用户可选择是否执行高风险操作
- [ ] 终端渲染美观的 Markdown 指南 (带颜色高亮和风险标注)
- [ ] 用户确认后才执行卸载命令
- [ ] 执行过程有 Spinner 进度展示
- [ ] 需要 sudo 时自动添加前缀
- [ ] 错误时优雅停止并反馈
- [ ] 配置持久化且支持环境变量覆盖
- [ ] 支持中英文切换

### 文档站
- [ ] 首页 Hero + 简化版 Try 组件
- [ ] /try 页面完整演示功能
- [ ] 支持 URL 参数分享 (/try?q=xxx)
- [ ] 伪终端风格结果展示
- [ ] 文档页面结构清晰，导航友好
- [ ] 包含风险分级说明文档
- [ ] 后端 API 代理正常工作
- [ ] 响应式设计，移动端友好
- [ ] 支持暗色模式

---

## 非功能需求

- CLI 入口文件 shebang: `#!/usr/bin/env node`
- 使用 ESM 模块系统
- 严格 TypeScript 类型检查
- 配置文件权限: 600 (仅用户可读写)
- Node.js 版本要求: >= 18
