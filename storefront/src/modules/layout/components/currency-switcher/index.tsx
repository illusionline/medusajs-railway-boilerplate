"use client"

import { useDisplayCurrency } from "@lib/context/display-currency-context"
import { DisplayCurrencyCode } from "@lib/util/format-display-price"
import { clx } from "@medusajs/ui"
import { AnimatePresence, motion } from "framer-motion"
import React, { useEffect, useRef, useState } from "react"

type CurrencySwitcherProps = {
  variant?: "topbar" | "header" | "drawer"
}

const CurrencySwitcher: React.FC<CurrencySwitcherProps> = ({
  variant = "topbar",
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
      <div
        className="flex flex-col gap-y-2.5"
        data-testid="drawer-currency-switcher"
      >
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-[0.18em] text-white/60">
            Display Currency
          </span>
          <span className="text-[10px] tracking-[0.14em] uppercase text-white/45">
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
                  "h-8 text-[10px] uppercase tracking-[0.12em] border transition-colors",
                  active
                    ? "bg-white text-[#0A0A0A] border-white font-semibold"
                    : "bg-transparent text-white/75 border-white/20 hover:border-white hover:text-white"
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
  const isTopbar = variant === "topbar"

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
        title={`Display currency: ${
          activeMeta?.label || displayCurrency
        } (Settled in AED)`}
        className={clx(
          "flex items-center gap-x-1.5 uppercase transition-colors py-1 focus:outline-none",
          isTopbar
            ? "text-[10px] tracking-[0.16em] text-white hover:text-white/75"
            : "text-[11px] tracking-[0.12em] text-[#0A0A0A] hover:opacity-65"
        )}
      >
        <span>
          {displayCurrency === "IRT" ? "IRT · TOMAN" : displayCurrency}
        </span>
        <span
          className={clx(
            "text-[9px] leading-none transition-transform duration-150",
            open && "rotate-180"
          )}
        >
          ▾
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 2 }}
            transition={{ duration: 0.15 }}
            role="listbox"
            aria-label="Select display currency"
            data-lenis-prevent
            className="absolute right-0 top-[calc(100%+4px)] z-[110] w-64 bg-white text-[#0A0A0A] border border-[#0A0A0A] shadow-xl py-1.5"
          >
            <div className="px-4 py-2 border-b border-[#E5E5E5] flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-[0.16em] text-[#0A0A0A]/60 font-medium">
                Display Currency
              </span>
              <span className="text-[9px] uppercase tracking-[0.14em] text-[#0A0A0A]/45">
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
                        ? "bg-[#0A0A0A] text-white"
                        : "text-[#0A0A0A] hover:bg-[#F7F7F5]"
                    )}
                  >
                    <span className="flex items-center gap-x-2.5">
                      <span className="font-medium tracking-[0.12em] uppercase w-9 text-[11px]">
                        {code}
                      </span>
                      <span
                        className={clx(
                          "text-[11px]",
                          isSelected ? "text-white/75" : "text-[#0A0A0A]/60"
                        )}
                      >
                        {meta?.label}
                      </span>
                    </span>
                    {code === "AED" && (
                      <span
                        className={clx(
                          "text-[9px] uppercase tracking-[0.14em]",
                          isSelected ? "text-white/70" : "text-[#0A0A0A]/45"
                        )}
                      >
                        Exact
                      </span>
                    )}
                  </button>
                )
              })}
            </div>

            <div className="px-4 pt-2 pb-1.5 border-t border-[#E5E5E5]">
              <p className="text-[10px] leading-snug text-[#0A0A0A]/60">
                All orders settle in{" "}
                <strong className="font-semibold text-[#0A0A0A]">AED</strong> at
                checkout.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default CurrencySwitcher
