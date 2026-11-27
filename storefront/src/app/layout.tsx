import { DisplayCurrencyProvider } from "@lib/context/display-currency-context"
import { getBaseURL } from "@lib/util/env"
import { getDisplayCurrencySnapshot } from "@lib/util/fx-display"
import EditorialFontController from "@modules/common/components/editorial-font-controller"
import SmoothScrollProvider from "@modules/common/components/smooth-scroll-provider"
import { Metadata } from "next"
import { Cormorant_Garamond, Inter, Jost } from "next/font/google"
import { Suspense } from "react"
import "styles/globals.css"

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-sans",
  display: "swap",
})

const cormorantGaramond = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
})

const jost = Jost({
  subsets: ["latin"],
  weight: ["200", "300"],
  variable: "--font-jost",
  display: "swap",
})

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
  title: {
    default: "ILLUSION — Official Online Atelier | illusionline.com",
    template: "%s | ILLUSION — Official Online Atelier | illusionline.com",
  },
  description:
    "ILLUSION (@illusion.line) — Official Online Atelier at illusionline.com. Architectural Eveningwear in Ready-to-Wear & Bespoke Made-to-Measure.",
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

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { displayCurrency, rates } = await getDisplayCurrencySnapshot()

  return (
    <html
      lang="en"
      data-mode="light"
      className={`${inter.variable} ${cormorantGaramond.variable} ${jost.variable}`}
    >
      <body className="bg-white text-[#0A0A0A] font-sans antialiased">
        <Suspense fallback={null}>
          <EditorialFontController />
        </Suspense>
        <DisplayCurrencyProvider
          initialCurrency={displayCurrency}
          rates={rates}
        >
          <SmoothScrollProvider>
            <main className="relative min-h-screen bg-white">
              {props.children}
            </main>
          </SmoothScrollProvider>
        </DisplayCurrencyProvider>
      </body>
    </html>
  )
}
