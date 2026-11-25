import currencyConfig from "@config/currency-config.json"

export type DisplayCurrencyCode =
  | "AED"
  | "USD"
  | "EUR"
  | "GBP"
  | "AUD"
  | "CAD"
  | "SAR"
  | "KWD"
  | "QAR"
  | "IRT"

export type FxRatesMap = Record<DisplayCurrencyCode, number>

export type CurrencyMeta = {
  code: DisplayCurrencyCode
  label: string
  shortLabel: string
  isIso4217: boolean
}

export const SUPPORTED_DISPLAY_CURRENCIES =
  currencyConfig.supportedCurrencies as DisplayCurrencyCode[]

export const CURRENCY_META = currencyConfig.currencies as Record<
  DisplayCurrencyCode,
  CurrencyMeta
>

export const FALLBACK_RATES_PER_AED: FxRatesMap = {
  ...(currencyConfig.fallbackRatesPerAED as FxRatesMap),
  ...(currencyConfig.manualRatesPerAED as Partial<FxRatesMap>),
  AED: 1,
}

export const ROUNDING_STEPS = currencyConfig.roundingSteps as Record<
  DisplayCurrencyCode,
  number
>

const COUNTRY_TO_CURRENCY = currencyConfig.countryToCurrency as Record<
  string,
  DisplayCurrencyCode
>

export function isSupportedDisplayCurrency(
  code?: string | null
): code is DisplayCurrencyCode {
  if (!code) return false
  const upper = code.trim().toUpperCase()
  return (SUPPORTED_DISPLAY_CURRENCIES as string[]).includes(upper)
}

export function mapCountryToDisplayCurrency(
  countryCode?: string | null
): DisplayCurrencyCode {
  if (!countryCode) return "AED"
  const upper = countryCode.trim().toUpperCase()
  const mapped = COUNTRY_TO_CURRENCY[upper]
  return isSupportedDisplayCurrency(mapped) ? mapped : "AED"
}

export function parseCustomEnvFxRates(): Partial<FxRatesMap> {
  const raw = process.env.NEXT_PUBLIC_CUSTOM_FX_RATES
  if (!raw || !raw.trim()) return {}

  try {
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== "object") return {}

    const overrides: Partial<FxRatesMap> = {}
    for (const [key, val] of Object.entries(parsed)) {
      const upper = key.trim().toUpperCase()
      const num = Number(val)
      if (isSupportedDisplayCurrency(upper) && Number.isFinite(num) && num > 0) {
        overrides[upper] = num
      }
    }
    return overrides
  } catch {
    return {}
  }
}

export function convertAmountFromAED(
  amountInAED: number,
  currencyCode: string,
  rates: Partial<Record<string, number>> = FALLBACK_RATES_PER_AED,
  options?: { applyLuxuryRounding?: boolean }
): number {
  const safeAmount = Number.isFinite(amountInAED) ? amountInAED : 0
  if (safeAmount === 0) return 0

  const code: DisplayCurrencyCode = isSupportedDisplayCurrency(currencyCode)
    ? currencyCode.trim().toUpperCase() as DisplayCurrencyCode
    : "AED"

  if (code === "AED") {
    return safeAmount
  }

  const rate =
    rates[code] ??
    FALLBACK_RATES_PER_AED[code] ??
    1

  const rawConverted = safeAmount * rate
  const applyRounding = options?.applyLuxuryRounding !== false
  const step = ROUNDING_STEPS[code] ?? 0

  if (!applyRounding || step <= 0) {
    return rawConverted
  }

  const sign = rawConverted < 0 ? -1 : 1
  const absRaw = Math.abs(rawConverted)
  const rounded = Math.round(absRaw / step) * step

  if (absRaw > 0 && rounded === 0) {
    return sign * Math.max(1, Math.round(absRaw))
  }

  return sign * rounded
}

export type FormatDisplayPriceOptions = {
  approxPrefix?: boolean
  applyLuxuryRounding?: boolean
  useTomanLabel?: boolean
}

/**
 * Safe centralized formatter for AED and all converted display currencies.
 * NEVER passes non-ISO "IRT" into Intl.NumberFormat({ style: "currency" }).
 */
export function formatDisplayPrice(
  amountInAED: number,
  currencyCode: string,
  rates: Partial<Record<string, number>> = FALLBACK_RATES_PER_AED,
  options?: FormatDisplayPriceOptions
): string {
  const safeAmount = Number.isFinite(amountInAED) ? amountInAED : 0
  const code: DisplayCurrencyCode = isSupportedDisplayCurrency(currencyCode)
    ? (currencyCode.trim().toUpperCase() as DisplayCurrencyCode)
    : "AED"

  const converted = convertAmountFromAED(safeAmount, code, rates, {
    applyLuxuryRounding: options?.applyLuxuryRounding,
  })

  const prefix =
    options?.approxPrefix && code !== "AED" && safeAmount !== 0 ? "≈ " : ""

  // CRITICAL: IRT is NOT an ISO-4217 code — format strictly as integer + " IRT" / " Toman"
  if (code === "IRT") {
    try {
      const formattedInt = new Intl.NumberFormat("en-US", {
        maximumFractionDigits: 0,
      }).format(Math.round(converted))
      const suffix = options?.useTomanLabel ? " Toman" : " IRT"
      return `${prefix}${formattedInt}${suffix}`
    } catch {
      const suffix = options?.useTomanLabel ? " Toman" : " IRT"
      return `${prefix}${Math.round(converted)}${suffix}`
    }
  }

  const isWhole = Math.abs(converted - Math.round(converted)) < 0.005

  try {
    const formatted = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: code,
      minimumFractionDigits: isWhole ? 0 : 2,
      maximumFractionDigits: isWhole ? 0 : 2,
    }).format(converted)

    return `${prefix}${formatted}`
  } catch {
    const fallbackNum = isWhole
      ? Math.round(converted).toLocaleString("en-US")
      : converted.toFixed(2)
    return `${prefix}${code} ${fallbackNum}`
  }
}

export function formatExactAED(amountInAED: number): string {
  const safeAmount = Number.isFinite(amountInAED) ? amountInAED : 0
  const isWhole = Math.abs(safeAmount - Math.round(safeAmount)) < 0.005

  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "AED",
      minimumFractionDigits: isWhole ? 0 : 2,
      maximumFractionDigits: 2,
    }).format(safeAmount)
  } catch {
    return `AED ${isWhole ? Math.round(safeAmount) : safeAmount.toFixed(2)}`
  }
}

export function formatExactAEDNumber(amountInAED: number): string {
  const safeAmount = Number.isFinite(amountInAED) ? amountInAED : 0
  const isWhole = Math.abs(safeAmount - Math.round(safeAmount)) < 0.005

  try {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: isWhole ? 0 : 2,
      maximumFractionDigits: 2,
    }).format(safeAmount)
  } catch {
    return isWhole ? String(Math.round(safeAmount)) : safeAmount.toFixed(2)
  }
}
