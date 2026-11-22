import { getProductPrice } from "@lib/util/get-product-price"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "../thumbnail"
import PreviewPrice from "./price"

export default function ProductPreview({
  product,
  isFeatured,
}: {
  product: HttpTypes.StoreProduct
  isFeatured?: boolean
  region: HttpTypes.StoreRegion
}) {
  const { cheapestPrice } = getProductPrice({
    product,
  })

  const hasCustomVariant = product.variants?.some(
    (v) =>
      v.title?.toLowerCase().includes("custom") ||
      v.options?.some((o) => o.value?.toLowerCase().includes("custom"))
  )

  return (
    <LocalizedClientLink
      href={`/products/${product.handle}`}
      className="group block"
    >
      <article data-testid="product-wrapper" className="flex flex-col">
        <Thumbnail
          thumbnail={product.thumbnail}
          images={product.images}
          size="full"
          isFeatured={isFeatured}
        />
        <div className="mt-4 flex flex-col gap-y-1">
          <div className="flex items-baseline justify-between gap-x-4">
            <h3
              className="font-display text-lg small:text-xl font-normal tracking-wide text-[#0A0A0A] group-hover:opacity-70 transition-opacity"
              data-testid="product-title"
            >
              {product.title}
            </h3>
            <div className="flex items-center gap-x-2 shrink-0 text-xs tracking-[0.06em] text-[#0A0A0A]/80">
              {cheapestPrice && <PreviewPrice price={cheapestPrice} />}
            </div>
          </div>
          <span className="text-[10px] uppercase tracking-[0.2em] text-[#0A0A0A]/45">
            {hasCustomVariant
              ? "Ready-to-Wear · Bespoke"
              : "Architectural Eveningwear"}
          </span>
        </div>
      </article>
    </LocalizedClientLink>
  )
}
