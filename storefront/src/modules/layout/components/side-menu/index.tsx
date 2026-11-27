"use client"

import { ArrowRightMini } from "@medusajs/icons"
import { clx, useToggleState } from "@medusajs/ui"
import { AnimatePresence, motion } from "framer-motion"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { createPortal } from "react-dom"

import { Locale } from "@lib/data/locales"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import CountrySelect from "../country-select"
import CurrencySwitcher from "../currency-switcher"
import LanguageSelect from "../language-select"

const SideMenuItems = [
  { name: "New Arrivals", href: "/store?sortBy=created_at&filter=new-arrivals" },
  { name: "Evening Gowns", href: "/store?filter=evening-gowns" },
  { name: "Noir Edit", href: "/store?filter=noir-edit" },
  { name: "Made-to-Measure", href: "/store?filter=made-to-measure" },
  { name: "All Dresses", href: "/store" },
  { name: "Measurement Guide", href: "/client-care#made-to-measure" },
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
        className="h-full flex items-center text-[11px] uppercase tracking-[0.12em] text-[#0A0A0A] hover:opacity-60 transition-opacity focus:outline-none"
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
                  transition={{ duration: 0.25 }}
                  className="fixed inset-0 bg-black/60"
                  onClick={() => setIsOpen(false)}
                  data-testid="side-menu-backdrop"
                />

                <motion.aside
                  data-testid="nav-menu-popup"
                  data-lenis-prevent
                  initial={{ x: "-100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "-100%" }}
                  transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
                  className="relative z-10 w-full max-w-[380px] h-full bg-[#0A0A0A] text-white border-r border-[#222222] flex flex-col justify-between p-7 overflow-y-auto"
                >
                  <div className="flex items-center justify-between border-b border-[#222222] pb-5">
                    <span className="text-xs font-semibold uppercase tracking-[0.22em] text-white">
                      ILLUSIONLINE
                    </span>
                    <button
                      type="button"
                      data-testid="close-menu-button"
                      onClick={() => setIsOpen(false)}
                      className="text-[11px] uppercase tracking-[0.16em] text-white/70 hover:text-white transition-colors"
                    >
                      Close
                    </button>
                  </div>

                  <ul className="flex flex-col gap-4 my-auto py-8">
                    {SideMenuItems.map((item) => (
                      <li key={item.name}>
                        <LocalizedClientLink
                          href={item.href}
                          className="font-editorial text-lg uppercase tracking-[0.1em] font-medium text-white hover:text-white/65 transition-colors block py-0.5"
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

                  <div className="flex flex-col gap-y-5 border-t border-[#222222] pt-6 text-xs text-white/75">
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
                    <p className="text-[10px] tracking-[0.14em] uppercase text-white/45">
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
