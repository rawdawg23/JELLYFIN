import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/lib/auth-context"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "OG JELLYFIN - Premium Media Server Community",
  description:
    "Join the ultimate Jellyfin community with premium features, expert support, and seamless device connectivity.",
  keywords: ["Jellyfin", "Media Server", "Streaming", "Community", "Premium", "Support"],
  authors: [{ name: "OG JELLYFIN Team" }],
  creator: "OG JELLYFIN",
  publisher: "OG JELLYFIN",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://ogjellyfin.com"),
  openGraph: {
    title: "OG JELLYFIN - Premium Media Server Community",
    description:
      "Join the ultimate Jellyfin community with premium features, expert support, and seamless device connectivity.",
    url: "https://ogjellyfin.com",
    siteName: "OG JELLYFIN",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "OG JELLYFIN - Premium Media Server Community",
    description:
      "Join the ultimate Jellyfin community with premium features, expert support, and seamless device connectivity.",
    creator: "@ogjellyfin",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
