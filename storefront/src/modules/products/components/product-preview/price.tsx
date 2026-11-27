"use client"

import { useDisplayCurrency } from "@lib/context/display-currency-context"
import { clx } from "@medusajs/ui"
import { VariantPrice } from "types/global"

export default function PreviewPrice({ price }: { price: VariantPrice }) {
  const { formatPrice } = useDisplayCurrency()

  if (!price) {
    return null
  }

  const calculatedDisplay = formatPrice(price.calculated_price_number, {
    approxPrefix: true,
  })
  const originalDisplay = formatPrice(price.original_price_number, {
    approxPrefix: true,
  })

  return (
    <>
      {price.price_type === "sale" && (
        <span
          className="line-through text-[#0A0A0A]/40 text-[11px]"
          data-testid="original-price"
        >
          {originalDisplay}
        </span>
      )}
      <span
        className={clx("text-[11px] tracking-[0.04em] text-[#0A0A0A]/80", {
          "font-medium text-[#0A0A0A]": price.price_type === "sale",
        })}
        data-testid="price"
      >
        {calculatedDisplay}
      </span>
    </>
  )
}
