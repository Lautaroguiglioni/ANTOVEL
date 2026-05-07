import type { Metadata, Viewport } from "next"
import { Syne, DM_Sans } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { MobileLayout } from "@/components/layout/MobileLayout"

const syne = Syne({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-syne",
  display: "swap",
})

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-dm-sans",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Antovel — Legacy Builder",
  description:
    "Construye tu cerebro 3D digital. Preserva tus recuerdos, tu salud y tu historia.",
  generator: "v0.app",
}

export const viewport: Viewport = {
  themeColor: "#080810",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="es"
      suppressHydrationWarning
      className={`${syne.variable} ${dmSans.variable} bg-background`}
    >
      <body className="font-sans antialiased text-foreground">
        <MobileLayout>{children}</MobileLayout>
        {process.env.NODE_ENV === "production" && <Analytics />}
      </body>
    </html>
  )
}
