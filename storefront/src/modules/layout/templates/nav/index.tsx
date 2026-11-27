import { Suspense } from "react"

import { getLocale } from "@lib/data/locale-actions"
import { listLocales } from "@lib/data/locales"
import { listRegions } from "@lib/data/regions"
import { StoreRegion } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import CartButton from "@modules/layout/components/cart-button"
import CurrencySwitcher from "@modules/layout/components/currency-switcher"
import HeaderSearch from "@modules/layout/components/header-search"
import SideMenu from "@modules/layout/components/side-menu"

const PRIMARY_NAV_LINKS = [
  {
    label: "New Arrivals",
    href: "/store?sortBy=created_at&filter=new-arrivals",
    testId: "nav-new-arrivals-link",
  },
  {
    label: "Evening Gowns",
    href: "/store?filter=evening-gowns",
    testId: "nav-evening-gowns-link",
  },
  {
    label: "Noir Edit",
    href: "/store?filter=noir-edit",
    testId: "nav-noir-edit-link",
  },
  {
    label: "Made-to-Measure",
    href: "/store?filter=made-to-measure",
    testId: "nav-made-to-measure-link",
  },
  {
    label: "All Dresses",
    href: "/store",
    testId: "nav-shop-all-link",
  },
]

export default async function Nav() {
  const [regions, locales, currentLocale] = await Promise.all([
    listRegions()
      .then((regions: StoreRegion[]) => regions)
      .catch(() => null),
    listLocales().catch(() => null),
    getLocale().catch(() => null),
  ])

  return (
    <div className="sticky top-0 inset-x-0 z-50 bg-white">
      {/* Top Announcement Bar (#000000 bg, #FFFFFF text, 10px uppercase, tracking-[0.16em]) */}
      <div className="w-full bg-[#000000] text-white h-9 border-b border-[#1A1A1A]">
        <div className="max-w-[1440px] mx-auto h-full px-4 md:px-8 flex items-center justify-between gap-4">
          <div className="hidden lg:block w-28" aria-hidden="true" />
          <p className="text-[10px] uppercase tracking-[0.16em] text-white truncate">
            <span>COMPLIMENTARY UAE COURIER</span>
            <span className="mx-2.5 text-white/45">|</span>
            <span>WORLDWIDE DHL EXPRESS (AED 99)</span>
          </p>
          <div className="flex items-center justify-end shrink-0 lg:w-28 h-full">
            <CurrencySwitcher variant="topbar" />
          </div>
        </div>
      </div>

      {/* Main Sticky Header (#FFFFFF bg, 1px solid #EAEAEA bottom border) */}
      <header className="relative bg-white border-b border-[#EAEAEA]">
        {/* Row 1: Left Mobile Trigger / Atelier Link, Centered ILLUSIONLINE Wordmark, Right Utilities */}
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 h-14 md:h-16 grid grid-cols-3 items-center">
          {/* Left */}
          <div className="flex items-center justify-start h-full">
            <div className="lg:hidden h-full flex items-center">
              <SideMenu
                regions={regions}
                locales={locales}
                currentLocale={currentLocale}
              />
            </div>
            <div className="hidden lg:flex items-center gap-x-6 h-full">
              <LocalizedClientLink
                href="/client-care#made-to-measure"
                className="text-[11px] uppercase tracking-[0.12em] text-[#0A0A0A]/65 hover:text-[#0A0A0A] transition-colors"
              >
                Atelier Bespoke
              </LocalizedClientLink>
            </div>
          </div>

          {/* Center: Bold, Sharply Tracked ILLUSIONLINE Wordmark */}
          <div className="flex items-center justify-center h-full">
            <LocalizedClientLink
              href="/"
              className="text-[15px] sm:text-[18px] md:text-[20px] font-semibold uppercase tracking-[0.22em] text-[#0A0A0A] hover:opacity-75 transition-opacity pl-[0.22em] whitespace-nowrap"
              data-testid="nav-store-link"
            >
              ILLUSIONLINE
            </LocalizedClientLink>
          </div>

          {/* Right Utilities: SEARCH / ACCOUNT / BAG (n) */}
          <div className="flex items-center justify-end gap-x-4 sm:gap-x-6 h-full">
            <HeaderSearch />

            <LocalizedClientLink
              className="hidden sm:flex items-center h-full text-[11px] uppercase tracking-[0.12em] text-[#0A0A0A] hover:opacity-60 transition-opacity"
              href="/account"
              data-testid="nav-account-link"
            >
              Account
            </LocalizedClientLink>

            <Suspense
              fallback={
                <LocalizedClientLink
                  className="flex items-center h-full text-[11px] uppercase tracking-[0.12em] text-[#0A0A0A] hover:opacity-60 transition-opacity"
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

        {/* Row 2 (Desktop): Centered Editorial Merchandising Navigation */}
        <nav
          aria-label="Primary Navigation"
          className="hidden lg:flex items-center justify-center gap-x-10 h-10 border-t border-[#F2F2F2] px-8"
        >
          {PRIMARY_NAV_LINKS.map((item) => (
            <LocalizedClientLink
              key={item.label}
              href={item.href}
              data-testid={item.testId}
              className="text-[11px] uppercase tracking-[0.12em] font-normal text-[#0A0A0A] hover:underline underline-offset-[6px] decoration-[#0A0A0A] transition-all"
            >
              {item.label}
            </LocalizedClientLink>
          ))}
        </nav>
      </header>
    </div>
  )
}
