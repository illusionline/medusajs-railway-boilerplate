import IllusionLogo from "@components/brand/illusion-logo"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export default async function Footer() {
  return (
    <footer className="bg-[#000000] text-white border-t border-white/15 w-full">
      {/* Top Dispatch & Atelier Notice Strip */}
      <div className="border-b border-white/10">
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] uppercase tracking-[0.16em] text-white/75">
          <span>COMPLIMENTARY UAE COURIER DELIVERY</span>
          <span className="hidden sm:inline text-white/30">|</span>
          <span>WORLDWIDE DHL EXPRESS SHIPPING (AED 99)</span>
          <span className="hidden sm:inline text-white/30">|</span>
          <span>READY-TO-WEAR &amp; MADE-TO-MEASURE ATELIER</span>
        </div>
      </div>

      {/* Main Footer Columns */}
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8">
          {/* Brand & Direct Concierge */}
          <div className="md:col-span-5 flex flex-col gap-y-4 max-w-sm">
            <LocalizedClientLink
              href="/"
              aria-label="ILLUSION — Official Online Atelier"
              className="w-fit inline-flex items-center focus:outline-none"
            >
              <IllusionLogo height={28} />
            </LocalizedClientLink>
            <p className="text-xs leading-relaxed text-white/65 pt-1">
              Architectural eveningwear conceived in sculptural silhouettes.
              Crafted in our Dubai atelier in standard sizing and individual
              made-to-measure commissions.
            </p>
            <div className="pt-2 flex flex-col gap-y-1">
              <span className="text-[10px] uppercase tracking-[0.16em] text-white/45">
                Client Concierge &amp; Support
              </span>
              <a
                href="mailto:support@illusionline.com"
                className="text-xs tracking-[0.06em] text-white underline underline-offset-4 hover:opacity-75 transition-opacity w-fit"
              >
                support@illusionline.com
              </a>
            </div>
          </div>

          {/* Shop / Edit */}
          <div className="md:col-span-2 flex flex-col gap-y-3.5">
            <span className="text-[10px] uppercase tracking-[0.18em] font-medium text-white/45">
              Collection
            </span>
            <ul className="flex flex-col gap-y-2.5 text-[11px] uppercase tracking-[0.1em] text-white/80">
              <li>
                <LocalizedClientLink
                  href="/store?sortBy=created_at&filter=new-arrivals"
                  className="hover:text-white transition-colors"
                >
                  New Arrivals
                </LocalizedClientLink>
              </li>
              <li>
                <LocalizedClientLink
                  href="/store?filter=evening-gowns"
                  className="hover:text-white transition-colors"
                >
                  Evening Gowns
                </LocalizedClientLink>
              </li>
              <li>
                <LocalizedClientLink
                  href="/store?filter=noir-edit"
                  className="hover:text-white transition-colors"
                >
                  Noir Edit
                </LocalizedClientLink>
              </li>
              <li>
                <LocalizedClientLink
                  href="/store?filter=made-to-measure"
                  className="hover:text-white transition-colors"
                >
                  Made-to-Measure
                </LocalizedClientLink>
              </li>
              <li>
                <LocalizedClientLink
                  href="/store"
                  className="hover:text-white transition-colors"
                >
                  All Dresses
                </LocalizedClientLink>
              </li>
            </ul>
          </div>

          {/* Client Care */}
          <div className="md:col-span-2 flex flex-col gap-y-3.5">
            <span className="text-[10px] uppercase tracking-[0.18em] font-medium text-white/45">
              Client Care
            </span>
            <ul className="flex flex-col gap-y-2.5 text-[11px] uppercase tracking-[0.1em] text-white/80">
              <li>
                <LocalizedClientLink
                  href="/client-care#made-to-measure"
                  className="hover:text-white transition-colors"
                >
                  Measurement Guide
                </LocalizedClientLink>
              </li>
              <li>
                <LocalizedClientLink
                  href="/client-care#shipping"
                  className="hover:text-white transition-colors"
                >
                  DHL Express Delivery
                </LocalizedClientLink>
              </li>
              <li>
                <LocalizedClientLink
                  href="/client-care#concierge"
                  className="hover:text-white transition-colors"
                >
                  Client Concierge
                </LocalizedClientLink>
              </li>
              <li>
                <LocalizedClientLink
                  href="/account"
                  className="hover:text-white transition-colors"
                >
                  Account
                </LocalizedClientLink>
              </li>
              <li>
                <LocalizedClientLink
                  href="/cart"
                  className="hover:text-white transition-colors"
                >
                  Shopping Bag
                </LocalizedClientLink>
              </li>
            </ul>
          </div>

          {/* Legal & Policies */}
          <div className="md:col-span-3 flex flex-col gap-y-3.5">
            <span className="text-[10px] uppercase tracking-[0.18em] font-medium text-white/45">
              Policies &amp; Legal
            </span>
            <ul className="flex flex-col gap-y-2.5 text-[11px] uppercase tracking-[0.1em] text-white/80">
              <li>
                <LocalizedClientLink
                  href="/policies/refund-policy"
                  className="hover:text-white transition-colors"
                >
                  Refund &amp; Returns Policy
                </LocalizedClientLink>
              </li>
              <li>
                <LocalizedClientLink
                  href="/policies/shipping-policy"
                  className="hover:text-white transition-colors"
                >
                  Shipping &amp; Customs Policy
                </LocalizedClientLink>
              </li>
              <li>
                <LocalizedClientLink
                  href="/policies/terms-of-service"
                  className="hover:text-white transition-colors"
                >
                  Terms of Service
                </LocalizedClientLink>
              </li>
              <li>
                <LocalizedClientLink
                  href="/policies/privacy-policy"
                  className="hover:text-white transition-colors"
                >
                  Privacy Policy
                </LocalizedClientLink>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Legal & Payment Descriptor Alignment Bar */}
        <div className="mt-14 pt-6 border-t border-white/15 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 text-[10px] tracking-[0.1em] text-white/55">
          <span>
            © 2026 ILLUSION (@illusion.line). Official Online Atelier at
            illusionline.com — Operated by ILLUSIONLINE CLOTHING TRADING, Dubai,
            UAE.
          </span>
          <span className="uppercase tracking-[0.14em] text-white/45 shrink-0">
            ALL TRANSACTIONS SETTLED IN AED
          </span>
        </div>
      </div>
    </footer>
  )
}
