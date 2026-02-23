import { Footer, Layout, Navbar } from 'nextra-theme-docs'
import { Head } from 'nextra/components'
import { getPageMap } from 'nextra/page-map'
import 'nextra-theme-docs/style.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'unwind - Intelligent Reverse Uninstaller',
  description: 'Reverse-engineer installation scripts and generate precise uninstall commands using AI',
}

const navbar = (
  <Navbar
    logo={<span style={{ fontWeight: 700 }}>unwind</span>}
    projectLink="https://github.com/your-username/unwind"
  />
)

const footer = <Footer>MIT {new Date().getFullYear()} © unwind</Footer>

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pageMap = await getPageMap()

  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <body>
        <Layout
          navbar={navbar}
          pageMap={pageMap}
          docsRepositoryBase="https://github.com/your-username/unwind/tree/main/apps/docs"
          footer={footer}
        >
          {children}
        </Layout>
      </body>
    </html>
  )
}
