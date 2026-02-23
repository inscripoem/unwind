import nextra from 'nextra'

const withNextra = nextra({
  // Nextra options
})

export default withNextra({
  reactStrictMode: true,
  turbopack: {
    resolveAlias: {
      'next-mdx-import-source-file': './src/mdx-components.tsx'
    }
  }
})
