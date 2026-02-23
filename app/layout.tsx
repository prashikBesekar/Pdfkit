import type { Metadata } from 'next'
import { DM_Sans, Space_Mono } from 'next/font/google'
import './globals.css'

const dmSans = DM_Sans({ 
  subsets: ['latin'],
  variable: '--font-dm-sans',
})

const spaceMono = Space_Mono({ 
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-space-mono',
})

export const metadata: Metadata = {
  title: 'PDFKit - Fast & Private PDF Tools',
  description: 'Merge, compress, split, and convert PDFs instantly. Your files never leave your browser.',
  keywords: ['pdf tools', 'merge pdf', 'compress pdf', 'split pdf', 'pdf converter'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${dmSans.variable} ${spaceMono.variable} font-sans`}>
        {children}
      </body>
    </html>
  )
}