import { Suspense } from "react"

import IllusionLogo from "@components/brand/illusion-logo"
import { getLocale } from "@lib/data/locale-actions"
import { listLocales } from "@lib/data/locales"
import { listRegions } from "@lib/data/regions"
import { StoreRegion } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import CartButton from "@modules/layout/components/cart-button"
import CurrencySwitcher from "@modules/layout/components/currency-switcher"
import HeaderCategoryNav, {
  PRIMARY_NAV_LINKS,
} from "@modules/layout/components/header-category-nav"
import HeaderSearch from "@modules/layout/components/header-search"
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
    <div className="sticky top-0 inset-x-0 z-50 bg-[#000000] text-white">
      {/* Top Courier & Currency Strip (#000000 bg, border-b border-white/10) */}
      <div className="w-full bg-[#000000] border-b border-white/10 h-9">
        <div className="max-w-[1440px] mx-auto h-full px-4 md:px-8 flex items-center justify-between gap-4">
          <div className="hidden lg:block w-28" aria-hidden="true" />
          <p className="text-[10px] uppercase tracking-[0.16em] text-white/80 truncate">
            <span>COMPLIMENTARY UAE COURIER</span>
            <span className="mx-2.5 text-white/35">|</span>
            <span>WORLDWIDE DHL EXPRESS (AED 99)</span>
          </p>
          <div className="flex items-center justify-end shrink-0 lg:w-28 h-full">
            <CurrencySwitcher variant="topbar" />
          </div>
        </div>
      </div>

      {/* Main Brand Row (#000000 bg, h-[64px] desktop / h-[56px] mobile) */}
      <header className="relative bg-[#000000]">
        <div className="relative max-w-[1440px] mx-auto px-4 md:px-8 h-[56px] lg:h-[64px] flex items-center justify-between border-b border-white/15 lg:border-b-0">
          {/* Left: Desktop ATELIER BESPOKE / Mobile Hamburger Menu */}
          <div className="flex items-center justify-start h-full z-10">
            <div className="lg:hidden h-full flex items-center">
              <SideMenu
                regions={regions}
                locales={locales}
                currentLocale={currentLocale}
              />
            </div>
            <div className="hidden lg:flex items-center h-full">
              <LocalizedClientLink
                href="/store?filter=made-to-measure"
                className="text-[11px] uppercase tracking-[0.14em] text-white/85 hover:text-white transition-colors"
              >
                Atelier Bespoke
              </LocalizedClientLink>
            </div>
          </div>

          {/* Dead-Center: Official ILLUSION Vector Ring-Light Brand Mark */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex items-center justify-center">
            <LocalizedClientLink
              href="/"
              aria-label="ILLUSION — Official Online Atelier"
              className="inline-flex items-center justify-center py-1 focus:outline-none"
              data-testid="nav-store-link"
            >
              <span className="hidden sm:inline-flex">
                <IllusionLogo height={26} />
              </span>
              <span className="inline-flex sm:hidden">
                <IllusionLogo height={22} />
              </span>
            </LocalizedClientLink>
          </div>

          {/* Right Utilities: SEARCH / ACCOUNT / BAG (n) */}
          <div className="flex items-center justify-end gap-x-4 sm:gap-x-6 h-full z-10">
            <HeaderSearch />

            <LocalizedClientLink
              className="hidden sm:flex items-center h-full text-[11px] uppercase tracking-[0.14em] text-white/90 hover:text-white transition-colors"
              href="/account"
              data-testid="nav-account-link"
            >
              Account
            </LocalizedClientLink>

            <Suspense
              fallback={
                <LocalizedClientLink
                  className="flex items-center h-full text-[11px] uppercase tracking-[0.14em] text-white/90 hover:text-white transition-colors"
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
        </div>

        {/* Second Tier Category Bar (#000000 bg, border-t border-white/10 border-b border-white/15, desktop h-[40px]) */}
        <Suspense
          fallback={
            <nav
              aria-label="Primary Navigation"
              className="hidden lg:flex items-center justify-center gap-x-10 h-[40px] bg-[#000000] border-t border-white/10 border-b border-white/15 px-8"
            >
              {PRIMARY_NAV_LINKS.map((item) => (
                <LocalizedClientLink
                  key={item.label}
                  href={item.href}
                  data-testid={item.testId}
                  className="text-[11px] uppercase tracking-[0.15em] text-white/80 hover:text-white transition-colors"
                >
                  {item.label}
                </LocalizedClientLink>
              ))}
            </nav>
          }
        >
          <HeaderCategoryNav />
        </Suspense>
      </header>
    </div>
  )
}
