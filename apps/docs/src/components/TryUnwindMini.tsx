'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const examples = [
  'npm install -g typescript',
  'curl -fsSL https://bun.sh/install | bash',
  'brew install node',
]

export function TryUnwindMini() {
  const [input, setInput] = useState('')
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim()) {
      router.push(`/try?q=${encodeURIComponent(input.trim())}`)
    }
  }

  const handleExample = (example: string) => {
    router.push(`/try?q=${encodeURIComponent(example)}`)
  }

  return (
    <div className="my-8 p-6 border border-gray-200 dark:border-gray-800 rounded-lg">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Paste an installation command, URL, or program name..."
          className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
        />
        <button
          type="submit"
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Try it
        </button>
      </form>
      <div className="mt-4 flex flex-wrap gap-2">
        <span className="text-sm text-gray-500">Examples:</span>
        {examples.map((example) => (
          <button
            key={example}
            onClick={() => handleExample(example)}
            className="text-sm px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            {example}
          </button>
        ))}
      </div>
    </div>
  )
}
