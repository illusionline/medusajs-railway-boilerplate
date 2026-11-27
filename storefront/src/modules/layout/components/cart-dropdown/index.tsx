"use client"

import { useDisplayCurrency } from "@lib/context/display-currency-context"
import { HttpTypes } from "@medusajs/types"
import DeleteButton from "@modules/common/components/delete-button"
import LineItemMeasurements from "@modules/common/components/line-item-measurements"
import LineItemOptions from "@modules/common/components/line-item-options"
import LineItemPrice from "@modules/common/components/line-item-price"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "@modules/products/components/thumbnail"
import { AnimatePresence, motion } from "framer-motion"
import { usePathname } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"

function getCheckoutStep(cart: HttpTypes.StoreCart) {
  if (!cart?.shipping_address?.address_1 || !cart.email) {
    return "address"
  } else if (cart?.shipping_methods?.length === 0) {
    return "delivery"
  } else {
    return "payment"
  }
}

const CartDropdown = ({
  cart: cartState,
}: {
  cart?: HttpTypes.StoreCart | null
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { displayCurrency, formatPrice, formatAED } = useDisplayCurrency()

  const totalItems =
    cartState?.items?.reduce((acc, item) => {
      return acc + item.quantity
    }, 0) || 0

  const subtotal = cartState?.subtotal ?? 0
  const prevItemsRef = useRef<number>(totalItems)
  const pathname = usePathname()

  useEffect(() => {
    setMounted(true)
  }, [])

  // Automatically slide open Bag drawer when new items are added
  useEffect(() => {
    if (
      totalItems > prevItemsRef.current &&
      !pathname.includes("/cart") &&
      !pathname.includes("/checkout")
    ) {
      setIsOpen(true)
    }
    prevItemsRef.current = totalItems
  }, [totalItems, pathname])

  // Close drawer on route navigation
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  // Lock body scroll and handle Escape key when drawer is open
  useEffect(() => {
    if (!isOpen) return

    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false)
      }
    }
    window.addEventListener("keydown", onKeyDown)

    return () => {
      document.body.style.overflow = prevOverflow
      window.removeEventListener("keydown", onKeyDown)
    }
  }, [isOpen])

  const checkoutStep = cartState ? getCheckoutStep(cartState) : "address"

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="h-full flex items-center text-[11px] uppercase tracking-[0.12em] text-[#0A0A0A] hover:opacity-60 transition-opacity duration-200 focus:outline-none"
        data-testid="nav-cart-link"
        aria-label={`Open shopping bag with ${totalItems} items`}
      >
        {`Bag (${totalItems})`}
      </button>

      {mounted &&
        createPortal(
          <AnimatePresence>
            {isOpen && (
              <div
                className="fixed inset-0 z-[100] flex justify-end"
                data-testid="nav-cart-dropdown"
              >
                {/* Backdrop */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className="fixed inset-0 bg-black/55"
                  onClick={() => setIsOpen(false)}
                />

                {/* Slide-over Drawer Panel */}
                <motion.aside
                  role="dialog"
                  aria-modal="true"
                  aria-label="Shopping Bag"
                  initial={{ x: "100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "100%" }}
                  transition={{
                    duration: 0.42,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="relative z-10 w-full max-w-[440px] h-full bg-white text-[#0A0A0A] border-l border-[#E5E5E5] flex flex-col justify-between shadow-2xl"
                >
                  {/* Drawer Header */}
                  <div className="px-6 py-5 border-b border-[#E5E5E5] flex items-center justify-between">
                    <div className="flex items-baseline gap-x-2">
                      <h2 className="text-[11px] uppercase tracking-[0.18em] font-semibold text-[#0A0A0A]">
                        Shopping Bag
                      </h2>
                      <span className="text-[11px] text-[#0A0A0A]/50">
                        ({totalItems})
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsOpen(false)}
                      className="text-[11px] uppercase tracking-[0.16em] text-[#0A0A0A]/60 hover:text-[#0A0A0A] py-1 px-2 transition-colors"
                      aria-label="Close bag drawer"
                    >
                      Close
                    </button>
                  </div>

                  {/* Drawer Body */}
                  {cartState && cartState.items?.length ? (
                    <>
                      <div
                        data-lenis-prevent
                        className="flex-1 overflow-y-auto px-6 py-6 divide-y divide-[#0A0A0A]/10 no-scrollbar"
                      >
                        {cartState.items
                          .sort((a, b) => {
                            return (a.created_at ?? "") > (b.created_at ?? "")
                              ? -1
                              : 1
                          })
                          .map((item) => (
                            <div
                              className="py-5 first:pt-0 last:pb-0 grid grid-cols-[84px_1fr] gap-x-4"
                              key={item.id}
                              data-testid="cart-item"
                            >
                              <LocalizedClientLink
                                href={`/products/${item.product_handle}`}
                                onClick={() => setIsOpen(false)}
                                className="w-[84px] block group"
                              >
                                <Thumbnail
                                  thumbnail={item.thumbnail}
                                  images={item.variant?.product?.images}
                                  size="portrait"
                                />
                              </LocalizedClientLink>

                              <div className="flex flex-col justify-between min-w-0">
                                <div>
                                  <div className="flex items-start justify-between gap-x-3">
                                    <h3 className="font-display text-lg leading-snug text-[#0A0A0A] truncate">
                                      <LocalizedClientLink
                                        href={`/products/${item.product_handle}`}
                                        onClick={() => setIsOpen(false)}
                                        data-testid="product-link"
                                      >
                                        {item.product_title || item.title}
                                      </LocalizedClientLink>
                                    </h3>
                                    <div className="shrink-0 text-right">
                                      <LineItemPrice
                                        item={item}
                                        style="tight"
                                        currencyCode={cartState.currency_code}
                                      />
                                    </div>
                                  </div>

                                  <div className="mt-0.5">
                                    <LineItemOptions
                                      variant={item.variant}
                                      data-testid="cart-item-variant"
                                      data-value={item.variant}
                                    />
                                  </div>

                                  <LineItemMeasurements
                                    metadata={
                                      item.metadata as
                                        | Record<string, unknown>
                                        | undefined
                                    }
                                    compact
                                  />
                                </div>

                                <div className="mt-3 flex items-center justify-between text-[11px] uppercase tracking-[0.14em] text-[#0A0A0A]/55">
                                  <span
                                    data-testid="cart-item-quantity"
                                    data-value={item.quantity}
                                  >
                                    Qty: {item.quantity}
                                  </span>
                                  <DeleteButton
                                    id={item.id}
                                    className="text-[11px] uppercase tracking-[0.14em] text-[#0A0A0A]/55 hover:text-[#0A0A0A]"
                                    data-testid="cart-item-remove-button"
                                  >
                                    Remove
                                  </DeleteButton>
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>

                      {/* Drawer Footer: Dual Display Currency + Exact AED Settlement */}
                      <div className="p-6 border-t border-[#E5E5E5] bg-white space-y-4">
                        <div className="space-y-1.5">
                          <div className="flex items-baseline justify-between">
                            <span className="text-[11px] uppercase tracking-[0.16em] text-[#0A0A0A]/70">
                              Subtotal{" "}
                              <span className="normal-case tracking-normal text-[#0A0A0A]/45">
                                (excl. duties)
                              </span>
                            </span>
                            <span
                              className="font-editorial text-lg font-medium text-[#0A0A0A]"
                              data-testid="cart-subtotal"
                              data-value={subtotal}
                            >
                              {formatPrice(subtotal, { approxPrefix: true })}
                            </span>
                          </div>

                          {displayCurrency !== "AED" && (
                            <div className="flex items-center justify-between text-[11px] text-[#0A0A0A]/65 border-t border-[#E5E5E5] pt-2">
                              <span className="uppercase tracking-[0.14em]">
                                Exact AED Settlement
                              </span>
                              <span className="font-medium text-[#0A0A0A]">
                                {formatAED(subtotal)}
                              </span>
                            </div>
                          )}
                        </div>

                        <p className="text-[11px] text-[#0A0A0A]/55 leading-relaxed">
                          {displayCurrency !== "AED"
                            ? `Displayed ${displayCurrency} values are approximate. Orders settle strictly in AED.`
                            : "Complimentary UAE Courier · Worldwide DHL Express (AED 99)."}
                        </p>

                        <div className="grid grid-cols-1 gap-2.5 pt-1">
                          <LocalizedClientLink
                            href={`/checkout?step=${checkoutStep}`}
                            onClick={() => setIsOpen(false)}
                            passHref
                          >
                            <button
                              type="button"
                              className="w-full h-12 bg-[#0A0A0A] text-white text-[11px] uppercase tracking-[0.18em] font-medium hover:bg-black/85 transition-colors duration-200"
                            >
                              Proceed to Checkout
                            </button>
                          </LocalizedClientLink>

                          <LocalizedClientLink
                            href="/cart"
                            onClick={() => setIsOpen(false)}
                            passHref
                          >
                            <button
                              type="button"
                              className="w-full h-10 border border-[#E5E5E5] text-[#0A0A0A] text-[11px] uppercase tracking-[0.16em] hover:border-[#0A0A0A] transition-colors duration-200"
                              data-testid="go-to-cart-button"
                            >
                              View Full Bag
                            </button>
                          </LocalizedClientLink>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
                      <span className="text-[10px] uppercase tracking-[0.22em] text-[#0A0A0A]/45 mb-3">
                        ILLUSIONLINE
                      </span>
                      <p className="font-editorial text-lg uppercase tracking-[0.08em] font-medium text-[#0A0A0A] mb-2">
                        Your Shopping Bag is Empty
                      </p>
                      <p className="text-xs text-[#0A0A0A]/60 leading-relaxed max-w-[260px] mb-8">
                        Explore architectural eveningwear in ready-to-wear and
                        bespoke made-to-measure silhouettes.
                      </p>
                      <LocalizedClientLink
                        href="/store"
                        onClick={() => setIsOpen(false)}
                        className="px-8 py-3.5 bg-[#0A0A0A] text-white text-[11px] uppercase tracking-[0.18em] font-medium hover:bg-black/85 transition-colors duration-200"
                      >
                        Shop All Dresses
                      </LocalizedClientLink>
                    </div>
                  )}
                </motion.aside>
              </div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </>
  )
}

export default CartDropdown
