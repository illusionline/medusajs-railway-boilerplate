"use client"

import { clx } from "@medusajs/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { PRIMARY_NAV_LINKS } from "@modules/layout/config/navigation"
import { usePathname, useSearchParams } from "next/navigation"
import React from "react"

export default function HeaderCategoryNav() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const activeFilter = searchParams.get("filter")
  const isStoreRoute = pathname?.endsWith("/store")
  const navItems = Array.isArray(PRIMARY_NAV_LINKS) ? PRIMARY_NAV_LINKS : []

  return (
    <nav
      aria-label="Primary Navigation"
      className="hidden lg:flex items-center justify-center gap-x-10 h-[40px] bg-[#000000] border-t border-white/10 border-b border-white/15 px-8"
    >
      {navItems.map((item) => {
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
