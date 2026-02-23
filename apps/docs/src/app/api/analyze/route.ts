import { NextRequest, NextResponse } from 'next/server'
import {
  analyze,
  detectInputType,
  fetchUrl,
  formatPlanAsMarkdown,
} from '@unwind/core'

function getConfig() {
  const apiKey = process.env.UNWIND_API_KEY
  const baseUrl = process.env.UNWIND_BASE_URL
  const model = process.env.UNWIND_MODEL

  if (!apiKey || !baseUrl || !model) {
    return null
  }

  return {
    language: 'en-US' as const,
    ai: { baseUrl, apiKey, model },
  }
}

function getDemoResponse(input: string): string {
  const inputType = detectInputType(input)

  return `# Uninstall Plan (Demo)

**Input:** ${input}
**Detected type:** ${inputType}

## ✅ Safe Operations
1. Remove application files
2. Clean up configuration

## ⚠️ Warning Operations
3. Remove PATH modifications from shell config

## 🚨 Critical Operations (Skipped by default)
4. Uninstall package manager dependencies

---
*This is a demo response. Configure API credentials or install the CLI for full AI-powered analysis.*`
}

export async function POST(request: NextRequest) {
  try {
    const { input } = await request.json()

    if (!input || typeof input !== 'string') {
      return NextResponse.json(
        { error: 'Invalid input' },
        { status: 400 }
      )
    }

    const config = getConfig()

    // If no API config, return demo response
    if (!config) {
      return NextResponse.json({ result: getDemoResponse(input) })
    }

    // Fetch URL content if needed
    const inputType = detectInputType(input)
    let scriptContent: string | undefined

    if (inputType === 'url') {
      try {
        scriptContent = await fetchUrl(input)
      } catch (error) {
        return NextResponse.json(
          { error: `Failed to fetch URL: ${error instanceof Error ? error.message : 'Unknown error'}` },
          { status: 400 }
        )
      }
    }

    // Run actual AI analysis
    const plan = await analyze({
      config,
      input,
      scriptContent,
    })

    const result = formatPlanAsMarkdown(plan, input)
    return NextResponse.json({ result })
  } catch (error) {
    console.error('Analysis error:', error)
    return NextResponse.json(
      { error: 'Analysis failed' },
      { status: 500 }
    )
  }
}
