import { getBaseURL } from "@lib/util/env"
import SmoothScrollProvider from "@modules/common/components/smooth-scroll-provider"
import { Metadata } from "next"
import { Cormorant_Garamond, Plus_Jakarta_Sans } from "next/font/google"
import "styles/globals.css"

const cormorantGaramond = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
})

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-sans",
  display: "swap",
})

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
  title: {
    default: "ILLUSIONLINE — Architectural Eveningwear",
    template: "%s | ILLUSIONLINE",
  },
  description:
    "ILLUSIONLINE — Architectural Eveningwear. Ready-to-Wear & Bespoke Made-to-Measure.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
}

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      data-mode="light"
      className={`${cormorantGaramond.variable} ${plusJakartaSans.variable}`}
    >
      <body className="bg-[#FAF9F6] text-[#0A0A0A] font-sans antialiased">
        <SmoothScrollProvider>
          <main className="relative min-h-screen">{props.children}</main>
        </SmoothScrollProvider>
      </body>
    </html>
  )
}
