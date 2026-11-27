"use client"

import { clx } from "@medusajs/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { usePathname, useSearchParams } from "next/navigation"
import React from "react"

export const PRIMARY_NAV_LINKS = [
  {
    label: "New Arrivals",
    href: "/store?sortBy=created_at&filter=new-arrivals",
    filterKey: "new-arrivals",
    testId: "nav-new-arrivals-link",
  },
  {
    label: "Evening Gowns",
    href: "/store?filter=evening-gowns",
    filterKey: "evening-gowns",
    testId: "nav-evening-gowns-link",
  },
  {
    label: "Noir Edit",
    href: "/store?filter=noir-edit",
    filterKey: "noir-edit",
    testId: "nav-noir-edit-link",
  },
  {
    label: "Made-to-Measure",
    href: "/store?filter=made-to-measure",
    filterKey: "made-to-measure",
    testId: "nav-made-to-measure-link",
  },
  {
    label: "All Dresses",
    href: "/store",
    filterKey: null,
    testId: "nav-shop-all-link",
  },
]

export default function HeaderCategoryNav() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const activeFilter = searchParams.get("filter")
  const isStoreRoute = pathname?.endsWith("/store")

  return (
    <nav
      aria-label="Primary Navigation"
      className="hidden lg:flex items-center justify-center gap-x-10 h-[40px] bg-[#000000] border-t border-white/10 border-b border-white/15 px-8"
    >
      {PRIMARY_NAV_LINKS.map((item) => {
        const isActive =
          isStoreRoute &&
          (item.filterKey
            ? activeFilter === item.filterKey
            : !activeFilter && !searchParams.get("q"))

        return (
          <LocalizedClientLink
            key={item.label}
            href={item.href}
            data-testid={item.testId}
            className={clx(
              "relative h-full inline-flex items-center text-[11px] uppercase tracking-[0.15em] transition-colors",
              "after:content-[''] after:absolute after:left-0 after:right-0 after:bottom-[9px] after:h-px after:bg-white after:transition-opacity after:duration-200",
              isActive
                ? "text-white after:opacity-100"
                : "text-white/80 hover:text-white after:opacity-0 hover:after:opacity-100"
            )}
          >
            {item.label}
          </LocalizedClientLink>
        )
      })}
    </nav>
  )
}
