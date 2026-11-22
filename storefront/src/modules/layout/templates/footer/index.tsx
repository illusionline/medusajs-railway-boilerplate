import { listCollections } from "@lib/data/collections"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export default async function Footer() {
  const collections = await listCollections({
    fields: "id, handle, title",
  })
    .then((res) => res.collections)
    .catch(() => [])

  return (
    <footer className="bg-[#0A0A0A] text-[#FAF9F6] border-t border-[#1A1A1A] w-full">
      <div className="content-container flex flex-col w-full">
        <div className="grid grid-cols-1 small:grid-cols-[1.4fr_2fr] gap-y-14 gap-x-16 py-20 small:py-28">
          {/* Brand Column */}
          <div className="flex flex-col gap-y-5 max-w-sm">
            <LocalizedClientLink
              href="/"
              className="text-base small:text-lg uppercase tracking-[0.36em] text-[#FAF9F6] hover:opacity-80 transition-opacity w-fit"
            >
              ILLUSIONLINE
            </LocalizedClientLink>
            <p className="text-xs leading-relaxed text-[#FAF9F6]/60 font-light">
              Architectural eveningwear conceived in sculptural silhouettes.
              Crafted in limited ready-to-wear editions and bespoke
              made-to-measure tailoring.
            </p>
          </div>

          {/* Navigation Columns */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-10 small:gap-x-12">
            {/* Atelier */}
            <div className="flex flex-col gap-y-4">
              <span className="text-[10px] uppercase tracking-[0.26em] text-[#FAF9F6]/45">
                Atelier
              </span>
              <ul className="flex flex-col gap-y-2.5 text-xs text-[#FAF9F6]/80">
                <li>
                  <LocalizedClientLink
                    href="/store"
                    className="hover:text-[#FAF9F6] transition-colors"
                  >
                    Shop All
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink
                    href="/store?sortBy=created_at"
                    className="hover:text-[#FAF9F6] transition-colors"
                  >
                    New Arrivals
                  </LocalizedClientLink>
                </li>
                {collections?.slice(0, 4).map((c) => (
                  <li key={c.id}>
                    <LocalizedClientLink
                      href={`/collections/${c.handle}`}
                      className="hover:text-[#FAF9F6] transition-colors"
                    >
                      {c.title}
                    </LocalizedClientLink>
                  </li>
                ))}
              </ul>
            </div>

            {/* Client Care */}
            <div className="flex flex-col gap-y-4">
              <span className="text-[10px] uppercase tracking-[0.26em] text-[#FAF9F6]/45">
                Client Care
              </span>
              <ul className="flex flex-col gap-y-2.5 text-xs text-[#FAF9F6]/80">
                <li>
                  <LocalizedClientLink
                    href="/client-care#shipping"
                    className="hover:text-[#FAF9F6] transition-colors"
                  >
                    Worldwide DHL Express Shipping
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink
                    href="/client-care#made-to-measure"
                    className="hover:text-[#FAF9F6] transition-colors"
                  >
                    Made-to-Measure Guide
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink
                    href="/client-care#concierge"
                    className="hover:text-[#FAF9F6] transition-colors"
                  >
                    Client Concierge
                  </LocalizedClientLink>
                </li>
              </ul>
            </div>

            {/* Private Account */}
            <div className="flex flex-col gap-y-4">
              <span className="text-[10px] uppercase tracking-[0.26em] text-[#FAF9F6]/45">
                Client Portal
              </span>
              <ul className="flex flex-col gap-y-2.5 text-xs text-[#FAF9F6]/80">
                <li>
                  <LocalizedClientLink
                    href="/account"
                    className="hover:text-[#FAF9F6] transition-colors"
                  >
                    Account
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink
                    href="/cart"
                    className="hover:text-[#FAF9F6] transition-colors"
                  >
                    Shopping Bag
                  </LocalizedClientLink>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Hairline Bar */}
        <div className="border-t border-[#1A1A1A] py-8 flex flex-col xsmall:flex-row items-start xsmall:items-center justify-between gap-4 text-[11px] tracking-[0.14em] uppercase text-[#FAF9F6]/45">
          <span>
            © {new Date().getFullYear()} ILLUSIONLINE. All rights reserved.
          </span>
          <span>Ready-to-Wear &amp; Bespoke Eveningwear</span>
        </div>
      </div>
    </footer>
  )
}
