"use client"

import { useSearchParams } from "next/navigation"
import { useEffect } from "react"

/**
 * Listens for `?font=serif` (or `?font=sans`) on any route and updates
 * `data-editorial-font` on `<html>` so `--font-editorial` switches live
 * between crisp Inter sans-serif (default) and Cormorant Garamond serif.
 */
export default function EditorialFontController() {
  const searchParams = useSearchParams()
  const fontParam = searchParams.get("font")

  useEffect(() => {
    const root = document.documentElement
    if (fontParam?.toLowerCase() === "serif") {
      root.setAttribute("data-editorial-font", "serif")
    } else if (fontParam?.toLowerCase() === "sans") {
      root.removeAttribute("data-editorial-font")
    } else if (!fontParam) {
      root.removeAttribute("data-editorial-font")
    }
  }, [fontParam])

  return null
}
