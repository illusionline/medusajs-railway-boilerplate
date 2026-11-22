import { clx } from "@medusajs/ui"

import { getProductPrice } from "@lib/util/get-product-price"
import { HttpTypes } from "@medusajs/types"

export default function ProductPrice({
  product,
  variant,
}: {
  product: HttpTypes.StoreProduct
  variant?: HttpTypes.StoreProductVariant
}) {
  const { cheapestPrice, variantPrice } = getProductPrice({
    product,
    variantId: variant?.id,
  })

  const selectedPrice = variant ? variantPrice : cheapestPrice

  if (!selectedPrice) {
    return <div className="block w-32 h-7 bg-[#0A0A0A]/5 animate-pulse" />
  }

  return (
    <div className="flex items-baseline gap-x-3 text-[#0A0A0A]">
      <span
        className={clx("text-lg small:text-xl tracking-[0.06em] font-normal", {
          "font-medium": selectedPrice.price_type === "sale",
        })}
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
          {selectedPrice.calculated_price}
        </span>
      </span>
      {selectedPrice.price_type === "sale" && (
        <>
          <span
            className="line-through text-sm text-[#0A0A0A]/45"
            data-testid="original-product-price"
            data-value={selectedPrice.original_price_number}
          >
            {selectedPrice.original_price}
          </span>
          <span className="text-[11px] uppercase tracking-[0.16em] px-2 py-0.5 border border-[#0A0A0A]/20 text-[#0A0A0A]">
            -{selectedPrice.percentage_diff}%
          </span>
        </>
      )}
    </div>
  )
}
