import IllusionLogo from "@components/brand/illusion-logo"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import ChevronDown from "@modules/common/icons/chevron-down"
import CurrencySwitcher from "@modules/layout/components/currency-switcher"

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="w-full bg-white text-[#0A0A0A] relative small:min-h-screen flex flex-col justify-between">
      <div>
        <div className="h-[60px] small:h-[68px] bg-[#000000] text-white border-b border-white/15 sticky top-0 z-40">
          <nav className="relative flex h-full items-center content-container justify-between">
            <LocalizedClientLink
              href="/cart"
              className="text-[11px] tracking-[0.14em] text-white/80 hover:text-white flex items-center gap-x-2 uppercase z-10 transition-colors"
              data-testid="back-to-cart-link"
            >
              <ChevronDown className="rotate-90" size={14} />
              <span className="mt-px hidden small:block">
                Back to Shopping Bag
              </span>
              <span className="mt-px block small:hidden">Bag</span>
            </LocalizedClientLink>

            <LocalizedClientLink
              href="/"
              aria-label="ILLUSION — Official Online Atelier"
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 inline-flex items-center justify-center py-1"
              data-testid="store-link"
            >
              <span className="hidden sm:inline-flex">
                <IllusionLogo height={24} />
              </span>
              <span className="inline-flex sm:hidden">
                <IllusionLogo height={20} />
              </span>
            </LocalizedClientLink>

            <div className="flex items-center justify-end gap-x-5 h-full z-10">
              <CurrencySwitcher variant="header" />
              <span className="hidden small:inline text-[10px] uppercase tracking-[0.16em] text-white/55">
                AED Checkout
              </span>
            </div>
          </nav>
        </div>
        <div className="relative" data-testid="checkout-container">
          {children}
        </div>
      </div>

      <footer className="py-7 px-4 md:px-8 border-t border-[#E5E5E5] bg-white w-full flex flex-col items-center justify-center gap-1.5 text-center">
        <p className="text-[10px] uppercase tracking-[0.14em] text-[#0A0A0A]/65">
          All Orders Settled in AED · Complimentary UAE Courier · Worldwide DHL
          Express
        </p>
        <p className="text-[10px] tracking-[0.06em] text-[#0A0A0A]/50">
          © 2026 ILLUSION (@illusion.line). Official Online Atelier at
          illusionline.com — Operated by ILLUSIONLINE CLOTHING TRADING, Dubai,
          UAE.
        </p>
      </footer>
    </div>
  )
}
