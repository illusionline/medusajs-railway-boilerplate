"use client"

import { useDisplayCurrency } from "@lib/context/display-currency-context"
import { getProductPrice } from "@lib/util/get-product-price"
import { HttpTypes } from "@medusajs/types"
import { clx } from "@medusajs/ui"

export default function ProductPrice({
  product,
  variant,
}: {
  product: HttpTypes.StoreProduct
  variant?: HttpTypes.StoreProductVariant
}) {
  const { displayCurrency, formatPrice, formatAED } = useDisplayCurrency()

  const { cheapestPrice, variantPrice } = getProductPrice({
    product,
    variantId: variant?.id,
  })

  const selectedPrice = variant ? variantPrice : cheapestPrice

  if (!selectedPrice) {
    return <div className="block w-32 h-7 bg-[#0A0A0A]/5 animate-pulse" />
  }

  const formattedDisplay = formatPrice(selectedPrice.calculated_price_number, {
    approxPrefix: true,
  })
  const formattedOriginal = formatPrice(selectedPrice.original_price_number, {
    approxPrefix: true,
  })

  return (
    <div className="flex flex-col gap-y-1 text-[#0A0A0A]">
      <div className="flex items-baseline gap-x-3 flex-wrap">
        <span
          className={clx(
            "text-lg small:text-xl tracking-[0.06em] font-normal",
            {
              "font-medium": selectedPrice.price_type === "sale",
            }
          )}
        >
          {!variant && (product.variants?.length ?? 0) > 1 && (
            <span className="text-xs uppercase tracking-[0.18em] text-[#0A0A0A]/55 mr-2">
              From
            </span>
          )}
          <span
            data-testid="product-price"
            data-value={selectedPrice.calculated_price_number}
          >
            {formattedDisplay}
          </span>
        </span>
        {selectedPrice.price_type === "sale" && (
          <>
            <span
              className="line-through text-sm text-[#0A0A0A]/45"
              data-testid="original-product-price"
              data-value={selectedPrice.original_price_number}
            >
              {formattedOriginal}
            </span>
            <span className="text-[11px] uppercase tracking-[0.16em] px-2 py-0.5 border border-[#0A0A0A]/20 text-[#0A0A0A]">
              -{selectedPrice.percentage_diff}%
            </span>
          </>
        )}
      </div>

      {displayCurrency !== "AED" && (
        <span className="text-[11px] tracking-[0.08em] text-[#0A0A0A]/55">
          Settled in AED ({formatAED(selectedPrice.calculated_price_number)})
        </span>
      )}
    </div>
  )
}
