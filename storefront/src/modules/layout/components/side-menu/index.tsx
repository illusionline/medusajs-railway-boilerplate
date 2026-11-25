"use client"

import { ArrowRightMini } from "@medusajs/icons"
import { clx, useToggleState } from "@medusajs/ui"
import { AnimatePresence, motion } from "framer-motion"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { createPortal } from "react-dom"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import CountrySelect from "../country-select"
import CurrencySwitcher from "../currency-switcher"
import LanguageSelect from "../language-select"
import { HttpTypes } from "@medusajs/types"
import { Locale } from "@lib/data/locales"

const SideMenuItems = [
  { name: "Shop All", href: "/store" },
  { name: "New Arrivals", href: "/store?sortBy=created_at" },
  { name: "Made-to-Measure Guide", href: "/client-care#made-to-measure" },
  { name: "Client Concierge", href: "/client-care#concierge" },
  { name: "Account", href: "/account" },
  { name: "Shopping Bag", href: "/cart" },
]

type SideMenuProps = {
  regions: HttpTypes.StoreRegion[] | null
  locales: Locale[] | null
  currentLocale: string | null
}

const SideMenu = ({ regions, locales, currentLocale }: SideMenuProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const countryToggleState = useToggleState()
  const languageToggleState = useToggleState()
  const pathname = usePathname()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!isOpen) return
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = prevOverflow
    }
  }, [isOpen])

  return (
    <div className="h-full flex items-center">
      <button
        type="button"
        data-testid="nav-menu-button"
        onClick={() => setIsOpen(true)}
        className="h-full flex items-center text-[11px] uppercase tracking-[0.22em] text-[#0A0A0A]/80 hover:text-[#0A0A0A] transition-colors focus:outline-none"
      >
        Menu
      </button>

      {mounted &&
        createPortal(
          <AnimatePresence>
            {isOpen && (
              <div className="fixed inset-0 z-[100] flex justify-start">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="fixed inset-0 bg-[#0A0A0A]/60 backdrop-blur-[2px]"
                  onClick={() => setIsOpen(false)}
                  data-testid="side-menu-backdrop"
                />

                <motion.aside
                  data-testid="nav-menu-popup"
                  data-lenis-prevent
                  initial={{ x: "-100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "-100%" }}
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  className="relative z-10 w-full max-w-[380px] h-full bg-[#0A0A0A] text-[#FAF9F6] border-r border-[#1A1A1A] flex flex-col justify-between p-8 overflow-y-auto"
                >
                  <div className="flex items-center justify-between border-b border-[#1A1A1A] pb-5">
                    <span className="text-xs uppercase tracking-[0.32em] text-[#FAF9F6]">
                      ILLUSIONLINE
                    </span>
                    <button
                      type="button"
                      data-testid="close-menu-button"
                      onClick={() => setIsOpen(false)}
                      className="text-[11px] uppercase tracking-[0.2em] text-[#FAF9F6]/65 hover:text-[#FAF9F6] transition-colors"
                    >
                      Close
                    </button>
                  </div>

                  <ul className="flex flex-col gap-5 my-auto py-8">
                    {SideMenuItems.map((item) => (
                      <li key={item.name}>
                        <LocalizedClientLink
                          href={item.href}
                          className="font-display text-3xl font-light tracking-wide text-[#FAF9F6] hover:text-[#FAF9F6]/65 transition-colors"
                          onClick={() => setIsOpen(false)}
                          data-testid={`${item.name
                            .toLowerCase()
                            .replace(/\s+/g, "-")}-link`}
                        >
                          {item.name}
                        </LocalizedClientLink>
                      </li>
                    ))}
                  </ul>

                  <div className="flex flex-col gap-y-5 border-t border-[#1A1A1A] pt-6 text-xs text-[#FAF9F6]/75">
                    <CurrencySwitcher variant="drawer" />

                    {!!locales?.length && (
                      <div
                        className="flex justify-between items-center"
                        onMouseEnter={languageToggleState.open}
                        onMouseLeave={languageToggleState.close}
                      >
                        <LanguageSelect
                          toggleState={languageToggleState}
                          locales={locales}
                          currentLocale={currentLocale}
                        />
                        <ArrowRightMini
                          className={clx(
                            "transition-transform duration-150",
                            languageToggleState.state ? "-rotate-90" : ""
                          )}
                        />
                      </div>
                    )}
                    {regions && (
                      <div
                        className="flex justify-between items-center"
                        onMouseEnter={countryToggleState.open}
                        onMouseLeave={countryToggleState.close}
                      >
                        <CountrySelect
                          toggleState={countryToggleState}
                          regions={regions}
                        />
                        <ArrowRightMini
                          className={clx(
                            "transition-transform duration-150",
                            countryToggleState.state ? "-rotate-90" : ""
                          )}
                        />
                      </div>
                    )}
                    <p className="text-[11px] tracking-[0.12em] uppercase text-[#FAF9F6]/40">
                      © {new Date().getFullYear()} ILLUSIONLINE
                    </p>
                  </div>
                </motion.aside>
              </div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </div>
  )
}

export default SideMenu
