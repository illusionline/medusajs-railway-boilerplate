import "server-only"
import { cookies as nextCookies } from "next/headers"

export const NGENIUS_CHECKOUT_COOKIE = "_ngenius_checkout_ctx"

export type NgeniusCheckoutCookiePayload = {
  cartId: string
  countryCode: string
  ngeniusOrderRef?: string
}

export const getAuthHeaders = async (): Promise<
  { authorization: string } | {}
> => {
  try {
    const cookies = await nextCookies()
    const token = cookies.get("_medusa_jwt")?.value

    if (!token) {
      return {}
    }

    return { authorization: `Bearer ${token}` }
  } catch {
    return {}
  }
}

export const getCacheTag = async (tag: string): Promise<string> => {
  try {
    const cookies = await nextCookies()
    const cacheId = cookies.get("_medusa_cache_id")?.value

    if (!cacheId) {
      return ""
    }

    return `${tag}-${cacheId}`
  } catch (error) {
    return ""
  }
}

export const getCacheOptions = async (
  tag: string
): Promise<{ tags: string[] } | {}> => {
  if (typeof window !== "undefined") {
    return {}
  }

  const cacheTag = await getCacheTag(tag)

  if (!cacheTag) {
    return {}
  }

  return { tags: [`${cacheTag}`] }
}

export const setAuthToken = async (token: string) => {
  const cookies = await nextCookies()
  cookies.set("_medusa_jwt", token, {
    maxAge: 60 * 60 * 24 * 7,
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
  })
}

export const removeAuthToken = async () => {
  const cookies = await nextCookies()
  cookies.set("_medusa_jwt", "", {
    maxAge: -1,
  })
}

export const getCartId = async () => {
  const cookies = await nextCookies()
  return cookies.get("_medusa_cart_id")?.value
}

export const setCartId = async (cartId: string) => {
  const cookies = await nextCookies()
  cookies.set("_medusa_cart_id", cartId, {
    maxAge: 60 * 60 * 24 * 7,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  })
}

export const removeCartId = async () => {
  const cookies = await nextCookies()
  cookies.set("_medusa_cart_id", "", {
    maxAge: -1,
  })
}

export const setNgeniusCheckoutContext = async (
  payload: NgeniusCheckoutCookiePayload
) => {
  const cookies = await nextCookies()
  cookies.set(NGENIUS_CHECKOUT_COOKIE, JSON.stringify(payload), {
    maxAge: 60 * 60 * 2,
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
  })
}

export const getNgeniusCheckoutContext =
  async (): Promise<NgeniusCheckoutCookiePayload | null> => {
    try {
      const cookies = await nextCookies()
      const raw = cookies.get(NGENIUS_CHECKOUT_COOKIE)?.value
      if (!raw) return null
      const parsed = JSON.parse(raw)
      if (parsed && typeof parsed.cartId === "string") {
        return parsed as NgeniusCheckoutCookiePayload
      }
      return null
    } catch {
      return null
    }
  }

export const clearNgeniusCheckoutContext = async () => {
  const cookies = await nextCookies()
  cookies.set(NGENIUS_CHECKOUT_COOKIE, "", {
    maxAge: -1,
    path: "/",
  })
}
