import type { Metadata } from 'next'
import { DM_Sans, Space_Mono } from 'next/font/google'
import './globals.css'

const dmSans = DM_Sans({ 
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
})

const spaceMono = Space_Mono({ 
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-space-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'DocMerge - Free PDF Tools | Merge, Compress & Split PDFs Online',
  description: 'Free online PDF tools. Merge, compress, split, and convert PDFs instantly in your browser. No upload required. 100% private and secure. Try our fast PDF merger, compressor, and splitter now!',
  keywords: [
    'pdf tools',
    'merge pdf online',
    'compress pdf free',
    'split pdf',
    'combine pdf',
    'pdf merger',
    'pdf compressor',
    'free pdf tools',
    'pdf editor online',
    'pdf splitter'
  ],
  authors: [{ name: 'DocMerge' }],
  creator: 'DocMerge',
  publisher: 'DocMerge',
  
  // Open Graph (for social media sharing)
  openGraph: {
    title: 'DocMerge - Free PDF Tools Online',
    description: 'Merge, compress, and split PDFs instantly. 100% free and private.',
    type: 'website',
    locale: 'en_US',
    siteName: 'DocMerge',
  },
  
  // Twitter Card
  twitter: {
    card: 'summary_large_image',
    title: 'DocMerge - Free PDF Tools Online',
    description: 'Merge, compress, and split PDFs instantly. 100% free and private.',
    creator: '@yourhandle', // Change this when you create Twitter
  },
  
  // Additional SEO
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${dmSans.variable} ${spaceMono.variable}`}>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  )
}