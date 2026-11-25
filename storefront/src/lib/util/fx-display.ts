import currencyConfig from "@config/currency-config.json"
import { cookies, headers } from "next/headers"
import {
  CURRENCY_META,
  DisplayCurrencyCode,
  FALLBACK_RATES_PER_AED,
  FxRatesMap,
  SUPPORTED_DISPLAY_CURRENCIES,
  convertAmountFromAED,
  formatDisplayPrice,
  formatExactAED,
  formatExactAEDNumber,
  isSupportedDisplayCurrency,
  mapCountryToDisplayCurrency,
  parseCustomEnvFxRates,
} from "./format-display-price"

export {
  CURRENCY_META,
  FALLBACK_RATES_PER_AED,
  SUPPORTED_DISPLAY_CURRENCIES,
  convertAmountFromAED,
  formatDisplayPrice,
  formatExactAED,
  formatExactAEDNumber,
  isSupportedDisplayCurrency,
  mapCountryToDisplayCurrency,
}
export type { DisplayCurrencyCode, FxRatesMap }

export const DISPLAY_CURRENCY_COOKIE = "display_currency"
const OPEN_ER_API_AED_URL = "https://open.er-api.com/v6/latest/AED"

/**
 * Server-side FX loader with 5-minute Next.js revalidation:
 * 1) Fetches live AED market rates from open.er-api.com (with hardcoded fallbacks if offline)
 * 2) Overlays manualRatesPerAED from currency-config.json ("IRT": 35000)
 * 3) Applies optional NEXT_PUBLIC_CUSTOM_FX_RATES JSON override as highest priority
 */
export async function getFxRates(): Promise<FxRatesMap> {
  const merged: FxRatesMap = {
    ...FALLBACK_RATES_PER_AED,
  }

  try {
    const res = await fetch(OPEN_ER_API_AED_URL, {
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(3500),
    })

    if (res.ok) {
      const data = await res.json()
      const liveRates = data?.rates as Record<string, unknown> | undefined
      if (liveRates && typeof liveRates === "object") {
        for (const code of SUPPORTED_DISPLAY_CURRENCIES) {
          if (code === "AED" || code === "IRT") continue
          const val = Number(liveRates[code])
          if (Number.isFinite(val) && val > 0) {
            merged[code] = val
          }
        }
      }
    }
  } catch {
    // Gracefully retain fallbackRatesPerAED when offline or timed out
  }

  // Overlay manualRatesPerAED from currency-config.json (e.g., "IRT": 35000)
  const manualRates = currencyConfig.manualRatesPerAED as Record<string, number>
  if (manualRates && typeof manualRates === "object") {
    for (const [key, val] of Object.entries(manualRates)) {
      const upper = key.trim().toUpperCase()
      const num = Number(val)
      if (isSupportedDisplayCurrency(upper) && Number.isFinite(num) && num > 0) {
        merged[upper] = num
      }
    }
  }

  // Highest-priority override: NEXT_PUBLIC_CUSTOM_FX_RATES JSON (e.g. {"IRT":36000})
  const envOverrides = parseCustomEnvFxRates()
  for (const [key, val] of Object.entries(envOverrides)) {
    if (isSupportedDisplayCurrency(key) && typeof val === "number" && val > 0) {
      merged[key] = val
    }
  }

  merged.AED = 1
  return merged
}

/**
 * Resolves visitor display currency:
 * 1) Persisted `display_currency` cookie (if manually selected or previously seeded)
 * 2) Geo IP request headers (`x-vercel-ip-country`, `cf-ipcountry`, `x-country-code`)
 * 3) Default `"AED"`
 */
export async function resolveVisitorDisplayCurrency(): Promise<DisplayCurrencyCode> {
  try {
    const cookieStore = await cookies()
    const savedCookie = cookieStore.get(DISPLAY_CURRENCY_COOKIE)?.value
    if (isSupportedDisplayCurrency(savedCookie)) {
      return savedCookie.trim().toUpperCase() as DisplayCurrencyCode
    }

    const headerStore = await headers()
    const geoCountry =
      headerStore.get("x-vercel-ip-country") ||
      headerStore.get("cf-ipcountry") ||
      headerStore.get("x-country-code")

    if (geoCountry) {
      return mapCountryToDisplayCurrency(geoCountry)
    }
  } catch {
    // During static build phases (e.g. /_not-found), cookies()/headers() are unavailable
  }

  return "AED"
}

export async function getDisplayCurrencySnapshot(): Promise<{
  displayCurrency: DisplayCurrencyCode
  rates: FxRatesMap
}> {
  const [displayCurrency, rates] = await Promise.all([
    resolveVisitorDisplayCurrency(),
    getFxRates(),
  ])

  return { displayCurrency, rates }
}
