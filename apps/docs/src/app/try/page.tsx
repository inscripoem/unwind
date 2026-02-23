'use client'

import { Suspense } from 'react'
import { TryUnwindFull } from '../../components/TryUnwindFull'

export default function TryPage() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <h1 className="text-4xl font-bold mb-4">Try unwind</h1>
      <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
        Enter an installation command, script URL, or program name to see how unwind would reverse it.
      </p>
      <Suspense fallback={<div>Loading...</div>}>
        <TryUnwindFull />
      </Suspense>
      <div className="mt-12 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
        <p className="text-yellow-800 dark:text-yellow-200">
          <strong>Note:</strong> This is a demo. The actual uninstall commands are not executed.
          Install the CLI tool to perform real uninstallation.
        </p>
      </div>
    </div>
  )
}
