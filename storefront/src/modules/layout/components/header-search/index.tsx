"use client"

import { AnimatePresence, motion } from "framer-motion"
import { useParams, usePathname, useRouter } from "next/navigation"
import React, { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"

export default function HeaderSearch() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [mounted, setMounted] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const pathname = usePathname()
  const params = useParams()
  const countryCode = (params?.countryCode as string) || "ae"

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!open) return
    const timer = window.setTimeout(() => inputRef.current?.focus(), 40)
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false)
    }
    window.addEventListener("keydown", onKeyDown)
    return () => {
      window.clearTimeout(timer)
      window.removeEventListener("keydown", onKeyDown)
    }
  }, [open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = query.trim()
    setOpen(false)
    if (trimmed) {
      router.push(`/${countryCode}/store?q=${encodeURIComponent(trimmed)}`)
    } else {
      router.push(`/${countryCode}/store`)
    }
  }

  return (
    <>
      <button
        type="button"
        id="header-search-trigger"
        onClick={() => setOpen((prev) => !prev)}
        className="h-full flex items-center text-[11px] uppercase tracking-[0.12em] text-[#0A0A0A] hover:opacity-60 transition-opacity focus:outline-none"
        data-testid="nav-search-button"
      >
        Search
      </button>

      {mounted &&
        createPortal(
          <AnimatePresence>
            {open && (
              <div className="fixed inset-0 z-[95]">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.18 }}
                  className="fixed inset-0 bg-black/45"
                  onClick={() => setOpen(false)}
                />
                <motion.div
                  initial={{ y: -16, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -12, opacity: 0 }}
                  transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                  className="relative z-10 w-full bg-white border-b border-[#0A0A0A] px-4 md:px-8 py-6"
                >
                  <div className="max-w-[1440px] mx-auto">
                    <form
                      onSubmit={handleSubmit}
                      className="flex items-center gap-3 border-b border-[#0A0A0A] pb-3"
                    >
                      <input
                        ref={inputRef}
                        type="search"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="SEARCH EVENING GOWNS, NOIR SILHOUETTES, CORSET, CAPE..."
                        className="w-full bg-transparent text-xs md:text-sm uppercase tracking-[0.12em] text-[#0A0A0A] placeholder:text-[#0A0A0A]/40 focus:outline-none"
                      />
                      <button
                        type="submit"
                        className="px-5 py-2.5 bg-[#0A0A0A] text-white text-[11px] uppercase tracking-[0.16em] font-medium hover:bg-black/85 transition-colors shrink-0"
                      >
                        Search
                      </button>
                      <button
                        type="button"
                        onClick={() => setOpen(false)}
                        className="px-3 py-2.5 text-[11px] uppercase tracking-[0.14em] text-[#0A0A0A]/65 hover:text-[#0A0A0A] shrink-0"
                      >
                        Close
                      </button>
                    </form>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </>
  )
}
