import LocalizedClientLink from "@modules/common/components/localized-client-link"
import ChevronDown from "@modules/common/icons/chevron-down"

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="w-full bg-[#FAF9F6] text-[#0A0A0A] relative small:min-h-screen flex flex-col justify-between">
      <div>
        <div className="h-16 small:h-20 bg-[#FAF9F6]/90 backdrop-blur-xl border-b border-[#1A1A1A]/15 sticky top-0 z-40">
          <nav className="flex h-full items-center content-container justify-between">
            <LocalizedClientLink
              href="/cart"
              className="text-[11px] tracking-[0.2em] text-[#0A0A0A]/75 hover:text-[#0A0A0A] flex items-center gap-x-2 uppercase flex-1 basis-0 transition-colors"
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
              className="text-sm small:text-base uppercase tracking-[0.36em] text-[#0A0A0A] hover:opacity-75 transition-opacity pl-[0.36em]"
              data-testid="store-link"
            >
              ILLUSIONLINE
            </LocalizedClientLink>
            <div className="flex-1 basis-0 flex justify-end">
              <span className="hidden small:inline text-[10px] uppercase tracking-[0.2em] text-[#0A0A0A]/45">
                Secure Checkout
              </span>
            </div>
          </nav>
        </div>
        <div className="relative" data-testid="checkout-container">
          {children}
        </div>
      </div>
      <div className="py-8 border-t border-[#0A0A0A]/10 w-full flex items-center justify-center text-[11px] uppercase tracking-[0.18em] text-[#0A0A0A]/45">
        © {new Date().getFullYear()} ILLUSIONLINE · Worldwide DHL Express
      </div>
    </div>
  )
}
