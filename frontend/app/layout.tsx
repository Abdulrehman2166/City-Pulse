import type { Metadata, Viewport } from 'next'
import { Caveat, JetBrains_Mono, Manrope, Sora } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { PageTransition } from '@/components/animated-ui'
import SmoothScroll from '@/components/smooth-scroll'
import { GlobalHUD } from '@/components/GlobalHUD'
import Scene3D from '@/components/scene-3d'
import CustomCursor from '@/components/CustomCursor'
import { CursorTrail } from '@/components/CursorTrail'
import './globals.css'

const manrope = Manrope({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-body',
})

const sora = Sora({
  subsets: ['latin'],
  weight: ['500', '600', '700', '800'],
  variable: '--font-heading',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-code',
})

const caveat = Caveat({
  subsets: ['latin'],
  weight: ['600', '700'],
  variable: '--font-handwriting',
})
import './landing.css'
import './dashboard.css'
import './pulse-theme.css'

export const metadata: Metadata = {
  title: 'City Pulse Control System — Emergency Simulation',
  description: 'Advanced emergency response management system with intelligent scheduling algorithms for optimal resource allocation',
  generator: 'v0.app',
  metadataBase: new URL('https://citypulse.example.com'),
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#110f19',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`theme-pulse bg-background ${manrope.variable} ${sora.variable} ${jetbrainsMono.variable} ${caveat.variable}`}>
      <body className={`${manrope.className} font-sans antialiased min-h-screen`}>
        <CustomCursor />
        <CursorTrail />
        <Scene3D />
        <SmoothScroll>
          <GlobalHUD>
            <PageTransition>
              {children}
            </PageTransition>
          </GlobalHUD>
        </SmoothScroll>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
