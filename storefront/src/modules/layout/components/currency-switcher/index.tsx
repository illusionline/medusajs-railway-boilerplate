"use client"

import { useDisplayCurrency } from "@lib/context/display-currency-context"
import { DisplayCurrencyCode } from "@lib/util/format-display-price"
import { clx } from "@medusajs/ui"
import { AnimatePresence, motion } from "framer-motion"
import React, { useEffect, useRef, useState } from "react"

type CurrencySwitcherProps = {
  variant?: "header" | "drawer"
}

const CurrencySwitcher: React.FC<CurrencySwitcherProps> = ({
  variant = "header",
}) => {
  const {
    displayCurrency,
    setDisplayCurrency,
    supportedCurrencies,
    currencyMeta,
  } = useDisplayCurrency()
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return

    const onClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false)
      }
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false)
    }

    document.addEventListener("mousedown", onClickOutside)
    window.addEventListener("keydown", onKeyDown)
    return () => {
      document.removeEventListener("mousedown", onClickOutside)
      window.removeEventListener("keydown", onKeyDown)
    }
  }, [open])

  const handleSelect = (code: DisplayCurrencyCode) => {
    setDisplayCurrency(code)
    setOpen(false)
  }

  if (variant === "drawer") {
    return (
      <div className="flex flex-col gap-y-2.5" data-testid="drawer-currency-switcher">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-[0.24em] text-[#FAF9F6]/50">
            Display Currency
          </span>
          <span className="text-[10px] tracking-[0.14em] uppercase text-[#FAF9F6]/45">
            Settled in AED
          </span>
        </div>
        <div className="grid grid-cols-5 gap-1.5">
          {supportedCurrencies.map((code) => {
            const active = displayCurrency === code
            return (
              <button
                key={code}
                type="button"
                onClick={() => handleSelect(code)}
                title={currencyMeta[code]?.label || code}
                className={clx(
                  "h-8 text-[10px] uppercase tracking-[0.14em] border transition-colors",
                  active
                    ? "bg-[#FAF9F6] text-[#0A0A0A] border-[#FAF9F6] font-medium"
                    : "bg-transparent text-[#FAF9F6]/70 border-[#FAF9F6]/20 hover:border-[#FAF9F6]/60 hover:text-[#FAF9F6]"
                )}
              >
                {code}
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  const activeMeta = currencyMeta[displayCurrency]

  return (
    <div
      ref={containerRef}
      className="relative h-full flex items-center"
      data-testid="header-currency-switcher"
    >
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-haspopup="listbox"
        title={`Display currency: ${activeMeta?.label || displayCurrency} (Settled in AED)`}
        className="flex items-center gap-x-1.5 text-[11px] uppercase tracking-[0.2em] text-[#0A0A0A]/75 hover:text-[#0A0A0A] transition-colors py-1 focus:outline-none"
      >
        <span>
          {displayCurrency === "IRT" ? "IRT · Toman" : displayCurrency}
        </span>
        <span
          className={clx(
            "text-[9px] leading-none transition-transform duration-200",
            open && "rotate-180"
          )}
        >
          ▾
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            role="listbox"
            aria-label="Select display currency"
            data-lenis-prevent
            className="absolute right-0 top-[calc(100%+1px)] z-[90] w-64 bg-[#FAF9F6] text-[#0A0A0A] border border-[#1A1A1A]/20 shadow-xl py-2"
          >
            <div className="px-4 py-2 border-b border-[#0A0A0A]/10 flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-[0.22em] text-[#0A0A0A]/50">
                Display Currency
              </span>
              <span className="text-[9px] uppercase tracking-[0.16em] text-[#0A0A0A]/45">
                AED Base
              </span>
            </div>

            <div className="max-h-72 overflow-y-auto py-1 no-scrollbar">
              {supportedCurrencies.map((code) => {
                const meta = currencyMeta[code]
                const isSelected = displayCurrency === code

                return (
                  <button
                    key={code}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelect(code)}
                    className={clx(
                      "w-full px-4 py-2 text-left flex items-center justify-between text-xs transition-colors",
                      isSelected
                        ? "bg-[#0A0A0A] text-[#FAF9F6]"
                        : "text-[#0A0A0A]/80 hover:bg-[#F2EFE9]"
                    )}
                  >
                    <span className="flex items-center gap-x-2.5">
                      <span className="font-medium tracking-[0.14em] uppercase w-9">
                        {code}
                      </span>
                      <span
                        className={clx(
                          "text-[11px]",
                          isSelected ? "text-[#FAF9F6]/75" : "text-[#0A0A0A]/55"
                        )}
                      >
                        {meta?.label}
                      </span>
                    </span>
                    {code === "AED" && (
                      <span
                        className={clx(
                          "text-[9px] uppercase tracking-[0.14em]",
                          isSelected ? "text-[#FAF9F6]/70" : "text-[#0A0A0A]/45"
                        )}
                      >
                        Exact
                      </span>
                    )}
                  </button>
                )
              })}
            </div>

            <div className="px-4 pt-2 pb-1 border-t border-[#0A0A0A]/10">
              <p className="text-[10px] leading-snug text-[#0A0A0A]/55">
                All orders settle in <strong className="font-medium text-[#0A0A0A]">AED</strong> at checkout.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default CurrencySwitcher
