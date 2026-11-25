"use server"

import {
  DisplayCurrencyCode,
  isSupportedDisplayCurrency,
} from "@lib/util/format-display-price"
import { cookies } from "next/headers"

const DISPLAY_CURRENCY_COOKIE = "display_currency"

export async function setDisplayCurrencyCookie(
  currency: string
): Promise<DisplayCurrencyCode> {
  const normalized: DisplayCurrencyCode = isSupportedDisplayCurrency(currency)
    ? (currency.trim().toUpperCase() as DisplayCurrencyCode)
    : "AED"

  const cookieStore = await cookies()
  cookieStore.set(DISPLAY_CURRENCY_COOKIE, normalized, {
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  })

  return normalized
}
