"use client"

import { useDisplayCurrency } from "@lib/context/display-currency-context"
import React from "react"

type CartTotalsProps = {
  totals: {
    total?: number | null
    subtotal?: number | null
    tax_total?: number | null
    currency_code: string
    item_subtotal?: number | null
    shipping_subtotal?: number | null
    discount_subtotal?: number | null
  }
}

const CartTotals: React.FC<CartTotalsProps> = ({ totals }) => {
  const { displayCurrency, formatPrice, formatAED } = useDisplayCurrency()
  const {
    total,
    tax_total,
    item_subtotal,
    shipping_subtotal,
    discount_subtotal,
  } = totals

  const safeTotal = total ?? 0
  const safeSubtotal = item_subtotal ?? 0
  const safeShipping = shipping_subtotal ?? 0
  const safeDiscount = discount_subtotal ?? 0
  const safeTax = tax_total ?? 0

  return (
    <div>
      <div className="flex flex-col gap-y-2.5 text-xs text-[#0A0A0A]/70">
        <div className="flex items-center justify-between">
          <span>Subtotal (excl. shipping &amp; taxes)</span>
          <span data-testid="cart-subtotal" data-value={safeSubtotal}>
            {formatPrice(safeSubtotal, { approxPrefix: true })}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span>DHL Express Shipping</span>
          <span data-testid="cart-shipping" data-value={safeShipping}>
            {safeShipping === 0
              ? formatPrice(0)
              : formatPrice(safeShipping, { approxPrefix: true })}
          </span>
        </div>
        {!!safeDiscount && (
          <div className="flex items-center justify-between">
            <span>Privilege / Discount</span>
            <span
              className="text-[#0A0A0A] font-medium"
              data-testid="cart-discount"
              data-value={safeDiscount}
            >
              - {formatPrice(safeDiscount, { approxPrefix: true })}
            </span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="flex gap-x-1 items-center">Taxes</span>
          <span data-testid="cart-taxes" data-value={safeTax}>
            {safeTax === 0
              ? formatPrice(0)
              : formatPrice(safeTax, { approxPrefix: true })}
          </span>
        </div>
      </div>

      <div className="h-px w-full bg-[#0A0A0A]/10 my-4" />

      <div className="space-y-2">
        <div className="flex items-baseline justify-between text-[#0A0A0A]">
          <span className="text-xs uppercase tracking-[0.2em]">
            {displayCurrency === "AED"
              ? "Total (AED)"
              : `Estimated Total (${displayCurrency})`}
          </span>
          <span
            className="font-display text-2xl text-[#0A0A0A]"
            data-testid="cart-total"
            data-value={safeTotal}
          >
            {formatPrice(safeTotal, { approxPrefix: true })}
          </span>
        </div>

        {displayCurrency !== "AED" && (
          <div className="flex items-center justify-between px-3 py-2 bg-[#F2EFE9] border border-[#0A0A0A]/15 text-xs text-[#0A0A0A]">
            <span className="uppercase tracking-[0.16em] text-[10px] text-[#0A0A0A]/75">
              Exact AED Settlement
            </span>
            <span
              className="font-medium tracking-[0.06em]"
              data-testid="cart-total-aed-settlement"
            >
              {formatAED(safeTotal)}
            </span>
          </div>
        )}
      </div>

      <div className="h-px w-full bg-[#0A0A0A]/10 mt-4" />
    </div>
  )
}

export default CartTotals
