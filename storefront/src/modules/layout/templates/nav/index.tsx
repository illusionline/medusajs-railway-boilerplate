import { Suspense } from "react"

import { listRegions } from "@lib/data/regions"
import { listLocales } from "@lib/data/locales"
import { getLocale } from "@lib/data/locale-actions"
import { StoreRegion } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import CartButton from "@modules/layout/components/cart-button"
import CurrencySwitcher from "@modules/layout/components/currency-switcher"
import SideMenu from "@modules/layout/components/side-menu"

export default async function Nav() {
  const [regions, locales, currentLocale] = await Promise.all([
    listRegions()
      .then((regions: StoreRegion[]) => regions)
      .catch(() => null),
    listLocales().catch(() => null),
    getLocale().catch(() => null),
  ])

  return (
    <div className="sticky top-0 inset-x-0 z-50">
      <header className="relative h-16 small:h-20 mx-auto bg-[#FAF9F6]/85 backdrop-blur-xl border-b border-[#1A1A1A]/15 transition-colors duration-300">
        <nav
          aria-label="Primary Navigation"
          className="content-container flex items-center justify-between w-full h-full"
        >
          {/* Left Navigation */}
          <div className="flex-1 basis-0 h-full flex items-center gap-x-8">
            <div className="h-full flex items-center small:hidden">
              <SideMenu
                regions={regions}
                locales={locales}
                currentLocale={currentLocale}
              />
            </div>

            <div className="hidden small:flex items-center gap-x-8 h-full">
              <LocalizedClientLink
                href="/store"
                className="text-[11px] uppercase tracking-[0.22em] text-[#0A0A0A]/75 hover:text-[#0A0A0A] transition-colors duration-200"
                data-testid="nav-shop-all-link"
              >
                Shop All
              </LocalizedClientLink>
              <LocalizedClientLink
                href="/store?sortBy=created_at"
                className="text-[11px] uppercase tracking-[0.22em] text-[#0A0A0A]/75 hover:text-[#0A0A0A] transition-colors duration-200"
                data-testid="nav-new-arrivals-link"
              >
                New Arrivals
              </LocalizedClientLink>
            </div>
          </div>

          {/* Centered Wordmark */}
          <div className="flex items-center justify-center h-full">
            <LocalizedClientLink
              href="/"
              className="text-sm small:text-[17px] font-normal uppercase tracking-[0.36em] text-[#0A0A0A] hover:opacity-75 transition-opacity duration-200 pl-[0.36em]"
              data-testid="nav-store-link"
            >
              ILLUSIONLINE
            </LocalizedClientLink>
          </div>

          {/* Right Navigation: Currency Switcher left of Account & Bag */}
          <div className="flex items-center gap-x-5 small:gap-x-7 h-full flex-1 basis-0 justify-end">
            <div className="hidden xsmall:flex items-center h-full">
              <CurrencySwitcher variant="header" />
            </div>

            <div className="hidden small:flex items-center h-full">
              <LocalizedClientLink
                className="text-[11px] uppercase tracking-[0.22em] text-[#0A0A0A]/75 hover:text-[#0A0A0A] transition-colors duration-200"
                href="/account"
                data-testid="nav-account-link"
              >
                Account
              </LocalizedClientLink>
            </div>

            <Suspense
              fallback={
                <LocalizedClientLink
                  className="text-[11px] uppercase tracking-[0.22em] text-[#0A0A0A]/75 hover:text-[#0A0A0A] transition-colors duration-200"
                  href="/cart"
                  data-testid="nav-cart-link"
                >
                  Bag (0)
                </LocalizedClientLink>
              }
            >
              <CartButton />
            </Suspense>
          </div>
        </nav>
      </header>
    </div>
  )
}
