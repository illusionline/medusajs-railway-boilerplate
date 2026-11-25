"use client"

import { useDisplayCurrency } from "@lib/context/display-currency-context"
import { getPercentageDiff } from "@lib/util/get-percentage-diff"
import { HttpTypes } from "@medusajs/types"
import { clx } from "@medusajs/ui"

type LineItemPriceProps = {
  item: HttpTypes.StoreCartLineItem | HttpTypes.StoreOrderLineItem
  style?: "default" | "tight"
  currencyCode: string
  forceAED?: boolean
}

const LineItemPrice = ({
  item,
  style = "default",
  forceAED = false,
}: LineItemPriceProps) => {
  const { displayCurrency, formatPrice, formatAED } = useDisplayCurrency()
  const { total, original_total } = item
  const originalPrice = original_total ?? 0
  const currentPrice = total ?? 0
  const hasReducedPrice = currentPrice < originalPrice

  const formatAmt = (amt: number) =>
    forceAED ? formatAED(amt) : formatPrice(amt, { approxPrefix: true })

  return (
    <div className="flex flex-col gap-x-2 text-[#0A0A0A]/80 items-end">
      <div className="text-right">
        {hasReducedPrice && (
          <>
            <p>
              {style === "default" && (
                <span className="text-[#0A0A0A]/50">Original: </span>
              )}
              <span
                className="line-through text-[#0A0A0A]/45 text-xs"
                data-testid="product-original-price"
              >
                {formatAmt(originalPrice)}
              </span>
            </p>
            {style === "default" && (
              <span className="text-xs text-[#0A0A0A]">
                -{getPercentageDiff(originalPrice, currentPrice)}%
              </span>
            )}
          </>
        )}
        <span
          className={clx("text-xs tracking-[0.06em] text-[#0A0A0A] block", {
            "font-medium": hasReducedPrice,
          })}
          data-testid="product-price"
        >
          {formatAmt(currentPrice)}
        </span>
        {!forceAED && displayCurrency !== "AED" && (
          <span className="block text-[10px] tracking-[0.06em] text-[#0A0A0A]/45">
            {formatAED(currentPrice)}
          </span>
        )}
      </div>
    </div>
  )
}

export default LineItemPrice
