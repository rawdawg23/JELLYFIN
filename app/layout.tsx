import type React from "react" // Fixed React import from type-only to regular import for JSX support
import "./globals.css"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="theme-color" content="#7c3aed" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <title>Jellyfin Store - Your Media Server Marketplace</title>
      </head>
      <body className="antialiased">{children}</body>
    </html>
  )
}

export const metadata = {
      generator: 'v0.dev'
    };
