"use client"

import { setDisplayCurrencyCookie } from "@lib/data/currency"
import {
  CURRENCY_META,
  DisplayCurrencyCode,
  FALLBACK_RATES_PER_AED,
  FormatDisplayPriceOptions,
  FxRatesMap,
  SUPPORTED_DISPLAY_CURRENCIES,
  formatDisplayPrice,
  formatExactAED,
  formatExactAEDNumber,
  isSupportedDisplayCurrency,
} from "@lib/util/format-display-price"
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react"

type DisplayCurrencyContextValue = {
  displayCurrency: DisplayCurrencyCode
  setDisplayCurrency: (next: DisplayCurrencyCode) => void
  rates: FxRatesMap
  appliedRate: number
  isSwitching: boolean
  formatPrice: (amountInAED: number, options?: FormatDisplayPriceOptions) => string
  formatAED: (amountInAED: number) => string
  formatAEDNumber: (amountInAED: number) => string
  supportedCurrencies: DisplayCurrencyCode[]
  currencyMeta: typeof CURRENCY_META
}

const DisplayCurrencyContext = createContext<DisplayCurrencyContextValue>({
  displayCurrency: "AED",
  setDisplayCurrency: () => {},
  rates: FALLBACK_RATES_PER_AED,
  appliedRate: 1,
  isSwitching: false,
  formatPrice: (amountInAED, options) =>
    formatDisplayPrice(amountInAED, "AED", FALLBACK_RATES_PER_AED, options),
  formatAED: formatExactAED,
  formatAEDNumber: formatExactAEDNumber,
  supportedCurrencies: SUPPORTED_DISPLAY_CURRENCIES,
  currencyMeta: CURRENCY_META,
})

export function DisplayCurrencyProvider({
  initialCurrency,
  rates,
  children,
}: {
  initialCurrency: DisplayCurrencyCode
  rates: FxRatesMap
  children: React.ReactNode
}) {
  const [displayCurrency, setCurrencyState] =
    useState<DisplayCurrencyCode>(initialCurrency)
  const [isSwitching, startTransition] = useTransition()

  // Sync from client cookie on mount if present
  useEffect(() => {
    const match = document.cookie.match(/(?:^|;\s*)display_currency=([^;]+)/)
    const rawCookie = match ? decodeURIComponent(match[1]) : null
    if (isSupportedDisplayCurrency(rawCookie) && rawCookie !== displayCurrency) {
      setCurrencyState(rawCookie.toUpperCase() as DisplayCurrencyCode)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const setDisplayCurrency = useCallback((next: DisplayCurrencyCode) => {
    if (!isSupportedDisplayCurrency(next)) return
    const normalized = next.toUpperCase() as DisplayCurrencyCode

    setCurrencyState(normalized)

    // Persist immediately on client cookie for instant navigation consistency
    const maxAge = 60 * 60 * 24 * 365
    const secure = window.location.protocol === "https:" ? "; Secure" : ""
    document.cookie = `display_currency=${normalized}; path=/; max-age=${maxAge}; SameSite=Lax${secure}`

    startTransition(() => {
      setDisplayCurrencyCookie(normalized).catch(() => {})
    })
  }, [])

  const formatPrice = useCallback(
    (amountInAED: number, options?: FormatDisplayPriceOptions) =>
      formatDisplayPrice(amountInAED, displayCurrency, rates, options),
    [displayCurrency, rates]
  )

  const appliedRate = rates[displayCurrency] ?? 1

  const value = useMemo<DisplayCurrencyContextValue>(
    () => ({
      displayCurrency,
      setDisplayCurrency,
      rates,
      appliedRate,
      isSwitching,
      formatPrice,
      formatAED: formatExactAED,
      formatAEDNumber: formatExactAEDNumber,
      supportedCurrencies: SUPPORTED_DISPLAY_CURRENCIES,
      currencyMeta: CURRENCY_META,
    }),
    [displayCurrency, setDisplayCurrency, rates, appliedRate, isSwitching, formatPrice]
  )

  return (
    <DisplayCurrencyContext.Provider value={value}>
      {children}
    </DisplayCurrencyContext.Provider>
  )
}

export function useDisplayCurrency() {
  return useContext(DisplayCurrencyContext)
}
