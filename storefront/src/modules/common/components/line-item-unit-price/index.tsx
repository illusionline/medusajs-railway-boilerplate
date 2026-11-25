"use client"

import { useDisplayCurrency } from "@lib/context/display-currency-context"
import { HttpTypes } from "@medusajs/types"
import { clx } from "@medusajs/ui"

type LineItemUnitPriceProps = {
  item: HttpTypes.StoreCartLineItem | HttpTypes.StoreOrderLineItem
  style?: "default" | "tight"
  currencyCode: string
  forceAED?: boolean
}

const LineItemUnitPrice = ({
  item,
  style = "default",
  forceAED = false,
}: LineItemUnitPriceProps) => {
  const { formatPrice, formatAED } = useDisplayCurrency()
  const total = item.total ?? 0
  const originalTotal = item.original_total ?? 0
  const qty = Math.max(1, item.quantity || 1)
  const hasReducedPrice = total < originalTotal && originalTotal > 0

  const percentage_diff =
    originalTotal > 0
      ? Math.round(((originalTotal - total) / originalTotal) * 100)
      : 0

  const formatAmt = (amt: number) =>
    forceAED ? formatAED(amt) : formatPrice(amt, { approxPrefix: true })

  return (
    <div className="flex flex-col text-[#0A0A0A]/65 justify-center h-full">
      {hasReducedPrice && (
        <>
          <p>
            {style === "default" && (
              <span className="text-[#0A0A0A]/50">Original: </span>
            )}
            <span
              className="line-through text-xs"
              data-testid="product-unit-original-price"
            >
              {formatAmt(originalTotal / qty)}
            </span>
          </p>
          {style === "default" && (
            <span className="text-xs text-[#0A0A0A]">-{percentage_diff}%</span>
          )}
        </>
      )}
      <span
        className={clx("text-xs tracking-[0.04em]", {
          "font-medium text-[#0A0A0A]": hasReducedPrice,
        })}
        data-testid="product-unit-price"
      >
        {formatAmt(total / qty)}
      </span>
    </div>
  )
}

export default LineItemUnitPrice
