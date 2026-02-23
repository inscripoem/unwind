export async function fetchUrl(url: string): Promise<string> {
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`)
  }

  const contentType = response.headers.get('content-type') || ''

  // Skip binary files
  if (
    contentType.includes('application/octet-stream') ||
    contentType.includes('application/zip') ||
    contentType.includes('application/gzip') ||
    contentType.includes('application/x-tar')
  ) {
    throw new Error(`Skipping binary file: ${url}`)
  }

  return response.text()
}

export function extractUrlsFromScript(script: string): string[] {
  const urlPattern = /https?:\/\/[^\s"'<>]+/g
  const matches = script.match(urlPattern) || []

  // Filter out binary file URLs
  return matches.filter(url => {
    const lower = url.toLowerCase()
    return !(
      lower.endsWith('.tar.gz') ||
      lower.endsWith('.tgz') ||
      lower.endsWith('.zip') ||
      lower.endsWith('.exe') ||
      lower.endsWith('.dmg') ||
      lower.endsWith('.pkg') ||
      lower.endsWith('.deb') ||
      lower.endsWith('.rpm')
    )
  })
}
