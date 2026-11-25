import { isEmpty } from "./isEmpty"

type ConvertToLocaleParams = {
  amount: number
  currency_code: string
  minimumFractionDigits?: number
  maximumFractionDigits?: number
  locale?: string
}

export const convertToLocale = ({
  amount,
  currency_code,
  minimumFractionDigits,
  maximumFractionDigits,
  locale = "en-US",
}: ConvertToLocaleParams) => {
  const safeAmount = Number.isFinite(amount) ? amount : 0

  if (!currency_code || isEmpty(currency_code)) {
    return safeAmount.toString()
  }

  const normalized = currency_code.trim().toUpperCase()

  // Guard non-ISO custom codes like IRT so Intl.NumberFormat never throws RangeError
  if (normalized === "IRT") {
    try {
      return `${new Intl.NumberFormat("en-US", {
        maximumFractionDigits: 0,
      }).format(Math.round(safeAmount))} IRT`
    } catch {
      return `${Math.round(safeAmount)} IRT`
    }
  }

  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: normalized,
      minimumFractionDigits,
      maximumFractionDigits,
    }).format(safeAmount)
  } catch {
    return `${normalized} ${safeAmount.toFixed(2)}`
  }
}
