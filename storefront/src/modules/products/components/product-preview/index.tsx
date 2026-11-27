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
          alt={product.title || "ILLUSIONLINE Gown"}
        />
        <div className="pt-3 flex flex-col gap-y-1">
          <h3
            className="font-sans text-[11px] font-medium uppercase tracking-[0.08em] leading-snug text-[#0A0A0A] group-hover:underline underline-offset-4 line-clamp-2"
            data-testid="product-title"
          >
            {product.title}
          </h3>
          <div className="flex items-center gap-x-2 text-[11px] tracking-[0.04em] text-[#0A0A0A]/75">
            {cheapestPrice && <PreviewPrice price={cheapestPrice} />}
          </div>
        </div>
      </article>
    </LocalizedClientLink>
  )
}
