import { sdk } from "@lib/config"
import {
  NGENIUS_CHECKOUT_COOKIE,
  NgeniusCheckoutCookiePayload,
} from "@lib/data/cookies"
import { revalidateTag } from "next/cache"
import { NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"

function resolvePublicOrigin(request: NextRequest): string {
  const envBase = process.env.NEXT_PUBLIC_BASE_URL?.trim()
  if (
    envBase &&
    !envBase.includes("localhost") &&
    !envBase.includes("0.0.0.0")
  ) {
    return envBase.replace(/\/+$/, "")
  }

  const forwardedHost = request.headers.get("x-forwarded-host")
  const forwardedProto = request.headers.get("x-forwarded-proto") || "https"
  if (forwardedHost) {
    return `${forwardedProto}://${forwardedHost.split(",")[0].trim()}`
  }

  const host = request.headers.get("host")
  if (host && !host.startsWith("0.0.0.0")) {
    const proto = host.includes("localhost") ? "http" : "https"
    return `${proto}://${host}`
  }

  return request.nextUrl.origin
}

function parseNgeniusCookie(
  raw?: string
): NgeniusCheckoutCookiePayload | null {
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw)
    if (parsed && typeof parsed.cartId === "string") {
      return parsed as NgeniusCheckoutCookiePayload
    }
    return null
  } catch {
    return null
  }
}

export async function GET(request: NextRequest) {
  const origin = resolvePublicOrigin(request)
  const searchParams = request.nextUrl.searchParams

  const isCancelled = searchParams.get("cancelled") === "1"
  const returnedRef = searchParams.get("ref")

  const ctxCookieRaw = request.cookies.get(NGENIUS_CHECKOUT_COOKIE)?.value
  const checkoutCtx = parseNgeniusCookie(ctxCookieRaw)

  const medusaCartCookie = request.cookies.get("_medusa_cart_id")?.value
  const cartId = checkoutCtx?.cartId || medusaCartCookie

  const defaultCountry = (
    process.env.NEXT_PUBLIC_DEFAULT_REGION || "ae"
  ).toLowerCase()
  const countryCode = (
    checkoutCtx?.countryCode || defaultCountry
  ).toLowerCase()

  const buildPaymentRetryRedirect = (reason: "cancelled" | "declined") => {
    const target = new URL(
      `/${countryCode}/checkout?step=payment&payment_error=${reason}`,
      origin
    )
    const res = NextResponse.redirect(target, 303)
    // Clear ephemeral N-Genius context cookie while keeping active cart intact
    res.cookies.set(NGENIUS_CHECKOUT_COOKIE, "", {
      maxAge: -1,
      path: "/",
    })
    if (cartId && !medusaCartCookie) {
      res.cookies.set("_medusa_cart_id", cartId, {
        maxAge: 60 * 60 * 24 * 7,
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      })
    }
    return res
  }

  if (isCancelled) {
    return buildPaymentRetryRedirect("cancelled")
  }

  if (!cartId) {
    return buildPaymentRetryRedirect("declined")
  }

  if (
    returnedRef &&
    checkoutCtx?.ngeniusOrderRef &&
    returnedRef !== checkoutCtx.ngeniusOrderRef
  ) {
    console.warn(
      `[N-Genius Callback] Redirect ref (${returnedRef}) differs from stored session ref (${checkoutCtx.ngeniusOrderRef}); backend will verify authoritative session state.`
    )
  }

  const jwtToken = request.cookies.get("_medusa_jwt")?.value
  const headers: Record<string, string> = jwtToken
    ? { authorization: `Bearer ${jwtToken}` }
    : {}

  const cacheId = request.cookies.get("_medusa_cache_id")?.value

  try {
    const cartRes = await sdk.store.cart.complete(cartId, {}, headers)

    if (cartRes?.type === "order" && cartRes.order?.id) {
      if (cacheId) {
        revalidateTag(`carts-${cacheId}`)
        revalidateTag(`orders-${cacheId}`)
      }

      const confirmedUrl = new URL(
        `/${countryCode}/order/${cartRes.order.id}/confirmed`,
        origin
      )
      const res = NextResponse.redirect(confirmedUrl, 303)

      // Clear both Medusa cart cookie and N-Genius context cookie upon successful order placement
      res.cookies.set("_medusa_cart_id", "", {
        maxAge: -1,
        path: "/",
      })
      res.cookies.set(NGENIUS_CHECKOUT_COOKIE, "", {
        maxAge: -1,
        path: "/",
      })

      return res
    }

    // Cart complete returned type === "cart" (payment declined / failed / incomplete on N-Genius)
    return buildPaymentRetryRedirect("declined")
  } catch (error) {
    console.error(
      `[N-Genius Callback] Cart completion failed for cart ${cartId}:`,
      error instanceof Error ? error.message : error
    )
    return buildPaymentRetryRedirect("declined")
  }
}
